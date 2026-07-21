import type { BaseDBEntity } from "@/shared/lib/database/types";

export type AnalyticsModule =
  | "commerce"
  | "catalog"
  | "customer"
  | "identity"
  | "inventory"
  | "pricing"
  | "order"
  | "finance"
  | "supplier"
  | "cms"
  | "blog"
  | "notification"
  | "automation"
  | "website"
  | "system";

export type AnalyticsActorRole =
  | "guest"
  | "customer"
  | "reseller"
  | "wholesaler"
  | "supplier"
  | "admin"
  | "system"
  | string;

/** Canonical analytics event names */
export const ANALYTICS_EVENT_NAMES = {
  HOMEPAGE_VIEWED: "homepage.viewed",
  CATEGORY_VIEWED: "category.viewed",
  PRODUCT_VIEWED: "product.viewed",
  VARIANT_SELECTED: "product.variant_selected",
  SEARCH_STARTED: "search.started",
  SEARCH_COMPLETED: "search.completed",
  FILTER_APPLIED: "search.filter_applied",
  SORT_CHANGED: "search.sort_changed",
  PRODUCT_SHARED: "product.shared",
  WISHLIST_ADDED: "wishlist.added",
  ADD_TO_CART: "cart.item_added",
  CART_UPDATED: "cart.updated",
  CART_CLEARED: "cart.cleared",
  CHECKOUT_STARTED: "checkout.started",
  CHECKOUT_COMPLETED: "checkout.completed",
  CHECKOUT_ABANDONED: "checkout.abandoned",
  PAYMENT_SELECTED: "checkout.payment_selected",
  ORDER_CREATED: "order.created",
  ORDER_PAID: "order.paid",
  ORDER_CANCELLED: "order.cancelled",
  REFUND_REQUESTED: "order.refund_requested",
  REFUND_COMPLETED: "order.refund_completed",
  BLOG_VIEWED: "blog.viewed",
  BLOG_SHARED: "blog.shared",
  CMS_PUBLISHED: "cms.published",
  ROLE_APPLICATION_SUBMITTED: "identity.role_application_submitted",
  PROFILE_UPDATED: "identity.profile_updated",
  LOGIN: "identity.login",
  LOGOUT: "identity.logout",
} as const;

export type AnalyticsEventName =
  | (typeof ANALYTICS_EVENT_NAMES)[keyof typeof ANALYTICS_EVENT_NAMES]
  | string;

export interface AnalyticsEventFact extends Omit<BaseDBEntity, "metadata"> {
  eventId: string;
  eventName: AnalyticsEventName;
  timestamp: Date;
  actorId?: string;
  actorRole?: AnalyticsActorRole;
  sessionId?: string;
  requestId?: string;
  source: string;
  module: AnalyticsModule;
  entityType?: string;
  entityId?: string;
  value?: number;
  currency?: string;
  metadata: Record<string, string | number | boolean | null | undefined>;
  idempotencyKey?: string;
}

export type MetricGranularity = "hour" | "day" | "week" | "month";

export interface MetricBucket extends BaseDBEntity {
  metricKey: string;
  granularity: MetricGranularity;
  bucketStart: Date;
  dimensions: Record<string, string>;
  count: number;
  sum: number;
  min?: number;
  max?: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  count?: number;
}

export interface MetricCardData {
  key: string;
  label: string;
  value: number;
  previousValue?: number;
  changePercent?: number;
  format?: "number" | "currency" | "percent";
  currency?: string;
}

export interface RankedItem {
  id: string;
  label: string;
  value: number;
  secondary?: string | number;
}

export interface AnalyticsOverview {
  range: { from: string; to: string };
  metrics: MetricCardData[];
  revenueSeries: TimeSeriesPoint[];
  ordersSeries: TimeSeriesPoint[];
  topProducts: RankedItem[];
  topCategories: RankedItem[];
  topSearchKeywords: RankedItem[];
  topArticles: RankedItem[];
  sessions: number;
  conversionRate: number;
  cartAbandonmentRate: number;
}

export interface TrackEventInput {
  eventName: AnalyticsEventName;
  module?: AnalyticsModule;
  source?: string;
  actorId?: string;
  actorRole?: AnalyticsActorRole;
  sessionId?: string;
  requestId?: string;
  entityType?: string;
  entityId?: string;
  value?: number;
  currency?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  timestamp?: Date | string;
  idempotencyKey?: string;
}
