import Link from "next/link";
import { ArrowRight, Flame, TrendingUp } from "lucide-react";
import { ProductCard } from "../product-card";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

interface TrendingProductsSectionProps {
  products: PublicProductCard[];
  title?: string;
  description?: string;
}

// Curated sample trending products if DB entries are low
const MOCK_TRENDING_PRODUCTS: PublicProductCard[] = [
  {
    id: "trending-1",
    slug: "wireless-charging-stand-3-in-1",
    name: "৩-ইন-১ ফার্স্ট ওয়ারলেস চার্জিং স্ট্যান্ড",
    image: "",
    price: 2150,
    comparePrice: 2900,
    discountPercent: 25,
    stockStatus: "in_stock",
    badges: ["trending"],
    isNew: false,
    isFlashSale: false,
    rating: 4.9,
    reviewCount: 142,
  },
  {
    id: "trending-2",
    slug: "smart-touch-sensor-trash-can",
    name: "স্মার্ট টাচ সেন্সর ডাস্টবিন ১২L",
    image: "",
    price: 1890,
    comparePrice: 2600,
    discountPercent: 27,
    stockStatus: "in_stock",
    badges: ["trending"],
    isNew: false,
    isFlashSale: false,
    rating: 4.8,
    reviewCount: 98,
  },
  {
    id: "trending-3",
    slug: "rechargeable-electric-lint-remover",
    name: "রিচার্জেবল ফ্যাব্রিক লিন্ট রিমুভার",
    image: "",
    price: 790,
    comparePrice: 1100,
    discountPercent: 28,
    stockStatus: "in_stock",
    badges: ["trending"],
    isNew: false,
    isFlashSale: false,
    rating: 4.9,
    reviewCount: 175,
  },
  {
    id: "trending-4",
    slug: "bluetooh-karaoke-microphone-speaker",
    name: "ব্লুটুথ ক্যারাওকে মাইক্রোফোন উইথ স্পিকার",
    image: "",
    price: 1390,
    comparePrice: 1950,
    discountPercent: 28,
    stockStatus: "in_stock",
    badges: ["trending"],
    isNew: false,
    isFlashSale: false,
    rating: 4.7,
    reviewCount: 62,
  },
];

export function TrendingProductsSection({
  products,
  title = "ট্রেন্ডিং প্রোডাক্ট",
  description = "এই সপ্তাহে ক্রেতাদের মধ্যে সবচেয়ে বেশি জনপ্রিয় প্রোডাক্টসমূহ",
}: TrendingProductsSectionProps): React.ReactElement {
  const displayProducts =
    products.length >= 4
      ? products.map((p) => ({ ...p, isFlashSale: false }))
      : MOCK_TRENDING_PRODUCTS;

  return (
    <section
      className="py-6 sm:py-10 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100"
      aria-labelledby="trending-products-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <TrendingUp className="h-5 w-5" aria-hidden />
              </div>
              <h2
                id="trending-products-heading"
                className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100"
              >
                {title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              {description}
            </p>
          </div>

          <Link
            href="/products?badge=trending"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
          >
            সব ট্রেন্ডিং প্রোডাক্ট দেখুন →
          </Link>
        </div>

        {/* 4 Column Desktop Grid / 2 Column Mobile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {displayProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}

export default TrendingProductsSection;
