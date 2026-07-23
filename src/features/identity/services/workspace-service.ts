import { BusinessProfile } from "../domain/business-profile-entity";
import { BusinessWorkspaceRepository } from "../repositories/business-workspace-repository";
import { StoreProfileRepository } from "../repositories/store-profile-repository";
import { BusinessWorkspace } from "../domain/business-workspace-entity";
import { NotFoundError } from "@/lib/errors/app-error";
import { logger } from "@/lib/utils/logger";
import { EventBus } from "@/lib/event-bus";
import { IDENTITY_EVENTS } from "../domain/identity-events";
import { generateSlug } from "@/lib/utils/slug-utils";
import type { ActorInfo } from "@/lib/core/types";

export class WorkspaceService {
  private readonly workspaceRepository: BusinessWorkspaceRepository;
  private readonly storeProfileRepository: StoreProfileRepository;

  constructor() {
    this.workspaceRepository = new BusinessWorkspaceRepository();
    this.storeProfileRepository = new StoreProfileRepository();
  }

  async createWorkspace(profile: BusinessProfile, actor: ActorInfo): Promise<BusinessWorkspace> {
    logger.info("WorkspaceService: creating workspace for business", {
      businessProfileId: profile.id,
      role: profile.role,
    });

    const existing = await this.workspaceRepository.findByBusinessProfileId(profile.id);
    if (existing) {
      logger.warn("WorkspaceService: workspace already exists", {
        businessProfileId: profile.id,
      });
      return existing;
    }

    const workspace = await this.workspaceRepository.create({
      businessProfileId: profile.id,
      userId: profile.userId,
      walletId: null,
      analyticsProfileId: null,
      status: "active",
      settings: {
        language: "en",
        timezone: "Asia/Dhaka",
        currency: "BDT",
        autoApproval: false,
        orderNotifications: true,
        marketingEmails: true,
        smsNotifications: false,
      },
      notificationPreferences: {
        email: true,
        sms: false,
        inApp: true,
        orderUpdates: true,
        marketing: false,
        security: true,
      },
    });

    if (profile.role === "reseller" || profile.role === "wholesaler") {
      try {
        const storeSlug = generateSlug(profile.businessName);
        const existingStore = await this.storeProfileRepository.findBySlug(storeSlug);

        await this.storeProfileRepository.create({
          businessProfileId: profile.id,
          userId: profile.userId,
          storeName: profile.businessName,
          storeSlug: existingStore ? `${storeSlug}-${Date.now().toString().slice(-4)}` : storeSlug,
          description: profile.description,
          contactPhone: profile.primaryPhone,
          contactEmail: profile.email,
        });

        await EventBus.publish(
          IDENTITY_EVENTS.STORE_CREATED,
          {
            storeProfileId: profile.id,
            storeName: profile.businessName,
            businessProfileId: profile.id,
          },
          { source: "workspace-service" },
        );
      } catch (error) {
        logger.error("WorkspaceService: store profile creation failed", error, {
          businessProfileId: profile.id,
        });
      }
    }

    await EventBus.publish(
      IDENTITY_EVENTS.WORKSPACE_CREATED,
      {
        workspaceId: workspace.id,
        businessProfileId: profile.id,
        userId: profile.userId,
      },
      {
        actor,
        source: "workspace-service",
      },
    );

    logger.info("WorkspaceService: workspace created successfully", {
      workspaceId: workspace.id,
      businessProfileId: profile.id,
    });

    return workspace;
  }

  async findByBusinessProfileId(businessProfileId: string): Promise<BusinessWorkspace | null> {
    return this.workspaceRepository.findByBusinessProfileId(businessProfileId);
  }

  async findByUserId(userId: string): Promise<BusinessWorkspace | null> {
    return this.workspaceRepository.findByUserId(userId);
  }

  async updateSettings(
    businessProfileId: string,
    settings: Record<string, unknown>,
  ): Promise<BusinessWorkspace> {
    logger.info("WorkspaceService: updating workspace settings", { businessProfileId });

    const workspace = await this.workspaceRepository.findByBusinessProfileId(businessProfileId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    return this.workspaceRepository.update(workspace.id, {
      settings: { ...workspace.settings, ...settings },
    });
  }

  async updateNotificationPreferences(
    businessProfileId: string,
    preferences: Record<string, unknown>,
  ): Promise<BusinessWorkspace> {
    logger.info("WorkspaceService: updating notification preferences", { businessProfileId });

    const workspace = await this.workspaceRepository.findByBusinessProfileId(businessProfileId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    const merged: Record<string, boolean> = {
      ...workspace.notificationPreferences,
      ...preferences,
    } as Record<string, boolean>;
    return this.workspaceRepository.update(workspace.id, {
      notificationPreferences: merged as any,
    });
  }

  async suspend(businessProfileId: string): Promise<BusinessWorkspace> {
    logger.info("WorkspaceService: suspending workspace", { businessProfileId });

    const workspace = await this.workspaceRepository.findByBusinessProfileId(businessProfileId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    return this.workspaceRepository.update(workspace.id, { status: "suspended" });
  }

  async archive(businessProfileId: string): Promise<BusinessWorkspace> {
    logger.info("WorkspaceService: archiving workspace", { businessProfileId });

    const workspace = await this.workspaceRepository.findByBusinessProfileId(businessProfileId);
    if (!workspace) {
      throw new NotFoundError("Workspace not found");
    }

    return this.workspaceRepository.update(workspace.id, { status: "archived" });
  }
}

export default WorkspaceService;
