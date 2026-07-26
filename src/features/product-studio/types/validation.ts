import { z } from "zod";

/**
 * Price inputs arrive from the studio as strings (`""`, `"1200"`). Coerce them so a
 * blank field becomes `undefined` rather than failing the `z.number()` check.
 */
function priceInput(val: unknown): number | undefined {
  if (val === "" || val === undefined || val === null) return undefined;
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : undefined;
}

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
  costPrice: z.preprocess(priceInput, z.number().nonnegative().optional()),
  sellingPrice: z.preprocess(priceInput, z.number().nonnegative().optional()),
  wholesalePrice: z.preprocess(priceInput, z.number().nonnegative().optional()),
  resellerPrice: z.preprocess(priceInput, z.number().nonnegative().optional()),
  comparePrice: z.preprocess(priceInput, z.number().nonnegative().optional()),
  campaignPrice: z.preprocess(priceInput, z.number().nonnegative().optional()),
  margin: z.number().optional(),
  profit: z.number().optional(),
  manualPriceOverrides: z.record(z.string(), z.boolean()).optional(),
});

/** Coerces number-ish form inputs (`""`, `"12"`, `null`) into a number, or `undefined` when blank. */
function numericInput(fallback?: number) {
  return (val: unknown): number | undefined => {
    if (val === "" || val === undefined || val === null) return fallback;
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
}

export const studioInventorySchema = z.object({
  sku: z.string().optional(),
  barcode: z.string().optional().or(z.literal("")),
  stock: z.preprocess(numericInput(0), z.number().int().nonnegative().default(0)),
  reservedStock: z.preprocess(numericInput(0), z.number().int().nonnegative().default(0)),
  incomingStock: z.preprocess(numericInput(0), z.number().int().nonnegative().default(0)),
  lowStockThreshold: z.preprocess(numericInput(5), z.number().int().nonnegative().default(5)),
  warehouseLocation: z.string().optional().or(z.literal("")),
  weight: z.preprocess(numericInput(), z.number().nonnegative().optional()),
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
