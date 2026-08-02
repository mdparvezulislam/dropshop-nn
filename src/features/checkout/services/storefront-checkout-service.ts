import { randomUUID } from "crypto";
import { ProductRepository } from "@/features/catalog/repositories/product-repository";
import { InventoryRepository } from "@/features/inventory/repositories/inventory-repository";
import { OrderRepository } from "@/features/order/repositories/order-repository";
import { createOrderAccessToken } from "@/features/order/utils/order-access-token";
import { CartService } from "./cart-service";
import { CheckoutService } from "./checkout-service";
import { PriceResolutionService } from "./price-resolution-service";
import type { CartType } from "../domain/cart-entity";
import type { CheckoutShippingInfo } from "../domain/checkout-entity";
import { SHIPPING_METHODS } from "@/config/site";
import { logger } from "@/lib/utils/logger";
import { ConflictError } from "@/lib/errors/app-error";
import { PricingValidationService } from "@/features/pricing/services/pricing-validation-service";

/**
 * Storefront checkout orchestration. The SERVER is the price and stock
 * authority end-to-end: the client sends only product ids, variant SKUs and
 * quantities — every price, availability and total is resolved here through
 * the existing pricing/inventory/checkout pipeline. Client-side numbers are
 * previews and are never trusted.
 */

export interface StorefrontCheckoutLineInput {
  productId: string;
  variantSku?: string;
  quantity: number;
  customSellingPriceBdt?: number;
}

export interface QuotedLine {
  productId: string;
  variantSku?: string;
  name: string;
  image: string;
  quantity: number;
  /** BDT major units — server-resolved. */
  unitPrice: number;
  totalPrice: number;
}

export interface RejectedLine {
  productId: string;
  variantSku?: string;
  name?: string;
  reason: string;
}

export interface StorefrontQuote {
  lines: QuotedLine[];
  rejected: RejectedLine[];
  /** BDT major units. */
  subtotal: number;
  shippingMethods: Array<{ id: string; label: string; cost: number; eta: string }>;
  currency: string;
}

export interface PlaceOrderInput {
  items: StorefrontCheckoutLineInput[];
  shipping: Omit<CheckoutShippingInfo, "deliveryCharge">;
  shippingMethodId: string;
  paymentMethod: string;
  viewer: { userId?: string; type: CartType };
}

export interface PlacedOrder {
  orderNumber: string;
  /** Signed guest-access token for the success page / tracking links. */
  accessToken: string;
  /** BDT major units. */
  grandTotal: number;
  subtotal: number;
  shippingCost: number;
  itemCount: number;
}

const MAX_LINES = 30;
const MAX_QTY = 99;

function cartRole(type: CartType): "retail" | "reseller" | "wholesale" | "customer" {
  if (type === "reseller") return "reseller";
  if (type === "wholesaler") return "wholesale";
  if (type === "customer") return "customer";
  return "retail";
}

export class StorefrontCheckoutService {
  private readonly products = new ProductRepository();
  private readonly inventory = new InventoryRepository();
  private readonly priceResolution = new PriceResolutionService();

  /**
   * Server-side revalidation of a client cart: product visibility, variant
   * validity, stock, and engine-resolved prices. Unavailable items come back
   * in `rejected` with a human reason so the UI can degrade gracefully.
   */
  async quote(items: StorefrontCheckoutLineInput[], type: CartType): Promise<StorefrontQuote> {
    const capped = items.slice(0, MAX_LINES);
    const lines: QuotedLine[] = [];
    const rejected: RejectedLine[] = [];

    for (const item of capped) {
      const quantity = Math.max(1, Math.min(MAX_QTY, Math.floor(item.quantity)));

      const product = await this.products.findOne({
        _id: item.productId,
        status: { $in: ["active", "published"] },
        isDeleted: { $ne: true },
      });
      if (!product) {
        rejected.push({
          productId: item.productId,
          variantSku: item.variantSku,
          reason: "প্রোডাক্টটি আর বিক্রয়যোগ্য নয়",
        });
        continue;
      }

      // Variant revalidation
      let variantImage: string | undefined;
      let variantStock: number | null = null;
      if (item.variantSku) {
        const variant = product.variants?.find((v) => v.sku === item.variantSku);
        if (!variant || variant.isActive === false) {
          rejected.push({
            productId: item.productId,
            variantSku: item.variantSku,
            name: product.name,
            reason: "নির্বাচিত ভ্যারিয়েন্টটি আর উপলব্ধ নয়",
          });
          continue;
        }
        variantImage = variant.image;
        variantStock = typeof variant.stock === "number" ? variant.stock : null;
      }

      // Stock revalidation: variant stock overrides; inventory rows next;
      // no records at all = untracked (dropship-sellable).
      let available: number | null = variantStock;
      if (available === null) {
        const rows = await this.inventory
          .find({ productId: product.id, status: "active" })
          .catch(() => []);
        available = rows.length
          ? rows.reduce((sum, row) => sum + (row.availableStock ?? 0), 0)
          : null;
      }
      if (available !== null && available < quantity) {
        rejected.push({
          productId: item.productId,
          variantSku: item.variantSku,
          name: product.name,
          reason: available <= 0 ? "স্টক শেষ" : `মাত্র ${available} টি স্টকে আছে`,
        });
        continue;
      }

      // Engine-resolved price (minor units) — same resolver the order uses.
      try {
        const resolved = await this.priceResolution.resolveSingle({
          productId: product.id,
          variantSku: item.variantSku,
          quantity,
          role: cartRole(type),
        });
        if (!resolved.unitPrice || resolved.unitPrice <= 0) {
          rejected.push({
            productId: item.productId,
            variantSku: item.variantSku,
            name: product.name,
            reason: "মূল্য নির্ধারিত হয়নি — অর্ডারের জন্য যোগাযোগ করুন",
          });
          continue;
        }

        let finalUnitPriceBdt = Math.round(resolved.unitPrice) / 100;

        // Server-Side Security Guard for Reseller Orders:
        // Enforce that reseller selling price is >= reseller purchase cost (resellerPrice)
        if (type === "reseller") {
          const resellerCostBdt = product.resellerPrice
            ? product.resellerPrice
            : product.record?.resellerPrice
              ? product.record.resellerPrice / 100
              : finalUnitPriceBdt;

          const customPriceToValidate = item.customSellingPriceBdt ?? finalUnitPriceBdt;

          const validation = PricingValidationService.validateResellerSellingPrice({
            customSellingPrice: customPriceToValidate,
            resellerPrice: resellerCostBdt,
          });

          if (!validation.isValid) {
            rejected.push({
              productId: item.productId,
              variantSku: item.variantSku,
              name: product.name,
              reason:
                validation.error ??
                `নূন্যতম বিক্রয় মূল্য ৳${resellerCostBdt} (রিসেলার মূল্যের চেয়ে কম দামে বিক্রি করা সম্ভব নয়)`,
            });
            continue;
          }

          finalUnitPriceBdt = validation.validatedSellingPrice;
        }

        const featured = product.media?.find((m) => m.isFeatured) ?? product.media?.[0];
        lines.push({
          productId: product.id,
          variantSku: item.variantSku,
          name: product.name,
          image: variantImage || featured?.url || "",
          quantity,
          unitPrice: finalUnitPriceBdt,
          totalPrice: Math.round(finalUnitPriceBdt * quantity * 100) / 100,
        });
      } catch (error) {
        logger.error("StorefrontCheckoutService quote price resolution failed", error, {
          productId: item.productId,
        });
        rejected.push({
          productId: item.productId,
          variantSku: item.variantSku,
          name: product.name,
          reason: "মূল্য যাচাই করা যায়নি",
        });
      }
    }

    return {
      lines,
      rejected,
      subtotal: lines.reduce((sum, line) => sum + line.totalPrice, 0),
      shippingMethods: SHIPPING_METHODS.filter((m) => m.enabled).map(
        ({ id, label, cost, eta }) => ({ id, label, cost, eta }),
      ),
      currency: "BDT",
    };
  }

  /**
   * Places the order through the EXISTING pipeline: server cart (engine
   * pricing) → CheckoutService.fullCheckout (validation, reservation,
   * shipping, draft) → order subscriber. Returns the real order number.
   */
  async placeOrder(input: PlaceOrderInput): Promise<PlacedOrder> {
    // Revalidate everything server-side first; reject if anything is unsellable.
    const quote = await this.quote(input.items, input.viewer.type);
    if (quote.rejected.length > 0) {
      const first = quote.rejected[0];
      throw new Error(
        `${first.name ?? "একটি প্রোডাক্ট"} — ${first.reason}। কার্ট আপডেট করে আবার চেষ্টা করুন।`,
      );
    }
    if (quote.lines.length === 0) {
      throw new Error("কার্ট খালি — অর্ডার করার মতো কিছু নেই।");
    }

    const method = SHIPPING_METHODS.find((m) => m.id === input.shippingMethodId && m.enabled);
    if (!method) {
      throw new Error("ডেলিভারি পদ্ধতিটি উপলব্ধ নয়।");
    }

    const cartService = new CartService();
    const checkoutService = new CheckoutService();

    // Fresh single-use server cart — never reuses or exposes another user's cart.
    const cart = await cartService.getOrCreateCart({
      sessionId: `storefront-${randomUUID()}`,
      userId: input.viewer.userId,
      type: input.viewer.type,
      currency: "BDT",
    });

    let cartId = cart.id;
    for (const item of input.items) {
      const updated = await cartService.addItem(
        cartId,
        {
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: Math.max(1, Math.min(MAX_QTY, Math.floor(item.quantity))),
          role: cartRole(input.viewer.type),
        },
        input.viewer.type,
      );
      cartId = updated.id;
    }

    const { AddressParserService } = await import("@/features/address/services/address-parser-service");
    const parsedAddress = AddressParserService.parseAddress(input.shipping.address);

    const shippingInfo: CheckoutShippingInfo = {
      ...input.shipping,
      district: input.shipping.district || parsedAddress.detectedDistrict || "Dhaka",
      upazila: input.shipping.upazila || parsedAddress.detectedUpazila,
      shippingMethod: method.id,
      deliveryCharge: Math.round(method.cost * 100),
      paymentMethod: input.paymentMethod,
    };

    const { draft } = await checkoutService.fullCheckout(cartId, shippingInfo, input.viewer.userId);

    // The event subscriber (checkout.order_draft_created) may have already
    // created the order synchronously. Check before attempting a duplicate.
    let order = await new OrderRepository().findByCheckoutDraft(draft.id);

    if (!order) {
      const { OrderService } = await import("@/features/order/services/order-service");
      const orderService = new OrderService();
      const generatedOrderNumber =
        "ORD-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100).toString();

      const itemsMapped = await Promise.all(
        draft.resolvedPrices.map(async (priceItem, index) => {
          let productName = "Product Item";
          let unitCostBasis = Math.floor(priceItem.unitPrice * 0.7);

          try {
            const p = await this.products.findById(priceItem.productId);
            if (p) {
              productName = p.name;
              const resellerCost = p.resellerPrice ?? p.record?.resellerPrice;
              if (draft.type === "reseller" && resellerCost) {
                unitCostBasis = Math.round(resellerCost < 1000 ? resellerCost * 100 : resellerCost);
              }
            }
          } catch {}

          const quotedLine = quote.lines[index];
          const finalSellingPriceBdt = quotedLine ? quotedLine.unitPrice : Math.round(priceItem.unitPrice) / 100;
          const finalSellingPriceMinor = Math.round(finalSellingPriceBdt * 100);

          const totalSellingPrice = finalSellingPriceMinor * priceItem.quantity;
          const totalCostBasis = unitCostBasis * priceItem.quantity;
          const totalProfit = Math.max(0, totalSellingPrice - totalCostBasis);
          const marginPercent = totalSellingPrice > 0 ? (totalProfit / totalSellingPrice) * 100 : 0;

          return {
            productId: priceItem.productId,
            variantSku: priceItem.variantSku || "SKU-DEFAULT",
            productName,
            quantity: priceItem.quantity,
            unitSellingPrice: finalSellingPriceMinor,
            unitCostBasis,
            totalSellingPrice,
            totalCostBasis,
            totalProfit,
            marginPercent,
            currency: priceItem.currency,
            pricingSource: priceItem.pricingSource,
            appliedRules: priceItem.appliedRules || [],
          };
        }),
      );

      const subtotal = itemsMapped.reduce((acc, curr) => acc + curr.totalSellingPrice, 0);
      const totalCostBasis = itemsMapped.reduce((acc, curr) => acc + curr.totalCostBasis, 0);
      const totalProfit = Math.max(0, subtotal - totalCostBasis);
      const deliveryChargeMinor = Math.round(method.cost * 100);
      const calculatedGrandTotalMinor = subtotal + deliveryChargeMinor;

      try {
        order = await orderService.createFromDraft({
          draftId: draft.id,
          checkoutId: draft.checkoutId,
          cartId: draft.cartId,
          orderNumber: generatedOrderNumber,
          type: draft.type as any,
          customer: {
            customerId: input.viewer.userId,
            name: input.shipping.receiverName || "Guest Customer",
            phone: input.shipping.phone || "",
            email: input.shipping.email,
          },
          shipping: {
            ...draft.shipping,
            upazila: (draft.shipping as any).upazila || null,
            area: (draft.shipping as any).area || null,
          } as any,
          pricing: {
            items: itemsMapped,
            subtotal,
            discountTotal: 0,
            taxTotal: 0,
            grandTotal: calculatedGrandTotalMinor,
            currency: "BDT",
          },
          profitPreview: {
            totalCostBasis,
            totalRevenue: subtotal,
            totalProfit,
            averageMargin: subtotal > 0 ? (totalProfit / subtotal) * 100 : 0,
          },
        });
      } catch (err) {
        if (err instanceof ConflictError) {
          // Subscriber beat us to it — look up the order it created.
          order = await new OrderRepository().findByCheckoutDraft(draft.id);
          if (!order) throw err;
        } else {
          logger.error("StorefrontCheckoutService: createFromDraft failed", err, {
            draftId: draft.id,
          });
          throw err;
        }
      }
    }

    const orderNumber = order.orderNumber;
    const finalSubtotalBdt = quote.lines.reduce((sum, l) => sum + l.totalPrice, 0);

    return {
      orderNumber,
      accessToken: createOrderAccessToken(orderNumber),
      grandTotal: finalSubtotalBdt + method.cost,
      subtotal: finalSubtotalBdt,
      shippingCost: method.cost,
      itemCount: quote.lines.reduce((sum, l) => sum + l.quantity, 0),
    };
  }
}

export default StorefrontCheckoutService;
