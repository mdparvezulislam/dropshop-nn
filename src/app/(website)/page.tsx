import {
  getPublicFeaturedProductsAction,
  getPublicTrendingProductsAction,
  getPublicNewArrivalsAction,
  getPublicFlashDealsAction,
  getPublicCategoriesAction,
} from "@/features/catalog/actions/public-actions";

import {
  HeroSection,
  TrustSection,
  CategoryShowcase,
  FlashDealsSection,
  CampaignBannerSection,
  NewArrivalsSection,
  WhyChooseUsSection,
  TestimonialsSection,
  NewsletterSection,
} from "@/components/website/sections";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DropshopNN - বাংলাদেশের বিশ্বস্ত ড্রপশিপিং ও হোলসেল প্ল্যাটফর্ম",
  description:
    "বাংলাদেশের সবচেয়ে বিশ্বস্ত প্রোডাক্ট সাপ্লাই প্ল্যাটফর্ম। রিসেলার, হোলসেলার এবং ড্রপশিপারদের জন্য অল-ইন-ওয়ান সমাধান।",
  openGraph: {
    title: "DropshopNN - Enterprise Commerce OS",
    description:
      "সোর্স করুন, বিক্রি করুন, ব্যবসা বাড়ান DropshopNN এর সাথে।",
    type: "website",
    locale: "en_BD",
  },
};

export default async function HomePage() {
  const [
    flashDealsRes,
    newArrivalsRes,
    categoriesRes,
  ] = await Promise.all([
    getPublicFlashDealsAction(5),
    getPublicNewArrivalsAction(6),
    getPublicCategoriesAction(),
  ]);

  return (
    <>
      {/* 1. Split Hero Section */}
      <HeroSection />

      {/* 2. Horizontal 5-Item Trust Bar */}
      <TrustSection />

      {/* 3. 8 Popular Category Showcase */}
      <CategoryShowcase categories={categoriesRes.data} />

      {/* 4. Flash Sale with Live Timer */}
      <FlashDealsSection products={flashDealsRes.data} />

      {/* 5. Dual Promotional Partner Banners */}
      <CampaignBannerSection />

      {/* 6. New Arrivals (6 Product Cards) */}
      <NewArrivalsSection products={newArrivalsRes.data} />

      {/* 7. Why Choose Us (5 Feature Cards) */}
      <WhyChooseUsSection />

      {/* 8. Merchant Testimonials */}
      <TestimonialsSection />

      {/* 9. Newsletter Subscription & Contact Actions */}
      <NewsletterSection />
    </>
  );
}
