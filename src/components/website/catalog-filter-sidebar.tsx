"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, RotateCcw, Check, Store, Building2 } from "lucide-react";
import type { Category, Brand } from "@/features/catalog/domain/classification-entity";

interface CatalogFilterSidebarProps {
  categories?: Category[];
  brands?: Brand[];
}

export function CatalogFilterSidebar({ categories = [], brands = [] }: CatalogFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get("category") || "";
  const selectedBrand = searchParams.get("brand") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStockOnly = searchParams.get("stockStatus") === "in_stock";
  const wholesaleOnly = searchParams.get("wholesaleOnly") === "true";
  const resellerFriendly = searchParams.get("resellerFriendly") === "true";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    router.push(pathname);
  };

  return (
    <aside className="w-full space-y-6">
      <div className="rounded-2xl bg-white border border-slate-300 p-5 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-black text-slate-900">ফিল্টার করুন</h3>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-extrabold text-amber-600 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            রিসেট
          </button>
        </div>

        {/* Categories Filter */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">ক্যাটাগরি</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => updateParam("category", null)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-colors ${
                !selectedCategory
                  ? "bg-amber-50 text-amber-900 border border-amber-200 font-black"
                  : "text-slate-800 hover:bg-slate-100"
              }`}
            >
              <span>সকল ক্যাটাগরি</span>
              {!selectedCategory && <Check className="h-3.5 w-3.5 text-amber-600" />}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateParam("category", cat.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-amber-50 text-amber-900 border border-amber-200 font-black"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {selectedCategory === cat.id && (
                  <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* BDT Price Range */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
            দাম এর সীমা (৳ BDT)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="সর্বনিম্ন"
              defaultValue={minPrice}
              onBlur={(e) => updateParam("minPrice", e.target.value || null)}
              className="h-9 px-3 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 outline-none focus:border-amber-500 shadow-2xs"
            />
            <input
              type="number"
              placeholder="সর্বোচ্চ"
              defaultValue={maxPrice}
              onBlur={(e) => updateParam("maxPrice", e.target.value || null)}
              className="h-9 px-3 text-xs font-bold rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-500 outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Brands Filter */}
        {brands.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
              ব্র্যান্ড
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => updateParam("brand", null)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-colors ${
                  !selectedBrand
                    ? "bg-amber-50 text-amber-900 border border-amber-200 font-black"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span>সকল ব্র্যান্ড</span>
                {!selectedBrand && <Check className="h-3.5 w-3.5 text-amber-600" />}
              </button>
              {brands.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => updateParam("brand", b.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-colors ${
                    selectedBrand === b.id
                      ? "bg-amber-50 text-amber-900 border border-amber-200 font-black"
                      : "text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  {selectedBrand === b.id && (
                    <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Special Toggles */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
            বিশেষ ফিল্টার
          </h4>

          {/* In Stock Only */}
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => updateParam("stockStatus", e.target.checked ? "in_stock" : null)}
              className="h-4 w-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500"
            />
            <span>শুধুমাত্র স্টকে থাকা প্রোডাক্ট</span>
          </label>

          {/* Wholesale Only */}
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={wholesaleOnly}
              onChange={(e) => updateParam("wholesaleOnly", e.target.checked ? "true" : null)}
              className="h-4 w-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500"
            />
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-amber-500" />
              হোলসেল প্রোডাক্টস
            </span>
          </label>

          {/* Reseller Friendly */}
          <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={resellerFriendly}
              onChange={(e) => updateParam("resellerFriendly", e.target.checked ? "true" : null)}
              className="h-4 w-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500"
            />
            <span className="flex items-center gap-1">
              <Store className="h-3.5 w-3.5 text-amber-500" />
              উচ্চ মার্জিন রিসেলিং
            </span>
          </label>
        </div>
      </div>
    </aside>
  );
}

export default CatalogFilterSidebar;
