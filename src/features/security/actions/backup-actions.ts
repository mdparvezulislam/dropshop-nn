"use server";

import { BackupService } from "../services/backup-service";
import { BackupJob, BackupStats } from "../domain/backup-entity";

export async function listBackupsAction(): Promise<{
  success: boolean;
  data?: BackupJob[];
  error?: string;
}> {
  try {
    const service = new BackupService();
    const data = await service.listBackups();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load backups" };
  }
}

export async function createBackupAction(
  data: Partial<BackupJob>,
): Promise<{ success: boolean; data?: BackupJob; error?: string }> {
  try {
    const service = new BackupService();
    const job = await service.createBackup(data);
    return { success: true, data: job };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create backup" };
  }
}

export async function deleteBackupAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const service = new BackupService();
    const ok = await service.deleteBackup(id);
    return { success: ok };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete backup" };
  }
}

export async function getBackupStatsAction(): Promise<{
  success: boolean;
  data?: BackupStats;
  error?: string;
}> {
  try {
    const service = new BackupService();
    const data = await service.getStats();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to load backup stats" };
  }
}
