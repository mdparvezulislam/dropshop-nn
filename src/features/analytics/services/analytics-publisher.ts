import { randomUUID } from "crypto";
import { EventBus } from "@/lib/event-bus";
import type { TrackEventInput } from "../domain/analytics-entity";
import { AnalyticsIngestionService } from "./analytics-ingestion-service";
import { logger } from "@/lib/utils/logger";

/**
 * Single entry point for publishing analytics events.
 * Writes to the analytics fact store and optionally mirrors onto EventBus.
 */
export class AnalyticsPublisher {
  private readonly ingestion = new AnalyticsIngestionService();

  async track(input: TrackEventInput): Promise<{ eventId: string }> {
    const result = await this.ingestion.ingest(input);

    try {
      await EventBus.publish(
        "analytics.event.tracked",
        {
          eventId: result.eventId,
          eventName: input.eventName,
          module: input.module ?? "website",
          entityType: input.entityType,
          entityId: input.entityId,
        },
        {
          source: "analytics-publisher",
          actor: input.actorId ? { id: input.actorId, role: input.actorRole } : undefined,
        },
      );
    } catch (err) {
      logger.warn("AnalyticsPublisher: EventBus mirror failed", { err });
    }

    return { eventId: result.eventId };
  }

  /** Fire-and-forget helper for client/server callers */
  trackAsync(input: TrackEventInput): void {
    this.track(input).catch((err) => {
      logger.warn("AnalyticsPublisher: async track failed", { err, event: input.eventName });
    });
  }
}

export function createClientSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return randomUUID();
}

export default AnalyticsPublisher;
