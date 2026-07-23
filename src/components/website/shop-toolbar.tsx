"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, Grid3x3, List, SlidersHorizontal, ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ShopToolbarProps {
  totalItems: number;
  viewMode: "grid" | "compact" | "list";
  onViewChange: (mode: "grid" | "compact" | "list") => void;
  onMobileFilterToggle?: () => void;
}

export function ShopToolbar({
  totalItems,
  viewMode,
  onViewChange,
  onMobileFilterToggle,
}: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";
  const currentQuery = searchParams.get("q") || "";

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="sticky top-18 lg:top-20 z-30 w-full bg-white/95 backdrop-blur-md border border-slate-300 shadow-xs py-3 px-4 sm:px-6 rounded-2xl mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filter Toggle & Total Count */}
        <div className="flex items-center gap-3">
          {onMobileFilterToggle && (
            <Button
              size="sm"
              variant="outline"
              onClick={onMobileFilterToggle}
              className="lg:hidden h-9 px-3 text-xs font-bold border-slate-300 text-slate-800 hover:bg-amber-50 hover:border-amber-400"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
              ফিল্টার
            </Button>
          )}

          <span className="text-xs font-bold text-slate-600">
            মোট <span className="text-slate-900 font-black">{totalItems}</span> টি প্রোডাক্ট পাওয়া গেছে
          </span>
        </div>

        {/* Right: Search + Sort Dropdown + View Switchers */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Quick Search */}
          <div className="relative hidden sm:block w-44 lg:w-56">
            <input
              type="text"
              defaultValue={currentQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="প্রোডাক্ট খুঁজুন..."
              className="w-full h-9 pl-8 pr-3 text-xs font-bold rounded-xl bg-slate-100 border border-slate-300 text-slate-900 placeholder:text-slate-500 outline-none focus:border-amber-500 transition-colors"
            />
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-amber-500 hidden sm:inline" />
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-9 px-3 text-xs font-black rounded-xl bg-white border border-slate-300 text-slate-900 outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
            >
              <option value="newest">সর্ট: নতুন আগমন</option>
              <option value="best_selling">সর্ট: বেস্ট সেলিং</option>
              <option value="rating">সর্ট: টপ রেটেড</option>
              <option value="price_asc">দাম: কম থেকে বেশি</option>
              <option value="price_desc">দাম: বেশি থেকে কম</option>
              <option value="discount">সর্বোচ্চ ডিসকাউন্ট</option>
            </select>
          </div>

          {/* View Modes */}
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-300">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === "grid" ? "bg-white text-amber-600 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
              )}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange("compact")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === "compact" ? "bg-white text-amber-600 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
              )}
              title="Compact Grid"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange("list")}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                viewMode === "list" ? "bg-white text-amber-600 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
              )}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopToolbar;
