import { BusinessProfileRepository } from "../repositories/business-profile-repository";
import { BusinessProfile } from "../domain/business-profile-entity";
import { ValidationError, NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus";
import { IDENTITY_EVENTS } from "../domain/identity-events";
import type { CreateBusinessProfileInput, UpdateBusinessProfileInput } from "../types/validation";

export class BusinessProfileService {
  private readonly repository: BusinessProfileRepository;

  constructor() {
    this.repository = new BusinessProfileRepository();
  }

  async create(data: CreateBusinessProfileInput & { userId: string }): Promise<BusinessProfile> {
    logger.info("BusinessProfileService: creating business profile", {
      businessName: data.businessName,
      role: data.role,
    });

    const existing = await this.repository.findByUserIdAndRole(data.userId, data.role);
    if (existing) {
      throw new ValidationError("Business profile already exists", {
        role: [`You already have a ${data.role} profile`],
      });
    }

    const profile = await this.repository.create({
      userId: data.userId,
      businessName: data.businessName,
      ownerName: data.ownerName,
      primaryPhone: data.primaryPhone,
      secondaryPhone: data.secondaryPhone,
      email: data.email,
      businessType: data.businessType,
      role: data.role,
      description: data.description,
      logo: data.logo,
      banner: data.banner,
      address: data.address,
      socialLinks: data.socialLinks,
      documents: data.documents,
      verificationStatus: "unverified",
      status: "pending",
    });

    await EventBus.publish(
      IDENTITY_EVENTS.BUSINESS_PROFILE_CREATED,
      {
        businessProfileId: profile.id,
        userId: profile.userId,
        businessName: profile.businessName,
        userType: profile.role,
      },
      { source: "business-profile-service" },
    );

    logger.info("BusinessProfileService: profile created", { profileId: profile.id });
    return profile;
  }

  async submitForApproval(businessProfileId: string): Promise<BusinessProfile> {
    logger.info("BusinessProfileService: submitting for approval", { businessProfileId });

    const profile = await this.repository.findById(businessProfileId);
    if (!profile) {
      throw new NotFoundError("Business profile not found");
    }

    const updated = await this.repository.update(businessProfileId, {
      verificationStatus: "pending",
      status: "pending",
    });

    await EventBus.publish(
      IDENTITY_EVENTS.BUSINESS_SUBMITTED,
      {
        businessProfileId: updated.id,
        userId: updated.userId,
        businessName: updated.businessName,
        userType: updated.role,
      },
      { source: "business-profile-service" },
    );

    logger.info("BusinessProfileService: submitted for approval", { businessProfileId });
    return updated;
  }

  async update(
    businessProfileId: string,
    data: UpdateBusinessProfileInput,
  ): Promise<BusinessProfile> {
    logger.info("BusinessProfileService: updating business profile", { businessProfileId });

    const existing = await this.repository.findById(businessProfileId);
    if (!existing) {
      throw new NotFoundError("Business profile not found");
    }

    const updated = await this.repository.update(businessProfileId, data);

    const changedFields = Object.keys(data);
    await EventBus.publish(
      IDENTITY_EVENTS.PROFILE_UPDATED,
      {
        userId: updated.userId,
        changedFields,
      },
      { source: "business-profile-service" },
    );

    return updated;
  }

  async findById(id: string): Promise<BusinessProfile | null> {
    return this.repository.findById(id);
  }

  async findByUserId(userId: string): Promise<BusinessProfile | null> {
    return this.repository.findByUserId(userId);
  }

  async findPendingApprovals(role?: string): Promise<BusinessProfile[]> {
    return this.repository.findPendingApprovals(role);
  }

  async countByStatus(status: string): Promise<number> {
    return this.repository.countByStatus(status);
  }

  async countPendingApprovals(): Promise<number> {
    return this.repository.countPendingApprovals();
  }
}

export default BusinessProfileService;
