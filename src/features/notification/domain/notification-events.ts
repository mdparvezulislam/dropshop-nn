export const NOTIFICATION_EVENTS = {
  TRIGGER: "notification.trigger",
  QUEUED: "notification.queued",
  SENT: "notification.sent",
  DELIVERED: "notification.delivered",
  FAILED: "notification.failed",
  READ: "notification.read",
  OPENED: "notification.opened",
  CLICKED: "notification.clicked",
  UNSUBSCRIBED: "notification.unsubscribed",
} as const;

/** Domain events that auto-trigger notifications */
export const NOTIFICATION_SOURCE_EVENTS = [
  "order.created",
  "order.completed",
  "order.cancelled",
  "order.shipped",
  "order.delivered",
  "cms.content.published",
  "notification.trigger",
] as const;

export type NotificationSourceEvent = (typeof NOTIFICATION_SOURCE_EVENTS)[number];
