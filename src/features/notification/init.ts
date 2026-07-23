import { FeatureFlags, Settings } from "@/lib/core/feature-flags";
import { EventRegistry } from "@/lib/event-bus/event-registry";
import { logger } from "@/lib/utils/logger";
import { NOTIFICATION_SOURCE_EVENTS } from "./domain/notification-events";

let registered = false;

export function registerNotificationModule(): void {
  if (registered) return;
  registered = true;

  logger.info("Initializing Notification Engine");

  try {
    // Flags may already exist from CORE — register safely
    try {
      FeatureFlags.register({
        key: "notification-engine",
        name: "Notification Engine",
        description: "Multi-channel communications, templates, and delivery pipeline",
        defaultState: "on",
      });
    } catch {
      // already registered
    }

    try {
      FeatureFlags.register({
        key: "notifications.email-enabled",
        name: "Email Notifications",
        description: "Enable email delivery channel",
        defaultState: "on",
      });
    } catch {
      // already registered
    }

    try {
      FeatureFlags.register({
        key: "notifications.sms-enabled",
        name: "SMS Notifications",
        description: "Enable SMS delivery channel",
        defaultState: "off",
      });
    } catch {
      // already registered
    }

    Settings.register({
      key: "notification.max-retries",
      name: "Max delivery retries",
      description: "Maximum retry attempts for failed deliveries",
      scope: "global",
      defaultValue: 3,
    });

    Settings.register({
      key: "notification.default-channels",
      name: "Default channels",
      description: "Default channels when template omits channels",
      scope: "global",
      defaultValue: "in_app,email",
    });
  } catch (err) {
    logger.warn("Notification flags/settings registration issue", { error: err });
  }

  // Seed default templates (lazy, non-blocking)
  import("./services/notification-service")
    .then(({ NotificationService }) => new NotificationService().ensureDefaultTemplates())
    .catch((err) => logger.warn("Notification template seed skipped", { err }));

  try {
    for (const eventType of NOTIFICATION_SOURCE_EVENTS) {
      EventRegistry.registerSyncSubscriber(eventType, {
        eventType,
        priority: 40,
        handle: async (event) => {
          const { NotificationPublisher } = await import(
            "./services/notification-publisher"
          );
          await new NotificationPublisher().handleBusinessEvent(event);
        },
      });
    }

    logger.info("Notification event subscribers registered");
  } catch (err) {
    logger.error("Failed to register notification subscribers", err);
  }
}
