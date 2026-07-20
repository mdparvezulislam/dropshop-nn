import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { BusinessProfileModel, BusinessProfileDocument } from "./business-profile-model";
import { BusinessProfile } from "../domain/business-profile-entity";
import { DatabaseQueryOptions } from "@/shared/lib/database/types";
import { logger } from "@/shared/utils/logger";
import { DatabaseError } from "@/shared/errors/app-error";

export class BusinessProfileRepository extends BaseRepository<BusinessProfileDocument, BusinessProfile> {
  constructor() {
    super(BusinessProfileModel, BusinessProfileRepository.mapToDomain);
  }

  private static mapToDomain(doc: BusinessProfileDocument): BusinessProfile {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      businessName: doc.businessName,
      ownerName: doc.ownerName,
      primaryPhone: doc.primaryPhone,
      secondaryPhone: doc.secondaryPhone,
      email: doc.email,
      businessType: doc.businessType as BusinessProfile["businessType"],
      role: doc.role as BusinessProfile["role"],
      description: doc.description,
      logo: doc.logo,
      banner: doc.banner,
      address: {
        division: doc.address.division,
        district: doc.address.district,
        upazila: doc.address.upazila,
        area: doc.address.area,
        postalCode: doc.address.postalCode,
        fullAddress: doc.address.fullAddress,
      },
      socialLinks: doc.socialLinks
        ? {
            website: doc.socialLinks.website,
            facebookPage: doc.socialLinks.facebookPage,
            instagram: doc.socialLinks.instagram,
            youtube: doc.socialLinks.youtube,
            whatsapp: doc.socialLinks.whatsapp,
            telegram: doc.socialLinks.telegram,
          }
        : undefined,
      documents: doc.documents
        ? {
            nidNumber: doc.documents.nidNumber,
            tradeLicenseNumber: doc.documents.tradeLicenseNumber,
            tinNumber: doc.documents.tinNumber,
            bankAccountName: doc.documents.bankAccountName,
            bankAccountNumber: doc.documents.bankAccountNumber,
            bankName: doc.documents.bankName,
            bankBranch: doc.documents.bankBranch,
            bkashNumber: doc.documents.bkashNumber,
            nagadNumber: doc.documents.nagadNumber,
          }
        : undefined,
      verificationStatus: doc.verificationStatus as BusinessProfile["verificationStatus"],
      verificationNotes: doc.verificationNotes,
      verifiedAt: doc.verifiedAt,
      verifiedBy: doc.verifiedBy,
      status: doc.status as BusinessProfile["status"],
      statusReason: doc.statusReason,
      suspendedAt: doc.suspendedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    };
  }

  async findByUserId(userId: string, options?: DatabaseQueryOptions): Promise<BusinessProfile | null> {
    try {
      return this.findOne({ userId }, options);
    } catch (error) {
      logger.error("BusinessProfileRepository findByUserId failed", error, { userId });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByUserIdAndRole(
    userId: string,
    role: string,
    options?: DatabaseQueryOptions,
  ): Promise<BusinessProfile | null> {
    try {
      return this.findOne({ userId, role }, options);
    } catch (error) {
      logger.error("BusinessProfileRepository findByUserIdAndRole failed", error, {
        userId,
        role,
      });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findByEmail(email: string, options?: DatabaseQueryOptions): Promise<BusinessProfile | null> {
    try {
      return this.findOne({ email: email.toLowerCase().trim() }, options);
    } catch (error) {
      logger.error("BusinessProfileRepository findByEmail failed", error, { email });
      throw new DatabaseError("Database search error", error);
    }
  }

  async findPendingApprovals(
    role?: string,
    options?: DatabaseQueryOptions,
  ): Promise<BusinessProfile[]> {
    try {
      const filter: Record<string, unknown> = {
        status: "pending",
        verificationStatus: "pending",
      };
      if (role) filter.role = role;
      return this.find(filter, options);
    } catch (error) {
      logger.error("BusinessProfileRepository findPendingApprovals failed", error);
      throw new DatabaseError("Database search error", error);
    }
  }

  async countByStatus(status: string, options?: DatabaseQueryOptions): Promise<number> {
    try {
      return this.count({ status }, options);
    } catch (error) {
      logger.error("BusinessProfileRepository countByStatus failed", error, { status });
      throw new DatabaseError("Database count error", error);
    }
  }

  async countPendingApprovals(role?: string, options?: DatabaseQueryOptions): Promise<number> {
    try {
      const filter: Record<string, unknown> = {
        status: "pending",
        verificationStatus: "pending",
      };
      if (role) filter.role = role;
      return this.count(filter, options);
    } catch (error) {
      logger.error("BusinessProfileRepository countPendingApprovals failed", error);
      throw new DatabaseError("Database count error", error);
    }
  }
}

export default BusinessProfileRepository;
