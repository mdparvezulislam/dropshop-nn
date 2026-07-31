import { CouponModel, ICouponDocument } from "./coupon-model";
import { Coupon } from "../domain/coupon-entity";
import { DatabaseConnectionManager } from "@/lib/database/connection-manager";

function mapDocumentToEntity(doc: ICouponDocument): Coupon {
  return {
    id: doc._id.toString(),
    code: doc.code,
    description: doc.description,
    type: doc.type,
    value: doc.value,
    maxDiscountCents: doc.maxDiscountCents,
    minOrderCents: doc.minOrderCents,
    validFrom: doc.validFrom ? new Date(doc.validFrom) : undefined,
    validUntil: doc.validUntil ? new Date(doc.validUntil) : undefined,
    usageLimit: doc.usageLimit,
    usageCount: doc.usageCount || 0,
    perUserLimit: doc.perUserLimit,
    status: doc.status,
    applicableCategories: doc.applicableCategories,
    applicableProducts: doc.applicableProducts,
    excludedProducts: doc.excludedProducts,
    createdBy: doc.createdBy,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

export class CouponRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    await DatabaseConnectionManager.connect();
    const doc = await CouponModel.findOne({ code: code.trim().toUpperCase() }).exec();
    return doc ? mapDocumentToEntity(doc) : null;
  }

  async findById(id: string): Promise<Coupon | null> {
    await DatabaseConnectionManager.connect();
    const doc = await CouponModel.findById(id).exec();
    return doc ? mapDocumentToEntity(doc) : null;
  }

  async list(filters?: { status?: string; search?: string }): Promise<Coupon[]> {
    await DatabaseConnectionManager.connect();
    const query: Record<string, any> = {};

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters?.search) {
      query.code = { $regex: filters.search.trim(), $options: "i" };
    }

    const docs = await CouponModel.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(mapDocumentToEntity);
  }

  async create(data: Partial<Coupon>): Promise<Coupon> {
    await DatabaseConnectionManager.connect();
    const doc = new CouponModel({
      code: data.code?.trim().toUpperCase(),
      description: data.description,
      type: data.type || "fixed",
      value: data.value || 0,
      maxDiscountCents: data.maxDiscountCents,
      minOrderCents: data.minOrderCents || 0,
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      usageLimit: data.usageLimit,
      usageCount: 0,
      perUserLimit: data.perUserLimit || 1,
      status: data.status || "active",
      createdBy: data.createdBy,
    });
    const saved = await doc.save();
    return mapDocumentToEntity(saved);
  }

  async update(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
    await DatabaseConnectionManager.connect();
    const doc = await CouponModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true },
    ).exec();
    return doc ? mapDocumentToEntity(doc) : null;
  }

  async incrementUsage(id: string): Promise<void> {
    await DatabaseConnectionManager.connect();
    await CouponModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }).exec();
  }

  async delete(id: string): Promise<boolean> {
    await DatabaseConnectionManager.connect();
    const res = await CouponModel.findByIdAndDelete(id).exec();
    return !!res;
  }
}
