"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  StorefrontCheckoutService,
  type PlacedOrder,
  type StorefrontQuote,
} from "../services/storefront-checkout-service";
import type { CartType } from "../domain/cart-entity";
import { SHIPPING_METHOD_IDS } from "@/config/site";
import { logger } from "@/lib/utils/logger";

/**
 * Public storefront checkout actions. Clients send ONLY ids, SKUs and
 * quantities — never prices. Everything money- or stock-related is resolved
 * server-side (see StorefrontCheckoutService).
 */

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

const productIdSchema = z.string().trim().min(1).max(100);

const lineSchema = z.object({
  productId: productIdSchema,
  variantSku: z.string().trim().min(1).max(80).optional(),
  quantity: z.coerce.number().int().min(1).max(99),
  customSellingPriceBdt: z.coerce.number().min(0).optional(),
});

const itemsSchema = z.array(lineSchema).min(1, "কার্ট খালি").max(30);

/** Bangladeshi mobile: 01[3-9]XXXXXXXX (optionally +880/880-prefixed). */
const bdPhoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^\+?880/, "0"))
  .pipe(z.string().regex(/^01[3-9]\d{8}$/, "সঠিক মোবাইল নম্বর দিন (যেমন: 01712345678)"));

const addressSchema = z.object({
  receiverName: z.string().trim().min(3, "নাম দিন").max(80),
  phone: bdPhoneSchema,
  alternativePhone: bdPhoneSchema.optional().or(z.literal("").transform(() => undefined)),
  email: z
    .string()
    .trim()
    .email("সঠিক ইমেইল দিন")
    .max(120)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  division: z.string().trim().min(2, "বিভাগ নির্বাচন করুন").max(40),
  district: z.string().trim().min(2, "জেলা নির্বাচন করুন").max(40),
  // Optional: checkout asks for district + full address only. A thana/upazila
  // line the customer never filled in is not worth blocking an order over —
  // the street address already carries it.

  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "৪ সংখ্যার পোস্ট কোড দিন")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  address: z.string().trim().min(8, "সম্পূর্ণ ঠিকানা দিন").max(250),
  landmark: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  addressLabel: z.enum(["home", "office"]).optional(),
  deliveryNote: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

const placeOrderSchema = z.object({
  items: itemsSchema,
  shipping: addressSchema,
  // Derived from SHIPPING_METHODS so config and validation cannot drift apart.
  shippingMethodId: z.enum(SHIPPING_METHOD_IDS),
  // Cash on delivery is the only settlement method the platform supports.
  // Gateways are a later phase; accepting any other value here would create
  // orders nothing can actually collect against.
  paymentMethod: z.literal("cod").default("cod"),
});

export type StorefrontAddressInput = z.input<typeof addressSchema>;

async function resolveViewer(): Promise<{ userId?: string; type: CartType }> {
  try {
    const session = await auth();
    const user = session?.user as
      { id?: string; role?: string; memberships?: string[] } | undefined;
    if (!user?.id) return { type: "guest" };
    const memberships = user.memberships ?? [];
    if (memberships.includes("wholesaler")) return { userId: user.id, type: "wholesaler" };
    if (memberships.includes("reseller")) return { userId: user.id, type: "reseller" };
    return { userId: user.id, type: "customer" };
  } catch {
    return { type: "guest" };
  }
}

function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "তথ্যগুলো যাচাই করা যায়নি";
}

/** Server revalidation for the review step — prices, stock, visibility. */
export async function quoteStorefrontCheckoutAction(
  items: unknown,
): Promise<ActionResult<StorefrontQuote>> {
  try {
    const parsed = itemsSchema.safeParse(items);
    if (!parsed.success) return { success: false, error: firstZodMessage(parsed.error) };

    const viewer = await resolveViewer();
    const quote = await new StorefrontCheckoutService().quote(parsed.data, viewer.type);
    return { success: true, data: quote };
  } catch (error) {
    logger.error("quoteStorefrontCheckoutAction failed", error);
    return { success: false, error: "কার্ট যাচাই করা যায়নি। আবার চেষ্টা করুন।" };
  }
}

/** Final order placement — full server-side revalidation before commit. */
export async function placeStorefrontOrderAction(
  input: unknown,
): Promise<ActionResult<PlacedOrder>> {
  try {
    const parsed = placeOrderSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: firstZodMessage(parsed.error) };

    const viewer = await resolveViewer();
    const order = await new StorefrontCheckoutService().placeOrder({
      items: parsed.data.items,
      // The legacy pipeline requires both `upazila` and `area`. Checkout no
      // longer asks for a thana line, so both settle to "" rather than being
      // back-filled with the district — a duplicated district in the address
      // reads as real sub-area data that nobody entered.
      shipping: {
          ...parsed.data.shipping,
        },
      shippingMethodId: parsed.data.shippingMethodId,
      paymentMethod: parsed.data.paymentMethod,
      viewer,
    });
    return { success: true, data: order };
  } catch (error) {
    logger.error("placeStorefrontOrderAction failed", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
    return { success: false, error: message };
  }
}
