/**
 * Centralized Single Source of Truth for Business Contact & Delivery Settings.
 *
 * Pulls from environment variables with graceful defaults.
 * Update these in your .env file or Railway variables for single-point updates.
 */

export const BUSINESS_CONFIG = {
  hotlinePhone: process.env.NEXT_PUBLIC_HOTLINE_PHONE || "01898-888800",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801898888800",
  whatsappDisplay: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || "01898-888800",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@nnenterprise.com.bd",
  officeAddress:
    process.env.NEXT_PUBLIC_OFFICE_ADDRESS ||
    "লেভেল ৫, হাউজ ১২, রোড ৮, সেক্টর ৪, উত্তরা, ঢাকা-১২৩০",

  socialLinks: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/nnenterprise",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/nnenterprise",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://youtube.com/@nnenterprise",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@nnenterprise",
  },

  deliveryRates: {
    insideDhaka: Number(process.env.NEXT_PUBLIC_DELIVERY_INSIDE_DHAKA || 80),
    outsideDhaka: Number(process.env.NEXT_PUBLIC_DELIVERY_OUTSIDE_DHAKA || 150),
  },

  courierServices: {
    steadfastEnabled: process.env.STEADFAST_ENABLED !== "false",
  },
} as const;

export default BUSINESS_CONFIG;
