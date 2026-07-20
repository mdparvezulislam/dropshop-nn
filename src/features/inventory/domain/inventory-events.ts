export const INVENTORY_EVENTS = {
  CREATED: "inventory.created",
  UPDATED: "inventory.updated",
  STOCK_RESERVED: "inventory.stock_reserved",
  STOCK_RELEASED: "inventory.stock_released",
  STOCK_ADJUSTED: "inventory.stock_adjusted",
  STOCK_SOLD: "inventory.stock_sold",
  STOCK_RETURNED: "inventory.stock_returned",
  STOCK_DAMAGED: "inventory.stock_damaged",
  LOW_STOCK_DETECTED: "inventory.low_stock_detected",
  OUT_OF_STOCK_DETECTED: "inventory.out_of_stock_detected",
} as const;

export type InventoryEventType = (typeof INVENTORY_EVENTS)[keyof typeof INVENTORY_EVENTS];

export interface InventoryCreatedPayload {
  productId: string;
  variantSku?: string;
  warehouseId?: string | null;
  availableStock: number;
  createdAt: string;
}

export interface InventoryUpdatedPayload {
  productId: string;
  variantSku?: string;
  changedFields: string[];
  updatedAt: string;
}

export interface StockReservedPayload {
  productId: string;
  variantSku?: string;
  quantity: number;
  referenceId?: string;
  availableAfterReserve: number;
}

export interface StockReleasedPayload {
  productId: string;
  variantSku?: string;
  quantity: number;
  referenceId?: string;
  availableAfterRelease: number;
}

export interface StockAdjustedPayload {
  productId: string;
  variantSku?: string;
  operation: string;
  quantity: number;
  previousAvailable: number;
  newAvailable: number;
}

export interface StockSoldPayload {
  productId: string;
  variantSku?: string;
  quantity: number;
  referenceId?: string;
  availableAfterSale: number;
}

export interface StockReturnedPayload {
  productId: string;
  variantSku?: string;
  quantity: number;
  returnedStock: number;
}

export interface StockDamagedPayload {
  productId: string;
  variantSku?: string;
  quantity: number;
  damagedStock: number;
}

export interface LowStockDetectedPayload {
  productId: string;
  variantSku?: string;
  currentStock: number;
  lowStockThreshold: number;
}

export interface OutOfStockDetectedPayload {
  productId: string;
  variantSku?: string;
}

export type InventoryEventPayloads = {
  [INVENTORY_EVENTS.CREATED]: InventoryCreatedPayload;
  [INVENTORY_EVENTS.UPDATED]: InventoryUpdatedPayload;
  [INVENTORY_EVENTS.STOCK_RESERVED]: StockReservedPayload;
  [INVENTORY_EVENTS.STOCK_RELEASED]: StockReleasedPayload;
  [INVENTORY_EVENTS.STOCK_ADJUSTED]: StockAdjustedPayload;
  [INVENTORY_EVENTS.STOCK_SOLD]: StockSoldPayload;
  [INVENTORY_EVENTS.STOCK_RETURNED]: StockReturnedPayload;
  [INVENTORY_EVENTS.STOCK_DAMAGED]: StockDamagedPayload;
  [INVENTORY_EVENTS.LOW_STOCK_DETECTED]: LowStockDetectedPayload;
  [INVENTORY_EVENTS.OUT_OF_STOCK_DETECTED]: OutOfStockDetectedPayload;
};
