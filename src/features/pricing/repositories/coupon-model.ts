import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICouponDocument extends Document {
  code: string;
  description?: string;
  type: "fixed" | "percentage";
  value: number;
  maxDiscountCents?: number;
  minOrderCents: number;
  validFrom?: Date;
  validUntil?: Date;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  status: "draft" | "scheduled" | "active" | "paused" | "expired" | "archived";
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String },
    type: { type: String, enum: ["fixed", "percentage"], required: true, default: "fixed" },
    value: { type: Number, required: true, min: 0 },
    maxDiscountCents: { type: Number },
    minOrderCents: { type: Number, default: 0 },
    validFrom: { type: Date },
    validUntil: { type: Date },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "paused", "expired", "archived"],
      default: "active",
      index: true,
    },
    applicableCategories: [{ type: String }],
    applicableProducts: [{ type: String }],
    excludedProducts: [{ type: String }],
    createdBy: { type: String },
  },
  {
    timestamps: true,
  },
);

CouponSchema.index({ code: 1, status: 1 });

export const CouponModel: Model<ICouponDocument> =
  mongoose.models.Coupon || mongoose.model<ICouponDocument>("Coupon", CouponSchema);
