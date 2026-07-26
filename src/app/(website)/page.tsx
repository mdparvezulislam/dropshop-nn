import type { Metadata } from "next";
import {
  getPublicFeaturedProductsAction,
  getPublicNewArrivalsAction,
  getPublicFlashDealsAction,
  getPublicCategoriesAction,
} from "@/features/catalog/actions/public-actions";
import { SITE_LOCALE } from "@/config/site";

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
    title: "DropshopNN — বাংলাদেশের অনলাইন শপ",
    description: "সোর্স করুন, বিক্রি করুন, ব্যবসা বাড়ান DropshopNN এর সাথে।",
    type: "website",
    locale: SITE_LOCALE,
  },
};

export default async function HomePage(): Promise<React.ReactElement> {
  const [flashDealsRes, newArrivalsRes, featuredRes, categoriesRes] = await Promise.all([
    getPublicFlashDealsAction(10),
    getPublicNewArrivalsAction(12),
    getPublicFeaturedProductsAction(8),
    getPublicCategoriesAction(),
  ]);

  // A failed fetch omits its section — no fake fallback data, ever.
  const flashDeals = flashDealsRes.success ? flashDealsRes.data : [];
  const newArrivals = newArrivalsRes.success ? newArrivalsRes.data : [];
  const featured = featuredRes.success ? featuredRes.data : [];
  const categories = categoriesRes.success ? categoriesRes.data : [];

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
        products={featured}
        priorityFirstRow={firstProductSection === "featured"}
      />
      <WhyChooseUsSection />
    </>
  );
}
