"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { ProductCard } from "../product-card";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

interface FeaturedProductsSectionProps {
  products: PublicProductCard[];
  title?: string;
  description?: string;
  priorityFirstRow?: boolean;
}

const CATEGORY_FILTERS = ["সব", "গ্যাজেট", "হোম অ্যাপ্লায়েন্স", "স্মার্টওয়াচ"] as const;

// Curated sample featured products if DB entries are low
const MOCK_FEATURED_PRODUCTS: PublicProductCard[] = [
  {
    id: "featured-1",
    slug: "smart-touch-digital-air-fryer-5l",
    name: "স্মার্ট ডিজিটাল এয়ার ফ্রায়ার ৫ লিটার",
    image: "",
    price: 4800,
    comparePrice: 6500,
    discountPercent: 26,
    stockStatus: "in_stock",
    badges: ["featured"],
    isNew: false,
    isFlashSale: false,
    rating: 4.9,
    reviewCount: 64,
  },
  {
    id: "featured-2",
    slug: "heavy-duty-electric-meat-grinder",
    name: "হেভি ডিউটি ইলেকট্রিক মিট গ্রাইন্ডার",
    image: "",
    price: 2450,
    comparePrice: 3200,
    discountPercent: 23,
    stockStatus: "in_stock",
    badges: ["featured"],
    isNew: true,
    isFlashSale: false,
    rating: 4.8,
    reviewCount: 38,
  },
  {
    id: "featured-3",
    slug: "rechargeable-neck-fan-portable",
    name: "রিচার্জেবল পোর্টেবল নেক ফ্যান",
    image: "",
    price: 1150,
    comparePrice: 1600,
    discountPercent: 28,
    stockStatus: "in_stock",
    badges: ["featured"],
    isNew: false,
    isFlashSale: false,
    rating: 4.7,
    reviewCount: 92,
  },
  {
    id: "featured-4",
    slug: "automatic-water-dispenser-pump",
    name: "অটোমেটিক ওয়াটার ডিসপেনসার পাম্প",
    image: "",
    price: 650,
    comparePrice: 950,
    discountPercent: 31,
    stockStatus: "in_stock",
    badges: ["featured"],
    isNew: false,
    isFlashSale: false,
    rating: 4.6,
    reviewCount: 45,
  },
];

export function FeaturedProductsSection({
  products,
  title = "বাছাই করা প্রোডাক্ট",
  description = "আমাদের কোয়ালিটি চেকে সেরা রেটিং পাওয়া প্রোডাক্টসমূহ",
  priorityFirstRow = false,
}: FeaturedProductsSectionProps): React.ReactElement | null {
  const [activeFilter, setActiveFilter] = useState<string>("সব");
  const displayProducts = products;

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section
      className="py-6 sm:py-10 bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100"
      aria-labelledby="featured-products-heading"
    >
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        
        {/* Header with Title, Filter Pills, and View All */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Star className="h-5 w-5 fill-amber-500" aria-hidden />
              </div>
              <h2
                id="featured-products-heading"
                className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100"
              >
                {title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              {description}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto ws-scroll pb-1">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 ${
                  activeFilter === filter
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <Link
            href="/products?sort=featured"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 rounded shrink-0 self-end md:self-auto"
          >
            সব বাছাই করা দেখুন →
          </Link>
        </div>

        {/* Desktop 4 Columns | Mobile 2 Columns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {displayProducts.slice(0, 8).map((product, index) => (
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

export default FeaturedProductsSection;
