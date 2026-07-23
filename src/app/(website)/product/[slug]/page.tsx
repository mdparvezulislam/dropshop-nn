import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublicProductBySlugAction } from "@/features/catalog/actions/public-actions";
import { ProductGallery } from "@/components/website/product-gallery";
import { ProductPagePanel } from "@/components/website/product-page-panel";
import { ProductTabsAndAccordions } from "@/components/website/product-tabs-and-accordions";
import { RelatedProducts } from "@/components/website/related-products";
import { generateProductJsonLd } from "@/lib/seo/json-ld-generator";

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
  const featuredMedia = product.media?.find((m) => m.isFeatured) || product.media?.[0];

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

export default async function PublicProductDetailsPage({ params }: ProductPageProps) {
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
        isFeatured: m.isFeatured || false,
      }))
    : [
        {
          url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
          alt: product.name,
          isFeatured: true,
        },
      ];

  const specifications =
    product.specifications?.map((s) => ({
      key: s.key,
      value: s.value,
      group: s.group || "general",
    })) ??
    product.content?.specifications?.map((s) => ({
      key: s.key,
      value: s.value,
      group: s.group || "general",
    })) ??
    [];

  const jsonLd = generateProductJsonLd(product, pricing.retailPrice, pricing.currency);

  return (
    <div data-layout="public" className="min-h-screen bg-slate-50 text-slate-900 py-6 pb-24 md:pb-12">
      {/* Google SEO Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-xs font-bold text-slate-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-red-600 transition-colors">হোম</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-red-600 transition-colors">ক্যাটালগ</Link>
          <span>/</span>
          <span className="text-slate-900 font-black truncate">{product.name}</span>
        </nav>

        {/* Hero Section: Gallery (Left) & Details Panel (Right) */}
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
              shortDescription={product.shortDescription}
              notice={product.notice}
              warehouseLocation="DHAKA-CENTRAL-WH1"
              retailPrice={pricing.retailPrice}
              resellerPrice={pricing.resellerPrice}
              wholesalePrice={pricing.wholesalePrice}
              costPrice={pricing.costPrice}
              comparePrice={pricing.comparePrice}
              currency={pricing.currency}
              isNew={product.newArrival}
              isFlashSale={product.flashSale}
              variants={product.variants as any}
              images={galleryImages}
              moq={pricing.moq}
            />
          </div>
        </div>

        {/* Specifications & Overview Section (Mobile Accordions + Desktop Tabs) */}
        <ProductTabsAndAccordions
          description={product.description || product.shortDescription}
          highlights={product.content?.highlights}
          specifications={specifications}
          notice={product.notice}
        />

        {/* Related Products Slider */}
        <div className="mt-12">
          <RelatedProducts products={relatedProducts} />
        </div>
      </div>
    </div>
  );
}
