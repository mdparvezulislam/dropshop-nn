import type { BaseDBEntity } from "@/lib/database/types";

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
  | "system"
  | "executive"
  | "reseller"
  | "wholesale"
  | "logistics"
  | "payment";

export type AnalyticsActorRole =
  | "guest"
  | "customer"
  | "reseller"
  | "wholesaler"
  | "supplier"
  | "admin"
  | "manager"
  | "finance"
  | "warehouse"
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
  (typeof ANALYTICS_EVENT_NAMES)[keyof typeof ANALYTICS_EVENT_NAMES] | string;

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
  trend?: "up" | "down" | "stable";
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

export interface AnalyticsFilter {
  dateFrom?: Date;
  dateTo?: Date;
  preset?: "today" | "7d" | "30d" | "90d" | "12m" | "custom";
  store?: string;
  courier?: string;
  customerId?: string;
  resellerId?: string;
  wholesaleId?: string;
  productId?: string;
  categoryId?: string;
  brandId?: string;
}

export type ExportFormat = "csv" | "excel" | "pdf";

export type ReportFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | "custom";

export type ChartType = "area" | "bar" | "line" | "pie" | "heatmap";

export type DashboardRefreshInterval = 0 | 15 | 30 | 60 | 300;

export interface AnalyticsSnapshot extends BaseDBEntity {
  snapshotDate: Date;
  type: "daily" | "monthly" | "yearly";
  data: Record<string, unknown>;
  metrics: Record<string, number>;
  dimensions: Record<string, string>;
  immutable: boolean;
}

export interface AnalyticsReport extends BaseDBEntity {
  title: string;
  description?: string;
  type: ReportFrequency;
  filters: AnalyticsFilter;
  data: Record<string, unknown>;
  metrics: MetricCardData[];
  charts: AnalyticsReportChart[];
  generatedAt: Date;
  generatedBy?: string;
  format: ExportFormat;
  fileUrl?: string;
  size?: number;
  schedule?: string;
  recipients?: string[];
}

export interface AnalyticsReportChart {
  id: string;
  title: string;
  type: ChartType;
  data: TimeSeriesPoint[];
  config?: Record<string, unknown>;
}

export interface LiveDashboardData {
  todayRevenue: number;
  todayOrders: number;
  todayShipments: number;
  todayDeliveries: number;
  todayReturns: number;
  grossSales: number;
  netSales: number;
  profit: number;
  expenses: number;
  outstandingCOD: number;
  ordersByHour: TimeSeriesPoint[];
  liveOrders: number;
  liveDeliveries: number;
  liveShipments: number;
  liveRevenue: number;
  liveNotifications: number;
}

export interface ExecutiveDashboardData {
  range: { from: string; to: string };
  todayRevenue: number;
  todayOrders: number;
  todayShipments: number;
  todayDeliveries: number;
  todayReturns: number;
  grossSales: number;
  netSales: number;
  profit: number;
  expenses: number;
  outstandingCOD: number;
  metrics: MetricCardData[];
  revenueSeries: TimeSeriesPoint[];
  ordersSeries: TimeSeriesPoint[];
}

export interface OrderAnalyticsData {
  range: { from: string; to: string };
  ordersByHour: TimeSeriesPoint[];
  ordersByDay: TimeSeriesPoint[];
  ordersByMonth: TimeSeriesPoint[];
  averageOrderValue: number;
  conversionRate: number;
  cancelledOrders: number;
  returnedOrders: number;
  pendingOrders: number;
  totalOrders: number;
  metrics: MetricCardData[];
}

export interface ProductAnalyticsData {
  range: { from: string; to: string };
  topSellingProducts: RankedItem[];
  lowSellingProducts: RankedItem[];
  lowStockProducts: RankedItem[];
  outOfStockProducts: RankedItem[];
  mostViewedProducts: RankedItem[];
  highestRevenueProducts: RankedItem[];
  categoryPerformance: RankedItem[];
  brandPerformance: RankedItem[];
  totalProducts: number;
  activeProducts: number;
  metrics: MetricCardData[];
}

export interface CustomerAnalyticsData {
  range: { from: string; to: string };
  newCustomers: number;
  returningCustomers: number;
  lifetimeValue: number;
  averageSpend: number;
  repeatPurchaseRate: number;
  inactiveCustomers: number;
  totalCustomers: number;
  customerAcquisitionSeries: TimeSeriesPoint[];
  metrics: MetricCardData[];
}

export interface ResellerAnalyticsData {
  range: { from: string; to: string };
  topResellers: RankedItem[];
  lowestPerformingResellers: RankedItem[];
  totalCommission: number;
  totalRevenue: number;
  totalOrderCount: number;
  totalConversion: number;
  metrics: MetricCardData[];
}

export interface WholesaleAnalyticsData {
  range: { from: string; to: string };
  wholesaleRevenue: number;
  wholesaleOrders: number;
  topWholesaleBuyers: RankedItem[];
  metrics: MetricCardData[];
}

export interface FinanceAnalyticsData {
  range: { from: string; to: string };
  totalRevenue: number;
  totalProfit: number;
  totalExpenses: number;
  totalRefunds: number;
  walletBalances: number;
  settlementStatus: string;
  codOutstanding: number;
  revenueSeries: TimeSeriesPoint[];
  profitSeries: TimeSeriesPoint[];
  metrics: MetricCardData[];
}

export interface LogisticsAnalyticsData {
  range: { from: string; to: string };
  courierPerformance: RankedItem[];
  averageDeliveryTime: number;
  failedDeliveries: number;
  returnRate: number;
  hubPerformance: RankedItem[];
  riderPerformance?: RankedItem[];
  metrics: MetricCardData[];
}

export interface InventoryAnalyticsData {
  range: { from: string; to: string };
  stockMovement: TimeSeriesPoint[];
  fastMovingProducts: RankedItem[];
  slowMovingProducts: RankedItem[];
  inventoryValue: number;
  deadStock: RankedItem[];
  metrics: MetricCardData[];
}

export interface PaymentAnalyticsData {
  range: { from: string; to: string };
  paymentMethods: RankedItem[];
  successRate: number;
  failedPayments: number;
  pendingPayments: number;
  metrics: MetricCardData[];
}
