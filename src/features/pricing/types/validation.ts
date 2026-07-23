import { z } from "zod";
import { objectIdSchema } from "@/lib/utils/validation";

const moneySchema = z.coerce
  .number()
  .int()
  .nonnegative("Amount must be a non-negative integer (cents)");

const percentageSchema = z.coerce
  .number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100");

export const pricingRuleConfigSchema = z.object({
  baseField: z.enum(["baseCostPrice", "purchasePrice", "supplierPrice", "sellingPrice"]).optional(),
  percentage: percentageSchema.optional(),
  fixedAmount: moneySchema.optional(),
  categoryId: objectIdSchema.optional().or(z.literal("")),
  brandId: objectIdSchema.optional().or(z.literal("")),
  supplierId: objectIdSchema.optional().or(z.literal("")),
  minMargin: percentageSchema.optional(),
  maxDiscount: percentageSchema.optional(),
});

export const createPricingSchema = z.object({
  productId: objectIdSchema,
  variantSku: z.string().trim().optional().or(z.literal("")),
  baseCostPrice: moneySchema.default(0),
  purchasePrice: moneySchema.default(0),
  supplierPrice: moneySchema.default(0),
  sellingPrice: moneySchema,
  wholesalePrice: moneySchema.default(0),
  resellerPrice: moneySchema.default(0),
  comparePrice: moneySchema.default(0),
  promotionalPrice: moneySchema.optional(),
  discountAmount: moneySchema.default(0),
  discountPercentage: percentageSchema.default(0),
  currency: z.string().trim().length(3, "Currency must be a 3-letter ISO code").default("USD"),
  taxRate: percentageSchema.default(0),
  taxInclusive: z.boolean().default(false),
  commissionRate: percentageSchema.default(0),
  pricingRule: z
    .enum(["fixed", "percentage", "supplier_based", "category_based", "brand_based", "dynamic"])
    .default("fixed"),
  ruleConfig: pricingRuleConfigSchema.optional(),
  status: z.enum(["active", "inactive", "scheduled", "expired"]).default("active"),
  effectiveFrom: z.coerce.date().optional().nullable(),
  effectiveTo: z.coerce.date().optional().nullable(),
});

export type CreatePricingInput = z.infer<typeof createPricingSchema>;

export const updatePricingSchema = createPricingSchema.partial().omit({ productId: true });

export type UpdatePricingInput = z.infer<typeof updatePricingSchema>;

export const bulkPriceUpdateItemSchema = z.object({
  productId: objectIdSchema,
  variantSku: z.string().trim().optional().or(z.literal("")),
  sellingPrice: moneySchema.optional(),
  wholesalePrice: moneySchema.optional(),
  resellerPrice: moneySchema.optional(),
  promotionalPrice: moneySchema.optional(),
  discountPercentage: percentageSchema.optional(),
  currency: z.string().trim().length(3).optional(),
});

export const bulkPriceUpdateSchema = z.object({
  items: z.array(bulkPriceUpdateItemSchema).min(1, "At least one pricing update is required"),
});

export type BulkPriceUpdateInput = z.infer<typeof bulkPriceUpdateSchema>;

export const bulkSupplierPriceUpdateSchema = z.object({
  items: z
    .array(
      z.object({
        productId: objectIdSchema,
        variantSku: z.string().trim().optional().or(z.literal("")),
        supplierPrice: moneySchema,
        purchasePrice: moneySchema.optional(),
        baseCostPrice: moneySchema.optional(),
      }),
    )
    .min(1, "At least one supplier price update is required"),
});

export type BulkSupplierPriceUpdateInput = z.infer<typeof bulkSupplierPriceUpdateSchema>;

export const pricingListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  productId: objectIdSchema.optional(),
  status: z.enum(["active", "inactive", "scheduled", "expired", "all"]).default("all"),
  currency: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PricingListQuery = z.infer<typeof pricingListQuerySchema>;

// ─── Rule Schemas ───────────────────────────────────────────

const ruleOperatorSchema = z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "between"]);

const ruleConditionSchema = z.object({
  field: z.string().min(1, "Condition field is required"),
  operator: ruleOperatorSchema,
  value: z.unknown(),
});

const ruleActionSchema = z.object({
  type: z.enum(["reject", "override", "validate", "transform"]),
  config: z.record(z.string(), z.unknown()),
});

export const createRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(200),
  description: z.string().max(1000).default(""),
  ruleType: z.enum(["reseller", "wholesale", "campaign", "protection", "visibility"]),
  conditions: z.array(ruleConditionSchema).min(1, "At least one condition is required"),
  actions: z.array(ruleActionSchema).min(1, "At least one action is required"),
  priority: z.coerce.number().int().min(0).max(1000).default(100),
  isActive: z.boolean().default(true),
});

export type CreateRuleInput = z.infer<typeof createRuleSchema>;

export const updateRuleSchema = createRuleSchema.partial();

export type UpdateRuleInput = z.infer<typeof updateRuleSchema>;

// ─── Wholesale Tier Schemas ─────────────────────────────────

export const wholesaleTierSchema = z.object({
  minQty: z.coerce.number().int().positive("Minimum quantity must be positive"),
  price: z.coerce.number().int().nonnegative("Price must be a non-negative integer (cents)"),
  discount: z.coerce.number().min(0).max(100).optional(),
  description: z.string().max(500).optional(),
});

export type WholesaleTierInput = z.infer<typeof wholesaleTierSchema>;

export const wholesaleTiersUpdateSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantSku: z.string().trim().optional().or(z.literal("")),
  tiers: z.array(wholesaleTierSchema).min(1, "At least one tier is required"),
});

export type WholesaleTiersUpdateInput = z.infer<typeof wholesaleTiersUpdateSchema>;

// ─── Campaign Pricing Schemas ───────────────────────────────

export const campaignTypeSchema = z.enum(["campaign", "flash_sale", "festival"]);

export const createCampaignPricingSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantSku: z.string().trim().optional().or(z.literal("")),
  campaignType: campaignTypeSchema,
  campaignPrice: z.coerce.number().int().nonnegative("Campaign price must be non-negative"),
  effectiveFrom: z.coerce.date(),
  effectiveTo: z.coerce.date(),
  description: z.string().max(500).optional(),
});

export type CreateCampaignPricingInput = z.infer<typeof createCampaignPricingSchema>;

export const updateCampaignPricingSchema = createCampaignPricingSchema
  .partial()
  .omit({ productId: true });

export type UpdateCampaignPricingInput = z.infer<typeof updateCampaignPricingSchema>;

// ─── Price Resolution ───────────────────────────────────────

export const resolvePriceQuerySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantSku: z.string().trim().optional().or(z.literal("")),
  role: z.string().optional().default("customer"),
  quantity: z.coerce.number().int().positive().optional().default(1),
  campaignCode: z.string().optional(),
});

export type ResolvePriceQuery = z.infer<typeof resolvePriceQuerySchema>;
