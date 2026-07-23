"use server";

import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/check-permission";
import { SettingsService } from "../services/settings-service";
import { FeatureFlagService } from "../services/feature-flag-service";
import { SystemHealthService } from "../services/system-health-service";
import { SettingsImportExportService } from "../services/settings-import-export-service";
import { SettingRepository } from "../repositories/setting-repository";
import {
  updateSettingSchema,
  updateCategorySettingsSchema,
  updateFeatureFlagSchema,
  updateMaintenanceSchema,
  importSettingsSchema,
} from "../types/validation";
import { logger } from "@/lib/utils/logger";
import { revalidatePath } from "next/cache";

export async function getAllSettingsAction(): Promise<{
  success: boolean;
  data?: {
    settings: any[];
    flags: any[];
    health: any;
    auditLogs: any[];
  };
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Settings.View");

  try {
    const service = new SettingsService();
    const flagService = new FeatureFlagService();
    const healthService = new SystemHealthService();
    const repo = new SettingRepository();

    const [settings, flags, health, auditLogs] = await Promise.all([
      service.listSettings(),
      flagService.listFlags(),
      healthService.getHealthStatus(),
      repo.listAuditLogs(50),
    ]);

    return {
      success: true,
      data: {
        settings,
        flags,
        health,
        auditLogs,
      },
    };
  } catch (error: any) {
    logger.error("getAllSettingsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateSettingAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Settings.Manage");

  try {
    const validated = updateSettingSchema.parse(formData);
    const service = new SettingsService();
    const result = await service.setSetting(
      validated.key,
      validated.value,
      session?.user?.name || session?.user?.id || "admin",
      validated.reason,
    );
    revalidatePath("/dashboard/settings");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("updateSettingAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function updateCategorySettingsAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Settings.Manage");

  try {
    const validated = updateCategorySettingsSchema.parse(formData);
    const service = new SettingsService();
    const actor = session?.user?.name || session?.user?.id || "admin";

    for (const [key, val] of Object.entries(validated.settings)) {
      await service.setSetting(key, val, actor, validated.reason);
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    logger.error("updateCategorySettingsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function toggleFeatureFlagAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Settings.Manage");

  try {
    const validated = updateFeatureFlagSchema.parse(formData);
    const service = new FeatureFlagService();
    const result = await service.updateFlagState(
      validated.key,
      validated.state,
      validated.allowedRoles,
      session?.user?.name || session?.user?.id || "admin",
    );
    revalidatePath("/dashboard/settings");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("toggleFeatureFlagAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function exportSettingsAction(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Settings.View");

  try {
    const service = new SettingsImportExportService();
    const data = await service.exportConfiguration();
    return { success: true, data };
  } catch (error: any) {
    logger.error("exportSettingsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function importSettingsAction(formData: unknown): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Settings.Manage");

  try {
    const validated = importSettingsSchema.parse(formData);
    const service = new SettingsImportExportService();
    const result = await service.importConfiguration(
      validated.payload,
      session?.user?.name || session?.user?.id || "admin",
    );
    revalidatePath("/dashboard/settings");
    return { success: true, data: result };
  } catch (error: any) {
    logger.error("importSettingsAction failed", error);
    return { success: false, error: error.message };
  }
}

export async function resetCategoryToDefaultAction(category: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  checkPermission(session, "Settings.Manage");

  try {
    const service = new SettingsService();
    await service.resetCategoryToDefault(category as any, session?.user?.name || session?.user?.id || "admin");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: any) {
    logger.error("resetCategoryToDefaultAction failed", error);
    return { success: false, error: error.message };
  }
}
