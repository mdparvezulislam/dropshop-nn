import { FeatureFlags, Settings } from "@/shared/core/feature-flags";
import { EventRegistry } from "@/shared/lib/event-bus/event-registry";
import { logger } from "@/shared/utils/logger";
import { ANALYTICS_SOURCE_EVENTS } from "./domain/analytics-events";

let registered = false;

export function registerAnalyticsModule(): void {
  if (registered) return;
  registered = true;

  logger.info("Initializing Analytics Engine");

  try {
    FeatureFlags.register({
      key: "analytics-engine",
      name: "Analytics Engine",
      description: "Centralized event intelligence, metrics, and dashboards",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "analytics-client-tracking",
      name: "Client Analytics Tracking",
      description: "Allow browser/session event tracking via server actions",
      defaultState: "on",
    });

    Settings.register({
      key: "analytics.default-range",
      name: "Default analytics range",
      description: "Default dashboard date preset",
      scope: "global",
      defaultValue: "30d",
    });

    Settings.register({
      key: "analytics.currency",
      name: "Analytics currency",
      description: "Default currency for revenue metrics",
      scope: "global",
      defaultValue: "BDT",
    });
  } catch (err) {
    logger.warn("Analytics flags already registered", { error: err });
  }

  try {
    for (const eventType of ANALYTICS_SOURCE_EVENTS) {
      EventRegistry.registerSyncSubscriber(eventType, {
        eventType,
        priority: 50,
        handle: async (event) => {
          const { AnalyticsIngestionService } = await import(
            "./services/analytics-ingestion-service"
          );
          await new AnalyticsIngestionService().ingestBusinessEvent(event);
        },
      });
    }

    EventRegistry.registerSyncSubscriber("*", {
      eventType: "*",
      priority: 100,
      handle: async (event) => {
        // Lightweight wildcard: only ingest known commerce/cms patterns not already handled
        if (ANALYTICS_SOURCE_EVENTS.includes(event.eventType as any)) return;
        if (
          !event.eventType.startsWith("order.") &&
          !event.eventType.startsWith("checkout.") &&
          !event.eventType.startsWith("cms.")
        ) {
          return;
        }
        const { AnalyticsIngestionService } = await import(
          "./services/analytics-ingestion-service"
        );
        await new AnalyticsIngestionService().ingestBusinessEvent(event);
      },
    });

    logger.info("Analytics event subscribers registered");
  } catch (err) {
    logger.error("Failed to register analytics subscribers", err);
  }
}
