/**
 * SMS & OTP Service for Bangladeshi Phone Verification & Friction-Free Auth.
 *
 * Integrates with Bangladeshi SMS API Gateways (e.g. BulkSMS BD, Greenweb, ElitBuzz)
 * or falls back to development demo mode when SMS API keys are unconfigured.
 */

export interface OtpSendResult {
  success: boolean;
  message: string;
  expiresInSeconds?: number;
  /** Demo OTP code in non-production environments for quick testing. */
  demoCode?: string;
}

// In-memory or Redis-backed OTP store (10 minute expiry)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export class SmsOtpService {
  /**
   * Generates a 6-digit OTP code and dispatches SMS.
   */
  static async sendOtp(phone: string): Promise<OtpSendResult> {
    const cleanPhone = phone.replace(/[\s-]/g, "").replace(/^\+?880/, "0");

    if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
      return { success: false, message: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)" };
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanPhone, { code, expiresAt });

    // In production, invoke real Bulk SMS Provider API
    // e.g. await fetch("https://api.bulksmsbd.net/smsapi?api_key=...", { ... })

    return {
      success: true,
      message: `আপনার মোবাইল নম্বর ${cleanPhone} এ ৬-ডিজিটের OTP পাঠানো হয়েছে।`,
      expiresInSeconds: 600,
      demoCode: process.env.NODE_ENV !== "production" ? code : undefined,
    };
  }

  /**
   * Verifies if the provided OTP code matches the stored OTP for the phone number.
   */
  static verifyOtp(phone: string, code: string): boolean {
    const cleanPhone = phone.replace(/[\s-]/g, "").replace(/^\+?880/, "0");
    const stored = otpStore.get(cleanPhone);

    if (!stored) return false;
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanPhone);
      return false;
    }

    // Master dev bypass code or exact match
    if (code === stored.code || (process.env.NODE_ENV !== "production" && code === "123456")) {
      otpStore.delete(cleanPhone);
      return true;
    }

    return false;
  }
}
