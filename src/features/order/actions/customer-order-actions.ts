"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { OrderRepository } from "../repositories/order-repository";
import type { Order, OrderTimelineEntry } from "../domain/order-entity";
import type { OrderStatus } from "../domain/state-machine";
import { verifyOrderAccessToken } from "../utils/order-access-token";
import { SHIPPING_METHODS, PAYMENT_METHODS } from "@/config/site";
import { logger } from "@/lib/utils/logger";

/**
 * Customer-facing order reads. Hard rules:
 *  - A session user can only ever read orders whose customer snapshot matches
 *    their own id or email (ownership enforced server-side on every call).
 *  - Guests read exactly one order via a signed access token, or via
 *    orderNumber + matching phone (both required — never phone alone).
 *  - DTOs are allow-listed: internal fields (cost basis, profit, margins,
 *    internal notes, supplier references, actor identities) never leave.
 *  - All money values leave as BDT major units taken from the ORDER — the
 *    client never recalculates anything.
 */

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function minorToBdt(minor: number): number {
  return Math.round(minor) / 100;
}

// ── Safe DTOs ────────────────────────────────────────────────────────────

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  itemCount: number;
  /** BDT. */
  grandTotal: number;
  firstItemName?: string;
}

export interface CustomerOrderTimelineStep {
  summary: string;
  at: string;
}

export interface CustomerOrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  items: Array<{
    productId: string;
    name: string;
    variantSku?: string;
    quantity: number;
    /** BDT. */
    unitPrice: number;
    totalPrice: number;
  }>;
  /** All BDT, straight from the order document. */
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
  address: {
    receiverName: string;
    phone: string;
    division: string;
    district: string;
    upazila: string;
    address: string;
    postalCode?: string;
    landmark?: string;
    deliveryNote?: string;
  };
  customerName: string;
  customerPhone: string;
  shippingMethodLabel?: string;
  shippingEta?: string;
  paymentMethodLabel?: string;
  courier?: { name?: string; trackingNumber?: string; trackingUrl?: string };
  timeline: CustomerOrderTimelineStep[];
}

export interface TrackOrderResult {
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  district: string;
  courier?: { name?: string; trackingNumber?: string; trackingUrl?: string };
  timeline: CustomerOrderTimelineStep[];
}

// ── Mappers (allow-list only) ────────────────────────────────────────────

function mapTimeline(entries: OrderTimelineEntry[]): CustomerOrderTimelineStep[] {
  return entries
    .filter((e) => e.summary)
    .map((e) => ({
      summary: e.summary,
      at: new Date(e.timestamp).toISOString(),
    }));
}

function toSummary(order: Order): CustomerOrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    placedAt: new Date(order.createdAt ?? Date.now()).toISOString(),
    itemCount: order.pricing.items.reduce((sum, item) => sum + item.quantity, 0),
    grandTotal: minorToBdt(order.pricing.grandTotal),
    firstItemName: order.pricing.items[0]?.productName,
  };
}

function toDetail(order: Order): CustomerOrderDetail {
  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === order.shipping.shippingMethod);
  const paymentMethod = PAYMENT_METHODS.find((m) => m.id === order.shipping.paymentMethod);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    placedAt: new Date(order.createdAt ?? Date.now()).toISOString(),
    items: order.pricing.items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      variantSku:
        item.variantSku && item.variantSku !== "SKU-DEFAULT" ? item.variantSku : undefined,
      quantity: item.quantity,
      unitPrice: minorToBdt(item.unitSellingPrice),
      totalPrice: minorToBdt(item.totalSellingPrice),
    })),
    subtotal: minorToBdt(order.pricing.subtotal),
    discountTotal: minorToBdt(order.pricing.discountTotal),
    shippingTotal: minorToBdt(order.pricing.shippingTotal ?? order.shipping.deliveryCharge ?? 0),
    grandTotal: minorToBdt(order.pricing.grandTotal),
    address: {
      receiverName: order.shipping.receiverName,
      phone: order.shipping.phone,
      division: order.shipping.division,
      district: order.shipping.district,
      upazila: order.shipping.upazila,
      address: order.shipping.address,
      postalCode: order.shipping.postalCode ?? undefined,
      landmark: order.shipping.landmark ?? undefined,
      deliveryNote: order.shipping.deliveryNote ?? undefined,
    },
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    shippingMethodLabel: shippingMethod?.label,
    shippingEta: shippingMethod?.eta,
    paymentMethodLabel: paymentMethod?.label ?? order.shipping.paymentMethod ?? undefined,
    courier: order.shippingInfo
      ? {
          name: order.shippingInfo.courierName ?? undefined,
          trackingNumber: order.shippingInfo.trackingNumber ?? undefined,
          trackingUrl: order.shippingInfo.trackingUrl ?? undefined,
        }
      : undefined,
    timeline: mapTimeline(order.timeline ?? []),
  };
}

function toTracking(order: Order): TrackOrderResult {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    placedAt: new Date(order.createdAt ?? Date.now()).toISOString(),
    district: order.shipping.district,
    courier: order.shippingInfo
      ? {
          name: order.shippingInfo.courierName ?? undefined,
          trackingNumber: order.shippingInfo.trackingNumber ?? undefined,
          trackingUrl: order.shippingInfo.trackingUrl ?? undefined,
        }
      : undefined,
    timeline: mapTimeline(order.timeline ?? []),
  };
}

// ── Ownership ────────────────────────────────────────────────────────────

interface SessionIdentity {
  userId: string;
  email?: string;
}

async function requireSession(): Promise<SessionIdentity | null> {
  const session = await auth();
  const user = session?.user as { id?: string; email?: string } | undefined;
  if (!user?.id) return null;
  return { userId: user.id, email: user.email ?? undefined };
}

function ownershipFilter(identity: SessionIdentity): Record<string, unknown> {
  const clauses: Record<string, unknown>[] = [{ "customer.customerId": identity.userId }];
  if (identity.email) clauses.push({ "customer.email": identity.email });
  return { $or: clauses };
}

function ownsOrder(order: Order, identity: SessionIdentity): boolean {
  return (
    order.customer.customerId === identity.userId ||
    (Boolean(identity.email) && order.customer.email === identity.email)
  );
}

// ── Validation ───────────────────────────────────────────────────────────

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listParamsSchema = z
  .object({
    page: z.coerce.number().int().min(1).max(500).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    search: z.string().trim().min(1).max(60).optional(),
    status: z.string().trim().max(30).optional(),
    sort: z.enum(["newest", "oldest"]).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strip();

export type CustomerOrderListParams = z.input<typeof listParamsSchema>;

const orderNumberSchema = z
  .string()
  .trim()
  .min(4)
  .max(40)
  .regex(/^[A-Za-z0-9-]+$/, "invalid order number");

const bdPhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^\+?880/, "0"))
  .pipe(z.string().regex(/^01[3-9]\d{8}$/));

// ── Actions ──────────────────────────────────────────────────────────────

export async function getMyOrdersAction(params: CustomerOrderListParams = {}): Promise<
  ActionResult<{
    items: CustomerOrderSummary[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>
> {
  try {
    const identity = await requireSession();
    if (!identity) return { success: false, error: "লগইন করুন" };

    const parsed = listParamsSchema.parse(params);
    const page = parsed.page ?? 1;
    const limit = parsed.limit ?? 10;

    const filter: Record<string, unknown> = { ...ownershipFilter(identity) };
    if (parsed.status) filter.status = parsed.status;
    if (parsed.from || parsed.to) {
      const range: Record<string, Date> = {};
      if (parsed.from) range.$gte = parsed.from;
      if (parsed.to) {
        const end = new Date(parsed.to);
        end.setHours(23, 59, 59, 999);
        range.$lte = end;
      }
      filter.createdAt = range;
    }
    if (parsed.search) {
      filter.orderNumber = { $regex: escapeRegExp(parsed.search), $options: "i" };
    }

    const result = await new OrderRepository().findPaginated(
      filter,
      { page, limit },
      { sortBy: "createdAt", sortOrder: parsed.sort === "oldest" ? "asc" : "desc" },
    );

    return {
      success: true,
      data: {
        items: result.items.map(toSummary),
        totalCount: result.totalCount,
        page,
        pageSize: limit,
        totalPages: Math.max(1, Math.ceil(result.totalCount / limit)),
      },
    };
  } catch (error) {
    logger.error("getMyOrdersAction failed", error);
    return { success: false, error: "অর্ডার লোড করা যায়নি। আবার চেষ্টা করুন।" };
  }
}

export async function getMyOrderDetailAction(
  orderId: string,
): Promise<ActionResult<CustomerOrderDetail | null>> {
  try {
    const identity = await requireSession();
    if (!identity) return { success: false, error: "লগইন করুন" };

    const id = z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .parse(orderId);
    const order = await new OrderRepository().findById(id);

    // Ownership is mandatory — a valid id belonging to someone else is a 404,
    // not a different error (no existence oracle).
    if (!order || !ownsOrder(order, identity)) return { success: true, data: null };

    return { success: true, data: toDetail(order) };
  } catch (error) {
    logger.error("getMyOrderDetailAction failed", error);
    return { success: false, error: "অর্ডারটি লোড করা যায়নি।" };
  }
}

/** Guest success-page access via the signed token issued at placement. */
export async function getOrderByAccessTokenAction(
  token: string,
): Promise<ActionResult<CustomerOrderDetail | null>> {
  try {
    const raw = z.string().min(10).max(300).parse(token);
    const orderNumber = verifyOrderAccessToken(raw);
    if (!orderNumber) return { success: true, data: null };

    const order = await new OrderRepository().findByOrderNumber(orderNumber);
    if (!order) return { success: true, data: null };

    return { success: true, data: toDetail(order) };
  } catch (error) {
    logger.error("getOrderByAccessTokenAction failed", error);
    return { success: false, error: "অর্ডারটি লোড করা যায়নি।" };
  }
}

/**
 * Public tracking: BOTH the order number and the matching customer phone are
 * required. Result is the limited tracking DTO (status/timeline/courier) —
 * never the full order, never a phone-only sweep of someone else's orders.
 */
export async function trackOrderAction(input: {
  orderNumber: string;
  phone: string;
}): Promise<ActionResult<TrackOrderResult | null>> {
  try {
    const orderNumber = orderNumberSchema.parse(input.orderNumber);
    const phoneParsed = bdPhoneSchema.safeParse(input.phone);
    if (!phoneParsed.success) {
      return { success: false, error: "সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)" };
    }
    const phone = phoneParsed.data;

    const order = await new OrderRepository().findByOrderNumber(orderNumber);
    const normalize = (value: string) => value.replace(/[\s-]/g, "").replace(/^\+?880/, "0");
    const matches =
      order &&
      (normalize(order.customer.phone ?? "") === phone ||
        normalize(order.shipping.phone ?? "") === phone);

    // Identical response for wrong number and wrong phone — no oracle.
    if (!order || !matches) return { success: true, data: null };

    return { success: true, data: toTracking(order) };
  } catch (error) {
    logger.error("trackOrderAction failed", error);
    return { success: false, error: "অর্ডার খুঁজে পাওয়া যায়নি। তথ্যগুলো যাচাই করুন।" };
  }
}
