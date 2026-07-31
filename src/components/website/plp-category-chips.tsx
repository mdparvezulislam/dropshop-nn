"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { PublicCategoryInfo } from "@/features/catalog/domain/public-catalog-types";

export interface PlpCategoryChipsProps {
  categories: PublicCategoryInfo[] | null;
}

export function PlpCategoryChips({ categories }: PlpCategoryChipsProps): React.ReactElement | null {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!categories || categories.length === 0) return null;

  const currentCategory = searchParams.get("category") ?? "";
  const topCategories = categories.filter((c) => c.parentCategoryId === null);

  const handleCategorySelect = (slug: string | null): void => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      if (currentCategory === slug) {
        params.delete("category");
      } else {
        params.set("category", slug);
      }
    } else {
      params.delete("category");
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="mb-4 lg:hidden">
      <div className="flex items-center gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-1 px-0.5 -mx-1">
        {/* All Categories Chip */}
        <button
          type="button"
          onClick={() => handleCategorySelect(null)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 snap-start border transition-all touch-manipulation active:scale-95",
            !currentCategory
              ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-2xs"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400",
          )}
        >
          <Layers className="h-3.5 w-3.5" aria-hidden />
          <span>সকল ক্যাটাগরি</span>
        </button>

        {/* Top-level Category Chips */}
        {topCategories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.slug)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs shrink-0 snap-start border transition-all touch-manipulation active:scale-95",
                isActive
                  ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400 font-semibold",
              )}
            >
              <span>{cat.name}</span>
              <span
                className={cn(
                  "text-[10px] tabular-nums px-1.5 py-0.2 rounded-full",
                  isActive
                    ? "bg-slate-950/20 text-slate-950 font-black"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold",
                )}
              >
                {cat.productCount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PlpCategoryChips;
