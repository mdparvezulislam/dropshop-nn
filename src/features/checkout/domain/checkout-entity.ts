import { BaseDBEntity } from "@/lib/database/types";
import type { PricingLineItem, PricingTotals, ProfitSummary } from "@/lib/domain/pricing-types";
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
  /** Customer email — links the order to an account's history. */
  email?: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  address: string;
  postalCode?: string;
  landmark?: string;
  /** "home" | "office" — free string for future labels. */
  addressLabel?: string;
  /** Selected shipping method id (e.g. "standard"). */
  shippingMethod?: string;
  /** Delivery charge in MINOR units — included in totals.grandTotal. */
  deliveryCharge?: number;
  /** Selected payment method id — stored only; gateways are a later phase. */
  paymentMethod?: string;
  deliveryNote?: string;
}

export type CheckoutPriceItem = PricingLineItem;

export interface CheckoutInventoryItem {
  productId: string;
  variantSku?: string;
  quantity: number;
  available: number;
  isValid: boolean;
  message?: string;
  reservationId?: string;
}

export type CheckoutTotals = PricingTotals;

export type CheckoutProfitPreview = ProfitSummary;

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
