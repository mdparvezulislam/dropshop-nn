import { BaseRepository } from "@/lib/database/generic-repository";
import {
  CampaignPricingModel,
  CampaignPricingDocument,
  ScheduledPricingModel,
  ScheduledPricingDocument,
} from "./campaign-model";
import { CampaignPricing } from "../domain/campaign-entity";
import { ScheduledPricing } from "../domain/campaign-entity";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class CampaignPricingRepository extends BaseRepository<
  CampaignPricingDocument,
  CampaignPricing
> {
  constructor() {
    super(CampaignPricingModel, CampaignPricingRepository.mapToDomain);
  }

  private static mapToDomain(doc: CampaignPricingDocument): CampaignPricing {
    return {
      id: doc._id.toString(),
      name: doc.name,
      campaignType: doc.campaignType,
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      campaignPrice: doc.campaignPrice,
      effectiveFrom: doc.effectiveFrom,
      effectiveTo: doc.effectiveTo,
      timezone: doc.timezone,
      priority: doc.priority,
      isActive: doc.isActive,
      autoRestore: doc.autoRestore,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findActiveByProduct(productId: string): Promise<CampaignPricing[]> {
    try {
      const now = new Date();
      return this.find({
        productId,
        isActive: true,
        effectiveFrom: { $lte: now },
        effectiveTo: { $gte: now },
      });
    } catch (error) {
      logger.error("CampaignPricingRepository findActiveByProduct failed", error, { productId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findActiveCampaigns(): Promise<CampaignPricing[]> {
    try {
      const now = new Date();
      return this.find({
        isActive: true,
        effectiveFrom: { $lte: now },
        effectiveTo: { $gte: now },
      });
    } catch (error) {
      logger.error("CampaignPricingRepository findActiveCampaigns failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}

export class ScheduledPricingRepository extends BaseRepository<
  ScheduledPricingDocument,
  ScheduledPricing
> {
  constructor() {
    super(ScheduledPricingModel, ScheduledPricingRepository.mapToDomain);
  }

  private static mapToDomain(doc: ScheduledPricingDocument): ScheduledPricing {
    return {
      id: doc._id.toString(),
      productId: doc.productId.toString(),
      variantSku: doc.variantSku,
      scheduledPrice: doc.scheduledPrice,
      scheduledCost: doc.scheduledCost,
      effectiveFrom: doc.effectiveFrom,
      effectiveTo: doc.effectiveTo,
      timezone: doc.timezone,
      autoEnable: doc.autoEnable,
      autoDisable: doc.autoDisable,
      isActive: doc.isActive,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
    };
  }

  async findPendingActivations(): Promise<ScheduledPricing[]> {
    try {
      const now = new Date();
      return this.find({
        status: "pending",
        effectiveFrom: { $lte: now },
        autoEnable: true,
        isActive: true,
      });
    } catch (error) {
      logger.error("ScheduledPricingRepository findPendingActivations failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }

  async findExpired(): Promise<ScheduledPricing[]> {
    try {
      const now = new Date();
      return this.find({
        status: "active",
        effectiveTo: { $lte: now },
        autoDisable: true,
        isActive: true,
      });
    } catch (error) {
      logger.error("ScheduledPricingRepository findExpired failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}
