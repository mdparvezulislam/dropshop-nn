import { z } from "zod";

export const productVariantValidationSchema = z.object({
  color: z.string().optional().or(z.literal("")),
  size: z.string().optional().or(z.literal("")),
  storage: z.string().optional().or(z.literal("")),
  ram: z.string().optional().or(z.literal("")),
  capacity: z.string().optional().or(z.literal("")),
  material: z.string().optional().or(z.literal("")),
  sku: z.string().min(2, "Variant SKU is required").trim(),
  customAttributes: z.record(z.string(), z.string()).optional(),
});

export const productMediaValidationSchema = z.object({
  url: z.string().url("Invalid media asset URL"),
  type: z.enum(["image", "video"]).default("image"),
  isFeatured: z.boolean().default(false),
  altText: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().nonnegative().default(0),
});

export const productAttributeValidationSchema = z.object({
  key: z.string().min(1, "Specification key is required").trim(),
  value: z.string().min(1, "Specification value is required").trim(),
  group: z.enum(["specification", "technical", "general"]).default("general"),
});

export const productSEOValidationSchema = z.object({
  metaTitle: z.string().max(70, "Title is too long").optional().or(z.literal("")),
  metaDescription: z.string().max(160, "Description is too long").optional().or(z.literal("")),
  metaKeywords: z.array(z.string()).default([]),
  ogImage: z.string().url().optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required").trim(),
  shortDescription: z.string().optional().or(z.literal("")),
  fullDescription: z.string().optional().or(z.literal("")),
  productModel: z.string().optional().or(z.literal("")),
  sku: z.string().min(2, "Base SKU is required").trim(),
  barcode: z.string().optional().or(z.literal("")),
  gtin: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  supplierId: z.string().min(1, "Supplier identifier is required"),
  visibility: z.enum(["public", "private", "hidden", "supplier_only"]).default("public"),
  variants: z
    .array(productVariantValidationSchema)
    .min(1, "At least one variant config is required"),
  media: z.array(productMediaValidationSchema).default([]),
  attributes: z.array(productAttributeValidationSchema).default([]),
  seo: productSEOValidationSchema.optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
