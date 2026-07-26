"use server";

import { auth } from "@/lib/auth";
import { LogisticsService } from "../services/logistics-service";
import { TrackingService } from "../services/tracking-service";
import { CourierConfigService } from "../services/courier-config-service";
import { PickupAddressService } from "../services/pickup-address-service";
import { CourierHealthService } from "../services/courier-health-service";
import { DeliveryAnalyticsService } from "../services/delivery-analytics-service";
import { RetryQueueService } from "../services/retry-queue-service";
import { ShipmentRepository } from "../repositories/shipment-repository";
import { WebhookEventRepository } from "../repositories/webhook-event-repository";
import { LogisticsAuditRepository } from "../repositories/logistics-audit-repository";
import {
  createShipmentSchema,
  bookShipmentSchema,
  cancelShipmentSchema,
  bulkBookSchema,
  saveCourierConfigSchema,
  createPickupAddressSchema,
  syncTrackingSchema,
  retryLogisticsTaskSchema,
} from "../types/validation";
import { checkPermission } from "@/lib/check-permission";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function createShipmentAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Courier.Manage");

  try {
    const validated = createShipmentSchema.parse(formData);
    const service = new LogisticsService();
    const result = await service.createShipment({
      ...validated,
      actorId: session.user.id,
    });
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createShipmentAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function bookShipmentAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Courier.Manage");

  try {
    const validated = bookShipmentSchema.parse(formData);
    const service = new LogisticsService();
    const result = await service.bookShipment(validated.shipmentId, session.user.id);
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("bookShipmentAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function cancelShipmentAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Courier.Manage");

  try {
    const validated = cancelShipmentSchema.parse(formData);
    const service = new LogisticsService();
    const result = await service.cancelShipment(
      validated.shipmentId,
      validated.reason,
      session.user.id,
    );
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("cancelShipmentAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function bulkBookShipmentsAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Courier.Manage");

  try {
    const validated = bulkBookSchema.parse(formData);
    const service = new LogisticsService();
    const result = await service.bulkBookShipments(validated.shipmentIds, session.user.id);
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("bulkBookShipmentsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listShipmentsAction(filters: unknown = {}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const repo = new ShipmentRepository();
    const result = await repo.findWithFilters(filters as any);
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("listShipmentsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function saveCourierConfigAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = saveCourierConfigSchema.parse(formData);
    const service = new CourierConfigService();
    const result = await service.saveConfig(validated.provider, validated as any);
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("saveCourierConfigAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listCourierConfigsAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const service = new CourierConfigService();
    const configs = await service.listConfigs();
    return { success: true, data: configs };
  } catch (error: any) {
    logger.error("listCourierConfigsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function testCourierConnectionAction(provider: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const service = new CourierConfigService();
    const result = await service.testConnection(provider);
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("testCourierConnectionAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function createPickupAddressAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = createPickupAddressSchema.parse(formData);
    const service = new PickupAddressService();
    const result = await service.createAddress(validated as any);
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("createPickupAddressAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listPickupAddressesAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const service = new PickupAddressService();
    const addresses = await service.listAddresses();
    return { success: true, data: addresses };
  } catch (error: any) {
    logger.error("listPickupAddressesAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function syncShipmentTrackingAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Courier.Sync");

  try {
    const validated = syncTrackingSchema.parse(formData);
    const service = new TrackingService();
    const result = await service.syncShipmentTracking(validated.shipmentId, session.user.id);
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("syncShipmentTrackingAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getLogisticsSummaryAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const service = new DeliveryAnalyticsService();
    const result = await service.getSummary();
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getLogisticsSummaryAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getCourierHealthMetricsAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const service = new CourierHealthService();
    const result = await service.getHealthMetrics();
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getCourierHealthMetricsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listWebhookEventsAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const repo = new WebhookEventRepository();
    const items = await repo.listRecentWebhooks();
    return { success: true, data: items };
  } catch (error: any) {
    logger.error("listWebhookEventsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listLogisticsAuditLogsAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const repo = new LogisticsAuditRepository();
    const items = await repo.listRecentLogs();
    return { success: true, data: items };
  } catch (error: any) {
    logger.error("listLogisticsAuditLogsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function listRetryQueueAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const service = new RetryQueueService();
    const items = await service.listRetryQueue();
    return { success: true, data: items };
  } catch (error: any) {
    logger.error("listRetryQueueAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function retryLogisticsTaskAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = (await auth()) as any;
  checkPermission(session, "Courier.Manage");

  try {
    const validated = retryLogisticsTaskSchema.parse(formData);
    const service = new RetryQueueService();
    const result = await service.retryTask(validated.taskId, session.user.id);
    revalidatePath("/dashboard/courier");
    return { success: true, data: { retried: result } };
  } catch (error: any) {
    logger.error("retryLogisticsTaskAction failed", error);
    return { success: false, error: error.message };
  }
}
