import { BaseRepository } from "@/lib/database/generic-repository";
import {
  PlatformSecretModel,
  SecretAuditLogModel,
  SecretFailedAccessLogModel,
} from "./secret-model";
import type {
  PlatformSecret,
  SecretAuditLog,
  SecretFailedAccessLog,
  SecretProvider,
  SecretType,
} from "../domain/secret-entity";
import type { BaseDocument } from "@/lib/database/types";

interface PlatformSecretDocument extends BaseDocument {
  provider: any;
  secretType: any;
  displayName: string;
  description?: string;
  encryptedValue: string;
  iv: string;
  authTag: string;
  maskedValue: string;
  version: number;
  status: any;
  currentVersion: number;
  previousVersion?: number;
  rollbackVersion?: number;
  previousEncryptedValue?: string;
  previousIv?: string;
  previousAuthTag?: string;
  lastUsedAt?: Date;
  rotatedAt?: Date;
}

function mapToSecret(doc: any): PlatformSecret {
  return {
    id: doc.id ?? doc._id?.toString(),
    provider: doc.provider,
    secretType: doc.secretType,
    displayName: doc.displayName,
    description: doc.description,
    encryptedValue: doc.encryptedValue,
    iv: doc.iv,
    authTag: doc.authTag,
    maskedValue: doc.maskedValue,
    version: doc.version || 1,
    status: doc.status || "active",
    currentVersion: doc.currentVersion || 1,
    previousVersion: doc.previousVersion,
    rollbackVersion: doc.rollbackVersion,
    previousEncryptedValue: doc.previousEncryptedValue,
    previousIv: doc.previousIv,
    previousAuthTag: doc.previousAuthTag,
    lastUsedAt: doc.lastUsedAt,
    rotatedAt: doc.rotatedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted ?? false,
    metadata: doc.metadata,
  };
}

function mapToAudit(doc: any): SecretAuditLog {
  return {
    id: doc.id ?? doc._id?.toString(),
    secretId: doc.secretId,
    provider: doc.provider,
    secretType: doc.secretType,
    action: doc.action,
    performedBy: doc.performedBy,
    timestamp: doc.timestamp,
    ipAddress: doc.ipAddress,
    details: doc.details,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
  };
}

function mapToFailedAccess(doc: any): SecretFailedAccessLog {
  return {
    id: doc.id ?? doc._id?.toString(),
    secretId: doc.secretId,
    provider: doc.provider,
    failureReason: doc.failureReason,
    attemptedBy: doc.attemptedBy,
    timestamp: doc.timestamp,
    ipAddress: doc.ipAddress,
    errorMessage: doc.errorMessage,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    isDeleted: doc.isDeleted ?? false,
    status: doc.status || "active",
  };
}

export class SecretRepository extends BaseRepository<PlatformSecretDocument, PlatformSecret> {
  constructor() {
    super(PlatformSecretModel as any, mapToSecret);
  }

  async findByProviderAndType(
    provider: SecretProvider,
    secretType: SecretType,
  ): Promise<PlatformSecret | null> {
    await this.ensureConnected();
    const doc = await PlatformSecretModel.findOne({
      provider,
      secretType,
      isDeleted: { $ne: true },
    }).lean();
    return doc ? mapToSecret({ ...doc, id: doc._id.toString() }) : null;
  }

  async listAllSecrets(): Promise<PlatformSecret[]> {
    await this.ensureConnected();
    const docs = await PlatformSecretModel.find({ isDeleted: { $ne: true } })
      .sort({ provider: 1, secretType: 1 })
      .lean();
    return docs.map((d: any) => mapToSecret({ ...d, id: d._id.toString() }));
  }

  async upsertSecret(
    data: Partial<PlatformSecret> & { provider: SecretProvider; secretType: SecretType },
  ): Promise<PlatformSecret> {
    await this.ensureConnected();
    const doc = await PlatformSecretModel.findOneAndUpdate(
      { provider: data.provider, secretType: data.secretType },
      { $set: data },
      { upsert: true, returnDocument: "after" },
    ).lean();
    return mapToSecret({ ...doc, id: doc._id.toString() });
  }

  // Audit Logging
  async createAuditLog(
    log: Omit<SecretAuditLog, "id" | "createdAt" | "updatedAt" | "isDeleted" | "status">,
  ): Promise<SecretAuditLog> {
    await this.ensureConnected();
    const doc = await SecretAuditLogModel.create(log);
    return mapToAudit({ ...doc.toObject(), id: doc._id.toString() });
  }

  async listAuditLogs(limit: number = 100): Promise<SecretAuditLog[]> {
    await this.ensureConnected();
    const docs = await SecretAuditLogModel.find({ isDeleted: { $ne: true } })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapToAudit({ ...d, id: d._id.toString() }));
  }

  // Failed Access Logging
  async createFailedAccessLog(
    log: Omit<SecretFailedAccessLog, "id" | "createdAt" | "updatedAt" | "isDeleted" | "status">,
  ): Promise<SecretFailedAccessLog> {
    await this.ensureConnected();
    const doc = await SecretFailedAccessLogModel.create(log);
    return mapToFailedAccess({ ...doc.toObject(), id: doc._id.toString() });
  }

  async listFailedAccessLogs(limit: number = 100): Promise<SecretFailedAccessLog[]> {
    await this.ensureConnected();
    const docs = await SecretFailedAccessLogModel.find({ isDeleted: { $ne: true } })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapToFailedAccess({ ...d, id: d._id.toString() }));
  }
}

export default SecretRepository;
