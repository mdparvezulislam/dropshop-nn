import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicProductBySlugAction } from "@/features/catalog/actions/public-actions";
import { ProductGallery } from "@/components/website/product-gallery";
import { ProductPagePanel } from "@/components/website/product-page-panel";
import { ProductTabsSection } from "@/components/website/product-tabs-section";
import { RelatedProducts } from "@/components/website/related-products";
import { StickyPurchaseBar } from "@/components/website/sticky-purchase-bar";

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
    title: `${product.name} - DropshopNN Bangladesh`,
    description: product.shortDescription ?? `বাংলাদেশে কিনুন ${product.name} সেরা পাইকারি ও রিসেলিং রেটে।`,
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: featuredMedia ? [{ url: featuredMedia.url }] : undefined,
      type: "website",
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
    : [{ url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80", alt: product.name }];

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
        price: (pricing.retailPrice / 100).toFixed(2),
        priceCurrency: pricing.currency,
        availability: `https://schema.org/InStock`,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs font-bold text-slate-600 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-amber-600 transition-colors">হোম</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-amber-600 transition-colors">ক্যাটালগ</Link>
          <span>/</span>
          <span className="text-slate-900 font-black truncate">{product.name}</span>
        </nav>

        {/* Gallery & Purchase Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
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

        {/* Product Tabs (Overview, Specs, Reviews, Q&A, Shipping, Wholesale) */}
        <ProductTabsSection
          description={product.shortDescription}
          highlights={product.content?.highlights}
          specifications={specifications}
        />

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts products={relatedProducts} />
        </div>
      </div>

      <StickyPurchaseBar
        name={product.name}
        price={`৳${(pricing.retailPrice / 100).toFixed(0)}`}
        stockStatus="in_stock"
      />
    </div>
  );
}
