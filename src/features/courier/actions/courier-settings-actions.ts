"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { CourierSettingsService } from "../services/courier-settings-service";
import { PathaoAuthService } from "../services/pathao-auth-service";
import { CourierApiLogRepository } from "../repositories/courier-api-log-repository";
import {
  saveSteadfastSettingsSchema,
  savePathaoSettingsSchema,
  issuePathaoTokenSchema,
} from "../types/validation";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function getCourierSettingsDashboardAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const service = new CourierSettingsService();
    const result = await service.getCourierSettingsDashboard();
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("getCourierSettingsDashboardAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function saveSteadfastSettingsAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = saveSteadfastSettingsSchema.parse(formData);
    const service = new CourierSettingsService();
    const result = await service.saveSteadfastSettings(validated);
    revalidatePath("/dashboard/courier/settings");
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("saveSteadfastSettingsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function savePathaoSettingsAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = savePathaoSettingsSchema.parse(formData);
    const service = new CourierSettingsService();
    const result = await service.savePathaoSettings(validated);
    revalidatePath("/dashboard/courier/settings");
    revalidatePath("/dashboard/courier");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("savePathaoSettingsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function generatePathaoTokenAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const validated = issuePathaoTokenSchema.parse(formData);
    const authService = new PathaoAuthService();
    const result = await authService.issueToken(validated);
    if (result.success) {
      revalidatePath("/dashboard/courier/settings");
      return { success: true, data: result };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    logger.error("generatePathaoTokenAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function refreshPathaoTokenAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const authService = new PathaoAuthService();
    const result = await authService.refreshToken();
    if (result.success) {
      revalidatePath("/dashboard/courier/settings");
      return { success: true, data: result };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    logger.error("refreshPathaoTokenAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function fetchPathaoStoresAction(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const authService = new PathaoAuthService();
    const result = await authService.fetchPathaoStores();
    if (result.success) {
      return { success: true, data: result.stores };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    logger.error("fetchPathaoStoresAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function saveGlobalShippingDefaultsAction(formData: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.Manage");

  try {
    const service = new CourierSettingsService();
    await service.saveGlobalShippingDefaults(formData as any);
    revalidatePath("/dashboard/courier/settings");
    return { success: true };
  } catch (error: any) {
    logger.error("saveGlobalShippingDefaultsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function getCourierApiLogsAction(provider?: string, logType?: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Courier.View");

  try {
    const repo = new CourierApiLogRepository();
    const logs = await repo.listLogs(provider, logType, 100);
    return { success: true, data: logs };
  } catch (error: any) {
    logger.error("getCourierApiLogsAction failed", error);
    return { success: false, error: error.message };
  }
}
