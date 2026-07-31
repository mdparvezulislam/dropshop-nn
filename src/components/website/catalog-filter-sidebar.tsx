"use client";

import { useId, type FormEvent, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type {
  PublicBrandInfo,
  PublicCategoryInfo,
} from "@/features/catalog/domain/public-catalog-types";

export interface CatalogFilterSidebarProps {
  /** Real category list with product counts; null = the taxonomy fetch failed. */
  categories: PublicCategoryInfo[] | null;
  /** Real brand list with product counts; null = the taxonomy fetch failed. */
  brands: PublicBrandInfo[] | null;
}

const rowClass = (selected: boolean): string =>
  cn(
    "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-amber-600",
    selected
      ? "border border-amber-200 bg-amber-50 font-black text-amber-900"
      : "text-slate-800 hover:bg-slate-100",
  );

function TaxonomyError({ label }: { label: string }): ReactElement {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] font-bold text-red-700"
    >
      {label} লোড করা যায়নি। পেজটি রিলোড করে আবার চেষ্টা করুন।
    </p>
  );
}

export function CatalogFilterSidebar({
  categories,
  brands,
}: CatalogFilterSidebarProps): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const minPriceId = useId();
  const maxPriceId = useId();

  const selectedCategory = searchParams.get("category") ?? "";
  const selectedBrand = searchParams.get("brand") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStockOnly = searchParams.get("inStock") === "1";
  const onSaleOnly = searchParams.get("onSale") === "1";

  /** Applies param changes and always resets pagination back to page 1. */
  const updateParams = (changes: Record<string, string | null>): void => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handlePriceSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parse = (raw: FormDataEntryValue | null): string | null => {
      const n = Number(String(raw ?? "").trim());
      return Number.isFinite(n) && n > 0 ? String(n) : null;
    };
    updateParams({ minPrice: parse(form.get("minPrice")), maxPrice: parse(form.get("maxPrice")) });
  };

  const handleReset = (): void => {
    // Filters are cleared; an active search query (q) is intentionally kept.
    const q = searchParams.get("q");
    router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname);
  };

  return (
    <aside aria-label="প্রোডাক্ট ফিল্টার" className="w-full space-y-6">
      <div className="space-y-6 rounded-2xl border border-slate-300 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-amber-500" aria-hidden />
            <h3 className="text-sm font-black text-slate-900">ফিল্টার করুন</h3>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 rounded text-xs font-extrabold text-amber-700 hover:underline focus-visible:outline-2 focus-visible:outline-amber-600"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            রিসেট
          </button>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">ক্যাটাগরি</h4>
          {categories === null ? (
            <TaxonomyError label="ক্যাটাগরি" />
          ) : (
            <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => updateParams({ category: null })}
                aria-pressed={!selectedCategory}
                className={rowClass(!selectedCategory)}
              >
                <span>সকল ক্যাটাগরি</span>
                {!selectedCategory && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                )}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    updateParams({ category: selectedCategory === cat.slug ? null : cat.slug })
                  }
                  aria-pressed={selectedCategory === cat.slug}
                  className={rowClass(selectedCategory === cat.slug)}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-500 tabular-nums">
                      {cat.productCount}
                    </span>
                    {selectedCategory === cat.slug && (
                      <Check className="h-3.5 w-3.5 text-amber-600" aria-hidden />
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2.5 border-t border-slate-200 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
            দামের সীমা (৳ BDT)
          </h4>
          <form onSubmit={handlePriceSubmit} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor={minPriceId} className="sr-only">
                  সর্বনিম্ন দাম (টাকা)
                </label>
                <input
                  id={minPriceId}
                  name="minPrice"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="সর্বনিম্ন"
                  defaultValue={minPrice}
                  key={`min-${minPrice}`}
                  className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-2xs placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
                />
              </div>
              <div>
                <label htmlFor={maxPriceId} className="sr-only">
                  সর্বোচ্চ দাম (টাকা)
                </label>
                <input
                  id={maxPriceId}
                  name="maxPrice"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="সর্বোচ্চ"
                  defaultValue={maxPrice}
                  key={`max-${maxPrice}`}
                  className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-2xs placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="h-8 w-full rounded-xl bg-amber-500 text-xs font-extrabold text-slate-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              দাম প্রয়োগ করুন
            </button>
          </form>
        </div>

        <div className="space-y-2.5 border-t border-slate-200 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">ব্র্যান্ড</h4>
          {brands === null ? (
            <TaxonomyError label="ব্র্যান্ড" />
          ) : brands.length === 0 ? (
            <p className="text-[11px] font-bold text-slate-500">কোনো ব্র্যান্ড নেই</p>
          ) : (
            <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => updateParams({ brand: null })}
                aria-pressed={!selectedBrand}
                className={rowClass(!selectedBrand)}
              >
                <span>সকল ব্র্যান্ড</span>
                {!selectedBrand && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                )}
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => updateParams({ brand: selectedBrand === b.slug ? null : b.slug })}
                  aria-pressed={selectedBrand === b.slug}
                  className={rowClass(selectedBrand === b.slug)}
                >
                  <span className="truncate">{b.name}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-500 tabular-nums">
                      {b.productCount}
                    </span>
                    {selectedBrand === b.slug && (
                      <Check className="h-3.5 w-3.5 text-amber-600" aria-hidden />
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
            প্রাপ্যতা ও অফার
          </h4>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateParams({ inStock: e.target.checked ? "1" : null })}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              <span>শুধুমাত্র স্টকে থাকা প্রোডাক্ট</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 transition-colors">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => updateParams({ onSale: e.target.checked ? "1" : null })}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              <span>শুধুমাত্র ডিসকাউন্ট প্রোডাক্ট</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 transition-colors">
              <input
                type="checkbox"
                checked={searchParams.get("isNew") === "1"}
                onChange={(e) => updateParams({ isNew: e.target.checked ? "1" : null })}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus-visible:outline-2 focus-visible:outline-amber-600"
              />
              <span>নতুন অ্যারাইভাল (New Arrival)</span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default CatalogFilterSidebar;
