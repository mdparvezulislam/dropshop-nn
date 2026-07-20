import { BusinessProfileRepository } from "../repositories/business-profile-repository";
import {
  BusinessProfile,
  BusinessVerificationStatus,
  BusinessStatus,
} from "../domain/business-profile-entity";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";
import { logger } from "@/shared/utils/logger";
import { EventBus } from "@/shared/lib/event-bus";
import { IDENTITY_EVENTS } from "../domain/identity-events";
import { WorkspaceService } from "./workspace-service";
import type { ActorInfo } from "@/shared/core/types";

export class ApprovalService {
  private readonly repository: BusinessProfileRepository;
  private readonly workspaceService: WorkspaceService;

  constructor() {
    this.repository = new BusinessProfileRepository();
    this.workspaceService = new WorkspaceService();
  }

  async approve(businessProfileId: string, actor: ActorInfo): Promise<BusinessProfile> {
    logger.info("ApprovalService: approving business profile", {
      businessProfileId,
      approvedBy: actor.id,
    });

    const profile = await this.repository.findById(businessProfileId);
    if (!profile) {
      throw new NotFoundError("Business profile not found");
    }

    if (profile.verificationStatus === "verified") {
      throw new ValidationError("Business profile is already verified");
    }

    if (profile.verificationStatus !== "pending" && profile.verificationStatus !== "unverified") {
      throw new ValidationError(
        `Cannot approve profile with status: ${profile.verificationStatus}`,
      );
    }

    const updated = await this.repository.update(businessProfileId, {
      verificationStatus: "verified" as BusinessVerificationStatus,
      status: "active" as BusinessStatus,
      verifiedAt: new Date(),
      verifiedBy: actor.id,
      verificationNotes: "Approved by " + (actor.name || actor.id),
    });

    await EventBus.publish(
      IDENTITY_EVENTS.BUSINESS_APPROVED,
      {
        businessProfileId: updated.id,
        userId: updated.userId,
        businessName: updated.businessName,
        userType: updated.role,
        approvedBy: actor.id,
        approvedAt: new Date().toISOString(),
      },
      {
        actor,
        source: "approval-service",
      },
    );

    try {
      await this.workspaceService.createWorkspace(updated, actor);
    } catch (error) {
      logger.error("ApprovalService: workspace creation failed after approval", error, {
        businessProfileId,
      });
    }

    logger.info("ApprovalService: business profile approved", {
      businessProfileId,
      role: updated.role,
    });

    return updated;
  }

  async reject(
    businessProfileId: string,
    actor: ActorInfo,
    reason?: string,
  ): Promise<BusinessProfile> {
    logger.info("ApprovalService: rejecting business profile", {
      businessProfileId,
      rejectedBy: actor.id,
      reason,
    });

    const profile = await this.repository.findById(businessProfileId);
    if (!profile) {
      throw new NotFoundError("Business profile not found");
    }

    if (profile.verificationStatus === "rejected") {
      throw new ValidationError("Business profile is already rejected");
    }

    const updated = await this.repository.update(businessProfileId, {
      verificationStatus: "rejected" as BusinessVerificationStatus,
      verifiedBy: actor.id,
      verificationNotes: reason || "Rejected by " + (actor.name || actor.id),
    });

    await EventBus.publish(
      IDENTITY_EVENTS.BUSINESS_REJECTED,
      {
        businessProfileId: updated.id,
        userId: updated.userId,
        businessName: updated.businessName,
        userType: updated.role,
        reason: reason || "No reason provided",
        rejectedBy: actor.id,
      },
      {
        actor,
        source: "approval-service",
      },
    );

    logger.info("ApprovalService: business profile rejected", { businessProfileId, reason });
    return updated;
  }

  async checkAutoApproval(
    profile: BusinessProfile,
    actor: ActorInfo,
  ): Promise<BusinessProfile | null> {
    const { Settings } = await import("@/shared/core/feature-flags");

    const settingKey = `identity.auto-approve-${profile.role}`;
    const autoApprove = Settings.get(settingKey);

    if (autoApprove === true) {
      logger.info("ApprovalService: auto-approving profile", {
        businessProfileId: profile.id,
        role: profile.role,
      });
      return this.approve(profile.id, actor);
    }

    return null;
  }

  async suspend(
    businessProfileId: string,
    actor: ActorInfo,
    reason?: string,
  ): Promise<BusinessProfile> {
    logger.info("ApprovalService: suspending business profile", { businessProfileId, reason });

    const profile = await this.repository.findById(businessProfileId);
    if (!profile) {
      throw new NotFoundError("Business profile not found");
    }

    const updated = await this.repository.update(businessProfileId, {
      status: "suspended" as BusinessStatus,
      statusReason: reason || "Suspended by admin",
      suspendedAt: new Date(),
    });

    return updated;
  }

  async unsuspend(businessProfileId: string, _actor: ActorInfo): Promise<BusinessProfile> {
    logger.info("ApprovalService: unsuspending business profile", { businessProfileId });

    const profile = await this.repository.findById(businessProfileId);
    if (!profile) {
      throw new NotFoundError("Business profile not found");
    }

    const updated = await this.repository.update(businessProfileId, {
      status: "active" as BusinessStatus,
      statusReason: undefined,
      suspendedAt: null,
    });

    return updated;
  }
}

export default ApprovalService;
