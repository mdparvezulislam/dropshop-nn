import {
  getPublicFeaturedProductsAction,
  getPublicTrendingProductsAction,
  getPublicNewArrivalsAction,
  getPublicFlashDealsAction,
  getPublicBrandsAction,
  getPublicCategoriesAction,
} from "@/features/catalog/actions/public-actions";
import { listPublicBlogAction } from "@/features/cms/actions/content-actions";
import type { CmsContent } from "@/features/cms/domain/content-entity";
import type { PaginatedResult } from "@/types";

import { HeroSection } from "@/components/website/sections/hero-section";
import { CategoryShowcase } from "@/components/website/sections/category-showcase";
import { FeaturedProductsSection } from "@/components/website/sections/featured-products-section";
import { TrendingProductsSection } from "@/components/website/sections/trending-products-section";
import { NewArrivalsSection } from "@/components/website/sections/new-arrivals-section";
import { FlashDealsSection } from "@/components/website/sections/flash-deals-section";
import { BrandSlider } from "@/components/website/sections/brand-slider";
import { WhyChooseUs } from "@/components/website/sections/why-choose-us";
import { HowItWorks } from "@/components/website/sections/how-it-works";
import { RoleHighlights } from "@/components/website/sections/role-highlights";
import { TestimonialsSection } from "@/components/website/sections/testimonials-section";
import {
  LatestBlogsSection,
  mapCmsPostToBlogCard,
} from "@/components/website/sections/latest-blogs-section";
import { NewsletterSection } from "@/components/website/sections/newsletter-section";
import { FooterCta } from "@/components/website/sections/footer-cta";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DropshopNN - Enterprise Commerce Operating System for Bangladesh",
  description:
    "Premium dropshipping platform for retailers, resellers, and wholesalers across Bangladesh. Source, sell, and scale with automated fulfillment.",
  openGraph: {
    title: "DropshopNN - Enterprise Commerce OS",
    description:
      "Source, sell, and scale across Bangladesh with automated dropshipping.",
    type: "website",
    locale: "en_BD",
  },
};

export default async function HomePage() {
  const [
    featuredRes,
    trendingRes,
    newArrivalsRes,
    flashDealsRes,
    brandsRes,
    categoriesRes,
    blogRes,
  ] = await Promise.all([
    getPublicFeaturedProductsAction(8),
    getPublicTrendingProductsAction(8),
    getPublicNewArrivalsAction(8),
    getPublicFlashDealsAction(6),
    getPublicBrandsAction(),
    getPublicCategoriesAction(),
    listPublicBlogAction({ page: 1, limit: 3 }),
  ]);

  const blogData = (blogRes.success ? blogRes.data : null) as PaginatedResult<CmsContent> | null;
  const blogPosts = (blogData?.items ?? []).map(mapCmsPostToBlogCard);

  return (
    <>
      <HeroSection />
      <CategoryShowcase categories={categoriesRes.data} />
      <FeaturedProductsSection products={featuredRes.data} />
      <TrendingProductsSection products={trendingRes.data} />
      <NewArrivalsSection products={newArrivalsRes.data} />
      <FlashDealsSection products={flashDealsRes.data} />
      <BrandSlider brands={brandsRes.data} />
      <WhyChooseUs />
      <HowItWorks />
      <RoleHighlights />
      <TestimonialsSection />
      <LatestBlogsSection posts={blogPosts} />
      <NewsletterSection />
      <FooterCta />
    </>
  );
}
