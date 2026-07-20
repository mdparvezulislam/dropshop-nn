import { BaseDBEntity } from "@/shared/lib/database/types";

export type StockAvailability =
  "in_stock" | "low_stock" | "out_of_stock" | "pre_order" | "backorder" | "discontinued";

export type StockOperationType =
  | "stock_in"
  | "stock_out"
  | "adjustment"
  | "reservation"
  | "release"
  | "transfer"
  | "damage"
  | "return"
  | "sold";

export type InventoryStatus = "active" | "inactive" | "frozen";

export interface ProductInventory extends BaseDBEntity {
  productId: string;
  variantSku?: string;
  warehouseId?: string | null;
  availableStock: number;
  reservedStock: number;
  incomingStock: number;
  damagedStock: number;
  returnedStock: number;
  soldStock: number;
  virtualStock: number;
  safetyStock: number;
  reorderLevel: number;
  lowStockThreshold: number;
  availability: StockAvailability;
  allowPreOrder: boolean;
  allowBackorder: boolean;
  status: InventoryStatus;
}

export interface InventoryHistory extends BaseDBEntity {
  inventoryId: string;
  productId: string;
  variantSku?: string;
  warehouseId?: string | null;
  operation: StockOperationType;
  quantity: number;
  previousAvailable: number;
  newAvailable: number;
  previousReserved: number;
  newReserved: number;
  reason?: string;
  referenceId?: string;
  notes?: string;
  performedBy?: string;
}

export interface SupplierInventory extends BaseDBEntity {
  productId: string;
  supplierId: string;
  variantSku?: string;
  supplierSku: string;
  supplierCost: number;
  supplierStock: number;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  isPreferred: boolean;
  currency: string;
  status: "active" | "inactive" | "discontinued";
}

export interface StockLevels {
  onHand: number;
  available: number;
  reserved: number;
  incoming: number;
  damaged: number;
  returned: number;
  sold: number;
  virtual: number;
  sellable: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isBelowReorder: boolean;
  isBelowSafety: boolean;
  availability: StockAvailability;
}

export interface StockAdjustmentRequest {
  inventoryId: string;
  operation: StockOperationType;
  quantity: number;
  reason?: string;
  referenceId?: string;
  notes?: string;
  warehouseId?: string | null;
  targetWarehouseId?: string | null;
  absoluteAvailable?: number;
}

export interface BulkStockUpdateItem {
  productId: string;
  variantSku?: string;
  availableStock?: number;
  reservedStock?: number;
  incomingStock?: number;
  damagedStock?: number;
  returnedStock?: number;
  soldStock?: number;
  virtualStock?: number;
  safetyStock?: number;
  reorderLevel?: number;
  lowStockThreshold?: number;
  allowPreOrder?: boolean;
  allowBackorder?: boolean;
}

export default ProductInventory;
