export type CouponDiscountType = "fixed" | "percentage";

export type CouponStatus = "draft" | "scheduled" | "active" | "paused" | "expired" | "archived";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponDiscountType;
  value: number; // Amount in cents if fixed, or percentage integer (e.g. 10 for 10%)
  maxDiscountCents?: number;
  minOrderCents: number;
  validFrom?: Date;
  validUntil?: Date;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  status: CouponStatus;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedProducts?: string[];
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
