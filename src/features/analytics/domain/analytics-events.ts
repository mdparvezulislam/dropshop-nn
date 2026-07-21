export const ANALYTICS_DOMAIN_EVENTS = {
  EVENT_INGESTED: "analytics.event.ingested",
  METRICS_REBUILT: "analytics.metrics.rebuilt",
} as const;

/** Domain events the analytics engine consumes from other modules */
export const ANALYTICS_SOURCE_EVENTS = [
  "order.created",
  "order.completed",
  "order.cancelled",
  "order.refunded",
  "catalog.product.created",
  "catalog.product.published",
  "cms.content.published",
  "cms.content.updated",
] as const;

export type AnalyticsSourceEvent = (typeof ANALYTICS_SOURCE_EVENTS)[number];
