import { BaseRepository } from "@/lib/database/generic-repository";
import { PlatformSettingModel, FeatureFlagModel, SettingAuditLogModel } from "./setting-model";
import type { SettingEntry, FeatureFlagEntry, SettingAuditLog, SettingCategory } from "../domain/setting-entity";
import type { BaseDocument } from "@/lib/database/types";

interface PlatformSettingDocument extends BaseDocument {
  category: any;
  key: string;
  value: any;
  dataType: any;
  name: string;
  description: string;
  scope: any;
  defaultValue: any;
  isPublic: boolean;
}

function mapToSetting(doc: any): SettingEntry {
  return {
    id: doc.id ?? doc._id?.toString(),
    category: doc.category,
    key: doc.key,
    value: doc.value,
    dataType: doc.dataType || "string",
    name: doc.name,
    description: doc.description,
    scope: doc.scope || "global",
    defaultValue: doc.defaultValue,
    isPublic: doc.isPublic ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
    metadata: doc.metadata,
  };
}

function mapToFlag(doc: any): FeatureFlagEntry {
  return {
    id: doc.id ?? doc._id?.toString(),
    key: doc.key,
    name: doc.name,
    description: doc.description,
    state: doc.state || "off",
    allowedRoles: doc.allowedRoles || [],
    isExperimental: doc.isExperimental ?? false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
    metadata: doc.metadata,
  };
}

function mapToAudit(doc: any): SettingAuditLog {
  return {
    id: doc.id ?? doc._id?.toString(),
    settingKey: doc.settingKey,
    category: doc.category,
    oldValue: doc.oldValue,
    newValue: doc.newValue,
    changedBy: doc.changedBy,
    timestamp: doc.timestamp,
    reason: doc.reason,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
    metadata: doc.metadata,
  };
}

export class SettingRepository extends BaseRepository<PlatformSettingDocument, SettingEntry> {
  constructor() {
    super(PlatformSettingModel as any, mapToSetting);
  }

  async findByKey(key: string): Promise<SettingEntry | null> {
    await this.ensureConnected();
    const doc = await PlatformSettingModel.findOne({ key, isDeleted: { $ne: true } }).lean();
    return doc ? mapToSetting({ ...doc, id: doc._id.toString() }) : null;
  }

  async findByCategory(category: SettingCategory): Promise<SettingEntry[]> {
    await this.ensureConnected();
    const docs = await PlatformSettingModel.find({ category, isDeleted: { $ne: true } }).lean();
    return docs.map((d: any) => mapToSetting({ ...d, id: d._id.toString() }));
  }

  async upsertSetting(data: Partial<SettingEntry> & { key: string; value: any }): Promise<SettingEntry> {
    await this.ensureConnected();
    const doc = await PlatformSettingModel.findOneAndUpdate(
      { key: data.key },
      { $set: data },
      { upsert: true, new: true },
    ).lean();
    return mapToSetting({ ...doc, id: doc._id.toString() });
  }

  async listAllSettings(): Promise<SettingEntry[]> {
    await this.ensureConnected();
    const docs = await PlatformSettingModel.find({ isDeleted: { $ne: true } }).sort({ category: 1, key: 1 }).lean();
    return docs.map((d: any) => mapToSetting({ ...d, id: d._id.toString() }));
  }

  // Feature Flags
  async listFlags(): Promise<FeatureFlagEntry[]> {
    await this.ensureConnected();
    const docs = await FeatureFlagModel.find({ isDeleted: { $ne: true } }).lean();
    return docs.map((d: any) => mapToFlag({ ...d, id: d._id.toString() }));
  }

  async upsertFlag(data: Partial<FeatureFlagEntry> & { key: string }): Promise<FeatureFlagEntry> {
    await this.ensureConnected();
    const doc = await FeatureFlagModel.findOneAndUpdate(
      { key: data.key },
      { $set: data },
      { upsert: true, new: true },
    ).lean();
    return mapToFlag({ ...doc, id: doc._id.toString() });
  }

  // Audit Logs
  async createAuditLog(log: Omit<SettingAuditLog, "id" | "createdAt" | "updatedAt" | "isDeleted" | "status">): Promise<SettingAuditLog> {
    await this.ensureConnected();
    const doc = await SettingAuditLogModel.create(log);
    return mapToAudit({ ...doc.toObject(), id: doc._id.toString() });
  }

  async listAuditLogs(limit: number = 100): Promise<SettingAuditLog[]> {
    await this.ensureConnected();
    const docs = await SettingAuditLogModel.find({ isDeleted: { $ne: true } })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapToAudit({ ...d, id: d._id.toString() }));
  }
}

export default SettingRepository;
