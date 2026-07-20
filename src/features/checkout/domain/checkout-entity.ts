import { BaseDBEntity } from "@/shared/lib/database/types";
import { CartType } from "./cart-entity";

export type CheckoutStep =
  | "cart_review"
  | "price_resolved"
  | "inventory_validated"
  | "inventory_reserved"
  | "draft_created"
  | "completed"
  | "expired"
  | "failed";

export type CheckoutStatus = "active" | "completed" | "expired" | "failed";

export interface CheckoutShippingInfo {
  receiverName: string;
  phone: string;
  alternativePhone?: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  address: string;
  deliveryNote?: string;
}

export interface CheckoutPriceItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  pricingSource: "retail" | "reseller" | "wholesale" | "campaign" | "flash_sale";
  campaignId?: string;
  appliedRules?: string[];
}

export interface CheckoutInventoryItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  available: number;
  isValid: boolean;
  message?: string;
  reservationId?: string;
}

export interface CheckoutTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}

export interface CheckoutProfitPreview {
  totalCostBasis: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
}

export interface OrderDraft extends BaseDBEntity {
  checkoutId: string;
  cartId: string;
  type: CartType;
  resolvedPrices: CheckoutPriceItem[];
  inventoryReservations: CheckoutInventoryItem[];
  shipping: CheckoutShippingInfo;
  totals: CheckoutTotals;
  profitPreview?: CheckoutProfitPreview;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface CheckoutSession extends BaseDBEntity {
  cartId: string;
  type: CartType;
  step: CheckoutStep;
  status: CheckoutStatus;
  resolvedPrices: CheckoutPriceItem[];
  inventoryValidations: CheckoutInventoryItem[];
  inventoryReservations: CheckoutInventoryItem[];
  shipping?: CheckoutShippingInfo;
  shippingCompleted: boolean;
  totals?: CheckoutTotals;
  profitPreview?: CheckoutProfitPreview;
  draftId?: string;
  expiresAt: Date;
}

export default CheckoutSession;
