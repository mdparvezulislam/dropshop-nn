import { FeatureFlags, Settings } from "@/shared/core/feature-flags";
import { EventRegistry } from "@/shared/lib/event-bus/event-registry";
import { BackgroundJobs } from "@/shared/platform/jobs";
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
      key: "analytics-executive-dashboard",
      name: "Executive Dashboard",
      description: "Enterprise executive dashboard with real-time KPIs",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "analytics-live-dashboard",
      name: "Live Dashboard",
      description: "Real-time auto-refreshing dashboard",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "analytics-report-center",
      name: "Report Center",
      description: "Generate and export analytics reports",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "analytics-client-tracking",
      name: "Client Analytics Tracking",
      description: "Allow browser/session event tracking via server actions",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "analytics-cache",
      name: "Analytics Cache",
      description: "Redis caching for analytics queries",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "analytics-snapshots",
      name: "Analytics Snapshots",
      description: "Daily/monthly/yearly analytics snapshots",
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

    Settings.register({
      key: "analytics.live-refresh-interval",
      name: "Live dashboard refresh interval",
      description: "Auto-refresh interval in seconds",
      scope: "global",
      defaultValue: "30",
    });

    Settings.register({
      key: "analytics.snapshot-retention-days",
      name: "Snapshot retention period",
      description: "Number of days to retain analytics snapshots",
      scope: "global",
      defaultValue: "365",
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
        if (ANALYTICS_SOURCE_EVENTS.includes(event.eventType as any)) return;
        if (
          !event.eventType.startsWith("order.") &&
          !event.eventType.startsWith("checkout.") &&
          !event.eventType.startsWith("cms.") &&
          !event.eventType.startsWith("courier.") &&
          !event.eventType.startsWith("finance.") &&
          !event.eventType.startsWith("inventory.") &&
          !event.eventType.startsWith("customer.") &&
          !event.eventType.startsWith("identity.") &&
          !event.eventType.startsWith("notification.")
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

  try {
    /* Analytics background jobs */
    BackgroundJobs.register({
      name: "analytics.generate-daily-snapshot",
      engine: "ANALYTICS",
      cron: "0 0 * * *",
      description: "Generate daily analytics snapshot for the previous day",
      enabled: true,
    });

    BackgroundJobs.register({
      name: "analytics.generate-monthly-snapshot",
      engine: "ANALYTICS",
      cron: "0 1 1 * *",
      description: "Generate monthly analytics snapshot",
      enabled: true,
    });

    BackgroundJobs.register({
      name: "analytics.generate-yearly-snapshot",
      engine: "ANALYTICS",
      cron: "0 2 1 1 *",
      description: "Generate yearly analytics snapshot",
      enabled: true,
    });

    BackgroundJobs.register({
      name: "analytics.cache-warmup",
      engine: "ANALYTICS",
      cron: "0 */4 * * *",
      description: "Warm analytics cache with common dashboard queries",
      enabled: true,
    });

    BackgroundJobs.register({
      name: "analytics.cleanup-stale-cache",
      engine: "ANALYTICS",
      cron: "0 4 * * *",
      description: "Clean up stale analytics cache entries",
      enabled: true,
    });

    logger.info("Analytics background jobs registered");
  } catch (err) {
    logger.error("Failed to register analytics background jobs", err);
  }
}
