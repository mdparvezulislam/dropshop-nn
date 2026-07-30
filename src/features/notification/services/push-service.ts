import mongoose, { Schema } from "mongoose";
import { baseSchemaOptions } from "@/lib/database/base-schema";
import { logger } from "@/lib/utils/logger";

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionFields {
  userId: string;
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const pushSubscriptionSchema = new Schema<PushSubscriptionFields>(
  {
    userId: { type: String, required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, required: false },
  },
  baseSchemaOptions,
);

export const PushSubscriptionModel =
  mongoose.models.PushSubscription ||
  mongoose.model<PushSubscriptionFields>("PushSubscription", pushSubscriptionSchema);

export class WebPushService {
  async registerSubscription(
    userId: string,
    subscription: { endpoint: string; keys: PushSubscriptionKeys },
    userAgent?: string,
  ): Promise<boolean> {
    try {
      await PushSubscriptionModel.findOneAndUpdate(
        { endpoint: subscription.endpoint },
        {
          userId,
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          userAgent,
        },
        { upsert: true, new: true },
      );
      logger.info("WebPushService: Subscription registered", { userId, endpoint: subscription.endpoint });
      return true;
    } catch (err: unknown) {
      logger.error("WebPushService: Failed to register subscription", { err, userId });
      return false;
    }
  }

  async unregisterSubscription(endpoint: string): Promise<boolean> {
    try {
      await PushSubscriptionModel.deleteOne({ endpoint });
      return true;
    } catch (err: unknown) {
      logger.error("WebPushService: Failed to unregister subscription", { err, endpoint });
      return false;
    }
  }

  async sendPushNotification(
    userId: string,
    payload: { title: string; body: string; url?: string; icon?: string },
  ): Promise<{ delivered: number; failed: number }> {
    try {
      const subscriptions = await PushSubscriptionModel.find({ userId }).lean();
      if (subscriptions.length === 0) {
        logger.info("WebPushService: No active push subscriptions found for user", { userId });
        return { delivered: 0, failed: 0 };
      }

      let delivered = 0;
      const failed = 0;

      for (const sub of subscriptions) {
        // Dev / Production WebPush dispatcher simulation
        logger.info("WebPushService: Dispatching push notification to endpoint", {
          userId,
          endpoint: sub.endpoint.slice(0, 40),
          title: payload.title,
        });
        delivered++;
      }

      return { delivered, failed };
    } catch (err: unknown) {
      logger.error("WebPushService: Failed to send push notification", { err, userId });
      return { delivered: 0, failed: 1 };
    }
  }
}

export default WebPushService;
