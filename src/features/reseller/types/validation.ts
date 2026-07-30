import { z } from "zod";
import { emailSchema, phoneSchema, objectIdSchema } from "@/lib/utils/validation";

const moneySchema = z.coerce
  .number()
  .int()
  .nonnegative("Amount must be a non-negative integer (cents)");

const percentageSchema = z.coerce
  .number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100");

export const resellerAddressSchema = z.object({
  country: z.string().min(2, "Country is required").trim(),
  division: z.string().min(2, "Division is required").trim(),
  district: z.string().min(2, "District is required").trim(),
  upazila: z.string().min(2, "Upazila is required").trim(),
  area: z.string().min(2, "Area is required").trim(),
  postalCode: z.string().min(4, "Postal code is required").trim(),
  fullAddress: z.string().min(5, "Full address is required").trim(),
});

export const createResellerSchema = z.object({
  businessName: z.string().min(2, "Business name is required").trim(),
  ownerName: z.string().min(2, "Owner name is required").trim(),
  contactPerson: z.string().min(2, "Contact person is required").trim(),
  email: emailSchema,
  phone: phoneSchema,
  alternativePhone: phoneSchema.optional().or(z.literal("")),
  logo: z.string().url("Invalid logo URL").optional().or(z.literal("")),
  coverImage: z.string().url("Invalid cover image URL").optional().or(z.literal("")),
  businessType: z.string().min(2, "Business type is required").trim(),
  address: resellerAddressSchema,
  nidNumber: z.string().optional().or(z.literal("")),
  tradeLicenseNumber: z.string().optional().or(z.literal("")),
  userId: objectIdSchema.optional().or(z.literal("")),
  collections: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional().or(z.literal("")),
  resellerMarkupPercent: z.coerce.number().min(0).max(100).optional(),
  wholesaleMarkupPercent: z.coerce.number().min(0).max(100).optional(),
});

export type CreateResellerInput = z.infer<typeof createResellerSchema>;

export const updateResellerSchema = createResellerSchema.partial();

export type UpdateResellerInput = z.infer<typeof updateResellerSchema>;

export const resellerStatusSchema = z.enum([
  "pending",
  "active",
  "suspended",
  "blocked",
  "archived",
]);

export const assignProductSchema = z.object({
  resellerId: objectIdSchema,
  productId: objectIdSchema,
  variantSku: z.string().trim().optional().or(z.literal("")),
  customTitle: z.string().trim().optional().or(z.literal("")),
  customDescription: z.string().trim().optional().or(z.literal("")),
  personalNotes: z.string().trim().optional().or(z.literal("")),
  sellingPrice: moneySchema.optional(),
  collectionIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
});

export type AssignProductInput = z.infer<typeof assignProductSchema>;

export const updateResellerProductSchema = z.object({
  customTitle: z.string().trim().optional().or(z.literal("")),
  customDescription: z.string().trim().optional().or(z.literal("")),
  personalNotes: z.string().trim().optional().or(z.literal("")),
  sellingStatus: z.enum(["draft", "active", "hidden", "out_of_catalog"]).optional(),
  isFavorite: z.boolean().optional(),
  isHidden: z.boolean().optional(),
  collectionIds: z.array(z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateResellerProductInput = z.infer<typeof updateResellerProductSchema>;

export const updateResellerProductPricingSchema = z.object({
  sellingPrice: moneySchema,
  discountAmount: moneySchema.optional(),
  discountPercentage: percentageSchema.optional(),
  currency: z.string().trim().length(3).optional(),
});

export type UpdateResellerProductPricingInput = z.infer<typeof updateResellerProductPricingSchema>;

export const createCollectionSchema = z.object({
  resellerId: objectIdSchema,
  name: z.string().min(2, "Collection name is required").trim(),
  description: z.string().optional().or(z.literal("")),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export const createProductGroupSchema = z.object({
  resellerId: objectIdSchema,
  name: z.string().min(2, "Group name is required").trim(),
  description: z.string().optional().or(z.literal("")),
});

export type CreateProductGroupInput = z.infer<typeof createProductGroupSchema>;

export const resellerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["pending", "active", "suspended", "blocked", "archived", "all"]).default("all"),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ResellerListQuery = z.infer<typeof resellerListQuerySchema>;

export const resellerProductSearchSchema = z.object({
  /** ObjectId, or "me" / "current" for session-bound reseller portal */
  resellerId: z.union([objectIdSchema, z.literal("me"), z.literal("current")]),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  categoryId: objectIdSchema.optional(),
  supplierId: objectIdSchema.optional(),
  sellingStatus: z.enum(["draft", "active", "hidden", "out_of_catalog", "all"]).default("all"),
  isFavorite: z.coerce.boolean().optional(),
  isHidden: z.coerce.boolean().optional(),
  collectionId: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ResellerProductSearchQuery = z.infer<typeof resellerProductSearchSchema>;
