import { z } from "zod";
import { objectIdSchema } from "@/shared/utils/validation";

const stockQuantitySchema = z.coerce
  .number()
  .int()
  .nonnegative("Stock quantity cannot be negative");

export const createInventorySchema = z.object({
  productId: objectIdSchema,
  variantSku: z.string().trim().optional().or(z.literal("")),
  warehouseId: objectIdSchema.optional().nullable().or(z.literal("")),
  availableStock: stockQuantitySchema.default(0),
  reservedStock: stockQuantitySchema.default(0),
  incomingStock: stockQuantitySchema.default(0),
  damagedStock: stockQuantitySchema.default(0),
  returnedStock: stockQuantitySchema.default(0),
  soldStock: stockQuantitySchema.default(0),
  virtualStock: stockQuantitySchema.default(0),
  safetyStock: stockQuantitySchema.default(0),
  reorderLevel: stockQuantitySchema.default(0),
  lowStockThreshold: stockQuantitySchema.default(5),
  allowPreOrder: z.boolean().default(false),
  allowBackorder: z.boolean().default(false),
  status: z.enum(["active", "inactive", "frozen"]).default("active"),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;

export const updateInventorySchema = createInventorySchema.partial().omit({ productId: true });

export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;

export const stockAdjustmentSchema = z.object({
  inventoryId: objectIdSchema,
  operation: z.enum(["stock_in", "stock_out", "adjustment", "reservation", "release", "transfer", "damage", "return", "sold"]),
  quantity: z.coerce.number().int().positive("Quantity must be a positive integer"),
  reason: z.string().trim().optional().or(z.literal("")),
  referenceId: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  warehouseId: objectIdSchema.optional().nullable().or(z.literal("")),
  targetWarehouseId: objectIdSchema.optional().nullable().or(z.literal("")),
  absoluteAvailable: stockQuantitySchema.optional(),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

export const createSupplierInventorySchema = z.object({
  productId: objectIdSchema,
  supplierId: objectIdSchema,
  variantSku: z.string().trim().optional().or(z.literal("")),
  supplierSku: z.string().min(1, "Supplier SKU is required").trim(),
  supplierCost: z.coerce.number().int().nonnegative("Supplier cost must be non-negative cents"),
  supplierStock: stockQuantitySchema.default(0),
  leadTimeDays: z.coerce.number().int().nonnegative().default(0),
  minimumOrderQuantity: z.coerce.number().int().positive().default(1),
  isPreferred: z.boolean().default(false),
  currency: z.string().trim().length(3).default("USD"),
  status: z.enum(["active", "inactive", "discontinued"]).default("active"),
});

export type CreateSupplierInventoryInput = z.infer<typeof createSupplierInventorySchema>;

export const updateSupplierInventorySchema = createSupplierInventorySchema
  .partial()
  .omit({ productId: true, supplierId: true });

export type UpdateSupplierInventoryInput = z.infer<typeof updateSupplierInventorySchema>;

export const bulkStockUpdateItemSchema = z.object({
  productId: objectIdSchema,
  variantSku: z.string().trim().optional().or(z.literal("")),
  availableStock: stockQuantitySchema.optional(),
  reservedStock: stockQuantitySchema.optional(),
  incomingStock: stockQuantitySchema.optional(),
  damagedStock: stockQuantitySchema.optional(),
  returnedStock: stockQuantitySchema.optional(),
  soldStock: stockQuantitySchema.optional(),
  virtualStock: stockQuantitySchema.optional(),
  safetyStock: stockQuantitySchema.optional(),
  reorderLevel: stockQuantitySchema.optional(),
  lowStockThreshold: stockQuantitySchema.optional(),
  allowPreOrder: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
});

export const bulkStockUpdateSchema = z.object({
  items: z.array(bulkStockUpdateItemSchema).min(1, "At least one stock update is required"),
});

export type BulkStockUpdateInput = z.infer<typeof bulkStockUpdateSchema>;

export const inventoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  productId: objectIdSchema.optional(),
  warehouseId: objectIdSchema.optional(),
  availability: z
    .enum(["in_stock", "low_stock", "out_of_stock", "pre_order", "backorder", "discontinued", "all"])
    .default("all"),
  status: z.enum(["active", "inactive", "frozen", "all"]).default("all"),
  lowStockOnly: z.coerce.boolean().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type InventoryListQuery = z.infer<typeof inventoryListQuerySchema>;

export const inventoryHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  inventoryId: objectIdSchema.optional(),
  productId: objectIdSchema.optional(),
  operation: z
    .enum(["stock_in", "stock_out", "adjustment", "reservation", "release", "transfer", "damage", "return", "sold", "all"])
    .default("all"),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type InventoryHistoryQuery = z.infer<typeof inventoryHistoryQuerySchema>;
