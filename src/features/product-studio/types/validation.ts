import { z } from "zod";

export const studioVariantRowSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().or(z.literal("")),
  attributes: z.record(z.string(), z.string()).optional(),
  color: z.string().optional().or(z.literal("")),
  size: z.string().optional().or(z.literal("")),
  storage: z.string().optional().or(z.literal("")),
  ram: z.string().optional().or(z.literal("")),
  capacity: z.string().optional().or(z.literal("")),
  material: z.string().optional().or(z.literal("")),
  sku: z.string().min(2, "Variant SKU is required").trim(),
  weight: z.number().nonnegative().optional(),
  price: z.number().nonnegative().optional(),
  priceAdjustment: z.number().optional().default(0),
  stock: z.number().int().nonnegative().optional().default(0),
  image: z.string().optional().or(z.literal("")),
  status: z.preprocess(
    (val) =>
      typeof val === "string"
        ? val.toLowerCase() === "published"
          ? "active"
          : val.toLowerCase()
        : val,
    z.enum(["active", "inactive"]).default("active"),
  ),
  isActive: z.boolean().optional().default(true),
});

export const studioMediaItemSchema = z.object({
  url: z.string(),
  type: z.enum(["image", "video", "document"]).default("image"),
  isFeatured: z.boolean().default(false),
  altText: z.string().optional().or(z.literal("")),
});

export const studioSpecificationSchema = z.object({
  key: z.string().min(1, "Specification key required"),
  value: z.string().min(1, "Specification value required"),
  group: z.string().optional().default("general"),
});

export const studioSEOSchema = z.object({
  metaTitle: z.string().max(100).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  metaKeywords: z.array(z.string()).optional(),
  slug: z.string().optional().or(z.literal("")),
  ogImage: z.string().optional().or(z.literal("")),
});

export const studioPricingSchema = z.object({
  costPrice: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
    z.number().nonnegative().optional(),
  ),
  sellingPrice: z.number().nonnegative().optional(),
  wholesalePrice: z.number().nonnegative().optional(),
  resellerPrice: z.number().nonnegative().optional(),
  comparePrice: z.number().nonnegative().optional(),
  campaignPrice: z.number().nonnegative().optional(),
  margin: z.number().optional(),
  profit: z.number().optional(),
  manualPriceOverrides: z.record(z.string(), z.boolean()).optional(),
});

export const studioInventorySchema = z.object({
  sku: z.string().optional(),
  barcode: z.string().optional().or(z.literal("")),
  stock: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? 0 : Number(val)),
    z.number().int().nonnegative().default(0),
  ),
  reservedStock: z.number().int().nonnegative().default(0),
  incomingStock: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  warehouseLocation: z.string().optional().or(z.literal("")),
  weight: z.number().nonnegative().optional(),
});

export const createStudioProductSchema = z.object({
  name: z.string().min(2, "Product name is required").max(255).trim(),
  productType: z
    .enum(["simple", "variant", "bundle", "digital", "service", "gift_card"])
    .default("simple"),
  templateId: z.string().optional().or(z.literal("")),
  sku: z.string().min(2, "SKU is required").max(100).trim(),
  shortDescription: z.string().max(500).optional().or(z.literal("")),
  richDescription: z.string().optional(),
  description: z.string().optional().or(z.literal("")),
  notice: z.string().optional().or(z.literal("")),
  badges: z.array(z.string()).default([]),
  specifications: z.array(studioSpecificationSchema).default([]),
  productModel: z.string().optional().or(z.literal("")),
  barcode: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  supplierId: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  visibility: z.enum(["public", "private", "hidden", "supplier_only"]).default("public"),
  status: z.preprocess(
    (val) =>
      typeof val === "string"
        ? val.toLowerCase() === "published"
          ? "active"
          : val.toLowerCase()
        : val,
    z.enum(["draft", "pending_review", "active", "inactive", "archived"]).default("draft"),
  ),
  featured: z.boolean().default(false),
  trending: z.boolean().default(false),
  flashSale: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  variants: z.array(studioVariantRowSchema).default([]),
  media: z.array(studioMediaItemSchema).default([]),
  seo: studioSEOSchema.optional(),
  pricing: studioPricingSchema.optional(),
  inventory: studioInventorySchema.optional(),
  warranty: z.string().optional().or(z.literal("")),
  returnPolicy: z.string().optional().or(z.literal("")),
});

export type CreateStudioProductInput = z.infer<typeof createStudioProductSchema>;

export const updateStudioProductSchema = createStudioProductSchema.partial();
export type UpdateStudioProductInput = z.infer<typeof updateStudioProductSchema>;
