import { z } from "zod";

const costChangeReasonEnum = z.enum([
  "supplier_price_increased",
  "supplier_price_decreased",
  "new_shipment",
  "import_cost_updated",
  "manual_correction",
  "currency_adjustment",
  "promotion",
  "replacement_supplier",
  "other",
]);

const costSupplierInfoSchema = z.object({
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  supplierSku: z.string().optional(),
  invoiceNumber: z.string().optional(),
  purchaseDate: z.coerce.date().optional(),
  purchaseLink: z.string().optional(),
  notes: z.string().optional(),
});

export const createCostVersionSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  variantSku: z.string().optional(),
  costPrice: z.number().min(0, "Cost price must be >= 0"),
  currency: z.string().default("BDT"),
  supplier: costSupplierInfoSchema.default({}),
  importCost: z.number().min(0).default(0),
  shippingCost: z.number().min(0).default(0),
  packagingCost: z.number().min(0).default(0),
  handlingCost: z.number().min(0).default(0),
  otherExpenses: z.number().min(0).default(0),
  reason: costChangeReasonEnum,
  reasonText: z.string().optional(),
  notes: z.string().optional(),
  effectiveDate: z.coerce.date().optional(),
});

export type CreateCostVersionInput = z.infer<typeof createCostVersionSchema>;

export const costListQuerySchema = z.object({
  productId: z.string().optional(),
  variantSku: z.string().optional(),
  supplierId: z.string().optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const costSearchQuerySchema = z.object({
  query: z.string().min(1),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const costCompareQuerySchema = z.object({
  versionIdA: z.string().min(1),
  versionIdB: z.string().min(1),
});
