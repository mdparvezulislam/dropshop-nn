import { randomUUID } from "crypto";
import type {
  DeliveryAttempt,
  DeliveryStatus,
  NotificationChannelType,
  NotificationMessage,
} from "../domain/notification-entity";
import { NotificationRepository } from "../repositories/notification-repository";
import { logger } from "@/shared/utils/logger";
import { FeatureFlags } from "@/shared/core/feature-flags";
import { getQueue } from "@/shared/lib/bullmq";

export interface ChannelDeliveryResult {
  channel: NotificationChannelType;
  status: DeliveryStatus;
  provider?: string;
  providerMessageId?: string;
  error?: string;
}

/**
 * Channel adapters — production providers can replace these stubs.
 * Email/SMS are logged + marked delivered when feature flags allow (dev-ready).
 */
export class NotificationDispatcher {
  private readonly repo = new NotificationRepository();

  async dispatch(notification: NotificationMessage): Promise<NotificationMessage> {
    const attempts: DeliveryAttempt[] = [...(notification.attempts ?? [])];
    let overall: DeliveryStatus = "delivered";
    let anySuccess = false;

    await this.repo.update(notification.id, { status: "sending" } as any);

    for (const channel of notification.channels) {
      const result = await this.deliverChannel(notification, channel);
      attempts.push({
        id: randomUUID(),
        channel: result.channel,
        status: result.status,
        provider: result.provider,
        providerMessageId: result.providerMessageId,
        error: result.error,
        attemptedAt: new Date(),
        completedAt: new Date(),
      });
      if (result.status === "delivered") anySuccess = true;
      else overall = "failed";
    }

    if (anySuccess && overall === "failed") overall = "delivered";

    const updated = await this.repo.update(notification.id, {
      attempts,
      status: overall,
      sentAt: new Date(),
      deliveredAt: anySuccess ? new Date() : null,
      retryCount:
        overall === "failed"
          ? (notification.retryCount ?? 0) + 1
          : notification.retryCount ?? 0,
    } as any);

    // Queue retry for failed messages (BullMQ ready)
    if (overall === "failed" && (notification.retryCount ?? 0) < (notification.maxRetries ?? 3)) {
      await this.enqueueRetry(notification.id);
    }

    return updated;
  }

  private async deliverChannel(
    notification: NotificationMessage,
    channel: NotificationChannelType,
  ): Promise<ChannelDeliveryResult> {
    try {
      switch (channel) {
        case "in_app":
          return {
            channel,
            status: "delivered",
            provider: "in-app-store",
            providerMessageId: notification.id,
          };
        case "email": {
          const enabled = FeatureFlags.isEnabled("notifications.email-enabled");
          if (!enabled) {
            return { channel, status: "cancelled", provider: "email", error: "Email channel disabled" };
          }
          logger.info("NotificationDispatcher: email (stub)", {
            to: notification.recipientEmail ?? notification.userId,
            title: notification.title,
          });
          return {
            channel,
            status: "delivered",
            provider: "email-stub",
            providerMessageId: `email_${notification.id}`,
          };
        }
        case "sms": {
          const enabled = FeatureFlags.isEnabled("notifications.sms-enabled");
          if (!enabled) {
            return { channel, status: "cancelled", provider: "sms", error: "SMS channel disabled" };
          }
          logger.info("NotificationDispatcher: sms (stub)", {
            to: notification.recipientPhone ?? notification.userId,
            body: notification.body.slice(0, 80),
          });
          return {
            channel,
            status: "delivered",
            provider: "sms-stub",
            providerMessageId: `sms_${notification.id}`,
          };
        }
        case "push":
          logger.info("NotificationDispatcher: push (stub)", {
            userId: notification.userId,
            title: notification.title,
          });
          return {
            channel,
            status: "delivered",
            provider: "push-stub",
            providerMessageId: `push_${notification.id}`,
          };
        default:
          return {
            channel,
            status: "failed",
            error: `Unsupported channel: ${channel}`,
          };
      }
    } catch (err) {
      return {
        channel,
        status: "failed",
        error: err instanceof Error ? err.message : "Delivery failed",
      };
    }
  }

  private async enqueueRetry(notificationId: string): Promise<void> {
    try {
      const queue = getQueue("notifications");
      await queue.add(
        "retry-delivery",
        { notificationId },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
          removeOnComplete: true,
        },
      );
    } catch (err) {
      logger.warn("NotificationDispatcher: retry enqueue failed (queue may be offline)", {
        err,
        notificationId,
      });
    }
  }
}

export default NotificationDispatcher;
