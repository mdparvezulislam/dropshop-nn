"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductsCatalogClient } from "./products-catalog-client";
import { EmptySearch } from "./empty-search";
import type { ProductCardData } from "./product-card";

export interface SearchResultsContentProps {
  initialQuery: string;
  initialProducts: ProductCardData[];
  initialCursor: string | null;
  initialHasMore: boolean;
  initialTotal: number;
}

export function SearchResultsContent({
  initialQuery,
  initialProducts,
}: SearchResultsContentProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialQuery);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const mappedProducts: ProductCardData[] = initialProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.image || "",
    retailPrice: p.retailPrice,
    resellerPrice: p.resellerPrice,
    wholesalePrice: p.wholesalePrice,
    comparePrice: p.comparePrice,
    rating: p.rating ?? 4.8,
    reviewCount: p.reviewCount ?? 10,
    brand: p.brand,
    stockStatus: p.stockStatus as "in_stock" | "low_stock" | "out_of_stock",
    moq: p.moq,
    isNew: true,
  }));

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-xs font-black text-slate-700 hover:text-amber-600">
              <ArrowLeft className="h-4 w-4 mr-1" /> ফিরে যান
            </Button>
          </div>

          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="প্রোডাক্ট, ব্র্যান্ড বা কি-ওয়ার্ড খুঁজুন..."
              className="w-full h-10 pl-10 pr-4 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {initialQuery
              ? `"${initialQuery}" এর জন্য ${mappedProducts.length} টি প্রোডাক্ট পাওয়া গেছে`
              : "প্রোডাক্ট অনুসন্ধান"}
          </h1>
        </div>

        {/* Search Results Grid or Empty Search */}
        {!initialQuery || mappedProducts.length === 0 ? (
          <EmptySearch query={initialQuery} />
        ) : (
          <ProductsCatalogClient
            initialProducts={mappedProducts}
            categories={[]}
            brands={[]}
          />
        )}
      </div>
    </div>
  );
}

export default SearchResultsContent;
