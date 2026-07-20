import { z } from "zod";

export const productVariantSchema = z.object({
  color: z.string().optional().or(z.literal("")),
  size: z.string().optional().or(z.literal("")),
  storage: z.string().optional().or(z.literal("")),
  ram: z.string().optional().or(z.literal("")),
  capacity: z.string().optional().or(z.literal("")),
  material: z.string().optional().or(z.literal("")),
  bundle: z.string().optional().or(z.literal("")),
  sku: z.string().min(2, "Variant SKU is required").trim(),
  barcode: z.string().optional().or(z.literal("")),
  weight: z.number().nonnegative().optional(),
  weightUnit: z.string().optional().or(z.literal("")),
  dimensions: z
    .object({
      length: z.number().nonnegative().optional(),
      width: z.number().nonnegative().optional(),
      height: z.number().nonnegative().optional(),
      unit: z.string().optional().or(z.literal("")),
    })
    .optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.number().int().nonnegative().optional(),
  customAttributes: z.record(z.string(), z.string()).optional(),
});

export const productMediaSchema = z.object({
  url: z.string().url("Invalid media URL"),
  type: z.enum(["image", "video", "document"]),
  isFeatured: z.boolean().default(false),
  altText: z.string().optional().or(z.literal("")),
  caption: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().nonnegative().default(0),
  width: z.number().int().nonnegative().optional(),
  height: z.number().int().nonnegative().optional(),
  fileSize: z.number().int().nonnegative().optional(),
  mimeType: z.string().optional().or(z.literal("")),
});

export const productSEOSchema = z.object({
  metaTitle: z.string().max(70, "Meta title too long (max 70)").optional().or(z.literal("")),
  metaDescription: z
    .string()
    .max(160, "Meta description too long (max 160)")
    .optional()
    .or(z.literal("")),
  metaKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  ogTitle: z.string().max(70).optional().or(z.literal("")),
  ogDescription: z.string().max(200).optional().or(z.literal("")),
  ogImage: z.string().url().optional().or(z.literal("")),
  ogType: z.string().optional().or(z.literal("")),
  twitterTitle: z.string().max(70).optional().or(z.literal("")),
  twitterDescription: z.string().max(200).optional().or(z.literal("")),
  twitterImage: z.string().url().optional().or(z.literal("")),
  twitterCardType: z.enum(["summary", "summary_large_image"]).optional(),
});

export const productSpecificationSchema = z.object({
  key: z.string().min(1, "Key is required").trim(),
  value: z.string().min(1, "Value is required").trim(),
  group: z.enum(["specification", "technical", "general"]).default("general"),
});

export const productContentSchema = z.object({
  richDescription: z.record(z.string(), z.unknown()).optional(),
  highlights: z.array(z.string().max(200)).max(10).optional(),
  includedItems: z.array(z.string()).optional(),
  features: z.array(z.string().max(500)).max(20).optional(),
  specifications: z.array(productSpecificationSchema).max(50).optional(),
  technicalDetails: z.record(z.string(), z.unknown()).optional(),
  warrantyInformation: z.string().max(2000).optional().or(z.literal("")),
  returnPolicy: z.string().max(2000).optional().or(z.literal("")),
});

export const supplierReferenceSchema = z.object({
  supplierId: z.string().min(1, "Supplier ID is required"),
  supplierSku: z.string().optional().or(z.literal("")),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const searchMetadataSchema = z.object({
  searchKeywords: z.array(z.string()).optional(),
  searchSynonyms: z.array(z.string()).optional(),
  searchWeight: z.number().min(0).max(10).optional(),
  popularityScore: z.number().int().min(0).max(100).optional(),
  searchable: z.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required").max(255).trim(),
  sku: z.string().min(2, "SKU is required").max(100).trim(),
  barcode: z.string().optional().or(z.literal("")),
  gtin: z.string().optional().or(z.literal("")),
  shortDescription: z.string().max(500).optional().or(z.literal("")),
  productModel: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  supplierId: z.string().optional().or(z.literal("")),
  visibility: z.enum(["public", "private", "hidden", "supplier_only"]).default("public"),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  flashSale: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
  media: z.array(productMediaSchema).default([]),
  seo: productSEOSchema.optional(),
  content: productContentSchema.optional(),
  suppliers: z.array(supplierReferenceSchema).default([]),
  searchMetadata: searchMetadataSchema.optional(),
  tags: z.array(z.string()).default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const brandSchema = z.object({
  name: z.string().min(2, "Brand name is required").max(100).trim(),
  logo: z.string().url().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(100).trim(),
  parentCategoryId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const collectionSchema = z.object({
  name: z.string().min(2, "Collection name is required").max(100).trim(),
  description: z.string().optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
  productIds: z.array(z.string()).default([]),
});

export const tagSchema = z.object({
  name: z.string().min(2, "Tag name is required").max(50).trim(),
});
