import { BaseDBEntity } from "@/lib/database/types";
import type { PricingSource, PricingTotals, ProfitSummary } from "@/lib/domain/pricing-types";
import type { OrderStatus } from "./state-machine";

export type OrderType = "guest" | "customer" | "reseller" | "wholesaler";

export interface CustomerSnapshot {
  customerId?: string;
  name: string;
  phone: string;
  email?: string;
  alternativePhone?: string;
}

export interface ShippingSnapshot {
  receiverName: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  division: string;
  district: string;
  upazila?: string;
  area?: string;
  address: string;
  postalCode?: string;
  landmark?: string;
  addressLabel?: string;
  shippingMethod?: string;
  /** Delivery charge in minor units, mirrored from checkout. */
  deliveryCharge?: number;
  paymentMethod?: string;
  deliveryNote?: string;
}

export interface OrderPricingItem {
  productId: string;
  variantSku?: string;
  productName: string;
  quantity: number;
  unitSellingPrice: number;
  unitWholesalePrice?: number;
  unitCostBasis: number;
  totalSellingPrice: number;
  totalCostBasis: number;
  totalProfit: number;
  marginPercent: number;
  currency: string;
  pricingSource: PricingSource;
  campaignId?: string;
  appliedRules?: string[];
}

export interface OrderPricingSnapshot extends PricingTotals {
  items: OrderPricingItem[];
}

export type OrderProfitPreview = ProfitSummary;

export interface OrderShippingInfo {
  courierId?: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  shippingCost?: number;
}

export interface OrderItem extends BaseDBEntity {
  productId: string;
  variantSku?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitCost: number;
  totalCost: number;
  unitProfit: number;
  totalProfit: number;
}

export interface OrderTimelineEntry {
  id: string;
  eventType: string;
  action: string;
  summary: string;
  actor?: {
    id: string;
    name?: string;
    role?: string;
  };
  changes?: Array<{
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }>;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  timestamp: Date;
}

export interface SupplierReference {
  supplierId: string;
  supplierName: string;
  items: Array<{
    productId: string;
    variantSku?: string;
    quantity: number;
  }>;
}

export type OrderPriority = "low" | "normal" | "high" | "urgent" | "vip";

export interface Order extends BaseDBEntity {
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  previousStatuses: OrderStatus[];
  priority: OrderPriority;
  checkoutDraftId: string;
  checkoutId: string;
  cartId: string;
  customer: CustomerSnapshot;
  shipping: ShippingSnapshot;
  pricing: OrderPricingSnapshot;
  profitPreview?: OrderProfitPreview;
  shippingInfo?: OrderShippingInfo;
  timeline: OrderTimelineEntry[];
  items: OrderItem[];
  note?: string;
  internalNote?: string;
  tags?: string[];
  supplierReferences?: SupplierReference[];
  source?: string;
  autoConfirmed?: boolean;
  resellerId?: string;
  resellerName?: string;
  resellerShopName?: string;
  wholesaleId?: string;
  confirmedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  returnedAt?: Date;
  refundedAt?: Date;
  failedAt?: Date;
  expiresAt?: Date;
}

export default Order;
