import { BaseRepository } from "@/lib/database/generic-repository";
import { BusinessMembershipModel, BusinessMembershipDocument } from "./business-membership-model";
import { BusinessMembershipEntity } from "../domain/business-membership-entity";

export class BusinessMembershipRepository extends BaseRepository<BusinessMembershipDocument, BusinessMembershipEntity> {
  constructor() {
    super(BusinessMembershipModel, BusinessMembershipRepository.mapToDomain);
  }

  public static mapToDomain(doc: BusinessMembershipDocument): BusinessMembershipEntity {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      membershipType: doc.membershipType,
      status: doc.status,
      grantedAt: doc.grantedAt,
      grantedBy: doc.grantedBy,
      expiresAt: doc.expiresAt,
      suspendedAt: doc.suspendedAt,
      suspensionReason: doc.suspensionReason,
      isDeleted: Boolean(doc.deletedAt),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
  }

  public async findByUserId(userId: string): Promise<BusinessMembershipEntity[]> {
    await this.ensureConnected();
    const docs = await BusinessMembershipModel.find({ userId, deletedAt: null }).lean();
    return docs.map((d) => BusinessMembershipRepository.mapToDomain(d as unknown as BusinessMembershipDocument));
  }

  public async findByUserAndType(userId: string, membershipType: string): Promise<BusinessMembershipEntity | null> {
    await this.ensureConnected();
    const doc = await BusinessMembershipModel.findOne({ userId, membershipType, deletedAt: null }).lean();
    if (!doc) return null;
    return BusinessMembershipRepository.mapToDomain(doc as unknown as BusinessMembershipDocument);
  }

  public async upsertMembership(
    userId: string,
    membershipType: string,
    grantedBy: string,
    status: "active" | "suspended" | "expired" = "active"
  ): Promise<BusinessMembershipEntity> {
    await this.ensureConnected();
    const doc = await BusinessMembershipModel.findOneAndUpdate(
      { userId, membershipType },
      {
        $set: {
          status,
          grantedAt: new Date(),
          grantedBy,
          suspendedAt: status === "suspended" ? new Date() : null,
          deletedAt: null,
        },
      },
      { upsert: true, new: true }
    ).lean();
    return BusinessMembershipRepository.mapToDomain(doc as unknown as BusinessMembershipDocument);
  }
}

export const businessMembershipRepository = new BusinessMembershipRepository();
