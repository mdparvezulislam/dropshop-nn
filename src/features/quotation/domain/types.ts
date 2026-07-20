export const QUOTATION_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "converted",
  "expired",
  "cancelled",
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export interface QuotationItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuotationEntity {
  id: string;
  quoteNumber: string;
  wholesalerId: string;
  status: QuotationStatus;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  notes: string;
  validUntil: string;
  convertedOrderId?: string;
  createdAt: string;
  updatedAt: string;
}
