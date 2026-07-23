"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { ProductCard, type ProductCardData } from "../product-card";

interface FlashDealsSectionProps {
  products: ProductCardData[];
}

const MOCK_FLASH_PRODUCTS: ProductCardData[] = [
  {
    id: "flash-1",
    name: "বোরো i12 TWS এয়ারবাডস",
    slug: "i12-tws-earbuds",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80",
    retailPrice: 47000,
    comparePrice: 65000,
    rating: 4.8,
    reviewCount: 120,
    stockStatus: "in_stock",
    isFlashSale: true,
  },
  {
    id: "flash-2",
    name: "রেমি ৩০০০০mAh পাওয়ার ব্যাংক",
    slug: "remi-30000mah-powerbank",
    image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=400&q=80",
    retailPrice: 145000,
    comparePrice: 170000,
    rating: 4.7,
    reviewCount: 95,
    stockStatus: "in_stock",
    isFlashSale: true,
  },
  {
    id: "flash-3",
    name: "হোলো স্মার্টওয়াচ X8",
    slug: "holo-smartwatch-x8",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
    retailPrice: 149000,
    comparePrice: 180000,
    rating: 4.9,
    reviewCount: 86,
    stockStatus: "in_stock",
    isFlashSale: true,
  },
  {
    id: "flash-4",
    name: "এক্সপ্রো P102 এয়ারবাডস স্পিকার",
    slug: "expro-p102-speaker",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80",
    retailPrice: 125000,
    comparePrice: 160000,
    rating: 4.6,
    reviewCount: 75,
    stockStatus: "in_stock",
    isFlashSale: true,
  },
  {
    id: "flash-5",
    name: "RGB LED স্ট্রিপ লাইট",
    slug: "rgb-led-strip-light",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=400&q=80",
    retailPrice: 65000,
    comparePrice: 95000,
    rating: 4.8,
    reviewCount: 64,
    stockStatus: "in_stock",
    isFlashSale: true,
  },
];

export function FlashDealsSection({ products }: FlashDealsSectionProps) {
  const displayProducts = products.length > 0 ? products.slice(0, 5) : MOCK_FLASH_PRODUCTS;

  return (
    <section className="py-12 lg:py-16 bg-white border-b border-slate-200" aria-label="Flash Deals">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-red-600">
              <Flame className="h-6 w-6 text-red-600 fill-red-600 animate-bounce" />
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                ফ্ল্যাশ সেল
              </h2>
            </div>

            {/* Countdown Timer Boxes matching reference */}
            <div className="flex items-center gap-1 text-xs font-black text-slate-800 ml-2">
              <span className="px-2 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-900">
                02 দিন
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-900">
                12 ঘন্টা
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-900">
                45 মিনিট
              </span>
              <span>:</span>
              <span className="px-2 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-900">
                30 সেকেন্ড
              </span>
            </div>
          </div>

          <Link
            href="/offers"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:text-amber-700 transition-colors"
          >
            সব ফ্ল্যাশ সেল দেখুন
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FlashDealsSection;
