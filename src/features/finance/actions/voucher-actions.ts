"use server";

import { GiftVoucherService, VoucherRedeemResult } from "../services/gift-voucher-service";
import { GiftVoucher } from "../domain/gift-voucher-entity";

export async function validateVoucherAction(
  code: string,
  subtotalCents: number,
): Promise<{ success: boolean; data?: VoucherRedeemResult; error?: string }> {
  try {
    const service = new GiftVoucherService();
    const res = await service.validateAndRedeem(code, subtotalCents);
    return { success: res.valid, data: res, error: res.valid ? undefined : res.message };
  } catch (err: any) {
    return { success: false, error: err.message || "ভাউচার যাচাইকরণ ব্যর্থ হয়েছে।" };
  }
}

export async function listVouchersAction(filters?: {
  status?: string;
  search?: string;
}): Promise<{ success: boolean; data?: GiftVoucher[]; error?: string }> {
  try {
    const service = new GiftVoucherService();
    const data = await service.listVouchers(filters);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "ভাউচার লিস্ট লোড করা যায়নি।" };
  }
}

export async function createVoucherAction(
  voucherData: Partial<GiftVoucher>,
): Promise<{ success: boolean; data?: GiftVoucher; error?: string }> {
  try {
    const service = new GiftVoucherService();
    const data = await service.createVoucher(voucherData);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "ভাউচার তৈরি ব্যর্থ হয়েছে।" };
  }
}

export async function deleteVoucherAction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const service = new GiftVoucherService();
    const ok = await service.deleteVoucher(id);
    return { success: ok };
  } catch (err: any) {
    return { success: false, error: err.message || "ভাউচার ডিলিট করা যায়নি।" };
  }
}
