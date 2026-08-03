import type { Metadata } from "next";
import { getPublicHomepageDataAction } from "@/features/storefront/actions/storefront-actions";
import { SITE_LOCALE } from "@/config/site";
import { BRAND } from "@/config/brand";

import {
  HeroSection,
  TrustSection,
  CategoryShowcase,
  FlashDealsSection,
  FeaturedProductsSection,
  NewArrivalsSection,
  TrendingProductsSection,
  BusinessSolutionsSection,
  TestimonialsSection,
  BrandSliderSection,
  FAQSection,
} from "@/components/website/sections";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `${BRAND.publicName} — অরিজিনাল প্রোডাক্ট শপ, রিটেইল ও হোলসেল প্ল্যাটফর্ম`,
  description:
    "অরিজিনাল গ্যাজেট ও লাইফস্টাইল প্রোডাক্ট শপিং করুন সেরা দামে। রিসেলার, রিটেইলার ও হোলসেলারদের জন্য নির্ভরযোগ্য প্রোডাক্ট সোর্সিং প্ল্যাটফর্ম। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।",
  keywords: [
    "NN Enterprise",
    "Online Shop",
    "Electronics Bangladesh",
    "Home Appliances",
    "Gadget Shop BD",
    "Reseller BD",
    "Wholesale Bangladesh",
    "Retail Supply BD",
  ],
  openGraph: {
    title: `${BRAND.publicName} — ${BRAND.tagline}`,
    description: `সোর্স করুন, কিনুন, ব্যবসা বাড়ান ${BRAND.publicName} এর সাথে।`,
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

  const { flashDeals, newArrivals, featuredProducts, trendingProducts, categories } = data;

  // The first product section actually rendered gets LCP priority on its first row.
  const firstProductSection: "flash" | "new" | "featured" =
    flashDeals.length > 0 ? "flash" : newArrivals.length > 0 ? "new" : "featured";

  return (
    <>
      {/* 1. Hero Banner */}
      <HeroSection />

      {/* 2. Trust Pillars Strip */}
      <TrustSection />

      {/* 3. Popular Categories Showcase */}
      <CategoryShowcase categories={categories} />

      {/* 4. Flash Sale Deals */}
      <FlashDealsSection products={flashDeals} priorityFirstRow={firstProductSection === "flash"} />

      {/* 5. Featured Products */}
      <FeaturedProductsSection
        products={featuredProducts}
        priorityFirstRow={firstProductSection === "featured"}
      />

      {/* 6. New Arrivals */}
      <NewArrivalsSection products={newArrivals} priorityFirstRow={firstProductSection === "new"} />

      {/* 7. Trending Products */}
      <TrendingProductsSection products={trendingProducts} />

      {/* 8. Merged Channel & Solutions Section */}
      <BusinessSolutionsSection />

      {/* 9. Customer Reviews & Testimonials */}
      <TestimonialsSection />

      {/* 10. Official Brand Partners */}
      <BrandSliderSection />

      {/* 11. Frequently Asked Questions (FAQ) */}
      <FAQSection />
    </>
  );
}
