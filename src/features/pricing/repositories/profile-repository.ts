import { BaseRepository } from "@/lib/database/generic-repository";
import { PricingProfileModel, PricingProfileDocument } from "./profile-model";
import { PricingProfile, ProfileMarkupRule, ProfileDiscountRule } from "../domain/pricing-profile-entity";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class PricingProfileRepository extends BaseRepository<PricingProfileDocument, PricingProfile> {
  constructor() {
    super(PricingProfileModel, PricingProfileRepository.mapToDomain);
  }

  private static mapToDomain(doc: PricingProfileDocument): PricingProfile {
    return {
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      markupRules: doc.markupRules as ProfileMarkupRule[],
      discountRules: doc.discountRules as ProfileDiscountRule[],
      minMarginPercent: doc.minMarginPercent,
      roundPriceTo: doc.roundPriceTo,
      isActive: doc.isActive,
      isDefault: doc.isDefault,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
    };
  }

  async findBySlug(slug: string): Promise<PricingProfile | null> {
    try {
      return this.findOne({ slug, isActive: true });
    } catch (error) {
      logger.error("PricingProfileRepository findBySlug failed", error, { slug });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findDefault(): Promise<PricingProfile | null> {
    try {
      return this.findOne({ isDefault: true, isActive: true });
    } catch (error) {
      logger.error("PricingProfileRepository findDefault failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }

  async findAllActive(): Promise<PricingProfile[]> {
    try {
      return this.find({ isActive: true });
    } catch (error) {
      logger.error("PricingProfileRepository findAllActive failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }
}
