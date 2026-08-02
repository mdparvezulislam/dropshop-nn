import type { Metadata } from "next";
import { getPublicHomepageDataAction } from "@/features/storefront/actions/storefront-actions";
import { SITE_LOCALE } from "@/config/site";
import { BRAND } from "@/config/brand";

import {
  HeroSection,
  BusinessEntryCards,
  CategoryShowcase,
  FlashDealsSection,
  FeaturedProductsSection,
  NewArrivalsSection,
  TrendingProductsSection,
  BusinessSolutionsSection,
  WhyChooseUsSection,
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
      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Business Entry Cards */}
      <BusinessEntryCards />

      {/* 4. Popular Categories */}
      <CategoryShowcase categories={categories} />

      {/* 5. Flash Sale */}
      <FlashDealsSection products={flashDeals} priorityFirstRow={firstProductSection === "flash"} />

      {/* 6. Featured Products */}
      <FeaturedProductsSection
        products={featuredProducts}
        priorityFirstRow={firstProductSection === "featured"}
      />

      {/* 7. New Arrivals */}
      <NewArrivalsSection products={newArrivals} priorityFirstRow={firstProductSection === "new"} />

      {/* 8. Trending Products */}
      <TrendingProductsSection products={trendingProducts} />

      {/* 9. Business Solutions */}
      <BusinessSolutionsSection />

      {/* 10. Why NN Enterprise */}
      <WhyChooseUsSection />

      {/* 11. Customer Reviews */}
      <TestimonialsSection />

      {/* 12. Brand Partners */}
      <BrandSliderSection />

      {/* 13. FAQ */}
      <FAQSection />
    </>
  );
}
