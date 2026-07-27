import { BaseRepository } from "@/lib/database/generic-repository";
import { CourierConfigModel } from "./courier-config-model";
import type { CourierConfig, CourierProviderName } from "../domain/courier-config-entity";
import type { BaseDocument } from "@/lib/database/types";

interface CourierConfigDocument extends BaseDocument {
  provider: string;
  displayName: string;
  enabled: boolean;
  isSandbox: boolean;
  apiBaseUrl: string;
  apiKey: string;
  apiSecret?: string;
  merchantId?: string;
  webhookSecret?: string;
  defaultStatus: string;
  defaultPackageType: string;
  defaultWeight: number;
  defaultCodPolicy: string;
  pickupAddressId?: string;
  lastTestedAt?: Date;
  connectionStatus: string;
  lastErrorMessage?: string;
}

function mapToDomain(doc: any): CourierConfig {
  return {
    id: doc.id ?? doc._id?.toString(),
    provider: doc.provider as CourierProviderName,
    displayName: doc.displayName,
    enabled: doc.enabled ?? false,
    isSandbox: doc.isSandbox ?? true,
    apiBaseUrl: doc.apiBaseUrl,
    apiKey: doc.apiKey,
    apiSecret: doc.apiSecret,
    merchantId: doc.merchantId,
    webhookSecret: doc.webhookSecret,
    defaultStatus: doc.defaultStatus ?? "pending_booking",
    defaultPackageType: doc.defaultPackageType ?? "parcel",
    defaultWeight: doc.defaultWeight ?? 500,
    defaultCodPolicy: doc.defaultCodPolicy ?? "collect_full",
    pickupAddressId: doc.pickupAddressId,
    lastTestedAt: doc.lastTestedAt ? new Date(doc.lastTestedAt) : undefined,
    connectionStatus: doc.connectionStatus ?? "untested",
    lastErrorMessage: doc.lastErrorMessage,
    status: doc.status ?? "active",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class CourierConfigRepository extends BaseRepository<CourierConfigDocument, CourierConfig> {
  constructor() {
    super(CourierConfigModel as any, mapToDomain);
  }

  async findByProvider(provider: string): Promise<CourierConfig | null> {
    const doc = await CourierConfigModel.findOne({ provider, isDeleted: { $ne: true } }).lean();
    return doc ? mapToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async listAllConfigs(): Promise<CourierConfig[]> {
    const docs = await CourierConfigModel.find({ isDeleted: { $ne: true } }).lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  async upsertConfig(provider: string, data: Partial<CourierConfig>): Promise<CourierConfig> {
    const updated = await CourierConfigModel.findOneAndUpdate(
      { provider },
      { $set: { ...data, provider } },
      { upsert: true, returnDocument: "after", runValidators: true },
    ).lean();

    return mapToDomain({ ...updated, id: (updated as any)._id.toString() });
  }
}

export default CourierConfigRepository;
