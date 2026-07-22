import { BaseRepository } from "@/shared/lib/database/generic-repository";
import { PickupAddressModel } from "./pickup-address-model";
import type { PickupAddress } from "../domain/pickup-address-entity";
import type { BaseDocument } from "@/shared/lib/database/types";

interface PickupAddressDocument extends BaseDocument {
  name: string;
  isDefault: boolean;
  warehouseId?: string;
  contactPerson: string;
  phone: string;
  alternativePhone?: string;
  district: string;
  area: string;
  address: string;
  instructions?: string;
}

function mapToDomain(doc: any): PickupAddress {
  return {
    id: doc.id ?? doc._id?.toString(),
    name: doc.name,
    isDefault: doc.isDefault ?? false,
    warehouseId: doc.warehouseId,
    contactPerson: doc.contactPerson,
    phone: doc.phone,
    alternativePhone: doc.alternativePhone,
    district: doc.district,
    area: doc.area,
    address: doc.address,
    instructions: doc.instructions,
    status: doc.status ?? "active",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    deletedAt: doc.deletedAt,
    isDeleted: doc.isDeleted,
    metadata: doc.metadata,
  };
}

export class PickupAddressRepository extends BaseRepository<PickupAddressDocument, PickupAddress> {
  constructor() {
    super(PickupAddressModel as any, mapToDomain);
  }

  async findDefaultAddress(): Promise<PickupAddress | null> {
    const doc = await PickupAddressModel.findOne({ isDefault: true, isDeleted: { $ne: true } }).lean();
    return doc ? mapToDomain({ ...doc, id: doc._id.toString() }) : null;
  }

  async listAddresses(): Promise<PickupAddress[]> {
    const docs = await PickupAddressModel.find({ isDeleted: { $ne: true } }).sort({ isDefault: -1, createdAt: -1 }).lean();
    return docs.map((d: any) => mapToDomain({ ...d, id: d._id.toString() }));
  }

  async setDefaultAddress(id: string): Promise<void> {
    await PickupAddressModel.updateMany({ isDeleted: { $ne: true } }, { $set: { isDefault: false } });
    await PickupAddressModel.findByIdAndUpdate(id, { $set: { isDefault: true } });
  }
}

export default PickupAddressRepository;
