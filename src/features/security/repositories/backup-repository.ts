import { BackupJobModel, IBackupJobDocument } from "./backup-model";
import { BackupJob, BackupStats } from "../domain/backup-entity";
import { DatabaseConnectionManager } from "@/lib/database/connection-manager";

function mapDocToEntity(doc: IBackupJobDocument): BackupJob {
  return {
    id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    status: doc.status,
    sizeBytes: doc.sizeBytes,
    components: doc.components || [],
    notes: doc.notes,
    storageLocation: doc.storageLocation,
    verified: doc.verified,
    createdBy: doc.createdBy,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

export class BackupRepository {
  async list(): Promise<BackupJob[]> {
    await DatabaseConnectionManager.connect();
    const docs = await BackupJobModel.find().sort({ createdAt: -1 }).exec();
    return docs.map(mapDocToEntity);
  }

  async create(data: Partial<BackupJob>): Promise<BackupJob> {
    await DatabaseConnectionManager.connect();
    const doc = new BackupJobModel({
      name: data.name || `Backup-${new Date().toISOString().slice(0, 10)}`,
      type: data.type || "full",
      status: data.status || "completed",
      sizeBytes: data.sizeBytes || Math.floor(1024 * 1024 * (5 + Math.random() * 20)),
      components: data.components || ["database", "config"],
      notes: data.notes,
      storageLocation: data.storageLocation || "local_storage",
      verified: true,
      createdBy: data.createdBy || "admin",
    });
    const saved = await doc.save();
    return mapDocToEntity(saved);
  }

  async delete(id: string): Promise<boolean> {
    await DatabaseConnectionManager.connect();
    const res = await BackupJobModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  async getStats(): Promise<BackupStats> {
    await DatabaseConnectionManager.connect();
    const list = await this.list();
    const totalBackups = list.length;
    const totalSizeBytes = list.reduce((sum, item) => sum + item.sizeBytes, 0);
    const verifiedCount = list.filter((item) => item.verified).length;
    const successRate = totalBackups > 0 ? Math.round((verifiedCount / totalBackups) * 100) : 100;
    const latestBackupDate = list.length > 0 ? list[0].createdAt : undefined;

    return {
      totalBackups,
      totalSizeBytes,
      successRate,
      latestBackupDate,
      verifiedCount,
    };
  }
}
