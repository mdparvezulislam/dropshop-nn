import { FeatureFlags, Settings } from "@/shared/core/feature-flags";
import { EventRegistry } from "@/shared/lib/event-bus/event-registry";
import type { BusinessEvent } from "@/shared/lib/event-bus/types";
import { BackgroundJobs } from "@/shared/platform/jobs";
import { logger } from "@/shared/utils/logger";
import { AUTOMATION_SOURCE_EVENTS } from "./domain/automation-entity";
import { initializeTaskLibrary } from "./services/task-library";

let registered = false;

export function registerAutomationModule(): void {
  if (registered) return;
  registered = true;

  logger.info("Initializing Automation Center");

  try {
    initializeTaskLibrary();

    FeatureFlags.register({
      key: "automation-engine",
      name: "Automation Engine",
      description: "Enterprise workflow automation and event orchestration",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "automation-workflow-builder",
      name: "Workflow Builder",
      description: "Visual workflow builder with rules engine",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "automation-schedule-center",
      name: "Schedule Center",
      description: "Schedule one-time and recurring jobs",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "automation-retry-engine",
      name: "Retry Engine",
      description: "Automatic retry with exponential backoff",
      defaultState: "on",
    });

    FeatureFlags.register({
      key: "automation-webhooks",
      name: "Webhook Automation",
      description: "Incoming and outgoing webhook support",
      defaultState: "on",
    });

    Settings.register({
      key: "automation.max-retries",
      name: "Global max retries",
      description: "Default maximum retry attempts per execution",
      scope: "global",
      defaultValue: "3",
    });

    Settings.register({
      key: "automation.retry-delay",
      name: "Retry delay (ms)",
      description: "Default delay between retries in milliseconds",
      scope: "global",
      defaultValue: "5000",
    });

    Settings.register({
      key: "automation.execution-timeout",
      name: "Execution timeout (ms)",
      description: "Default timeout for workflow executions",
      scope: "global",
      defaultValue: "300000",
    });
  } catch (err) {
    logger.warn("Automation flags already registered", { error: err });
  }

  try {
    for (const eventType of AUTOMATION_SOURCE_EVENTS) {
      EventRegistry.registerSyncSubscriber(eventType, {
        eventType,
        priority: 40,
        handle: async (event: BusinessEvent) => {
          const { workflowRepository } = await import("./repositories/workflow-repository");
          const { workflowEngine } = await import("./services/workflow-engine");

          const workflows = await workflowRepository.findActiveByEventType(event.eventType);
          for (const workflow of workflows) {
            await workflowEngine.execute(
              workflow.id,
              { event: event.data, eventType: event.eventType },
              "event",
              undefined,
              event.eventId
            );
          }
        },
      });
    }

    EventRegistry.registerSyncSubscriber("*", {
      eventType: "*",
      priority: 80,
      handle: async (event: BusinessEvent) => {
        const { workflowRepository } = await import("./repositories/workflow-repository");
        const { workflowEngine } = await import("./services/workflow-engine");

        const workflows = await workflowRepository.findActiveByEventType("*");
        for (const workflow of workflows) {
          await workflowEngine.execute(
            workflow.id,
            { event: event.data, eventType: event.eventType },
            "event",
            undefined,
            event.eventId
          );
        }
      },
    });

    logger.info("Automation event subscribers registered");
  } catch (err) {
    logger.error("Failed to register automation subscribers", err);
  }

  try {
    BackgroundJobs.register({
      name: "automation.process-scheduled-jobs",
      engine: "AUTOMATION",
      cron: "* * * * *",
      description: "Process due scheduled jobs every minute",
      enabled: true,
    });

    BackgroundJobs.register({
      name: "automation.automatic-retry",
      engine: "AUTOMATION",
      cron: "*/5 * * * *",
      description: "Automatic retry of failed executions every 5 minutes",
      enabled: true,
    });

    BackgroundJobs.register({
      name: "automation.cache-warmup",
      engine: "AUTOMATION",
      cron: "0 */6 * * *",
      description: "Warm automation cache every 6 hours",
      enabled: true,
    });

    BackgroundJobs.register({
      name: "automation.cache-cleanup",
      engine: "AUTOMATION",
      cron: "0 3 * * *",
      description: "Clean up stale automation cache daily",
      enabled: true,
    });

    logger.info("Automation background jobs registered");
  } catch (err) {
    logger.error("Failed to register automation background jobs", err);
  }
}
