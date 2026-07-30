"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { NotificationService } from "../services/notification-service";
import { NotificationPublisher } from "../services/notification-publisher";
import {
  notifySchema,
  inboxQuerySchema,
  templateUpsertSchema,
  deliveryLogQuerySchema,
} from "../types/validation";
import { revalidatePath } from "next/cache";

function requireUserId(session: unknown): string {
  const user = (session as { user?: { id?: string } } | null)?.user;
  if (!user?.id) throw new Error("Unauthorized");
  return user.id;
}

export async function getNotificationInboxAction(query: unknown = {}): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = requireUserId(session);
    const validated = inboxQuerySchema.parse(query ?? {});
    const service = new NotificationService();
    const data = await service.getInbox(userId, validated);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load inbox",
    };
  }
}

export async function markNotificationReadAction(id: string): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = requireUserId(session);
    const service = new NotificationService();
    const data = await service.markRead(id, userId);
    revalidatePath("/account");
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark read",
    };
  }
}

export async function markAllNotificationsReadAction(): Promise<{
  success: boolean;
  data?: { count: number };
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = requireUserId(session);
    const service = new NotificationService();
    const count = await service.markAllRead(userId);
    return { success: true, data: { count } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to mark all read",
    };
  }
}

export async function archiveNotificationAction(id: string): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = requireUserId(session);
    const service = new NotificationService();
    const data = await service.archive(id, userId);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to archive",
    };
  }
}

export async function deleteNotificationAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = requireUserId(session);
    const service = new NotificationService();
    await service.deleteForUser(id, userId);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete",
    };
  }
}

export async function sendNotificationAction(payload: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Notification.Create");
    const validated = notifySchema.parse(payload);
    const publisher = new NotificationPublisher();
    const data = await publisher.notify(validated);
    revalidatePath("/dashboard/notifications");
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send notification",
    };
  }
}

export async function listNotificationTemplatesAction(): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Notification.View");
    const service = new NotificationService();
    const data = await service.listTemplates();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to list templates",
    };
  }
}

export async function upsertNotificationTemplateAction(payload: unknown): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Notification.Update");
    const validated = templateUpsertSchema.parse(payload);
    const service = new NotificationService();
    const data = await service.upsertTemplate(validated);
    revalidatePath("/dashboard/notifications/templates");
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save template",
    };
  }
}

export async function getDeliveryLogsAction(query: unknown = {}): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Notification.View");
    const validated = deliveryLogQuerySchema.parse(query ?? {});
    const service = new NotificationService();
    const data = await service.getDeliveryLogs(validated);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load delivery logs",
    };
  }
}

export async function getNotificationStatusSummaryAction(): Promise<{
  success: boolean;
  data?: Record<string, number>;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Notification.View");
    const service = new NotificationService();
    const data = await service.getStatusSummary();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load summary",
    };
  }
}

export async function retryNotificationDeliveryAction(id: string): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  try {
    const session = await auth();
    checkPermission(session, "Notification.Update");
    const service = new NotificationService();
    const data = await service.retryDelivery(id);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to retry delivery",
    };
  }
}

/** Lightweight unread count for topbar / account */
export async function getUnreadNotificationCountAction(): Promise<{
  success: boolean;
  data?: { count: number };
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = requireUserId(session);
    const service = new NotificationService();
    const inbox = await service.getInbox(userId, { limit: 1, page: 1 });
    return { success: true, data: { count: inbox.unreadCount } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to load count",
    };
  }
}

export async function subscribeWebPushAction(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = requireUserId(session);
    const { WebPushService } = await import("../services/push-service");
    const pushService = new WebPushService();
    const ok = await pushService.registerSubscription(userId, subscription, subscription.userAgent);
    return { success: ok };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to subscribe push",
    };
  }
}

export async function unsubscribeWebPushAction(endpoint: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { WebPushService } = await import("../services/push-service");
    const pushService = new WebPushService();
    const ok = await pushService.unregisterSubscription(endpoint);
    return { success: ok };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to unsubscribe push",
    };
  }
}
