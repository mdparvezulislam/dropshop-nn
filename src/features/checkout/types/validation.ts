import { z } from "zod";
import { objectIdSchema, phoneSchema, emailSchema } from "@/shared/utils/validation";

const cartTypeSchema = z.enum(["guest", "customer", "reseller", "wholesaler"]);

export const addCartItemSchema = z.object({
  cartId: objectIdSchema.optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  resellerId: z.string().optional(),
  productId: objectIdSchema,
  variantSku: z.string().trim().optional().or(z.literal("")),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  type: cartTypeSchema.default("customer"),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  cartId: objectIdSchema,
  itemIndex: z.coerce.number().int().nonnegative(),
  quantity: z.coerce.number().int().nonnegative("Quantity cannot be negative"),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const removeCartItemSchema = z.object({
  cartId: objectIdSchema,
  itemIndex: z.coerce.number().int().nonnegative(),
});

export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;

export const getActiveCartSchema = z.object({
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  resellerId: z.string().optional(),
  type: cartTypeSchema.default("customer"),
});

export type GetActiveCartInput = z.infer<typeof getActiveCartSchema>;

export const checkoutShippingSchema = z.object({
  receiverName: z.string().min(1, "Receiver name is required").max(200).trim(),
  phone: phoneSchema,
  alternativePhone: phoneSchema.optional().or(z.literal("")),
  division: z.string().min(1, "Division is required").max(100).trim(),
  district: z.string().min(1, "District is required").max(100).trim(),
  upazila: z.string().min(1, "Upazila is required").max(100).trim(),
  area: z.string().min(1, "Area is required").max(100).trim(),
  address: z.string().min(1, "Address is required").max(500).trim(),
  deliveryNote: z.string().max(500).optional().or(z.literal("")),
});

export type CheckoutShippingInput = z.infer<typeof checkoutShippingSchema>;

export const startCheckoutSchema = z.object({
  cartId: objectIdSchema,
  sessionId: z.string().optional(),
});

export type StartCheckoutInput = z.infer<typeof startCheckoutSchema>;

export const submitCheckoutSchema = z.object({
  checkoutId: objectIdSchema,
  shipping: checkoutShippingSchema,
});

export type SubmitCheckoutInput = z.infer<typeof submitCheckoutSchema>;

export const checkoutListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(["active", "completed", "expired", "failed", "all"]).default("all"),
  type: cartTypeSchema.optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CheckoutListQuery = z.infer<typeof checkoutListQuerySchema>;

export const completeRoleCheckoutSchema = z.object({
  type: cartTypeSchema.default("reseller"),
  resellerId: z.string().optional(),
  wholesaleId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  paymentMethod: z.enum(["cod", "prepaid"]).default("cod"),
  customer: z.object({
    name: z.string().min(1).max(200).trim(),
    phone: phoneSchema,
    email: emailSchema.optional().or(z.literal("")),
    address: z.string().min(1).max(500).trim(),
    district: z.string().min(1).max(100).trim(),
    division: z.string().max(100).optional(),
    upazila: z.string().max(100).optional(),
    area: z.string().max(100).optional(),
  }),
  items: z
    .array(
      z.object({
        productId: objectIdSchema,
        variantSku: z.string().optional(),
        quantity: z.coerce.number().int().positive(),
        unitPriceOverride: z.coerce.number().int().nonnegative().optional(),
      }),
    )
    .min(1),
  deliveryCharge: z.coerce.number().int().nonnegative().default(0),
});

export type CompleteRoleCheckoutInput = z.infer<typeof completeRoleCheckoutSchema>;
