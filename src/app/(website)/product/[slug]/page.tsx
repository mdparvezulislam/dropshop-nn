import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicProductBySlugAction } from "@/features/catalog/actions/public-actions";
import { ProductGallery } from "@/components/website/product-gallery";
import { ProductPagePanel } from "@/components/website/product-page-panel";
import { ProductDescription } from "@/components/website/product-description";
import { ProductSpecifications } from "@/components/website/product-specifications";
import { ReviewsSection } from "@/components/website/reviews-section";
import { RelatedProducts } from "@/components/website/related-products";
import { StickyPurchaseBar } from "@/components/website/sticky-purchase-bar";
import { MarketingKit } from "@/components/website/marketing-kit";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicProductBySlugAction(slug);

  if (!result.success || !result.data) {
    return { title: "Product Not Found - DropshopNN" };
  }

  const { product } = result.data;
  const featuredMedia = product.media?.find((m) => m.isFeatured);

  return {
    title: `${product.name} - DropshopNN`,
    description: product.shortDescription ?? `Shop ${product.name} on DropshopNN`,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: featuredMedia ? [{ url: featuredMedia.url }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription ?? undefined,
    },
    alternates: {
      canonical: `/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const result = await getPublicProductBySlugAction(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const { product, pricing, relatedProducts } = result.data;

  const galleryImages = product.media?.length
    ? product.media.map((m) => ({
        url: m.url,
        alt: m.altText ?? product.name,
        type: (m.type === "video" ? "video" : "image") as "image" | "video" | "model",
      }))
    : [{ url: "", alt: product.name }];

  const specifications =
    product.content?.specifications?.map((s) => ({
      key: s.key,
      value: s.value,
    })) ?? [];

  const variantGroups = product.variants?.length
    ? [
        {
          name: "Color",
          options: [
            ...new Set(
              product.variants.filter((v) => v.color).map((v) => v.color!),
            ),
          ].map((c) => ({ type: "color" as const, value: c, available: true })),
        },
        {
          name: "Size",
          options: [
            ...new Set(
              product.variants.filter((v) => v.size).map((v) => v.size!),
            ),
          ].map((s) => ({ type: "size" as const, value: s, available: true })),
        },
      ].filter((g) => g.options.length > 0)
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku,
    ...(pricing.retailPrice > 0 && {
      offers: {
        "@type": "Offer",
        price: pricing.retailPrice,
        priceCurrency: pricing.currency,
        availability: `https://schema.org/InStock`,
      },
    }),
    ...(product.media?.[0] && {
      image: product.media.map((m) => m.url),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div>
            <ProductGallery
              images={galleryImages}
              title={product.name}
            />
          </div>
          <div>
            <ProductPagePanel
              productId={product.id}
              name={product.name}
              brand={product.brandId}
              sku={product.sku}
              retailPrice={pricing.retailPrice}
              resellerPrice={pricing.resellerPrice}
              wholesalePrice={pricing.wholesalePrice}
              costPrice={pricing.costPrice}
              comparePrice={pricing.comparePrice}
              currency={pricing.currency}
              isNew={product.newArrival}
              isFlashSale={product.flashSale}
              variants={variantGroups}
              moq={pricing.moq}
            />
          </div>
        </div>

        <div className="max-w-4xl">
          <ProductDescription
            description={product.shortDescription}
            highlights={product.content?.highlights}
            features={product.content?.features}
            includedItems={product.content?.includedItems}
          />

          <ProductSpecifications specifications={specifications} />

          <MarketingKit productName={product.name} />

          <ReviewsSection
            rating={4.5}
            totalCount={0}
            reviews={[]}
          />
        </div>

        <RelatedProducts products={relatedProducts} />
      </div>

      <div data-purchase-end />
      <StickyPurchaseBar
        name={product.name}
        price={`${pricing.currency === "BDT" ? "৳" : "$"}${pricing.retailPrice.toLocaleString("en-BD", { minimumFractionDigits: 2 })}`}
        stockStatus="in_stock"
      />
    </>
  );
}
