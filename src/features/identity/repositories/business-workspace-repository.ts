import { BaseRepository } from "@/lib/database/generic-repository";
import { BusinessWorkspaceModel, BusinessWorkspaceDocument } from "./business-workspace-model";
import { BusinessWorkspace } from "../domain/business-workspace-entity";
import { DatabaseQueryOptions } from "@/lib/database/types";
import { logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/errors/app-error";

export class BusinessWorkspaceRepository extends BaseRepository<
  BusinessWorkspaceDocument,
  BusinessWorkspace
> {
  constructor() {
    super(BusinessWorkspaceModel, BusinessWorkspaceRepository.mapToDomain);
  }

  private static mapToDomain(doc: BusinessWorkspaceDocument): BusinessWorkspace {
    return {
      id: doc._id.toString(),
      businessProfileId: doc.businessProfileId.toString(),
      userId: doc.userId.toString(),
      walletId: doc.walletId,
      settings: doc.settings
        ? {
            language: doc.settings.language,
            timezone: doc.settings.timezone,
            currency: doc.settings.currency,
            autoApproval: doc.settings.autoApproval,
            orderNotifications: doc.settings.orderNotifications,
            marketingEmails: doc.settings.marketingEmails,
            smsNotifications: doc.settings.smsNotifications,
          }
        : undefined,
      notificationPreferences: doc.notificationPreferences
        ? {
            email: doc.notificationPreferences.email,
            sms: doc.notificationPreferences.sms,
            inApp: doc.notificationPreferences.inApp,
            orderUpdates: doc.notificationPreferences.orderUpdates,
            marketing: doc.notificationPreferences.marketing,
            security: doc.notificationPreferences.security,
          }
        : undefined,
      analyticsProfileId: doc.analyticsProfileId,
      status: doc.status as BusinessWorkspace["status"],
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
  ): Promise<BusinessWorkspace | null> {
    try {
      return this.findOne({ businessProfileId }, options);
    } catch (error) {
      logger.error("BusinessWorkspaceRepository findByBusinessProfileId failed", error, {
        businessProfileId,
      });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByUserId(
    userId: string,
    options?: DatabaseQueryOptions,
  ): Promise<BusinessWorkspace | null> {
    try {
      return this.findOne({ userId }, options);
    } catch (error) {
      logger.error("BusinessWorkspaceRepository findByUserId failed", error, { userId });
      throw new DatabaseError("Database search error", error);
    }
  }
}

export default BusinessWorkspaceRepository;
