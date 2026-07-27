import { ShipmentRepository } from "../repositories/shipment-repository";
import { WebhookEventRepository } from "../repositories/webhook-event-repository";
import { FulfillmentService } from "./fulfillment-service";
import { TrackingService } from "./tracking-service";
import { logger } from "@/lib/utils/logger";

export interface RetryQueueItem {
  id: string;
  type: "failed_booking" | "failed_webhook" | "failed_sync";
  referenceNumber: string;
  provider: string;
  failureReason: string;
  retryCount: number;
  createdAt: Date;
}

export class RetryQueueService {
  private readonly shipmentRepository: ShipmentRepository;
  private readonly webhookEventRepository: WebhookEventRepository;
  private readonly fulfillment: FulfillmentService;
  private readonly trackingService: TrackingService;

  constructor() {
    this.shipmentRepository = new ShipmentRepository();
    this.webhookEventRepository = new WebhookEventRepository();
    this.fulfillment = new FulfillmentService();
    this.trackingService = new TrackingService();
  }

  async listRetryQueue(): Promise<RetryQueueItem[]> {
    const queue: RetryQueueItem[] = [];

    // Failed Bookings
    const { items: failedShipments } = await this.shipmentRepository.findWithFilters({
      status: "failed",
      limit: 50,
    });
    for (const s of failedShipments) {
      queue.push({
        id: `RETRY-SHP-${s.id}`,
        type: "failed_booking",
        referenceNumber: s.shipmentNumber,
        provider: s.provider,
        failureReason: s.lastFailureReason || "Booking rejected by courier API",
        retryCount: s.retryCount || 0,
        createdAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
      });
    }

    // Unprocessed Webhooks
    const failedWebhooks = await this.webhookEventRepository.findFailedWebhooks();
    for (const w of failedWebhooks) {
      queue.push({
        id: `RETRY-WH-${w.id}`,
        type: "failed_webhook",
        referenceNumber: w.event,
        provider: w.provider,
        failureReason: w.error || "Unprocessed webhook event payload",
        retryCount: w.retryCount,
        createdAt: w.createdAt,
      });
    }

    return queue;
  }

  async retryTask(taskId: string, actorId: string = "system"): Promise<boolean> {
    if (taskId.startsWith("RETRY-SHP-")) {
      const shipmentId = taskId.replace("RETRY-SHP-", "");
      const result = await this.fulfillment.bookShipment(shipmentId, {
        id: actorId,
        role: "system",
      });
      logger.info("RetryQueueService: retried failed booking", {
        shipmentId,
        booked: result.booked,
      });
      return result.booked;
    } else if (taskId.startsWith("RETRY-WH-")) {
      const webhookId = taskId.replace("RETRY-WH-", "");
      const webhook = await this.webhookEventRepository.findById(webhookId);
      if (webhook) {
        await this.trackingService.processWebhookEvent(webhook.provider, webhook.payload, actorId);
        await this.webhookEventRepository.update(webhookId, {
          processed: true,
          processedAt: new Date(),
        } as any);
        return true;
      }
    }

    return false;
  }
}

export default RetryQueueService;
