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
  { value: "price_asc", label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "featured", label: "ফিচার্ড" },
  { value: "name_asc", label: "নাম: A-Z" },
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
    <div className="sticky top-18 lg:top-20 z-30 mb-6 w-full rounded-2xl border border-slate-300 bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onMobileFilterToggle && (
            <button
              type="button"
              onClick={onMobileFilterToggle}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-300 px-3 text-xs font-bold text-slate-800 transition-colors hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" aria-hidden />
              ফিল্টার
            </button>
          )}

          <span className="text-xs font-bold text-slate-600">
            মোট{" "}
            <span className="font-black text-slate-900 tabular-nums">
              {totalCount.toLocaleString("en-BD")}
            </span>{" "}
            টি প্রোডাক্ট
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {showSearchBox && (
            <form
              role="search"
              onSubmit={handleSearchSubmit}
              className="relative hidden w-44 sm:block lg:w-56"
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
                className="h-9 w-full rounded-xl border border-slate-300 bg-slate-100 pl-8 pr-3 text-xs font-bold text-slate-900 transition-colors placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
              />
              <Search
                className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500"
                aria-hidden
              />
            </form>
          )}

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="hidden h-3.5 w-3.5 text-amber-500 sm:inline" aria-hidden />
            <label htmlFor={sortId} className="sr-only">
              সাজানোর ক্রম
            </label>
            <select
              id={sortId}
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-9 cursor-pointer rounded-xl border border-slate-300 bg-white px-3 text-xs font-black text-slate-900 shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  সর্ট: {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden items-center gap-1 rounded-xl border border-slate-300 bg-slate-100 p-1 sm:flex">
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
                    ? "bg-white font-bold text-amber-600 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900",
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
