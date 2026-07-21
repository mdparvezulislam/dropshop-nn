import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { UserAddressModel, type UserAddressDocument } from "./user-address-model";
import type { UserAddress } from "../domain/user-address-entity";

export class UserAddressRepository extends BaseRepository<UserAddressDocument, UserAddress> {
  constructor() {
    super(UserAddressModel, (doc) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      fullName: doc.fullName,
      phone: doc.phone,
      division: doc.division,
      district: doc.district,
      upazila: doc.upazila,
      area: doc.area,
      postalCode: doc.postalCode,
      landmark: doc.landmark,
      isDefault: doc.isDefault,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      deletedAt: doc.deletedAt,
      isDeleted: doc.isDeleted,
      status: doc.status,
      metadata: doc.metadata ? Object.fromEntries(doc.metadata as any) : undefined,
    }));
  }

  async findByUser(userId: string): Promise<UserAddress[]> {
    return this.find({ userId, isDeleted: { $ne: true } });
  }

  async findDefault(userId: string): Promise<UserAddress | null> {
    return this.findOne({ userId, isDefault: true, isDeleted: { $ne: true } });
  }

  async unsetDefault(userId: string): Promise<void> {
    const current = await this.findDefault(userId);
    if (current) {
      await this.update(current.id, { isDefault: false });
    }
  }
}
export default UserAddressRepository;
