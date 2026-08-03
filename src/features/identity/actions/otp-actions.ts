"use server";

import { SmsOtpService, type OtpSendResult } from "@/features/identity/services/sms-otp-service";

export async function sendOtpAction(phone: string): Promise<OtpSendResult> {
  try {
    return await SmsOtpService.sendOtp(phone);
  } catch {
    return {
      success: false,
      message: "OTP পাঠাতে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    };
  }
}

export async function verifyOtpAction(
  phone: string,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const isValid = SmsOtpService.verifyOtp(phone, code);
    if (!isValid) {
      return { success: false, error: "ভুল OTP কোড অথবা মেয়াদ শেষ হয়ে গেছে।" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "ভেরিফিকেশনে সমস্যা হয়েছে।" };
  }
}
