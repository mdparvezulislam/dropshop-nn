import { z } from "zod";

function magicString(maxLength: number) {
  return z
    .string()
    .transform((val) => (val.length > maxLength ? val.slice(0, maxLength) : val))
    .pipe(z.string().max(maxLength));
}

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().or(z.literal("")),
  attributes: z.record(z.string(), z.string()).optional(),
  sku: z.string().min(2, "Variant SKU is required").trim(),
  priceAdjustment: z.number().optional().default(0),
  stock: z.number().int().nonnegative().optional().default(0),
  image: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
  isActive: z.boolean().optional().default(true),

  // Legacy fields kept for backward compatibility
  color: z.string().optional().or(z.literal("")),
  size: z.string().optional().or(z.literal("")),
  storage: z.string().optional().or(z.literal("")),
  ram: z.string().optional().or(z.literal("")),
  capacity: z.string().optional().or(z.literal("")),
  material: z.string().optional().or(z.literal("")),
  bundle: z.string().optional().or(z.literal("")),
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
  sortOrder: z.number().int().nonnegative().optional(),
  customAttributes: z.record(z.string(), z.string()).optional(),
});

export const productMediaSchema = z.object({
  url: z.string().min(1, "Media URL is required"),
  type: z.enum(["image", "video", "document"]).default("image"),
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
  metaTitle: magicString(100).optional().or(z.literal("")),
  metaDescription: magicString(300).optional().or(z.literal("")),
  metaKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional().or(z.literal("")),
  ogTitle: z.string().optional().or(z.literal("")),
  ogDescription: z.string().optional().or(z.literal("")),
  ogImage: z.string().optional().or(z.literal("")),
  ogType: z.string().optional().or(z.literal("")),
  twitterTitle: z.string().optional().or(z.literal("")),
  twitterDescription: z.string().optional().or(z.literal("")),
  twitterImage: z.string().optional().or(z.literal("")),
  twitterCardType: z.enum(["summary", "summary_large_image"]).optional(),
});

export const productSpecificationSchema = z.object({
  key: z.string().min(1, "Key is required").trim(),
  value: z.string().min(1, "Value is required").trim(),
  group: z.string().optional().default("general"),
});

export const productContentSchema = z.object({
  richDescription: z.union([z.record(z.string(), z.unknown()), z.string(), z.unknown()]).optional(),
  description: z.string().optional().or(z.literal("")),
  highlights: z.array(z.string()).optional(),
  includedItems: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  specifications: z.array(productSpecificationSchema).optional(),
  technicalDetails: z.record(z.string(), z.unknown()).optional(),
  warrantyInformation: z.string().optional().or(z.literal("")),
  returnPolicy: z.string().optional().or(z.literal("")),
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
  searchWeight: z.number().optional(),
  popularityScore: z.number().optional(),
  searchable: z.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required").max(255).trim(),
  slug: z.string().optional().or(z.literal("")),
  sku: z.string().optional().or(z.literal("")),
  barcode: z.string().optional().or(z.literal("")),
  gtin: z.string().optional().or(z.literal("")),
  productType: z
    .enum(["simple", "variant", "bundle", "digital", "service", "gift_card"])
    .default("simple"),
  shortDescription: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  notice: z.string().optional().or(z.literal("")),
  productModel: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  supplierId: z.string().optional().or(z.literal("")),
  status: z.preprocess(
    (val) =>
      typeof val === "string"
        ? val.toLowerCase() === "published"
          ? "active"
          : val.toLowerCase()
        : val,
    z.enum(["draft", "pending_review", "active", "inactive", "archived"]).default("draft"),
  ),
  visibility: z
    .enum(["public", "private", "hidden", "supplier_only", "reseller_only", "wholesale_only"])
    .default("public"),
  badges: z.array(z.string()).default([]),
  featured: z.boolean().optional().default(false),
  trending: z.boolean().optional().default(false),
  flashSale: z.boolean().optional().default(false),
  newArrival: z.boolean().optional().default(false),
  hasVariants: z.boolean().optional().default(false),
  variants: z.array(productVariantSchema).default([]),
  media: z.array(productMediaSchema).default([]),
  specifications: z.array(productSpecificationSchema).default([]),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDescription: z.string().optional().or(z.literal("")),
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
  logo: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(100).trim(),
  parentCategoryId: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const collectionSchema = z.object({
  name: z.string().min(2, "Collection name is required").max(100).trim(),
  description: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().nonnegative().default(0),
  productIds: z.array(z.string()).default([]),
});

export const tagSchema = z.object({
  name: z.string().min(2, "Tag name is required").max(50).trim(),
});

export const templateSpecFieldSchema = z.object({
  key: z.string().min(1).trim(),
  label: z.string().min(1).trim(),
  type: z.enum(["text", "number", "boolean", "select", "multiselect", "color"]).default("text"),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
  group: z.enum(["specification", "technical", "general"]).default("general"),
});

export const templateAttributeSchema = z.object({
  key: z.string().min(1).trim(),
  label: z.string().min(1).trim(),
  type: z.enum(["text", "select", "color", "size", "number"]).default("text"),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
});

export const templatePricingProfileSchema = z.object({
  retailMultiplier: z.number().min(1).default(1.4),
  wholesaleMultiplier: z.number().min(1).default(1.3),
  resellerMultiplier: z.number().min(1).default(1.22),
  campaignMultiplier: z.number().min(1).default(1.15),
  minMarginPercent: z.number().min(0).max(100).default(15),
});

export const templateShippingProfileSchema = z.object({
  weight: z.number().nonnegative().default(0.5),
  weightUnit: z.string().default("kg"),
  length: z.number().nonnegative().default(0),
  width: z.number().nonnegative().default(0),
  height: z.number().nonnegative().default(0),
  dimensionUnit: z.string().default("cm"),
  shippingClass: z.string().default("standard"),
});

export const templateWarrantyProfileSchema = z.object({
  period: z.string().default("1 Year"),
  periodDays: z.number().int().nonnegative().default(365),
  type: z.enum(["manufacturer", "seller", "none"]).default("seller"),
  description: z.string().default(""),
});

export const templateSEOProfileSchema = z.object({
  metaTitleTemplate: z.string().default(""),
  metaDescriptionTemplate: z.string().default(""),
  focusKeywordSuggestions: z.array(z.string()).default([]),
});

export const templateGoogleMerchantSchema = z.object({
  googleProductCategory: z.string().default(""),
  ageGroup: z.string().default("adult"),
  gender: z.string().default("unisex"),
  condition: z.string().default("new"),
});

export const createProductTemplateSchema = z.object({
  name: z.string().min(2, "Template name is required").max(100).trim(),
  nameBangla: z.string().min(1, "Bangla name is required").max(100).trim(),
  description: z.string().max(500).optional().or(z.literal("")),
  iconName: z.string().default("Package"),
  categoryId: z.string().optional().or(z.literal("")),
  categoryName: z.string().min(1, "Category name is required").trim(),
  sortOrder: z.number().int().nonnegative().default(0),
  specs: z.array(templateSpecFieldSchema).default([]),
  attributes: z.array(templateAttributeSchema).default([]),
  suggestedTags: z.array(z.string()).default([]),
  suggestedCollections: z.array(z.string()).default([]),
  pricingProfile: templatePricingProfileSchema.default({
    retailMultiplier: 1.3,
    wholesaleMultiplier: 1.12,
    resellerMultiplier: 1.2,
    campaignMultiplier: 1.0,
    minMarginPercent: 10,
  }),
  shippingProfile: templateShippingProfileSchema.default({
    weight: 0.5,
    weightUnit: "kg",
    length: 10,
    width: 10,
    height: 5,
    dimensionUnit: "cm",
    shippingClass: "standard",
  }),
  warrantyProfile: templateWarrantyProfileSchema.default({
    period: "1 year",
    periodDays: 365,
    type: "manufacturer",
    description: "",
  }),
  returnPolicy: z.string().default(""),
  packageIncludes: z.array(z.string()).default([]),
  seoProfile: templateSEOProfileSchema.default({
    metaTitleTemplate: "",
    metaDescriptionTemplate: "",
    focusKeywordSuggestions: [],
  }),
  googleMerchant: templateGoogleMerchantSchema.default({
    googleProductCategory: "",
    ageGroup: "adult",
    gender: "unisex",
    condition: "new",
  }),
  suggestedBulletFeatures: z.array(z.string()).default([]),
});

export type CreateProductTemplateInput = z.infer<typeof createProductTemplateSchema>;

export const updateProductTemplateSchema = createProductTemplateSchema.partial();
export type UpdateProductTemplateInput = z.infer<typeof updateProductTemplateSchema>;
