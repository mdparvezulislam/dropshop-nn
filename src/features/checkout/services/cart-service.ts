import { CartRepository } from "../repositories/cart-repository";
import { PriceResolutionService } from "./price-resolution-service";
import { EventBus } from "@/shared/lib/event-bus";
import { ValidationError, NotFoundError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import type { Cart, CartItem, CartType, CartStatus } from "../domain/cart-entity";

export interface CreateCartInput {
  type: CartType;
  sessionId?: string;
  userId?: string;
  resellerId?: string;
  wholesaleId?: string;
  currency?: string;
}

export interface AddItemInput {
  productId: string;
  variantSku?: string;
  quantity: number;
  role: "retail" | "reseller" | "wholesale" | "customer";
}

export class CartService {
  private readonly cartRepository: CartRepository;
  private readonly priceResolutionService: PriceResolutionService;

  constructor() {
    this.cartRepository = new CartRepository();
    this.priceResolutionService = new PriceResolutionService();
  }

  private normalizeVariantSku(variantSku?: string | null): string | undefined {
    if (!variantSku || variantSku.trim() === "") return undefined;
    return variantSku.toUpperCase().trim();
  }

  async getOrCreateCart(input: CreateCartInput): Promise<Cart> {
    let cart: Cart | null = null;

    if (input.sessionId) {
      cart = await this.cartRepository.findActiveBySession(input.sessionId);
    } else if (input.userId) {
      cart = await this.cartRepository.findActiveByUser(input.userId);
    } else if (input.resellerId) {
      cart = await this.cartRepository.findActiveByReseller(input.resellerId);
    }

    if (cart) {
      return cart;
    }

    const newCart = await this.cartRepository.create({
      type: input.type,
      status: "active",
      sessionId: input.sessionId,
      userId: input.userId,
      resellerId: input.resellerId,
      wholesaleId: input.wholesaleId,
      items: [],
      itemCount: 0,
      subtotal: 0,
      currency: input.currency ?? "USD",
      lastActivityAt: new Date(),
    } as any);

    await EventBus.publish(
      "checkout.cart_created",
      {
        cartId: newCart.id,
        type: newCart.type,
        sessionId: newCart.sessionId,
        userId: newCart.userId,
      },
      { source: "checkout-cart" },
    );

    logger.info("CartService: cart created", { cartId: newCart.id, type: newCart.type });
    return newCart;
  }

  async addItem(cartId: string, input: AddItemInput, cartType: CartType): Promise<Cart> {
    logger.info("CartService: adding item", { cartId, productId: input.productId });

    const cart = await this.cartRepository.findById(cartId);
    if (!cart) throw new NotFoundError("Cart not found");
    if (cart.status !== "active") throw new ValidationError("Cart is not active");

    const role =
      cartType === "reseller" ? "reseller" : cartType === "wholesaler" ? "wholesale" : "retail";

    const resolved = await this.priceResolutionService.resolveSingle({
      productId: input.productId,
      variantSku: this.normalizeVariantSku(input.variantSku),
      quantity: input.quantity,
      role,
    });

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId === input.productId &&
        item.variantSku === this.normalizeVariantSku(input.variantSku),
    );

    let items: CartItem[];
    if (existingIndex >= 0) {
      items = [...cart.items];
      const existing = items[existingIndex];
      const newQty = existing.quantity + input.quantity;
      items[existingIndex] = {
        ...existing,
        quantity: newQty,
        resolvedPrice: resolved.unitPrice,
        profitPreview: {
          costBasis: resolved.profitPreview.costBasis,
          profitAmount: (resolved.profitPreview.profitAmount / input.quantity) * newQty,
          profitMargin: resolved.profitPreview.profitMargin,
        },
      };
    } else {
      const newItem: CartItem = {
        productId: input.productId,
        variantSku: this.normalizeVariantSku(input.variantSku),
        quantity: input.quantity,
        resolvedPrice: resolved.unitPrice,
        currency: resolved.currency,
        appliedRule: resolved.appliedRules?.join(","),
        campaignId: resolved.campaignId,
        profitPreview: {
          costBasis: resolved.profitPreview.costBasis,
          profitAmount: resolved.profitPreview.profitAmount,
          profitMargin: resolved.profitPreview.profitMargin,
        },
      };
      items = [...cart.items, newItem];
    }

    const subtotal = items.reduce((sum, item) => sum + item.resolvedPrice * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const updated = await this.cartRepository.update(cartId, {
      items,
      subtotal,
      itemCount,
      lastActivityAt: new Date(),
    } as any);

    await EventBus.publish(
      "checkout.cart_updated",
      {
        cartId: updated.id,
        type: updated.type,
        itemCount: updated.itemCount,
        subtotal: updated.subtotal,
        changes: existingIndex >= 0 ? ["quantity_updated"] : ["item_added"],
      },
      { source: "checkout-cart" },
    );

    return updated;
  }

  async updateItemQuantity(cartId: string, itemIndex: number, quantity: number): Promise<Cart> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) throw new NotFoundError("Cart not found");
    if (cart.status !== "active") throw new ValidationError("Cart is not active");
    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      throw new ValidationError("Invalid item index");
    }

    let items: CartItem[];
    if (quantity === 0) {
      items = cart.items.filter((_, i) => i !== itemIndex);
    } else {
      items = [...cart.items];
      items[itemIndex] = { ...items[itemIndex], quantity };
    }

    const subtotal = items.reduce((sum, item) => sum + item.resolvedPrice * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return this.cartRepository.update(cartId, {
      items,
      subtotal,
      itemCount,
      lastActivityAt: new Date(),
    } as any);
  }

  async removeItem(cartId: string, itemIndex: number): Promise<Cart> {
    const cart = await this.cartRepository.findById(cartId);
    if (!cart) throw new NotFoundError("Cart not found");
    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      throw new ValidationError("Invalid item index");
    }

    const items = cart.items.filter((_, i) => i !== itemIndex);
    const subtotal = items.reduce((sum, item) => sum + item.resolvedPrice * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return this.cartRepository.update(cartId, {
      items,
      subtotal,
      itemCount,
      lastActivityAt: new Date(),
    } as any);
  }

  async getCart(cartId: string): Promise<Cart | null> {
    return this.cartRepository.findById(cartId);
  }

  async getActiveCart(input: {
    sessionId?: string;
    userId?: string;
    resellerId?: string;
  }): Promise<Cart | null> {
    if (input.sessionId) return this.cartRepository.findActiveBySession(input.sessionId);
    if (input.userId) return this.cartRepository.findActiveByUser(input.userId);
    if (input.resellerId) return this.cartRepository.findActiveByReseller(input.resellerId);
    return null;
  }

  async clearCart(cartId: string): Promise<Cart> {
    return this.cartRepository.update(cartId, {
      items: [],
      subtotal: 0,
      itemCount: 0,
      lastActivityAt: new Date(),
    } as any);
  }

  async markAbandoned(before: Date): Promise<number> {
    const carts = await this.cartRepository.findAbandoned(before);
    let count = 0;
    for (const cart of carts) {
      await this.cartRepository.update(cart.id, { status: "abandoned" } as any);
      count++;
    }
    return count;
  }
}

export default CartService;
