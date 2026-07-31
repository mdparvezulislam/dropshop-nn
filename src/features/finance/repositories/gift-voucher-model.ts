import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGiftVoucherDocument extends Document {
  code: string;
  amountCents: number;
  usedAmountCents: number;
  expiryDate?: Date;
  status: "active" | "used" | "expired" | "paused" | "archived";
  singleUse: boolean;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GiftVoucherSchema = new Schema<IGiftVoucherDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    amountCents: { type: Number, required: true, min: 1 },
    usedAmountCents: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "used", "expired", "paused", "archived"],
      default: "active",
      index: true,
    },
    singleUse: { type: Boolean, default: true },
    notes: { type: String },
    createdBy: { type: String },
  },
  {
    timestamps: true,
  },
);

GiftVoucherSchema.index({ code: 1, status: 1 });

export const GiftVoucherModel: Model<IGiftVoucherDocument> =
  mongoose.models.GiftVoucher || mongoose.model<IGiftVoucherDocument>("GiftVoucher", GiftVoucherSchema);
