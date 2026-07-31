import { GiftVoucherRepository } from "../repositories/gift-voucher-repository";
import { GiftVoucher } from "../domain/gift-voucher-entity";

export interface VoucherRedeemResult {
  valid: boolean;
  code: string;
  discountCents: number;
  message: string;
  voucher?: GiftVoucher;
}

export class GiftVoucherService {
  private repository: GiftVoucherRepository;

  constructor() {
    this.repository = new GiftVoucherRepository();
  }

  async validateAndRedeem(code: string, subtotalCents: number): Promise<VoucherRedeemResult> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, code: cleanCode, discountCents: 0, message: "গिफ्ट ভাউচার কোডটি লিখুন।" };
    }

    const voucher = await this.repository.findByCode(cleanCode);
    if (!voucher) {
      return { valid: false, code: cleanCode, discountCents: 0, message: "ভাউচার কোডটি খুঁজে পাওয়া যায়নি।" };
    }

    if (voucher.status !== "active") {
      return { valid: false, code: cleanCode, discountCents: 0, message: "ভাউচারটি বর্তমানে সক্রিয় নেই।" };
    }

    if (voucher.expiryDate && new Date() > voucher.expiryDate) {
      return { valid: false, code: cleanCode, discountCents: 0, message: "ভাউচারটির মেয়াদের সময়সীমা পার হয়ে গেছে।" };
    }

    if (voucher.remainingCents <= 0) {
      return { valid: false, code: cleanCode, discountCents: 0, message: "ভাউচার ব্যালেন্স শেষ হয়ে গিয়েছে।" };
    }

    const discountCents = Math.min(voucher.remainingCents, subtotalCents);

    return {
      valid: true,
      code: cleanCode,
      discountCents,
      message: `গिफ्ट ভাউচার সফলভাবে যোগ করা হয়েছে! ৳${Math.round(discountCents / 100)} ছাড় পাওয়া গেছে।`,
      voucher,
    };
  }

  async listVouchers(filters?: { status?: string; search?: string }): Promise<GiftVoucher[]> {
    return this.repository.list(filters);
  }

  async createVoucher(data: Partial<GiftVoucher>): Promise<GiftVoucher> {
    return this.repository.create(data);
  }

  async deleteVoucher(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
