import { randomUUID } from "crypto";
import { EventFactRepository } from "../repositories/event-fact-repository";
import { MetricBucketRepository } from "../repositories/metric-bucket-repository";
import {
  ANALYTICS_EVENT_NAMES,
  type AnalyticsEventFact,
  type AnalyticsModule,
  type TrackEventInput,
} from "../domain/analytics-entity";
import type { BusinessEvent } from "@/shared/lib/event-bus/types";
import { logger } from "@/shared/utils/logger";
import { ValidationError } from "@/shared/errors/app-error";

function sanitizeMetadata(
  input?: Record<string, unknown>,
): Record<string, string | number | boolean | null | undefined> {
  if (!input) return {};
  const out: Record<string, string | number | boolean | null | undefined> = {};
  for (const [key, value] of Object.entries(input)) {
    if (
      value === null ||
      value === undefined ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      out[key] = value;
    } else {
      out[key] = String(value);
    }
  }
  return out;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function startOfHour(d: Date): Date {
  const x = new Date(d);
  x.setUTCMinutes(0, 0, 0);
  return x;
}

function inferModule(eventName: string, explicit?: AnalyticsModule): AnalyticsModule {
  if (explicit) return explicit;
  if (eventName.startsWith("order.") || eventName.startsWith("checkout.") || eventName.startsWith("cart.")) {
    return "order";
  }
  if (eventName.startsWith("product.") || eventName.startsWith("catalog.") || eventName.startsWith("category.")) {
    return "catalog";
  }
  if (eventName.startsWith("blog.")) return "blog";
  if (eventName.startsWith("cms.")) return "cms";
  if (eventName.startsWith("search.")) return "website";
  if (eventName.startsWith("identity.") || eventName === "login" || eventName === "logout") {
    return "identity";
  }
  if (eventName.startsWith("homepage.")) return "website";
  return "system";
}

export class AnalyticsIngestionService {
  private readonly facts = new EventFactRepository();
  private readonly metrics = new MetricBucketRepository();

  async ingest(input: TrackEventInput): Promise<{ eventId: string; duplicate?: boolean }> {
    if (!input.eventName?.trim()) {
      throw new ValidationError("eventName is required");
    }

    const eventId = randomUUID();
    const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();
    const idempotencyKey =
      input.idempotencyKey ||
      (input.sessionId && input.entityId
        ? `${input.eventName}:${input.sessionId}:${input.entityId}:${timestamp.toISOString().slice(0, 13)}`
        : undefined);

    if (idempotencyKey) {
      const existing = await this.facts.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        return { eventId: existing.eventId, duplicate: true };
      }
    }

    const targetModule = inferModule(input.eventName, input.module);

    try {
      await this.facts.create({
        eventId,
        eventName: input.eventName.trim(),
        timestamp,
        actorId: input.actorId,
        actorRole: input.actorRole ?? "guest",
        sessionId: input.sessionId,
        requestId: input.requestId,
        source: input.source ?? "app",
        module: targetModule,
        entityType: input.entityType,
        entityId: input.entityId,
        value: input.value,
        currency: input.currency ?? "BDT",
        metadata: sanitizeMetadata(input.metadata as Record<string, unknown> | undefined),
        idempotencyKey,
      } as any);
    } catch (err: any) {
      if (err?.code === 11000 || String(err?.message || "").includes("duplicate")) {
        return { eventId, duplicate: true };
      }
      throw err;
    }

    await this.rollUp(input.eventName, timestamp, input.value ?? 0, {
      module: targetModule,
      role: String(input.actorRole ?? "guest"),
    });

    return { eventId };
  }

  /** Map domain EventBus events into analytics facts */
  async ingestBusinessEvent(event: BusinessEvent): Promise<void> {
    const data = event.data ?? {};
    const mapped = this.mapBusinessEvent(event.eventType, data);
    if (!mapped) return;

    await this.ingest({
      eventName: mapped.eventName,
      module: mapped.module,
      source: event.source || "event-bus",
      actorId: event.actor?.id,
      actorRole: event.actor?.role,
      requestId: event.correlationId,
      entityType: mapped.entityType,
      entityId: mapped.entityId,
      value: mapped.value,
      currency: mapped.currency,
      metadata: sanitizeMetadata({ ...data, busEventType: event.eventType }),
      timestamp: event.timestamp,
      idempotencyKey: `bus:${event.eventId}:${mapped.eventName}`,
    });
  }

  private mapBusinessEvent(
    eventType: string,
    data: Record<string, unknown>,
  ): {
    eventName: string;
    module: AnalyticsModule;
    entityType?: string;
    entityId?: string;
    value?: number;
    currency?: string;
  } | null {
    switch (eventType) {
      case "order.created":
        return {
          eventName: ANALYTICS_EVENT_NAMES.ORDER_CREATED,
          module: "order",
          entityType: "order",
          entityId: String(data.orderId ?? ""),
          value: Number(data.grandTotal ?? 0),
          currency: String(data.currency ?? "BDT"),
        };
      case "order.completed":
        return {
          eventName: ANALYTICS_EVENT_NAMES.ORDER_PAID,
          module: "order",
          entityType: "order",
          entityId: String(data.orderId ?? ""),
          value: Number(data.grandTotal ?? data.total ?? 0),
          currency: String(data.currency ?? "BDT"),
        };
      case "order.cancelled":
        return {
          eventName: ANALYTICS_EVENT_NAMES.ORDER_CANCELLED,
          module: "order",
          entityType: "order",
          entityId: String(data.orderId ?? ""),
          value: Number(data.grandTotal ?? 0),
        };
      case "order.refunded":
        return {
          eventName: ANALYTICS_EVENT_NAMES.REFUND_COMPLETED,
          module: "order",
          entityType: "order",
          entityId: String(data.orderId ?? ""),
          value: Number(data.refundAmount ?? data.grandTotal ?? 0),
        };
      case "catalog.product.published":
      case "catalog.product.created":
        return {
          eventName: eventType,
          module: "catalog",
          entityType: "product",
          entityId: String(data.productId ?? ""),
        };
      case "cms.content.published":
        return {
          eventName: ANALYTICS_EVENT_NAMES.CMS_PUBLISHED,
          module: "cms",
          entityType: String(data.type ?? "content"),
          entityId: String(data.id ?? data.contentId ?? ""),
        };
      default:
        return null;
    }
  }

  private async rollUp(
    eventName: string,
    timestamp: Date,
    value: number,
    dims: Record<string, string>,
  ): Promise<void> {
    try {
      const day = startOfDay(timestamp);
      const hour = startOfHour(timestamp);
      await Promise.all([
        this.metrics.increment(`event:${eventName}`, "day", day, value, dims),
        this.metrics.increment(`event:${eventName}`, "hour", hour, value, dims),
        this.metrics.increment("events:all", "day", day, value, dims),
      ]);

      if (
        eventName === ANALYTICS_EVENT_NAMES.ORDER_CREATED ||
        eventName === ANALYTICS_EVENT_NAMES.ORDER_PAID
      ) {
        await this.metrics.increment("revenue", "day", day, value, dims);
        await this.metrics.increment("orders", "day", day, 1, dims);
      }
    } catch (err) {
      logger.warn("AnalyticsIngestionService: metric rollup failed", { err, eventName });
    }
  }
}

export default AnalyticsIngestionService;
