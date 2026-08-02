"use client";

import { useId, type FormEvent, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Grid3x3, LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type CatalogViewMode = "grid" | "compact" | "list";

export interface ShopToolbarProps {
  /** Real total from the server (PublicListResult.totalCount), not the page size. */
  totalCount: number;
  viewMode: CatalogViewMode;
  onViewChange: (mode: CatalogViewMode) => void;
  onMobileFilterToggle?: () => void;
  /** "relevance" on /search adds the relevance option and makes it the default. */
  defaultSort?: "newest" | "relevance";
  /** Hide the inline q-filter box (e.g. on /search which has its own input). */
  showSearchBox?: boolean;
}

const BASE_SORT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "newest", label: "নতুন আগে" },
  { value: "featured", label: "ফিচার্ড ও জনপ্রিয়" },
  { value: "price_asc", label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "discount_desc", label: "সর্বোচ্চ ডিসকাউন্ট" },
  { value: "best_selling", label: "বেস্ট সেলিং" },
  { value: "trending", label: "ট্রেন্ডিং" },
];

export function ShopToolbar({
  totalCount,
  viewMode,
  onViewChange,
  onMobileFilterToggle,
  defaultSort = "newest",
  showSearchBox = true,
}: ShopToolbarProps): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sortId = useId();
  const searchId = useId();

  const activeFilterCount = [
    searchParams.get("category"),
    searchParams.get("brand"),
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
    searchParams.get("inStock"),
    searchParams.get("onSale"),
    searchParams.get("isNew"),
  ].filter(Boolean).length;

  const sortOptions =
    defaultSort === "relevance"
      ? [{ value: "relevance", label: "প্রাসঙ্গিকতা" }, ...BASE_SORT_OPTIONS]
      : BASE_SORT_OPTIONS;

  const currentSort = searchParams.get("sort") ?? defaultSort;
  const currentQuery = searchParams.get("q") ?? "";

  const handleSortChange = (newSort: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const viewButtons: ReadonlyArray<{
    mode: CatalogViewMode;
    label: string;
    icon: ReactElement;
  }> = [
    { mode: "grid", label: "গ্রিড ভিউ", icon: <LayoutGrid className="h-4 w-4" aria-hidden /> },
    { mode: "compact", label: "কমপ্যাক্ট ভিউ", icon: <Grid3x3 className="h-4 w-4" aria-hidden /> },
    { mode: "list", label: "লিস্ট ভিউ", icon: <List className="h-4 w-4" aria-hidden /> },
  ];

  return (
    <div className="sticky top-14 lg:top-20 z-30 mb-4 lg:mb-6 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-3 sm:px-6 py-2.5 shadow-xs backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 sm:gap-3">
          {onMobileFilterToggle && (
            <button
              type="button"
              onClick={onMobileFilterToggle}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 focus-visible:outline-2 focus-visible:outline-amber-600 lg:hidden active:scale-95 touch-manipulation"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              <span>ফিল্টার</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950 px-1">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            মোট{" "}
            <span className="font-black text-slate-900 dark:text-slate-100 tabular-nums">
              {totalCount.toLocaleString("en-BD")}
            </span>{" "}
            টি প্রোডাক্ট
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {showSearchBox && (
            <form
              role="search"
              onSubmit={handleSearchSubmit}
              className="relative hidden sm:block w-44 lg:w-56"
            >
              <label htmlFor={searchId} className="sr-only">
                ক্যাটালগে প্রোডাক্ট খুঁজুন
              </label>
              <input
                id={searchId}
                key={currentQuery}
                type="search"
                name="q"
                defaultValue={currentQuery}
                placeholder="প্রোডাক্ট খুঁজুন..."
                className="h-9 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 pl-8 pr-3 text-xs font-bold text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500"
              />
              <Search
                className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400"
                aria-hidden
              />
            </form>
          )}

          <div className="flex items-center gap-1">
            <ArrowUpDown className="hidden h-3.5 w-3.5 text-amber-500 sm:inline" aria-hidden />
            <label htmlFor={sortId} className="sr-only">
              সাজানোর ক্রম
            </label>
            <select
              id={sortId}
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-9 cursor-pointer rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-black text-slate-900 dark:text-slate-100 shadow-2xs focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  সর্ট: {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 sm:flex">
            {viewButtons.map(({ mode, label, icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewChange(mode)}
                aria-label={label}
                aria-pressed={viewMode === mode}
                className={cn(
                  "rounded-lg p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-amber-600",
                  viewMode === mode
                    ? "bg-white dark:bg-slate-900 font-bold text-amber-600 dark:text-amber-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopToolbar;
