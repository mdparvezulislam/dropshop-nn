import type { CurrencyCode } from "./types";

export type SupportedLocale = "en" | "bn";
export type SupportedTimezone = "Asia/Dhaka" | "UTC";

const LOCALE_CONFIG: Record<SupportedLocale, {
  name: string;
  nativeName: string;
  dateFormat: string;
  timeFormat: string;
  currencyFormat: (amount: number, currency: CurrencyCode) => string;
  numberFormat: (value: number) => string;
  dir: "ltr" | "rtl";
}> = {
  en: {
    name: "English",
    nativeName: "English",
    dateFormat: "MMM dd, yyyy",
    timeFormat: "hh:mm a",
    currencyFormat: (amount, currency) => {
      const symbol = currency === "BDT" ? "৳" : "$";
      return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    },
    numberFormat: (value) => value.toLocaleString("en-US"),
    dir: "ltr",
  },
  bn: {
    name: "Bangla",
    nativeName: "বাংলা",
    dateFormat: "dd MMMM, yyyy",
    timeFormat: "hh:mm a",
    currencyFormat: (amount, currency) => {
      const symbol = currency === "BDT" ? "৳" : "$";
      const bnNumber = toBanglaNumber(amount);
      return `${symbol}${bnNumber}`;
    },
    numberFormat: (value) => toBanglaNumber(value),
    dir: "ltr",
  },
};

const BANGLA_DIGITS: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

function toBanglaNumber(value: number): string {
  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: 2 });
  return formatted.replace(/\d/g, (d) => BANGLA_DIGITS[d] ?? d);
}

export class Localization {
  static formatCurrency(amount: number, currency: CurrencyCode = "BDT", locale: SupportedLocale = "en"): string {
    const config = LOCALE_CONFIG[locale] ?? LOCALE_CONFIG.en;
    return config.currencyFormat(amount, currency);
  }

  static formatNumber(value: number, locale: SupportedLocale = "en"): string {
    const config = LOCALE_CONFIG[locale] ?? LOCALE_CONFIG.en;
    return config.numberFormat(value);
  }

  static formatDate(date: Date | string, locale: SupportedLocale = "en"): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const config = LOCALE_CONFIG[locale] ?? LOCALE_CONFIG.en;

    const months: Record<SupportedLocale, string[]> = {
      en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
    };

    const month = months[locale][d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();

    if (locale === "bn") {
      return `${toBanglaNumber(day)} ${month}, ${toBanglaNumber(year)}`;
    }

    return `${month} ${day}, ${year}`;
  }

  static formatDateTime(date: Date | string, locale: SupportedLocale = "en", timezone?: SupportedTimezone): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const dateStr = this.formatDate(d, locale);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;

    if (locale === "bn") {
      const bnHours = toBanglaNumber(displayHours);
      const bnMinutes = toBanglaNumber(minutes);
      const bnAmPm = hours >= 12 ? "অপরাহ্ন" : "পূর্বাহ্ন";
      return `${dateStr} ${bnHours}:${bnMinutes} ${bnAmPm}`;
    }

    return `${dateStr} ${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  }

  static getLocaleConfig(locale: SupportedLocale): typeof LOCALE_CONFIG[SupportedLocale] {
    return LOCALE_CONFIG[locale] ?? LOCALE_CONFIG.en;
  }

  static isRtl(locale: SupportedLocale): boolean {
    return this.getLocaleConfig(locale).dir === "rtl";
  }
}

export const BD_DIVISIONS = [
  "Barisal", "Chittagong", "Dhaka", "Khulna", "Mymensingh", "Rajshahi", "Rangpur", "Sylhet",
] as const;

export const BD_MOBILE_REGEX = /^(\+?880|0)1[3-9]\d{8}$/;

export function validateBdMobile(phone: string): boolean {
  return BD_MOBILE_REGEX.test(phone.replace(/[\s-]/g, ""));
}

export function formatBdMobile(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, "");
  if (cleaned.startsWith("+880")) {
    return `0${cleaned.slice(3)}`;
  }
  return cleaned;
}
