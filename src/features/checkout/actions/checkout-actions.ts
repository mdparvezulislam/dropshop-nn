"use server";

import { auth } from "@/shared/lib/auth";
import { CartService } from "../services/cart-service";
import { CheckoutService } from "../services/checkout-service";
import {
  addCartItemSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  getActiveCartSchema,
  startCheckoutSchema,
  submitCheckoutSchema,
  checkoutListQuerySchema,
  checkoutShippingSchema,
  completeRoleCheckoutSchema,
} from "../types/validation";
import { ForbiddenError, UnauthorizedError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { revalidatePath } from "next/cache";

function checkPermission(
  session: { user?: { permissions?: string[]; email?: string | null; id?: string } } | null,
  permission: string,
): void {
  if (!session) {
    throw new UnauthorizedError("Session expired or invalid");
  }
  const permissions = session.user?.permissions || [];
  if (!permissions.includes("*") && !permissions.includes(permission)) {
    throw new ForbiddenError(`Missing required permission: ${permission}`);
  }
}

export async function getOrCreateCartAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["getOrCreateCart"]>>;
  error?: string;
}> {
  try {
    const validated = getActiveCartSchema.parse(formData);
    const service = new CartService();
    const result = await service.getOrCreateCart({
      type: validated.type as any,
      sessionId: validated.sessionId,
      userId: validated.userId,
      resellerId: validated.resellerId,
    });
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getOrCreateCartAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function addCartItemAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["addItem"]>>;
  error?: string;
}> {
  try {
    const validated = addCartItemSchema.parse(formData);
    const service = new CartService();

    const cart = validated.cartId
      ? await service.getCart(validated.cartId)
      : await service.getOrCreateCart({
          type: validated.type as any,
          sessionId: validated.sessionId,
          userId: validated.userId,
          resellerId: validated.resellerId,
        });

    const cartId = cart!.id;
    const result = await service.addItem(
      cartId,
      {
        productId: validated.productId,
        variantSku: validated.variantSku,
        quantity: validated.quantity,
        role:
          validated.type === "reseller"
            ? "reseller"
            : validated.type === "wholesaler"
              ? "wholesale"
              : "retail",
      },
      validated.type as any,
    );

    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("addCartItemAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateCartItemAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["updateItemQuantity"]>>;
  error?: string;
}> {
  try {
    const validated = updateCartItemSchema.parse(formData);
    const service = new CartService();
    const result = await service.updateItemQuantity(
      validated.cartId,
      validated.itemIndex,
      validated.quantity,
    );
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateCartItemAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function removeCartItemAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["removeItem"]>>;
  error?: string;
}> {
  try {
    const validated = removeCartItemSchema.parse(formData);
    const service = new CartService();
    const result = await service.removeItem(validated.cartId, validated.itemIndex);
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("removeCartItemAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function clearCartAction(cartId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["clearCart"]>>;
  error?: string;
}> {
  try {
    const service = new CartService();
    const result = await service.clearCart(cartId);
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("clearCartAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function startCheckoutAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["startCheckout"]>>;
  error?: string;
}> {
  try {
    const validated = startCheckoutSchema.parse(formData);
    const service = new CheckoutService();
    const result = await service.startCheckout(validated.cartId);
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("startCheckoutAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function setCheckoutShippingAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["setShipping"]>>;
  error?: string;
}> {
  try {
    const validated = submitCheckoutSchema.parse(formData);
    const service = new CheckoutService();
    const result = await service.setShipping(validated.checkoutId, validated.shipping);
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("setCheckoutShippingAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function submitCheckoutAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["fullCheckout"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Checkout.Create");

  try {
    const validated = submitCheckoutSchema.parse(formData);
    const service = new CheckoutService();
    const sessionData = await service.getSession(validated.checkoutId);
    if (!sessionData) return { success: false, error: "Checkout session not found" };

    const result = await service.fullCheckout(
      sessionData.cartId,
      validated.shipping,
      session?.user?.id,
    );
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("submitCheckoutAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getCheckoutSessionAction(checkoutId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["getSession"]>>;
  error?: string;
}> {
  try {
    const service = new CheckoutService();
    const result = await service.getSession(checkoutId);
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getCheckoutSessionAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getOrderDraftAction(draftId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["getDraft"]>>;
  error?: string;
}> {
  try {
    const service = new CheckoutService();
    const result = await service.getDraft(draftId);
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getOrderDraftAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listCheckoutsAction(query: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["listCheckouts"]>>;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Checkout.View");

  try {
    const validated = checkoutListQuerySchema.parse(query);
    const filter: Record<string, unknown> = {};
    if (validated.status && validated.status !== "all") filter.status = validated.status;
    if (validated.type) filter.type = validated.type;

    const service = new CheckoutService();
    const result = await service.listCheckouts(
      filter,
      {
        page: validated.page,
        limit: validated.limit,
      },
      validated.sortBy
        ? { sortBy: validated.sortBy, sortOrder: validated.sortOrder }
        : { sortBy: "createdAt", sortOrder: "desc" },
    );
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("listCheckoutsAction failed", error);
    return { success: false, error: error.message };
  }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("880")) return `+${digits}`;
  if (digits.startsWith("0")) return `+88${digits}`;
  return `+880${digits}`;
}

/**
 * Role-aware checkout entry point.
 * One pipeline for reseller / wholesale / customer — behavior differs by cart type only.
 */
export async function completeRoleCheckoutAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["fullCheckout"]>>;
  error?: string;
}> {
  try {
    const validated = completeRoleCheckoutSchema.parse({
      ...(formData as object),
      customer: {
        ...((formData as { customer?: object })?.customer ?? {}),
        phone: normalizePhone(
          String((formData as { customer?: { phone?: string } })?.customer?.phone ?? ""),
        ),
      },
    });

    const cartService = new CartService();
    const checkoutService = new CheckoutService();

    const cart = await cartService.getOrCreateCart({
      type: validated.type,
      sessionId: validated.sessionId,
      userId: validated.userId,
      resellerId: validated.resellerId,
      wholesaleId: validated.wholesaleId,
      currency: "BDT",
    });

    await cartService.clearCart(cart.id);

    for (const item of validated.items) {
      await cartService.addItem(
        cart.id,
        {
          productId: item.productId,
          variantSku: item.variantSku,
          quantity: item.quantity,
          role:
            validated.type === "reseller"
              ? "reseller"
              : validated.type === "wholesaler"
                ? "wholesale"
                : "retail",
        },
        validated.type,
      );

      if (item.unitPriceOverride !== undefined) {
        const fresh = await cartService.getCart(cart.id);
        if (fresh) {
          const idx = fresh.items.findIndex(
            (ci) =>
              ci.productId === item.productId &&
              (ci.variantSku ?? "") === (item.variantSku ?? "").toUpperCase().trim(),
          );
          if (idx >= 0) {
            const target = fresh.items[idx];
            const cost = target.profitPreview?.costBasis ?? 0;
            const override = item.unitPriceOverride;
            fresh.items[idx] = {
              ...target,
              resolvedPrice: override,
              profitPreview: {
                costBasis: cost,
                profitAmount: (override - cost) * target.quantity,
                profitMargin: override > 0 ? ((override - cost) / override) * 100 : 0,
              },
            };
            const subtotal = fresh.items.reduce(
              (sum, ci) => sum + ci.resolvedPrice * ci.quantity,
              0,
            );
            const { CartRepository } = await import("../repositories/cart-repository");
            await new CartRepository().update(cart.id, {
              items: fresh.items,
              subtotal,
              itemCount: fresh.items.reduce((s, ci) => s + ci.quantity, 0),
              lastActivityAt: new Date(),
            } as never);
          }
        }
      }
    }

    const shipping = {
      receiverName: validated.customer.name,
      phone: validated.customer.phone,
      division: validated.customer.division || validated.customer.district,
      district: validated.customer.district,
      upazila: validated.customer.upazila || validated.customer.district,
      area: validated.customer.area || validated.customer.address.slice(0, 100),
      address: validated.customer.address,
      deliveryNote: `payment:${validated.paymentMethod};deliveryCharge:${validated.deliveryCharge}`,
    };

    const result = await checkoutService.fullCheckout(cart.id, shipping, validated.userId);

    revalidatePath("/reseller/orders");
    revalidatePath("/wholesale/orders");
    revalidatePath("/dashboard/orders");
    return { success: true, data: result };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    logger.error("completeRoleCheckoutAction failed", error as Error);
    return { success: false, error: message };
  }
}
