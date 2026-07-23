import {
  CheckoutSessionRepository,
  OrderDraftRepository,
} from "../repositories/checkout-repository";
import { CartRepository } from "../repositories/cart-repository";
import { PriceResolutionService, type PriceResolveRequest } from "./price-resolution-service";
import {
  InventoryValidationService,
  type InventoryCheckRequest,
} from "./inventory-validation-service";
import { EventBus } from "@/lib/event-bus";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { runInTransaction } from "@/lib/database/query-builder";
import type {
  CheckoutSession,
  CheckoutShippingInfo,
  CheckoutPriceItem,
  CheckoutInventoryItem,
  CheckoutTotals,
  CheckoutProfitPreview,
  OrderDraft,
  CheckoutStep,
} from "../domain/checkout-entity";
import type { Cart } from "../domain/cart-entity";
import type { PaginationParams, SortParams, PaginatedResult } from "@/types";

export class CheckoutService {
  private readonly checkoutRepository: CheckoutSessionRepository;
  private readonly orderDraftRepository: OrderDraftRepository;
  private readonly cartRepository: CartRepository;
  private readonly priceResolutionService: PriceResolutionService;
  private readonly inventoryValidationService: InventoryValidationService;

  constructor() {
    this.checkoutRepository = new CheckoutSessionRepository();
    this.orderDraftRepository = new OrderDraftRepository();
    this.cartRepository = new CartRepository();
    this.priceResolutionService = new PriceResolutionService();
    this.inventoryValidationService = new InventoryValidationService();
  }

  async startCheckout(cartId: string): Promise<CheckoutSession> {
    logger.info("CheckoutService: starting checkout", { cartId });

    const cart = await this.cartRepository.findById(cartId);
    if (!cart) throw new NotFoundError("Cart not found");
    if (cart.status !== "active") throw new ValidationError("Cart is not active");
    if (cart.items.length === 0) throw new ValidationError("Cart is empty");

    const existing = await this.checkoutRepository.findActiveByCart(cartId);
    if (existing) {
      logger.info("CheckoutService: resuming existing checkout", { checkoutId: existing.id });
      return existing;
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const session = await this.checkoutRepository.create({
      cartId,
      type: cart.type,
      step: "cart_review",
      status: "active",
      resolvedPrices: [],
      inventoryValidations: [],
      inventoryReservations: [],
      shippingCompleted: false,
      expiresAt,
    } as any);

    await EventBus.publish(
      "checkout.started",
      {
        checkoutId: session.id,
        cartId,
        type: cart.type,
      },
      { source: "checkout" },
    );

    return session;
  }

  async resolvePrices(checkoutId: string): Promise<CheckoutSession> {
    logger.info("CheckoutService: resolving prices", { checkoutId });

    const session = await this.checkoutRepository.findById(checkoutId);
    if (!session) throw new NotFoundError("Checkout session not found");
    if (session.status !== "active") throw new ValidationError("Checkout is not active");

    const cart = await this.cartRepository.findById(session.cartId);
    if (!cart) throw new NotFoundError("Cart not found");

    const role =
      cart.type === "reseller" ? "reseller" : cart.type === "wholesaler" ? "wholesale" : "retail";

    const requests: PriceResolveRequest[] = cart.items.map((item) => ({
      productId: item.productId,
      variantSku: item.variantSku,
      quantity: item.quantity,
      role,
    }));

    const resolvedPrices: CheckoutPriceItem[] =
      await this.priceResolutionService.resolveBatch(requests);

    const updated = await this.checkoutRepository.update(checkoutId, {
      resolvedPrices,
      step: "price_resolved" as CheckoutStep,
    } as any);

    await this.validateInventory(updated.id);

    return updated;
  }

  async validateInventory(checkoutId: string): Promise<CheckoutSession> {
    logger.info("CheckoutService: validating inventory", { checkoutId });

    const session = await this.checkoutRepository.findById(checkoutId);
    if (!session) throw new NotFoundError("Checkout session not found");

    const cart = await this.cartRepository.findById(session.cartId);
    if (!cart) throw new NotFoundError("Cart not found");

    const requests: InventoryCheckRequest[] = cart.items.map((item) => ({
      productId: item.productId,
      variantSku: item.variantSku,
      quantity: item.quantity,
    }));

    const validations = await this.inventoryValidationService.validateBatch(requests);

    const allValid = validations.every((v) => v.isValid);

    await EventBus.publish(
      "checkout.validated",
      {
        checkoutId,
        cartId: session.cartId,
        priceValid: true,
        inventoryValid: allValid,
      },
      { source: "checkout" },
    );

    return this.checkoutRepository.update(checkoutId, {
      inventoryValidations: validations,
      step: allValid ? ("inventory_validated" as CheckoutStep) : ("failed" as CheckoutStep),
      status: allValid ? "active" : "failed",
    } as any);
  }

  async reserveInventory(checkoutId: string, actorId?: string): Promise<CheckoutSession> {
    logger.info("CheckoutService: reserving inventory", { checkoutId });

    const session = await this.checkoutRepository.findById(checkoutId);
    if (!session) throw new NotFoundError("Checkout session not found");
    if (session.step !== "inventory_validated") {
      throw new ValidationError("Inventory must be validated before reservation");
    }

    const cart = await this.cartRepository.findById(session.cartId);
    if (!cart) throw new NotFoundError("Cart not found");

    const reservations: CheckoutInventoryItem[] = [];

    for (const item of cart.items) {
      const inventory = await this.getInventoryForProduct(item.productId, item.variantSku);
      if (inventory) {
        const result = await this.inventoryValidationService.reserve(
          inventory.id,
          item.quantity,
          checkoutId,
          actorId,
        );

        reservations.push({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
          available: item.quantity,
          isValid: result.success,
          reservationId: result.reserveId,
          message: result.message,
        });
      } else {
        // Soft-pass when inventory record is missing (catalog-only products)
        reservations.push({
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
          available: item.quantity,
          isValid: true,
          message: "No inventory record — skipped reservation",
        });
      }
    }

    const allReserved = reservations.every((r) => r.isValid);

    await EventBus.publish(
      "checkout.inventory_reserved",
      {
        checkoutId,
        cartId: session.cartId,
        reservations: reservations.map((r) => ({ productId: r.productId, quantity: r.quantity })),
      },
      { source: "checkout" },
    );

    return this.checkoutRepository.update(checkoutId, {
      inventoryReservations: reservations,
      step: allReserved ? ("inventory_reserved" as CheckoutStep) : ("failed" as CheckoutStep),
      status: allReserved ? "active" : "failed",
    } as any);
  }

  async setShipping(checkoutId: string, shipping: CheckoutShippingInfo): Promise<CheckoutSession> {
    logger.info("CheckoutService: setting shipping", { checkoutId });

    const session = await this.checkoutRepository.findById(checkoutId);
    if (!session) throw new NotFoundError("Checkout session not found");
    if (session.status !== "active") throw new ValidationError("Checkout is not active");

    return this.checkoutRepository.update(checkoutId, {
      shipping,
      shippingCompleted: true,
    } as any);
  }

  async createOrderDraft(checkoutId: string): Promise<OrderDraft> {
    return runInTransaction(async () => {
      logger.info("CheckoutService: creating order draft", { checkoutId });

      const session = await this.checkoutRepository.findById(checkoutId);
      if (!session) throw new NotFoundError("Checkout session not found");
      if (session.status !== "active") throw new ValidationError("Checkout is not active");
      if (!session.shippingCompleted) throw new ValidationError("Shipping info required");
      if (session.inventoryReservations.length === 0) {
        throw new ValidationError("Inventory must be reserved before creating draft");
      }

      const cart = await this.cartRepository.findById(session.cartId);
      if (!cart) throw new NotFoundError("Cart not found");

      const resolvedPrices = session.resolvedPrices;
      const subtotal = resolvedPrices.reduce((sum, p) => sum + p.totalPrice, 0);
      const grandTotal = subtotal;

      const totals: CheckoutTotals = {
        subtotal,
        discountTotal: 0,
        taxTotal: 0,
        grandTotal,
        currency: cart.currency,
      };

      const totalCostBasis = cart.items.reduce((sum, item, idx) => {
        const resolved = resolvedPrices[idx];
        return sum + (resolved ? resolved.unitPrice * item.quantity : 0);
      }, 0);

      const profitPreview: CheckoutProfitPreview = {
        totalCostBasis,
        totalRevenue: grandTotal,
        totalProfit: grandTotal - totalCostBasis,
        averageMargin:
          totalCostBasis > 0 ? ((grandTotal - totalCostBasis) / totalCostBasis) * 100 : 0,
      };

      const draft = await this.orderDraftRepository.create({
        checkoutId,
        cartId: session.cartId,
        type: session.type,
        resolvedPrices,
        inventoryReservations: session.inventoryReservations,
        shipping: session.shipping!,
        totals,
        profitPreview,
      } as any);

      await this.checkoutRepository.update(checkoutId, {
        step: "draft_created" as CheckoutStep,
        totals,
        profitPreview,
        draftId: draft.id,
      } as any);

      await this.cartRepository.markConverted(session.cartId);

      await EventBus.publish(
        "checkout.order_draft_created",
        {
          draftId: draft.id,
          checkoutId,
          cartId: session.cartId,
          type: session.type,
          grandTotal,
          itemCount: cart.items.length,
        },
        { source: "checkout" },
      );

      logger.info("CheckoutService: order draft created", {
        draftId: draft.id,
        checkoutId,
      });

      return draft;
    });
  }

  async fullCheckout(
    cartId: string,
    shipping: CheckoutShippingInfo,
    actorId?: string,
  ): Promise<{
    checkout: CheckoutSession;
    draft: OrderDraft;
  }> {
    logger.info("CheckoutService: full checkout flow", { cartId });

    let session = await this.startCheckout(cartId);
    session = await this.resolvePrices(session.id);
    session = await this.reserveInventory(session.id, actorId);
    session = await this.setShipping(session.id, shipping);
    const draft = await this.createOrderDraft(session.id);

    session = await this.checkoutRepository.update(session.id, {
      step: "completed" as CheckoutStep,
      status: "completed",
    } as any);

    return { checkout: session, draft };
  }

  async getSession(checkoutId: string): Promise<CheckoutSession | null> {
    return this.checkoutRepository.findById(checkoutId);
  }

  async getDraft(draftId: string): Promise<OrderDraft | null> {
    return this.orderDraftRepository.findById(draftId);
  }

  async listCheckouts(
    filter: object,
    pagination: PaginationParams,
    sort?: SortParams,
  ): Promise<PaginatedResult<CheckoutSession>> {
    return this.checkoutRepository.findPaginated(filter, pagination, sort);
  }

  async expireSession(checkoutId: string): Promise<void> {
    const session = await this.checkoutRepository.findById(checkoutId);
    if (!session || session.status !== "active") return;

    await this.checkoutRepository.update(checkoutId, {
      step: "expired" as CheckoutStep,
      status: "expired",
    } as any);

    await EventBus.publish(
      "checkout.expired",
      {
        checkoutId,
        cartId: session.cartId,
        reason: "Session expired",
      },
      { source: "checkout" },
    );
  }

  private async getInventoryForProduct(
    productId: string,
    variantSku?: string,
  ): Promise<{ id: string; availableStock: number; reservedStock: number } | null> {
    const { InventoryService } = await import("@/features/inventory/services/inventory-service");
    const inventoryService = new InventoryService();
    const inventory = await inventoryService.getInventoryByProduct(productId, variantSku);
    if (!inventory) return null;
    return {
      id: inventory.id,
      availableStock: inventory.availableStock,
      reservedStock: inventory.reservedStock,
    };
  }
}

export default CheckoutService;
