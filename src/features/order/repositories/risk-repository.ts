import { BaseRepository } from "@/lib/database/generic-repository";
import { RiskModel } from "./risk-model";
import type { BaseDocument } from "@/lib/database/types";

export interface RiskFlagDocument extends BaseDocument {
  orderId: string;
  orderNumber: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  category:
    | "frequent_returns"
    | "cod_refusal"
    | "fake_order"
    | "multiple_cancellations"
    | "duplicate_order"
    | "suspicious_activity";
  reason: string;
  confidence: number;
  detectedBy: "system" | "manual";
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

export interface RiskFlagEntity {
  id: string;
  orderId: string;
  orderNumber: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  category:
    | "frequent_returns"
    | "cod_refusal"
    | "fake_order"
    | "multiple_cancellations"
    | "duplicate_order"
    | "suspicious_activity";
  reason: string;
  confidence: number;
  detectedBy: "system" | "manual";
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  isDeleted: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

function toDomain(doc: any): RiskFlagEntity {
  return {
    id: doc.id ?? doc._id.toString(),
    orderId: doc.orderId,
    orderNumber: doc.orderNumber,
    riskLevel: doc.riskLevel,
    category: doc.category,
    reason: doc.reason,
    confidence: doc.confidence,
    detectedBy: doc.detectedBy ?? "system",
    resolved: doc.resolved ?? false,
    resolvedAt: doc.resolvedAt,
    resolvedBy: doc.resolvedBy,
    resolution: doc.resolution,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class RiskRepository extends BaseRepository<RiskFlagDocument, RiskFlagEntity> {
  constructor() {
    super(RiskModel as any, toDomain);
  }

  async findByOrder(orderId: string): Promise<RiskFlagEntity[]> {
    return this.find({ orderId }, { sort: { createdAt: -1 } } as any);
  }

  async findActiveByCategory(category: string): Promise<RiskFlagEntity[]> {
    return this.find({ category, resolved: false });
  }

  async countByRiskLevel(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$riskLevel", count: { $sum: 1 } } }];
    const results = await (RiskModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }

  async countByCategory(): Promise<Record<string, number>> {
    const pipeline = [{ $group: { _id: "$category", count: { $sum: 1 } } }];
    const results = await (RiskModel as any).aggregate(pipeline);
    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }

  async resolve(id: string, resolution: string, resolvedBy: string): Promise<RiskFlagEntity> {
    return this.update(id, {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy,
      resolution,
    } as any);
  }
}

export default RiskRepository;
