"use server";

import { CouponService, CouponValidationResult } from "../services/coupon-service";
import { Coupon } from "../domain/coupon-entity";

export async function validateCouponAction(
  code: string,
  subtotalCents: number,
): Promise<{ success: boolean; data?: CouponValidationResult; error?: string }> {
  try {
    const service = new CouponService();
    const result = await service.validateAndApply(code, subtotalCents);
    return { success: result.valid, data: result, error: result.valid ? undefined : result.message };
  } catch (err: any) {
    return { success: false, error: err.message || "কুপন যাচাইকরণ ব্যর্থ হয়েছে।" };
  }
}

export async function listCouponsAction(filters?: {
  status?: string;
  search?: string;
}): Promise<{ success: boolean; data?: Coupon[]; error?: string }> {
  try {
    const service = new CouponService();
    const data = await service.listCoupons(filters);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "কুপন লিস্ট আনতে ব্যর্থ হয়েছে।" };
  }
}

export async function createCouponAction(
  couponData: Partial<Coupon>,
): Promise<{ success: boolean; data?: Coupon; error?: string }> {
  try {
    const service = new CouponService();
    const data = await service.createCoupon(couponData);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "কুপন তৈরি করতে ব্যর্থ হয়েছে।" };
  }
}

export async function updateCouponAction(
  id: string,
  couponData: Partial<Coupon>,
): Promise<{ success: boolean; data?: Coupon; error?: string }> {
  try {
    const service = new CouponService();
    const data = await service.updateCoupon(id, couponData);
    if (!data) return { success: false, error: "কুপন আপডেট করা যায়নি।" };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "কুপন আপডেট ব্যর্থ হয়েছে।" };
  }
}

export async function deleteCouponAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const service = new CouponService();
    const ok = await service.deleteCoupon(id);
    return { success: ok };
  } catch (err: any) {
    return { success: false, error: err.message || "কুপন রিমুভ ব্যর্থ হয়েছে।" };
  }
}
