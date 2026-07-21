export type {
  NotificationMessage,
  NotificationTemplate,
  NotificationCategory,
  NotificationChannelType,
  DeliveryStatus,
  DeliveryAttempt,
  NotifyInput,
} from "./domain/notification-entity";

export { DEFAULT_TEMPLATES } from "./domain/notification-entity";
export { NOTIFICATION_EVENTS, NOTIFICATION_SOURCE_EVENTS } from "./domain/notification-events";

export { NotificationService } from "./services/notification-service";
export { NotificationPublisher } from "./services/notification-publisher";
export { NotificationDispatcher } from "./services/notification-dispatcher";
export { PreferenceResolver } from "./services/preference-resolver";
export { renderTemplateString, renderNotificationContent } from "./services/template-renderer";

export { registerNotificationModule } from "./init";

export {
  notifySchema,
  inboxQuerySchema,
  templateUpsertSchema,
  deliveryLogQuerySchema,
} from "./types/validation";
