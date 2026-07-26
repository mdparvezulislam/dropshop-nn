"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { DeliveryAutomationService } from "../services/delivery-automation-service";
import { TrackingService } from "../services/tracking-service";
import { triggerManualAutomationSyncSchema, restartAutomationSchema } from "../types/validation";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function getAutomationDashboardAction(): Promise<{
  success: boolean;
  data?: {
    metrics: any;
    automations: any[];
  };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const service = new DeliveryAutomationService();
    const [metrics, automations] = await Promise.all([
      service.getDashboardMetrics(),
      service.listAutomations(100),
    ]);
    return { success: true, data: { metrics, automations } };
  } catch (error: any) {
    logger.error("getAutomationDashboardAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function triggerManualAutomationSyncAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = triggerManualAutomationSyncSchema.parse(formData);
    const trackingService = new TrackingService();
    const updated = await trackingService.syncShipmentTracking(
      validated.shipmentId,
      session?.user?.name || session?.user?.id || "admin",
    );
    revalidatePath("/dashboard/courier/automation");
    revalidatePath("/dashboard/courier");
    return { success: true, data: updated };
  } catch (error: any) {
    logger.error("triggerManualAutomationSyncAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function runAdaptivePollingWorkerAction(): Promise<{
  success: boolean;
  processedCount?: number;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const service = new DeliveryAutomationService();
    const count = await service.runAdaptivePollingWorker();
    revalidatePath("/dashboard/courier/automation");
    return { success: true, processedCount: count };
  } catch (error: any) {
    logger.error("runAdaptivePollingWorkerAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function restartAutomationAction(formData: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = restartAutomationSchema.parse(formData);
    const service = new DeliveryAutomationService();
    await service.orchestrateCourierEvent({
      shipmentId: validated.shipmentId,
      newStatus: "in_transit" as any,
      description: "Automation manually restarted by administrator",
      actorId: session?.user?.name || session?.user?.id || "admin",
    });
    revalidatePath("/dashboard/courier/automation");
    return { success: true };
  } catch (error: any) {
    logger.error("restartAutomationAction failed", error);
    return { success: false, error: error.message };
  }
}
