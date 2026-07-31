export type BackupType = "full" | "database" | "media" | "config" | "logs";
export type BackupStatus = "completed" | "in_progress" | "failed" | "restored";

export interface BackupJob {
  id: string;
  name: string;
  type: BackupType;
  status: BackupStatus;
  sizeBytes: number;
  components: string[];
  notes?: string;
  storageLocation: string;
  verified: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestoreJob {
  id: string;
  backupId: string;
  backupName: string;
  status: "completed" | "failed" | "in_progress";
  componentsRestored: string[];
  createdBy: string;
  createdAt: Date;
}

export interface BackupStats {
  totalBackups: number;
  totalSizeBytes: number;
  successRate: number;
  latestBackupDate?: Date;
  verifiedCount: number;
}
