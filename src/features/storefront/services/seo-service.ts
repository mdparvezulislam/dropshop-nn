import { BRAND } from "@/config/brand";
import { SITE_LOCALE } from "@/config/site";
import type { Metadata } from "next";

export class SeoService {
  generateHomepageMetadata(): Metadata {
    return {
      title: `${BRAND.publicName} — ${BRAND.tagline}`,
      description:
        "রিসেলার, হোলসেলার এবং ড্রপশিপারদের জন্য অল-ইন-ওয়ান প্রোডাক্ট সাপ্লাই প্ল্যাটফর্ম। অরিজিনাল প্রোডাক্ট, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।",
      openGraph: {
        title: `${BRAND.publicName} — ${BRAND.tagline}`,
        description: `সোর্স করুন, বিক্রি করুন, ব্যবসা বাড়ান ${BRAND.publicName} এর সাথে।`,
        type: "website",
        locale: SITE_LOCALE,
      },
    };
  }

  generateProductMetadata(title: string, description?: string, image?: string): Metadata {
    return {
      title: `${title} | ${BRAND.publicName}`,
      description: description || `অরিজিনাল ${title} কিনুন ${BRAND.publicName} থেকে সেরা দামে।`,
      openGraph: {
        title,
        description: description || `অরিজিনাল ${title} কিনুন ${BRAND.publicName} থেকে সেরা দামে।`,
        images: image ? [{ url: image }] : undefined,
        type: "website",
      },
    };
  }

  generateCategoryMetadata(name: string, description?: string): Metadata {
    return {
      title: `${name} | ${BRAND.publicName}`,
      description: description || `${name} ক্যাটাগরির সেরা প্রোডাক্টসমূহ দেখুন ${BRAND.publicName} এ।`,
      openGraph: {
        title: `${name} — ${BRAND.publicName}`,
        description: description || `${name} ক্যাটাগরির সেরা প্রোডাক্টসমূহ দেখুন ${BRAND.publicName} এ।`,
      },
    };
  }
}
