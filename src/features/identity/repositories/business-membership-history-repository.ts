import { BaseRepository } from "@/lib/database/generic-repository";
import { BusinessMembershipHistoryModel } from "./business-membership-history-model";

function toDomain(doc: any) {
  return {
    id: doc.id ?? doc._id.toString(),
    userId: doc.userId,
    applicationId: doc.applicationId,
    membershipType: doc.membershipType,
    action: doc.action,
    actorId: doc.actorId,
    actorRole: doc.actorRole,
    fromStatus: doc.fromStatus,
    toStatus: doc.toStatus,
    notes: doc.notes,
    createdAt: doc.createdAt,
  };
}

export class BusinessMembershipHistoryRepository extends BaseRepository<any, any> {
  constructor() {
    super(BusinessMembershipHistoryModel as any, toDomain);
  }

  async findByUser(userId: string): Promise<any[]> {
    return this.find({ userId }, { sort: { createdAt: -1 } } as any);
  }
}

export const businessMembershipHistoryRepository = new BusinessMembershipHistoryRepository();
