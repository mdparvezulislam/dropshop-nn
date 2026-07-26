import {
  CampaignPricingRepository,
  ScheduledPricingRepository,
} from "../repositories/campaign-repository";
import { CampaignPricing, ScheduledPricing } from "../domain/campaign-entity";
import { NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

export class CampaignPricingService {
  private readonly campaignRepo = new CampaignPricingRepository();
  private readonly scheduleRepo = new ScheduledPricingRepository();

  async listCampaigns(): Promise<CampaignPricing[]> {
    return this.campaignRepo.find({ isActive: true });
  }

  async createCampaign(data: Partial<CampaignPricing>, actorId?: string): Promise<CampaignPricing> {
    logger.info("CampaignService: creating campaign", {
      name: data.name,
      campaignType: data.campaignType,
    });
    return this.campaignRepo.create({ ...data, createdBy: actorId, updatedBy: actorId } as any);
  }

  async updateCampaign(
    id: string,
    data: Partial<CampaignPricing>,
    actorId?: string,
  ): Promise<CampaignPricing> {
    const existing = await this.campaignRepo.findById(id);
    if (!existing) throw new NotFoundError("Campaign pricing not found");
    return this.campaignRepo.update(id, { ...data, updatedBy: actorId } as any);
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return this.campaignRepo.delete(id);
  }

  async listScheduled(): Promise<ScheduledPricing[]> {
    return this.scheduleRepo.find({ isActive: true });
  }

  async createScheduled(
    data: Partial<ScheduledPricing>,
    actorId?: string,
  ): Promise<ScheduledPricing> {
    return this.scheduleRepo.create({ ...data, createdBy: actorId, updatedBy: actorId } as any);
  }

  async updateScheduled(
    id: string,
    data: Partial<ScheduledPricing>,
    actorId?: string,
  ): Promise<ScheduledPricing> {
    const existing = await this.scheduleRepo.findById(id);
    if (!existing) throw new NotFoundError("Scheduled pricing not found");
    return this.scheduleRepo.update(id, { ...data, updatedBy: actorId } as any);
  }

  async deleteScheduled(id: string): Promise<boolean> {
    return this.scheduleRepo.delete(id);
  }

  async processScheduledActivations(): Promise<number> {
    const pending = await this.scheduleRepo.findPendingActivations();
    let count = 0;
    for (const item of pending) {
      await this.scheduleRepo.update(item.id, { status: "active" });
      count++;
    }
    return count;
  }

  async processScheduledExpirations(): Promise<number> {
    const expired = await this.scheduleRepo.findExpired();
    let count = 0;
    for (const item of expired) {
      await this.scheduleRepo.update(item.id, { status: "expired", isActive: false });
      count++;
    }
    return count;
  }
}
