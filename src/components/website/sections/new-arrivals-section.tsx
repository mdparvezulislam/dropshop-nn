"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard, type ProductCardData } from "../product-card";

interface NewArrivalsSectionProps {
  products: ProductCardData[];
}

const MOCK_NEW_PRODUCTS: ProductCardData[] = [
  {
    id: "new-1",
    name: "ড্রোন 4K ক্যামেরা সহ",
    slug: "drone-4k-camera",
    image:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80",
    retailPrice: 375000,
    rating: 4.8,
    reviewCount: 45,
    stockStatus: "in_stock",
    isNew: true,
  },
  {
    id: "new-2",
    name: "স্মার্ট ক্যামেরা 1080P",
    slug: "smart-camera-1080p",
    image:
      "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=400&q=80",
    retailPrice: 215000,
    rating: 4.9,
    reviewCount: 38,
    stockStatus: "in_stock",
    isNew: true,
  },
  {
    id: "new-3",
    name: "ওয়ারলেস মাউস RGB",
    slug: "wireless-mouse-rgb",
    image:
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80",
    retailPrice: 65000,
    rating: 4.7,
    reviewCount: 55,
    stockStatus: "in_stock",
    isNew: true,
  },
  {
    id: "new-4",
    name: "গেমিং কীবোর্ড মেকানিক্যাল",
    slug: "gaming-keyboard-mechanical",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80",
    retailPrice: 145000,
    rating: 4.8,
    reviewCount: 42,
    stockStatus: "in_stock",
    isNew: true,
  },
  {
    id: "new-5",
    name: "টাইপ-সি ফাস্ট চার্জার",
    slug: "type-c-fast-charger",
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80",
    retailPrice: 35000,
    rating: 4.9,
    reviewCount: 85,
    stockStatus: "in_stock",
    isNew: true,
  },
  {
    id: "new-6",
    name: "ভার্চুয়াল রিয়েলিটি গ্লাস",
    slug: "virtual-reality-glass",
    image:
      "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=400&q=80",
    retailPrice: 45000,
    rating: 4.6,
    reviewCount: 50,
    stockStatus: "in_stock",
    isNew: true,
  },
];

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  const displayProducts = products.length > 0 ? products.slice(0, 6) : MOCK_NEW_PRODUCTS;

  return (
    <section
      className="py-12 lg:py-16 bg-white border-b border-slate-200"
      aria-label="New Arrivals"
    >
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              নতুন আগমন
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
              সেরা নতুন প্রোডাক্ট সমূহ
            </p>
          </div>

          <Link
            href="/products?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 hover:text-amber-700 transition-colors"
          >
            সব দেখুন
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NewArrivalsSection;
