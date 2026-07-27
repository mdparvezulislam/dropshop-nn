import { BaseRepository } from "@/lib/database/generic-repository";
import {
  BusinessMembershipApplicationModel,
  ApplicationDocument,
} from "./business-membership-application-model";
import {
  BusinessMembershipApplicationEntity,
  ApplicationStatus,
} from "../domain/business-membership-entity";

export class BusinessMembershipApplicationRepository extends BaseRepository<
  ApplicationDocument,
  BusinessMembershipApplicationEntity
> {
  constructor() {
    super(BusinessMembershipApplicationModel, BusinessMembershipApplicationRepository.mapToDomain);
  }

  public static mapToDomain(doc: ApplicationDocument): BusinessMembershipApplicationEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      userFullName: doc.userFullName,
      userPhone: doc.userPhone,
      userEmail: doc.userEmail,
      membershipType: doc.membershipType,
      status: doc.status,
      commonFields: doc.commonFields,
      resellerFields: doc.resellerFields,
      wholesalerFields: doc.wholesalerFields,
      reviewNotes: doc.reviewNotes,
      adminQuestion: doc.adminQuestion,
      userAnswer: doc.userAnswer,
      reviewedBy: doc.reviewedBy,
      reviewedAt: doc.reviewedAt,
      rejectionReason: doc.rejectionReason,
      isDeleted: Boolean(doc.deletedAt),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
  }

  public async findActiveByUserAndType(
    userId: string,
    membershipType: string,
  ): Promise<BusinessMembershipApplicationEntity | null> {
    await this.ensureConnected();
    const doc = await BusinessMembershipApplicationModel.findOne({
      userId,
      membershipType,
      deletedAt: null,
      status: { $in: ["pending", "under_review", "need_info", "approved", "rejected"] },
    })
      .sort({ createdAt: -1 })
      .lean();
    if (!doc) return null;
    return BusinessMembershipApplicationRepository.mapToDomain(
      doc as unknown as ApplicationDocument,
    );
  }

  public async findByUserId(userId: string): Promise<BusinessMembershipApplicationEntity[]> {
    await this.ensureConnected();
    const docs = await BusinessMembershipApplicationModel.find({ userId, deletedAt: null })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d) =>
      BusinessMembershipApplicationRepository.mapToDomain(d as unknown as ApplicationDocument),
    );
  }

  public async listApplications(params: {
    status?: ApplicationStatus;
    membershipType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    items: BusinessMembershipApplicationEntity[];
    totalCount: number;
    totalPages: number;
  }> {
    await this.ensureConnected();
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { deletedAt: null };

    if (params.status) {
      query.status = params.status;
    }

    if (params.membershipType) {
      query.membershipType = params.membershipType;
    }

    if (params.search) {
      const regex = new RegExp(params.search, "i");
      query.$or = [
        { userFullName: regex },
        { userPhone: regex },
        { userEmail: regex },
        { "commonFields.fullName": regex },
        { "commonFields.phone": regex },
        { "commonFields.district": regex },
        { "wholesalerFields.companyName": regex },
      ];
    }

    const [docs, totalCount] = await Promise.all([
      BusinessMembershipApplicationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BusinessMembershipApplicationModel.countDocuments(query),
    ]);

    const items = docs.map((d) =>
      BusinessMembershipApplicationRepository.mapToDomain(d as unknown as ApplicationDocument),
    );

    return {
      items,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  public async getAnalytics(): Promise<{
    totalApplications: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    needInfoCount: number;
    approvalRate: number;
    rejectionRate: number;
  }> {
    await this.ensureConnected();
    const rows = await BusinessMembershipApplicationModel.aggregate<{ _id: string; count: number }>([
      { $match: { deletedAt: null } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const map = new Map<string, number>(rows.map((r) => [r._id, r.count]));
    const pending = map.get("pending") ?? 0;
    const approved = map.get("approved") ?? 0;
    const rejected = map.get("rejected") ?? 0;
    const needInfo = map.get("need_info") ?? 0;
    const total = Array.from(map.values()).reduce((sum, val) => sum + val, 0);

    const decided = approved + rejected;
    const approvalRate = decided > 0 ? Math.round((approved / decided) * 100) : 0;
    const rejectionRate = decided > 0 ? Math.round((rejected / decided) * 100) : 0;

    return {
      totalApplications: total,
      pendingCount: pending,
      approvedCount: approved,
      rejectedCount: rejected,
      needInfoCount: needInfo,
      approvalRate,
      rejectionRate,
    };
  }
}

export const businessMembershipApplicationRepository =
  new BusinessMembershipApplicationRepository();
