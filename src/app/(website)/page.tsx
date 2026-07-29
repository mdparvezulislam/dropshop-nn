import type { Metadata } from "next";
import { getPublicHomepageDataAction } from "@/features/storefront/actions/storefront-actions";
import { SITE_LOCALE } from "@/config/site";
import { BRAND } from "@/config/brand";

import {
  HeroSection,
  TrustSection,
  CategoryShowcase,
  FlashDealsSection,
  CampaignBannerSection,
  NewArrivalsSection,
  FeaturedProductsSection,
  WhyChooseUsSection,
} from "@/components/website/sections";

export const revalidate = 300;

export const metadata: Metadata = {
  description:
    "রিসেলার, হোলসেলার এবং ড্রপশিপারদের জন্য অল-ইন-ওয়ান প্রোডাক্ট সাপ্লাই প্ল্যাটফর্ম। অরিজিনাল প্রোডাক্ট, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।",
  openGraph: {
    title: `${BRAND.publicName} — ${BRAND.tagline}`,
    description: `সোর্স করুন, বিক্রি করুন, ব্যবসা বাড়ান ${BRAND.publicName} এর সাথে।`,
    type: "website",
    locale: SITE_LOCALE,
  },
};

export default async function HomePage(): Promise<React.ReactElement> {
  const result = await getPublicHomepageDataAction();
  const data = result.data ?? {
    categories: [],
    featuredProducts: [],
    flashDeals: [],
    newArrivals: [],
    trendingProducts: [],
    brands: [],
    collections: [],
    blogPosts: [],
    siteSettings: { brandName: BRAND.publicName, tagline: BRAND.tagline },
    telemetry: { builtAt: new Date().toISOString(), buildDurationMs: 0 },
  };

  const { flashDeals, newArrivals, featuredProducts, categories } = data;

  // The first product section actually rendered gets LCP priority on its first row.
  const firstProductSection: "flash" | "new" | "featured" =
    flashDeals.length > 0 ? "flash" : newArrivals.length > 0 ? "new" : "featured";

  return (
    <>
      <HeroSection />
      <TrustSection />
      <CategoryShowcase categories={categories} />
      <FlashDealsSection products={flashDeals} priorityFirstRow={firstProductSection === "flash"} />
      <CampaignBannerSection />
      <NewArrivalsSection products={newArrivals} priorityFirstRow={firstProductSection === "new"} />
      <FeaturedProductsSection
        products={featuredProducts}
        priorityFirstRow={firstProductSection === "featured"}
      />
      <WhyChooseUsSection />
    </>
  );
}
