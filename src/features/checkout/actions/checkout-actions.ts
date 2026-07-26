"use server";

import { auth } from "@/lib/auth";
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
import { checkPermission } from "@/lib/check-permission";
import { DEFAULT_CURRENCY } from "@/constants";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

type ActorIdentity = { userId: string; role: string; memberships: string[] };

/**
 * SECURITY: identity always comes from the session — never from the client.
 * Cart/checkout ids are opaque handles, so every id-taking action must prove
 * the record belongs to the caller before reading or mutating it.
 */
async function requireActor(): Promise<ActorIdentity | null> {
  const session = await auth();
  const user = session?.user as
    | { id?: string; role?: string; memberships?: string[] }
    | undefined;
  if (!user?.id) return null;
  return {
    userId: user.id,
    role: (user.role ?? "").toLowerCase().replace(/\s+/g, "_"),
    memberships: user.memberships ?? [],
  };
}

function isStaff(actor: ActorIdentity): boolean {
  return actor.role === "admin" || actor.role === "super_admin" || actor.role.includes("admin");
}

function actorOwnsCart(
  cart: { userId?: string; resellerId?: string; wholesaleId?: string },
  actor: ActorIdentity,
): boolean {
  if (isStaff(actor)) return true;
  return (
    cart.userId === actor.userId ||
    cart.resellerId === actor.userId ||
    cart.wholesaleId === actor.userId
  );
}

const UNAUTHENTICATED = { success: false as const, error: "Authentication required" };
const FORBIDDEN = { success: false as const, error: "Not found" };
const GENERIC_ERROR = "Request could not be completed";

/** Loads a cart only when the session user owns it. */
async function loadOwnedCart(cartId: string, actor: ActorIdentity) {
  const cart = await new CartService().getCart(cartId);
  if (!cart || !actorOwnsCart(cart, actor)) return null;
  return cart;
}

export async function getOrCreateCartAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["getOrCreateCart"]>>;
  error?: string;
}> {
  try {
    const actor = await requireActor();
    if (!actor) return UNAUTHENTICATED;

    const validated = getActiveCartSchema.parse(formData);
    const service = new CartService();
    // Client-supplied userId/resellerId are ignored — identity is the session.
    const result = await service.getOrCreateCart({
      type: validated.type as any,
      userId: actor.userId,
    });
    return { success: true, data: result };
  } catch (error) {
    logger.error("getOrCreateCartAction failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function addCartItemAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["addItem"]>>;
  error?: string;
}> {
  try {
    const actor = await requireActor();
    if (!actor) return UNAUTHENTICATED;

    const validated = addCartItemSchema.parse(formData);
    const service = new CartService();

    const cart = validated.cartId
      ? await loadOwnedCart(validated.cartId, actor)
      : await service.getOrCreateCart({
          type: validated.type as any,
          userId: actor.userId,
        });
    if (!cart) return FORBIDDEN;

    const cartId = cart.id;
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
  } catch (error) {
    logger.error("addCartItemAction failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function updateCartItemAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["updateItemQuantity"]>>;
  error?: string;
}> {
  try {
    const actor = await requireActor();
    if (!actor) return UNAUTHENTICATED;

    const validated = updateCartItemSchema.parse(formData);
    if (!(await loadOwnedCart(validated.cartId, actor))) return FORBIDDEN;

    const result = await new CartService().updateItemQuantity(
      validated.cartId,
      validated.itemIndex,
      validated.quantity,
    );
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error) {
    logger.error("updateCartItemAction failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function removeCartItemAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["removeItem"]>>;
  error?: string;
}> {
  try {
    const actor = await requireActor();
    if (!actor) return UNAUTHENTICATED;

    const validated = removeCartItemSchema.parse(formData);
    if (!(await loadOwnedCart(validated.cartId, actor))) return FORBIDDEN;

    const result = await new CartService().removeItem(validated.cartId, validated.itemIndex);
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error) {
    logger.error("removeCartItemAction failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function clearCartAction(cartId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CartService["clearCart"]>>;
  error?: string;
}> {
  try {
    const actor = await requireActor();
    if (!actor) return UNAUTHENTICATED;
    if (!(await loadOwnedCart(cartId, actor))) return FORBIDDEN;

    const result = await new CartService().clearCart(cartId);
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error) {
    logger.error("clearCartAction failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function startCheckoutAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["startCheckout"]>>;
  error?: string;
}> {
  try {
    const actor = await requireActor();
    if (!actor) return UNAUTHENTICATED;

    const validated = startCheckoutSchema.parse(formData);
    if (!(await loadOwnedCart(validated.cartId, actor))) return FORBIDDEN;

    const result = await new CheckoutService().startCheckout(validated.cartId);
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error) {
    logger.error("startCheckoutAction failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function setCheckoutShippingAction(formData: unknown): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["setShipping"]>>;
  error?: string;
}> {
  try {
    const actor = await requireActor();
    if (!actor) return UNAUTHENTICATED;

    const validated = submitCheckoutSchema.parse(formData);
    const service = new CheckoutService();
    const existing = await service.getSession(validated.checkoutId);
    if (!existing || !(await loadOwnedCart(existing.cartId, actor))) return FORBIDDEN;

    const result = await service.setShipping(validated.checkoutId, validated.shipping);
    revalidatePath("/dashboard/checkout");
    return { success: true, data: result };
  } catch (error) {
    logger.error("setCheckoutShippingAction failed", error);
    return { success: false, error: GENERIC_ERROR };
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
    const actor = await requireActor();
    if (!actor) return UNAUTHENTICATED;

    const result = await new CheckoutService().getSession(checkoutId);
    // Same response for "missing" and "not yours" — no existence oracle.
    if (!result || !(await loadOwnedCart(result.cartId, actor))) {
      return { success: true, data: null };
    }
    return { success: true, data: result };
  } catch (error) {
    logger.error("getCheckoutSessionAction failed", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function getOrderDraftAction(draftId: string): Promise<{
  success: boolean;
  data?: Awaited<ReturnType<CheckoutService["getDraft"]>>;
  error?: string;
}> {
  try {
    const actor = await requireActor();
    if (!actor) return UNAUTHENTICATED;

    const result = await new CheckoutService().getDraft(draftId);
    if (!result || !(await loadOwnedCart(result.cartId, actor))) {
      return { success: true, data: null };
    }
    return { success: true, data: result };
  } catch (error) {
    logger.error("getOrderDraftAction failed", error);
    return { success: false, error: GENERIC_ERROR };
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

    // Price overrides are a B2B feature: only authenticated reseller/
    // wholesaler/admin sessions may use them, and never below the
    // server-resolved price (mark-up only — the zero-price exploit is closed).
    const session = await auth();
    const sessionUser = session?.user as
      { id?: string; role?: string; memberships?: string[] } | undefined;
    const sessionRole = (sessionUser?.role ?? "").toLowerCase().replace(/\s+/g, "_");
    const canOverridePrices = Boolean(
      sessionUser?.id &&
      (sessionRole === "admin" ||
        sessionRole === "super_admin" ||
        (sessionUser.memberships ?? []).some((m) => m === "reseller" || m === "wholesaler")),
    );

    // Order attribution comes from the session when present; anonymous callers
    // cannot claim another user's identity.
    const cart = await cartService.getOrCreateCart({
      type: validated.type,
      sessionId: validated.sessionId,
      userId: sessionUser?.id ?? undefined,
      resellerId: sessionUser?.id ? validated.resellerId : undefined,
      wholesaleId: sessionUser?.id ? validated.wholesaleId : undefined,
      currency: DEFAULT_CURRENCY,
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

      if (item.unitPriceOverride !== undefined && canOverridePrices) {
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
            // Floor at the server-resolved price: overrides may only mark UP.
            const override = Math.max(item.unitPriceOverride, target.resolvedPrice);
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

    const result = await checkoutService.fullCheckout(cart.id, shipping, sessionUser?.id);

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
