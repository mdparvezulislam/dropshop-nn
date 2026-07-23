import { PricingProfileRepository } from "../repositories/profile-repository";
import { PricingProfile } from "../domain/pricing-profile-entity";
import { NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";

export class PricingProfileService {
  private readonly repo = new PricingProfileRepository();

  async listProfiles(): Promise<PricingProfile[]> {
    return this.repo.findAllActive();
  }

  async getProfile(id: string): Promise<PricingProfile> {
    const profile = await this.repo.findById(id);
    if (!profile) throw new NotFoundError("Pricing profile not found");
    return profile;
  }

  async createProfile(data: Partial<PricingProfile>, actorId?: string): Promise<PricingProfile> {
    logger.info("PricingProfileService: creating profile", { name: data.name });
    return this.repo.create({ ...data, createdBy: actorId, updatedBy: actorId } as any);
  }

  async updateProfile(id: string, data: Partial<PricingProfile>, actorId?: string): Promise<PricingProfile> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError("Pricing profile not found");
    return this.repo.update(id, { ...data, updatedBy: actorId } as any);
  }

  async deleteProfile(id: string): Promise<boolean> {
    return this.repo.delete(id);
  }

  async setDefaultProfile(id: string): Promise<PricingProfile> {
    const profiles = await this.repo.findAllActive();
    for (const p of profiles) {
      await this.repo.update(p.id, { isDefault: p.id === id });
    }
    const updated = await this.repo.findById(id);
    if (!updated) throw new NotFoundError("Pricing profile not found");
    return updated;
  }
}
