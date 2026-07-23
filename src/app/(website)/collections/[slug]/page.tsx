import Link from "next/link";
import { getPublicFeaturedProductsAction, getPublicTrendingProductsAction, getPublicFlashDealsAction } from "@/features/catalog/actions/public-actions";
import { ProductsCatalogClient } from "@/components/website/products-catalog-client";
import { ArrowLeft, Sparkles, Layers } from "lucide-react";
import type { ProductCardData } from "@/components/website/product-card";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const COLLECTION_TITLES: Record<string, { banglaTitle: string; subtitle: string }> = {
  "trending-now": { banglaTitle: "ট্রেন্ডিং সোর্সিং কালেকশন", subtitle: "বাংলাদেশে বর্তমানে সবচেয়ে জনপ্রিয় ও হাই-ডিমান্ড প্রোডাক্ট সমূহ" },
  "fast-charging-hub": { banglaTitle: "ফাস্ট চার্জিং হাব", subtitle: "হাই-স্পিড চার্জার, পাওয়ার ব্যাংক এবং গ্যাজেট এক্সেসরিজ" },
  "smart-home-essentials": { banglaTitle: "স্মার্ট হোম এসেনশিয়ালস", subtitle: "স্মার্ট সিকিউরিটি ক্যামেরা, সেন্সর এবং হোম অটোমেশন" },
  "audio-sound-pro": { banglaTitle: "অডিও & সাউন্ড প্রো", subtitle: "প্রিমিয়াম TWS এয়ারবাডস, ব্লুটুথ স্পিকার এবং সাউন্ড সিস্টেম" },
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const colInfo = COLLECTION_TITLES[slug] || { banglaTitle: slug.replace(/-/g, " "), subtitle: "বিশেষ প্রোডাক্ট কালেকশন" };

  return {
    title: `${colInfo.banglaTitle} - DropshopNN`,
    description: colInfo.subtitle,
  };
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let productsRes = await getPublicFeaturedProductsAction(16);
  if (slug === "trending-now") {
    productsRes = await getPublicTrendingProductsAction(16);
  } else if (slug === "fast-charging-hub") {
    productsRes = await getPublicFlashDealsAction(16);
  }

  const rawProducts = productsRes.data;
  const colInfo = COLLECTION_TITLES[slug] || { banglaTitle: slug.replace(/-/g, " "), subtitle: "বিশেষ প্রোডাক্ট কালেকশন" };

  const mappedProducts: ProductCardData[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.image || "",
    retailPrice: p.retailPrice,
    resellerPrice: p.resellerPrice,
    wholesalePrice: p.wholesalePrice,
    comparePrice: p.comparePrice,
    rating: p.rating ?? 4.8,
    reviewCount: p.reviewCount ?? 18,
    brand: p.brand,
    stockStatus: p.stockStatus as "in_stock" | "low_stock" | "out_of_stock",
    moq: p.moq,
    isNew: true,
  }));

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-foreground py-8">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <Link href="/collections" className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:underline mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> সকল কালেকশন
        </Link>

        {/* Collection Header Banner */}
        <div className="bg-white border border-border/80 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5" /> বিশেষ কালেকশন
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">{colInfo.banglaTitle}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
            {colInfo.subtitle}
          </p>
        </div>

        {/* Products Catalog Suite */}
        <ProductsCatalogClient
          initialProducts={mappedProducts}
          categories={[]}
          brands={[]}
        />
      </div>
    </div>
  );
}
