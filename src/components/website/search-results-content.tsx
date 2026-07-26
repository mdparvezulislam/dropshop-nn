"use client";

import { useId, useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { ProductsCatalogClient } from "./products-catalog-client";
import { EmptySearch } from "./empty-search";
import { TrendingSearches } from "./trending-searches";
import type {
  PublicBrandInfo,
  PublicCategoryInfo,
  PublicListResult,
} from "@/features/catalog/domain/public-catalog-types";

export interface SearchResultsContentProps {
  query: string;
  /** Server-fetched result page; null when there is no (valid) query. */
  result: (PublicListResult & { query: string }) | null;
  categories: PublicCategoryInfo[] | null;
  brands: PublicBrandInfo[] | null;
  /** Real top category names (by product count) for the empty landing. */
  trendingTerms: string[];
  /** Server-rendered pagination links. */
  pagination?: ReactNode;
}

/**
 * Thin interactive shell for /search. Data comes fully server-rendered; this
 * component only pushes new URLs (new query / trending term) to the router.
 */
export function SearchResultsContent({
  query,
  result,
  categories,
  brands,
  trendingTerms,
  pagination,
}: SearchResultsContentProps): ReactElement {
  const router = useRouter();
  const searchInputId = useId();
  const [inputValue, setInputValue] = useState(query);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const q = inputValue.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const hasResults = result !== null && result.items.length > 0;

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8 text-slate-900">
      <div className="mx-auto max-w-(--content-max) space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="-ml-2 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-black text-slate-700 transition-colors hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-amber-600"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> ফিরে যান
            </button>
          </div>

          <form role="search" onSubmit={handleSubmit} className="relative max-w-xl">
            <label htmlFor={searchInputId} className="sr-only">
              প্রোডাক্ট, ব্র্যান্ড বা কি-ওয়ার্ড খুঁজুন
            </label>
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" aria-hidden />
            <input
              id={searchInputId}
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="প্রোডাক্ট, ব্র্যান্ড বা কি-ওয়ার্ড খুঁজুন..."
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-xs font-bold text-slate-900 shadow-2xs placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500"
            />
          </form>

          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
            {query && result
              ? `"${query}" এর জন্য ${result.totalCount.toLocaleString("en-BD")} টি প্রোডাক্ট পাওয়া গেছে`
              : "প্রোডাক্ট অনুসন্ধান"}
          </h1>
        </div>

        {!query || result === null ? (
          <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xs">
            <p className="text-sm font-bold text-slate-700">
              উপরের সার্চ বক্সে টাইপ করে প্রোডাক্ট, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন।
            </p>
            <TrendingSearches
              terms={trendingTerms}
              title="জনপ্রিয় ক্যাটাগরি"
              onSelect={(term) => router.push(`/search?q=${encodeURIComponent(term)}`)}
            />
          </div>
        ) : !hasResults ? (
          <EmptySearch query={query} />
        ) : (
          <ProductsCatalogClient
            products={result.items}
            totalCount={result.totalCount}
            categories={categories}
            brands={brands}
            pagination={pagination}
            defaultSort="relevance"
            showSearchBox={false}
            resetHref={`/search?q=${encodeURIComponent(query)}`}
          />
        )}
      </div>
    </div>
  );
}

export default SearchResultsContent;
