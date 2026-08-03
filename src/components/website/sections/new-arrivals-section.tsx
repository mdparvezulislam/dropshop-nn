import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "../product-card";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

interface NewArrivalsSectionProps {
  products: PublicProductCard[];
  priorityFirstRow?: boolean;
}

// Curated sample new arrivals if DB entries are low
const MOCK_NEW_PRODUCTS: PublicProductCard[] = [
  {
    id: "new-1",
    slug: "ultra-thin-magnetic-power-bank",
    name: "আল্ট্রা থিন ম্যাগনেটিক পাওয়ার ব্যাংক ১০,০০০mAh",
    image: "",
    price: 1850,
    comparePrice: 2400,
    discountPercent: 23,
    stockStatus: "in_stock",
    badges: ["new_arrival"],
    isNew: true,
    isFlashSale: false,
    rating: 5.0,
    reviewCount: 12,
  },
  {
    id: "new-2",
    slug: "smart-rgb-ambient-desk-light",
    name: "স্মার্ট RGB অ্যাম্বিয়েন্ট ডেস্ক লাইট বার",
    image: "",
    price: 1350,
    comparePrice: 1900,
    discountPercent: 28,
    stockStatus: "in_stock",
    badges: ["new_arrival"],
    isNew: true,
    isFlashSale: false,
    rating: 4.9,
    reviewCount: 15,
  },
  {
    id: "new-3",
    slug: "electric-spin-scrubber-cleaning-brush",
    name: "ইলেকট্রিক স্পিন স্ক্রাবার ক্লিনিং ব্রাশ",
    image: "",
    price: 1750,
    comparePrice: 2300,
    discountPercent: 24,
    stockStatus: "in_stock",
    badges: ["new_arrival"],
    isNew: true,
    isFlashSale: false,
    rating: 4.8,
    reviewCount: 22,
  },
  {
    id: "new-4",
    slug: "hd-1080p-mini-action-camera",
    name: "HD ১০৮০p ওয়াটারপ্রুফ মিনি অ্যাকশন ক্যামেরা",
    image: "",
    price: 2950,
    comparePrice: 4200,
    discountPercent: 29,
    stockStatus: "in_stock",
    badges: ["new_arrival"],
    isNew: true,
    isFlashSale: false,
    rating: 4.7,
    reviewCount: 18,
  },
  {
    id: "new-5",
    slug: "foldable-laptop-stand-aluminum",
    name: "ফোল্ডিং অ্যালুমিনিয়াম ল্যাপটপ স্ট্যান্ড",
    image: "",
    price: 850,
    comparePrice: 1200,
    discountPercent: 29,
    stockStatus: "in_stock",
    badges: ["new_arrival"],
    isNew: true,
    isFlashSale: false,
    rating: 4.9,
    reviewCount: 40,
  },
  {
    id: "new-6",
    slug: "car-vacuum-cleaner-high-power",
    name: "হাই পাওয়ার পোর্টেবল কার ভ্যাকিউম ক্লিনার",
    image: "",
    price: 1290,
    comparePrice: 1800,
    discountPercent: 28,
    stockStatus: "in_stock",
    badges: ["new_arrival"],
    isNew: true,
    isFlashSale: false,
    rating: 4.8,
    reviewCount: 31,
  },
];

export function NewArrivalsSection({
  products,
  priorityFirstRow = false,
}: NewArrivalsSectionProps): React.ReactElement | null {
  const displayProducts = products.map((p) => ({ ...p, isNew: true }));

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section
      className="py-6 sm:py-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
      aria-labelledby="new-arrivals-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-5 w-5" aria-hidden />
              </div>
              <h2
                id="new-arrivals-heading"
                className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100"
              >
                নতুন অ্যারাইভাল (New Arrivals)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              গত ১৪ দিনে যুক্ত হওয়া লেটেস্ট গ্যাজেট ও প্রোডাক্টসমূহ
            </p>
          </div>

          <Link
            href="/products?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded"
          >
            সব নতুন প্রোডাক্ট দেখুন →
          </Link>
        </div>

        {/* 6 Column Desktop / 2 Column Mobile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {displayProducts.slice(0, 12).map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={priorityFirstRow && index < 4}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default NewArrivalsSection;
