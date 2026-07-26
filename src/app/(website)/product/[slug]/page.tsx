import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicProductBySlugAction } from "@/features/catalog/actions/public-actions";
import { ProductHero, type ProductHeroData } from "@/components/website/product-hero";
import { ProductTabsAndAccordions } from "@/components/website/product-tabs-and-accordions";
import { RelatedSection, RelatedSectionSkeleton } from "@/components/website/related-section";
import { RecentlyViewed } from "@/components/website/recently-viewed";
import { generateBreadcrumbJsonLd, generateProductJsonLd } from "@/lib/seo/json-ld-generator";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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
    product.metaDescription || product.shortDescription || `${product.name} — DropshopNN বাংলাদেশ।`;
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

export default async function PublicProductDetailsPage({ params }: ProductPageProps) {
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

  const media = [...(product.media ?? [])]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m) => ({
      url: m.url,
      alt: m.altText ?? product.name,
      type: (m.type === "video" ? "video" : "image") as "image" | "video",
      isFeatured: m.isFeatured || false,
    }));

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
  };

  // Empty rows are hidden — a spec with no value is not information.
  const specifications =
    product.specifications
      ?.filter((s) => Boolean(s.key?.trim()) && Boolean(s.value?.trim()))
      .map((s) => ({
        key: s.key,
        value: s.value,
        group: s.group || "general",
      })) ?? [];

  // Parser-generated features + highlights, merged, deduplicated, empties dropped.
  const features = [
    ...new Set([...(product.content?.features ?? []), ...(product.content?.highlights ?? [])]),
  ].filter((f) => Boolean(f?.trim()));

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
  });
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  const featuredImage = media.find((m) => m.isFeatured)?.url ?? media[0]?.url ?? "";

  return (
    <div
      data-layout="public"
      className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-6 pb-28 md:pb-12"
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

      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 space-y-10">
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
