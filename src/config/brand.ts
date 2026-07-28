/**
 * Centralized Single Source of Truth for Public Customer-Facing Branding.
 *
 * Internal Engineering Identity = DropshopNN (Developer codebase, DB, APIs)
 * Public Customer Brand = NN Enterprise (Storefront, SEO, Receipts, Notifications)
 *
 * Never hardcode company/brand names in public UI or metadata.
 * Always import BRAND from this file.
 */
export const BRAND = {
  publicName: "NN Enterprise",
  shortName: "NN Enterprise",
  legalName: "NN Enterprise Ltd.",
  websiteName: "NN Enterprise",
  organization: "NN Enterprise",
  tagline: "বাংলাদেশের প্রিমিয়াম ই-কমার্স ও সোর্সিং প্ল্যাটফর্ম",
  supportEmail: "support@nnenterprise.com.bd",
  supportPhone: "+880 1700-000000",
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://nnenterprise.com.bd",
  copyright: `© ${new Date().getFullYear()} NN Enterprise. সর্বস্বত্ব সংরক্ষিত।`,
} as const;

export default BRAND;
