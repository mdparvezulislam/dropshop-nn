import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { StoreProfileModel, StoreProfileDocument } from "./store-profile-model";
import { StoreProfile } from "../domain/store-profile-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class StoreProfileRepository extends BaseRepository<StoreProfileDocument, StoreProfile> {
  constructor() {
    super(StoreProfileModel, StoreProfileRepository.mapToDomain);
  }

  private static mapToDomain(doc: StoreProfileDocument): StoreProfile {
    return {
      id: doc._id.toString(),
      businessProfileId: doc.businessProfileId.toString(),
      userId: doc.userId.toString(),
      storeName: doc.storeName,
      storeSlug: doc.storeSlug,
      storeLogo: doc.storeLogo,
      storeBanner: doc.storeBanner,
      theme: doc.theme,
      color: doc.color,
      description: doc.description,
      contactPhone: doc.contactPhone,
      contactEmail: doc.contactEmail,
      socialLinks: doc.socialLinks
        ? {
            facebook: doc.socialLinks.facebook,
            instagram: doc.socialLinks.instagram,
            youtube: doc.socialLinks.youtube,
            whatsapp: doc.socialLinks.whatsapp,
            telegram: doc.socialLinks.telegram,
          }
        : undefined,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findByBusinessProfileId(
    businessProfileId: string,
    options?: DatabaseQueryOptions,
  ): Promise<StoreProfile | null> {
    try {
      return this.findOne({ businessProfileId }, options);
    } catch (error) {
      logger.error("StoreProfileRepository findByBusinessProfileId failed", error, {
        businessProfileId,
      });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findBySlug(slug: string, options?: DatabaseQueryOptions): Promise<StoreProfile | null> {
    try {
      return this.findOne({ storeSlug: slug.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("StoreProfileRepository findBySlug failed", error, { slug });
      throw new DatabaseError("Database search error", error);
    }
  }
}

export default StoreProfileRepository;
