"use client";

import type { ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X, RotateCcw, Filter } from "lucide-react";
import type {
  PublicBrandInfo,
  PublicCategoryInfo,
} from "@/features/catalog/domain/public-catalog-types";

interface AppliedFilterChipsProps {
  categories: PublicCategoryInfo[] | null;
  brands: PublicBrandInfo[] | null;
  resetHref?: string;
}

export function AppliedFilterChips({
  categories,
  brands,
  resetHref = "/products",
}: AppliedFilterChipsProps): ReactElement | null {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategorySlug = searchParams.get("category");
  const currentBrandSlug = searchParams.get("brand");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock") === "1";
  const onSale = searchParams.get("onSale") === "1";
  const isNew = searchParams.get("isNew") === "1";
  const rating = searchParams.get("rating");
  const searchQuery = searchParams.get("q");

  const categoryName = currentCategorySlug
    ? categories?.find((c) => c.slug === currentCategorySlug)?.name ?? currentCategorySlug
    : null;

  const brandName = currentBrandSlug
    ? brands?.find((b) => b.slug === currentBrandSlug)?.name ?? currentBrandSlug
    : null;

  const removeParam = (key: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const removePriceParams = (): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const resetAllFilters = (): void => {
    router.push(resetHref);
  };

  const hasActiveFilters =
    Boolean(categoryName) ||
    Boolean(brandName) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStock ||
    onSale ||
    isNew ||
    Boolean(rating) ||
    Boolean(searchQuery);

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 p-3 text-xs">
      <div className="flex items-center gap-1 font-black text-amber-700 dark:text-amber-400 mr-1">
        <Filter className="h-3.5 w-3.5" aria-hidden />
        <span>সক্রিয় ফিল্টার:</span>
      </div>

      {searchQuery && (
        <span className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
          <span>অনুসন্ধান: &ldquo;{searchQuery}&rdquo;</span>
          <button
            type="button"
            onClick={() => removeParam("q")}
            className="hover:text-red-500 rounded p-0.5"
            aria-label="অনুসন্ধান ফিল্টার মুছুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}

      {categoryName && (
        <span className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
          <span>ক্যাটাগরি: {categoryName}</span>
          <button
            type="button"
            onClick={() => removeParam("category")}
            className="hover:text-red-500 rounded p-0.5"
            aria-label="ক্যাটাগরি ফিল্টার মুছুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}

      {brandName && (
        <span className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
          <span>ব্র্যান্ড: {brandName}</span>
          <button
            type="button"
            onClick={() => removeParam("brand")}
            className="hover:text-red-500 rounded p-0.5"
            aria-label="ব্র্যান্ড ফিল্টার মুছুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}

      {(minPrice || maxPrice) && (
        <span className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
          <span>
            দাম: {minPrice ? `৳${minPrice}` : "৳০"} - {maxPrice ? `৳${maxPrice}` : "সর্বোচ্চ"}
          </span>
          <button
            type="button"
            onClick={removePriceParams}
            className="hover:text-red-500 rounded p-0.5"
            aria-label="দামের ফিল্টার মুছুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}

      {inStock && (
        <span className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
          <span>শুধুমাত্র স্টক</span>
          <button
            type="button"
            onClick={() => removeParam("inStock")}
            className="hover:text-red-500 rounded p-0.5"
            aria-label="স্টক ফিল্টার মুছুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}

      {onSale && (
        <span className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
          <span>ডিসকাউন্ট অফার</span>
          <button
            type="button"
            onClick={() => removeParam("onSale")}
            className="hover:text-red-500 rounded p-0.5"
            aria-label="ডিসকাউন্ট ফিল্টার মুছুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}

      {isNew && (
        <span className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
          <span>নতুন অ্যারাইভাল</span>
          <button
            type="button"
            onClick={() => removeParam("isNew")}
            className="hover:text-red-500 rounded p-0.5"
            aria-label="নতুন অ্যারাইভাল ফিল্টার মুছুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}

      {rating && (
        <span className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
          <span>রেটিং: ⭐ {rating}+ স্টার</span>
          <button
            type="button"
            onClick={() => removeParam("rating")}
            className="hover:text-red-500 rounded p-0.5"
            aria-label="রেটিং ফিল্টার মুছুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}

      <button
        type="button"
        onClick={resetAllFilters}
        className="ml-auto inline-flex items-center gap-1 text-xs font-black text-amber-700 dark:text-amber-400 hover:underline"
      >
        <RotateCcw className="h-3 w-3" />
        সব ফিল্টার রিসেট
      </button>
    </div>
  );
}

export default AppliedFilterChips;
