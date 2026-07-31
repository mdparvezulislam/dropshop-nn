import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Play } from "lucide-react";
import { getPublicProductBySlugAction } from "@/features/catalog/actions/public-actions";
import { ProductHero, type ProductHeroData } from "@/components/website/product-hero";
import { ProductTabsAndAccordions } from "@/components/website/product-tabs-and-accordions";
import { RelatedSection, RelatedSectionSkeleton } from "@/components/website/related-section";
import { RecentlyViewed } from "@/components/website/recently-viewed";
import {
  ProductReviewsSection,
  ProductReviewsSkeleton,
} from "@/components/website/reviews/product-reviews-section";
import { generateBreadcrumbJsonLd, generateProductJsonLd } from "@/lib/seo/json-ld-generator";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";

function getYoutubeEmbedUrl(raw?: string): string | null {
  if (!raw || typeof raw !== "string" || !raw.trim()) return null;
  const trimmed = raw.trim();

  // If raw is an embed iframe snippet
  const iframeMatch = trimmed.match(/src=["'](https?:\/\/[^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }

  // Extract YouTube 11-character video ID
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return null;
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicProductBySlugAction(slug);

  if (!result.success || !result.data) {
    return { title: "প্রোডাক্ট পাওয়া যায়নি", robots: { index: false } };
  }

  const { product, brandName } = result.data;
  const featuredMedia = product.media?.find((m) => m.isFeatured) || product.media?.[0];
  const description =
    product.metaDescription || product.shortDescription || `${product.name} — NN Enterprise বাংলাদেশ।`;
  // Stored SEO overrides (Product Studio SEO tab / parser) win over derived values.
  const seo = product.seo;
  const ogImage = seo?.ogImage || featuredMedia?.url;

  return {
    title: product.metaTitle || product.name,
    description,
    keywords: seo?.metaKeywords,
    openGraph: {
      title: seo?.ogTitle || product.name,
      description: seo?.ogDescription || description,
      images: ogImage ? [{ url: ogImage, alt: product.name }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle || product.name,
      description: seo?.twitterDescription || description,
      images: seo?.twitterImage ? [seo.twitterImage] : ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: `/product/${product.slug}`,
    },
    other: brandName ? { "product:brand": brandName } : undefined,
  };
}

export default async function PublicProductDetailsPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const result = await getPublicProductBySlugAction(slug);

  if (!result.success) {
    throw new Error(result.error);
  }
  if (!result.data) {
    notFound();
  }

  const {
    product,
    pricing,
    brandName,
    brandSlug,
    categoryName,
    categorySlug,
    stockStatus,
    stockTotal,
  } = result.data;

  // Real rating only: `count === 0` means the hero renders no stars at all.
  // Comes with the detail payload, so no extra query is issued here.
  const rating = result.data.rating.count > 0 ? result.data.rating : undefined;

  const media = [...(product.media ?? [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => ({
      url: m.url,
      alt: m.altText ?? product.name,
      type: (m.type === "video" ? "video" : "image") as "image" | "video",
      isFeatured: m.isFeatured || false,
    }));

  // Parser-generated features + highlights, merged, deduplicated, empties dropped.
  const features = [
    ...new Set([...(product.content?.features ?? []), ...(product.content?.highlights ?? [])]),
  ].filter((f) => Boolean(f?.trim()));

  // Empty rows are hidden — a spec with no value is not information.
  const specifications =
    product.specifications
      ?.filter((s) => Boolean(s.key?.trim()) && Boolean(s.value?.trim()))
      .map((s) => ({
        key: s.key,
        value: s.value,
        group: s.group || "general",
      })) ?? [];

  const heroData: ProductHeroData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    productModel: product.productModel,
    shortDescription: product.shortDescription,
    notice: product.notice,
    isNew: product.newArrival ?? false,
    isFlashSale: product.flashSale ?? false,
    brandName,
    brandSlug,
    categoryName,
    categorySlug,
    media,
    variants: (product.variants ?? []).filter((v) => v.isActive !== false),
    warranty: product.content?.warrantyInformation,
    highlights: features,
    rating,
  };

  const breadcrumbItems = [
    { name: "হোম", href: "/" },
    ...(categoryName && categorySlug
      ? [{ name: categoryName, href: `/category/${categorySlug}` }]
      : [{ name: "ক্যাটালগ", href: "/products" }]),
    { name: product.name, href: `/product/${product.slug}` },
  ];

  const displayPrice = pricing.campaignPrice ?? pricing.retailPrice;
  const productJsonLd = generateProductJsonLd({
    product,
    price: displayPrice,
    comparePrice: pricing.comparePrice,
    currency: pricing.currency,
    brandName,
    inStock: stockStatus !== "out_of_stock",
    // Emitted only when real published reviews exist (see generator).
    rating,
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  const featuredImage = media.find((m) => m.isFeatured)?.url ?? media[0]?.url ?? "";
  const rawVideoUrl = product.videoUrl || (product.content as Record<string, unknown> | undefined)?.videoUrl;
  const youtubeEmbedUrl = getYoutubeEmbedUrl(typeof rawVideoUrl === "string" ? rawVideoUrl : undefined);

  return (
    <div
      data-layout="public"
      // Mobile: minimal chrome and room for the sticky purchase bar (which is
      // ~124px tall plus the iOS home-indicator inset).
      className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-2 sm:py-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-12"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs font-bold text-slate-500 flex items-center gap-2 flex-wrap"
        >
          {breadcrumbItems.slice(0, -1).map((item) => (
            <span key={item.href} className="flex items-center gap-2">
              <Link
                href={item.href}
                className="hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
              >
                {item.name}
              </Link>
              <span aria-hidden>/</span>
            </span>
          ))}
          <span className="text-slate-900 font-black truncate max-w-60" aria-current="page">
            {product.name}
          </span>
        </nav>

        {/* Hero: gallery + info + purchase */}
        <ProductHero
          data={heroData}
          pricing={pricing}
          stockStatus={stockStatus}
          stockTotal={stockTotal}
        />

        {/* Description / specs / features / warranty / notice / tags */}
        <ProductTabsAndAccordions
          description={product.description}
          specifications={specifications}
          features={features}
          notice={product.notice}
          warranty={product.content?.warrantyInformation}
          returnPolicy={product.content?.returnPolicy}
          tags={product.tags ?? []}
        />

        {/* YouTube Video Section — rendered ONLY when valid videoUrl exists */}
        {youtubeEmbedUrl && (
          <section className="mt-5 sm:mt-8 bg-white -mx-3 sm:mx-0 border-y sm:border border-slate-200 rounded-none sm:rounded-3xl p-4 sm:p-6 sm:shadow-xs text-slate-900 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="p-1 rounded-lg bg-red-100 flex items-center justify-center">
                <Play className="w-4 h-4 text-red-600 fill-red-600 shrink-0" aria-hidden />
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900">ভিডিও রিভিউ / পণ্য প্রদর্শনী</h2>
            </div>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 shadow-inner">
              <iframe
                src={youtubeEmbedUrl}
                title={`${product.name} ভিডিও`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </section>
        )}

        {/* Verified-purchase ratings & reviews — streamed */}
        <Suspense fallback={<ProductReviewsSkeleton />}>
          <ProductReviewsSection
            productId={product.id}
            productSlug={product.slug}
            searchParams={searchParams}
          />
        </Suspense>

        {/* Related rails — streamed */}
        <Suspense fallback={<RelatedSectionSkeleton />}>
          <RelatedSection
            slug={product.slug}
            categoryName={categoryName}
            categorySlug={categorySlug}
            brandName={brandName}
            brandSlug={brandSlug}
          />
        </Suspense>

        {/* Recently viewed (client, local history of real products) */}
        <RecentlyViewed
          current={{
            slug: product.slug,
            name: product.name,
            image: featuredImage || PRODUCT_IMAGE_PLACEHOLDER,
            price: displayPrice,
          }}
        />
      </div>
    </div>
  );
}
