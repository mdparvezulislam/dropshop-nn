import { CouponRepository } from "../repositories/coupon-repository";
import { Coupon } from "../domain/coupon-entity";

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountCents: number;
  message: string;
  coupon?: Coupon;
}

export class CouponService {
  private repository: CouponRepository;

  constructor() {
    this.repository = new CouponRepository();
  }

  async validateAndApply(
    code: string,
    subtotalCents: number,
  ): Promise<CouponValidationResult> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return {
        valid: false,
        code: cleanCode,
        discountCents: 0,
        message: "দয়া করে একটি সঠিক কুপন কোড লিখুন।",
      };
    }

    const coupon = await this.repository.findByCode(cleanCode);

    if (!coupon) {
      return {
        valid: false,
        code: cleanCode,
        discountCents: 0,
        message: "কুপন কোডটি খুঁজে পাওয়া যায়নি বা এটি সঠিক নয়।",
      };
    }

    if (coupon.status !== "active") {
      return {
        valid: false,
        code: cleanCode,
        discountCents: 0,
        message: "কুপনটি বর্তমানে সক্রিয় নেই।",
      };
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return {
        valid: false,
        code: cleanCode,
        discountCents: 0,
        message: "কুপনটির মেয়াদ এখনও শুরু হয়নি।",
      };
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return {
        valid: false,
        code: cleanCode,
        discountCents: 0,
        message: "কুপনটির মেয়াদের সময়সীমা শেষ হয়ে গিয়েছে।",
      };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        valid: false,
        code: cleanCode,
        discountCents: 0,
        message: "কুপনটির ব্যবহারের সর্বোচ্চ সীমা পূর্ণ হয়ে গিয়েছে।",
      };
    }

    if (subtotalCents < coupon.minOrderCents) {
      const minOrderBDT = Math.round(coupon.minOrderCents / 100);
      return {
        valid: false,
        code: cleanCode,
        discountCents: 0,
        message: `কুপনটি ব্যবহারের জন্য সর্বনিম্ন ৳${minOrderBDT} টাকার অর্ডার প্রয়োজন।`,
      };
    }

    let discountCents = 0;
    if (coupon.type === "fixed") {
      discountCents = Math.min(coupon.value, subtotalCents);
    } else {
      // percentage
      const calculated = Math.round((subtotalCents * coupon.value) / 100);
      if (coupon.maxDiscountCents && coupon.maxDiscountCents > 0) {
        discountCents = Math.min(calculated, coupon.maxDiscountCents);
      } else {
        discountCents = calculated;
      }
    }

    return {
      valid: true,
      code: cleanCode,
      discountCents,
      message: `কুপন সফলভাবে প্রয়োগ করা হয়েছে! ৳${Math.round(discountCents / 100)} টাকা ছাড় পেয়েছেন।`,
      coupon,
    };
  }

  async listCoupons(filters?: { status?: string; search?: string }): Promise<Coupon[]> {
    return this.repository.list(filters);
  }

  async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
    return this.repository.create(data);
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | null> {
    return this.repository.update(id, data);
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
