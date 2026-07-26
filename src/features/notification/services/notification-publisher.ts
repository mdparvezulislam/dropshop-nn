import type { NotifyInput, NotificationMessage } from "../domain/notification-entity";
import { NotificationService } from "./notification-service";
import type { BusinessEvent } from "@/lib/event-bus/types";
import { logger } from "@/lib/utils/logger";

/**
 * Single public entry point for all platform notifications.
 * Engines and UI should use this — never send email/SMS directly.
 */
export class NotificationPublisher {
  private readonly service = new NotificationService();

  async notify(input: NotifyInput): Promise<NotificationMessage | null> {
    return this.service.notify(input);
  }

  notifyAsync(input: NotifyInput): void {
    this.service.notify(input).catch((err) => {
      logger.warn("NotificationPublisher: async notify failed", {
        err,
        type: input.type,
      });
    });
  }

  /** Map domain EventBus events into notification requests */
  async handleBusinessEvent(event: BusinessEvent): Promise<void> {
    const data = event.data ?? {};
    const mapped = this.mapEvent(event.eventType, data, event.actor);
    if (!mapped) return;
    await this.notify(mapped);
  }

  private mapEvent(
    eventType: string,
    data: Record<string, unknown>,
    actor?: { id?: string; name?: string; role?: string },
  ): NotifyInput | null {
    if (eventType === "notification.trigger") {
      const recipients = (data.recipients as string[]) ?? [];
      const type = String(data.type ?? "generic");
      const payload = (data.data as Record<string, unknown>) ?? {};
      const userId = recipients[0] || (payload.userId as string | undefined);
      return {
        userId,
        type,
        templateKey: type,
        title: payload.title as string | undefined,
        body: payload.body as string | undefined,
        variables: this.toVars(payload),
        data: this.toVars(payload),
        entityType: payload.entityType as string | undefined,
        entityId: payload.entityId as string | undefined,
        href: payload.href as string | undefined,
      };
    }

    switch (eventType) {
      case "order.created":
        return {
          userId: String(data.customerId ?? data.userId ?? actor?.id ?? ""),
          type: "order.created",
          templateKey: "order.created",
          category: "order",
          variables: {
            customerName: String(data.customerName ?? actor?.name ?? "Customer"),
            orderNumber: String(data.orderNumber ?? data.orderId ?? ""),
            amount: String(data.grandTotal ?? data.total ?? ""),
          },
          entityType: "order",
          entityId: String(data.orderId ?? ""),
          href: "/account/orders",
        };
      case "order.shipped":
      case "order.delivered":
        return {
          userId: String(data.customerId ?? data.userId ?? actor?.id ?? ""),
          type: eventType === "order.shipped" ? "order.shipped" : "order.shipped",
          templateKey: "order.shipped",
          category: "shipping",
          variables: {
            customerName: String(data.customerName ?? "Customer"),
            orderNumber: String(data.orderNumber ?? data.orderId ?? ""),
            trackingNumber: String(data.trackingNumber ?? "N/A"),
          },
          entityType: "order",
          entityId: String(data.orderId ?? ""),
          href: "/account/orders",
        };
      case "order.cancelled":
        return {
          userId: String(data.customerId ?? data.userId ?? actor?.id ?? ""),
          type: "order.cancelled",
          templateKey: "order.cancelled",
          category: "order",
          variables: {
            customerName: String(data.customerName ?? "Customer"),
            orderNumber: String(data.orderNumber ?? data.orderId ?? ""),
          },
          entityType: "order",
          entityId: String(data.orderId ?? ""),
          href: "/account/orders",
        };
      case "order.completed":
        return {
          userId: String(data.customerId ?? data.userId ?? actor?.id ?? ""),
          type: "order.created",
          templateKey: "order.created",
          category: "order",
          title: "Order completed",
          body: `Order ${String(data.orderNumber ?? "")} has been completed.`,
          variables: {
            customerName: String(data.customerName ?? "Customer"),
            orderNumber: String(data.orderNumber ?? data.orderId ?? ""),
            amount: String(data.grandTotal ?? ""),
          },
          entityType: "order",
          entityId: String(data.orderId ?? ""),
          href: "/account/orders",
        };
      case "cms.content.published":
        return {
          userId: String(data.authorId ?? actor?.id ?? ""),
          type: "cms.published",
          templateKey: "cms.published",
          category: "cms",
          variables: {
            title: String(data.title ?? "Content"),
          },
          entityType: "content",
          entityId: String(data.id ?? data.contentId ?? ""),
          href: "/dashboard/content",
        };
      default:
        return null;
    }
  }

  private toVars(input: Record<string, unknown>): Record<string, string | number | boolean | null> {
    const out: Record<string, string | number | boolean | null> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        out[k] = v;
      } else if (v !== undefined) {
        out[k] = String(v);
      }
    }
    return out;
  }
}

export default NotificationPublisher;
