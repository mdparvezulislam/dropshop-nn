import { GiftVoucherModel, IGiftVoucherDocument } from "./gift-voucher-model";
import { GiftVoucher } from "../domain/gift-voucher-entity";
import { DatabaseConnectionManager } from "@/lib/database/connection-manager";

function mapDocumentToEntity(doc: IGiftVoucherDocument): GiftVoucher {
  const remaining = Math.max(0, doc.amountCents - doc.usedAmountCents);
  return {
    id: doc._id.toString(),
    code: doc.code,
    amountCents: doc.amountCents,
    usedAmountCents: doc.usedAmountCents,
    remainingCents: remaining,
    expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
    status: doc.status,
    singleUse: doc.singleUse,
    notes: doc.notes,
    createdBy: doc.createdBy,
    createdAt: new Date(doc.createdAt),
    updatedAt: new Date(doc.updatedAt),
  };
}

export class GiftVoucherRepository {
  async findByCode(code: string): Promise<GiftVoucher | null> {
    await DatabaseConnectionManager.connect();
    const doc = await GiftVoucherModel.findOne({ code: code.trim().toUpperCase() }).exec();
    return doc ? mapDocumentToEntity(doc) : null;
  }

  async list(filters?: { status?: string; search?: string }): Promise<GiftVoucher[]> {
    await DatabaseConnectionManager.connect();
    const query: Record<string, any> = {};

    if (filters?.status && filters.status !== "all") {
      query.status = filters.status;
    }

    if (filters?.search) {
      query.code = { $regex: filters.search.trim(), $options: "i" };
    }

    const docs = await GiftVoucherModel.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(mapDocumentToEntity);
  }

  async create(data: Partial<GiftVoucher>): Promise<GiftVoucher> {
    await DatabaseConnectionManager.connect();
    const doc = new GiftVoucherModel({
      code: data.code?.trim().toUpperCase(),
      amountCents: data.amountCents || 0,
      usedAmountCents: 0,
      expiryDate: data.expiryDate,
      status: data.status || "active",
      singleUse: data.singleUse ?? true,
      notes: data.notes,
      createdBy: data.createdBy,
    });
    const saved = await doc.save();
    return mapDocumentToEntity(saved);
  }

  async update(id: string, updates: Partial<GiftVoucher>): Promise<GiftVoucher | null> {
    await DatabaseConnectionManager.connect();
    const doc = await GiftVoucherModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true },
    ).exec();
    return doc ? mapDocumentToEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    await DatabaseConnectionManager.connect();
    const res = await GiftVoucherModel.findByIdAndDelete(id).exec();
    return !!res;
  }
}
