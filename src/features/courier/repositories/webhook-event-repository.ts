import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { WebhookEventModel } from "./webhook-event-model";
import type { BaseDocument } from "@/shared/lib/database/types";

export interface CourierWebhookEventRecord {
  id: string;
  provider: string;
  event: string;
  payload: any;
  processed: boolean;
  retryCount: number;
  error?: string;
  processedAt?: Date;
  createdAt: Date;
}

function mapToDomain(doc: any): CourierWebhookEventRecord {
  return {
    id: doc.id ?? doc._id?.toString(),
    provider: doc.provider,
    event: doc.event,
    payload: doc.payload,
    processed: doc.processed ?? false,
    retryCount: doc.retryCount ?? 0,
    error: doc.error,
    processedAt: doc.processedAt ? new Date(doc.processedAt) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
  };
}

export class WebhookEventRepository extends BaseRepository<any, CourierWebhookEventRecord> {
  constructor() {
    super(WebhookEventModel as any, mapToDomain);
  }

  async listRecentWebhooks(limit: number = 50): Promise<CourierWebhookEventRecord[]> {
    const docs = await WebhookEventModel.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  async findFailedWebhooks(): Promise<CourierWebhookEventRecord[]> {
    const docs = await WebhookEventModel.find({ processed: false, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }
}

export default WebhookEventRepository;
