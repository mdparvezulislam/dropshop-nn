import { BaseDBEntity } from "@/lib/database/types";

export interface PartialDeliveryItem {
  productId: string;
  variantSku?: string;
  productName: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  deliveredValue: number;
  remainingValue: number;
}

export interface PartialDelivery extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  items: PartialDeliveryItem[];
  totalDeliveredValue: number;
  totalRemainingValue: number;
  notes?: string;
  deliveredAt: Date;
  deliveredBy?: string;
}

export interface PartialReturnItem {
  productId: string;
  variantSku?: string;
  productName: string;
  returnedQuantity: number;
  refundAmount: number;
  condition?: string;
}

export interface PartialReturn extends BaseDBEntity {
  orderId: string;
  orderNumber: string;
  returnId: string;
  items: PartialReturnItem[];
  totalRefundAmount: number;
  inventoryRestored: boolean;
  restoredAt?: Date;
  notes?: string;
}
