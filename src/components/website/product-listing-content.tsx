"use client";

import type { FormEvent, ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/website/product-card";
import { EmptyListing } from "@/components/website/empty-listing";
import { cn } from "@/lib/utils/cn";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";

/**
 * Thin, URL-driven listing shell.
 *
 * The server page fetches everything and passes it down as props; the only
 * client behaviour here is writing URL params (router.push) so the server
 * re-renders with new data. No client product state, no server-action
 * refetching, no quick-view state.
 */

/** Sort options offered on public listing pages. No rating sort — ratings don't exist yet. */
export type ListingSort = "newest" | "price_asc" | "price_desc" | "featured" | "name_asc";

export const LISTING_SORT_OPTIONS: ReadonlyArray<{ value: ListingSort; label: string }> = [
  { value: "newest", label: "নতুন আগে" },
  { value: "price_asc", label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "featured", label: "ফিচার্ড" },
  { value: "name_asc", label: "নাম: A → Z" },
];

/** The canonical URL state of a listing page, parsed server-side. */
export interface ListingQuery {
  page: number;
  sort: ListingSort;
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  onSale: boolean;
}

export function buildListingHref(basePath: string, query: Partial<ListingQuery>): string {
  const params = new URLSearchParams();
  if (query.page !== undefined && query.page > 1) params.set("page", String(query.page));
  if (query.sort !== undefined && query.sort !== "newest") params.set("sort", query.sort);
  if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
  if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));
  if (query.inStock) params.set("inStock", "1");
  if (query.onSale) params.set("onSale", "1");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// ── Legacy compatibility types ────────────────────────────────────────────
// product-sort-select.tsx and product-filter-sidebar.tsx (owned by another
// workstream, now unused by any page) still import these shapes. Kept only
// so they compile until that workstream deletes them. Nothing in the new
// shell uses them — no rating UI exists anywhere.

/** @deprecated Only for the retired product-sort-select component. */
export type SortOption = "newest" | "price_asc" | "price_desc" | "rating" | "featured";

/** @deprecated Only for the retired product-filter-sidebar component. */
export interface ProductListingFilters {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  minRating?: number;
  brand?: string;
  sort?: SortOption;
}

// ── Pagination ────────────────────────────────────────────────────────────

function pageItems(current: number, total: number): Array<number | "gap"> {
  const wanted = new Set<number>([1, total, current - 1, current, current + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const items: Array<number | "gap"> = [];
  let previous = 0;
  for (const page of pages) {
    if (page - previous > 1) items.push("gap");
    items.push(page);
    previous = page;
  }
  return items;
}

interface ListingPaginationProps {
  basePath: string;
  query: ListingQuery;
  totalPages: number;
}

function ListingPagination({
  basePath,
  query,
  totalPages,
}: ListingPaginationProps): ReactElement | null {
  if (totalPages <= 1) return null;
  const current = Math.min(Math.max(query.page, 1), totalPages);
  const hrefFor = (page: number): string => buildListingHref(basePath, { ...query, page });

  const edgeLinkClass =
    "inline-flex h-9 items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 text-xs font-extrabold text-slate-800 transition-colors hover:border-amber-400 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500";

  return (
    <nav
      aria-label="পেজ নেভিগেশন"
      className="flex flex-wrap items-center justify-center gap-1.5 pt-6"
    >
      {current > 1 ? (
        <Link href={hrefFor(current - 1)} className={edgeLinkClass}>
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          আগের পেজ
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(edgeLinkClass, "cursor-not-allowed opacity-40")}>
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          আগের পেজ
        </span>
      )}

      {pageItems(current, totalPages).map((item, index) =>
        item === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden
            className="inline-flex h-9 w-6 items-center justify-center text-xs font-black text-slate-400"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === current ? "page" : undefined}
            aria-label={`পেজ ${item}`}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-xs font-black tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500",
              item === current
                ? "border-amber-500 bg-amber-500 text-slate-950"
                : "border-slate-300 bg-white text-slate-800 hover:border-amber-400 hover:text-amber-700",
            )}
          >
            {item}
          </Link>
        ),
      )}

      {current < totalPages ? (
        <Link href={hrefFor(current + 1)} className={edgeLinkClass}>
          পরের পেজ
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(edgeLinkClass, "cursor-not-allowed opacity-40")}>
          পরের পেজ
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}
    </nav>
  );
}

// ── Toolbar (sort + URL-param filters) ────────────────────────────────────

interface ListingToolbarProps {
  basePath: string;
  query: ListingQuery;
  showFilters: boolean;
}

function parsePriceInput(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.min(Math.round(parsed), 100_000_000);
}

function ListingToolbar({ basePath, query, showFilters }: ListingToolbarProps): ReactElement {
  const router = useRouter();

  const handleSortChange = (sort: ListingSort): void => {
    router.push(buildListingHref(basePath, { ...query, page: 1, sort }));
  };

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    router.push(
      buildListingHref(basePath, {
        page: 1,
        sort: query.sort,
        minPrice: parsePriceInput(form.get("minPrice")),
        maxPrice: parsePriceInput(form.get("maxPrice")),
        inStock: form.get("inStock") === "1",
        onSale: form.get("onSale") === "1",
      }),
    );
  };

  const filterKey = `${query.minPrice ?? ""}:${query.maxPrice ?? ""}:${query.inStock}:${query.onSale}`;
  const inputClass =
    "h-9 w-24 rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-amber-500";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-300 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
      {showFilters ? (
        <form
          key={filterKey}
          onSubmit={handleFilterSubmit}
          className="flex flex-wrap items-center gap-x-3 gap-y-2"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700">
            <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" aria-hidden />
            ফিল্টার
          </span>

          <div className="flex items-center gap-1.5">
            <label htmlFor="listing-min-price" className="text-xs font-bold text-slate-600">
              দাম (৳)
            </label>
            <input
              id="listing-min-price"
              name="minPrice"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="সর্বনিম্ন"
              defaultValue={query.minPrice ?? ""}
              className={inputClass}
            />
            <span aria-hidden className="text-xs font-bold text-slate-400">
              –
            </span>
            <label htmlFor="listing-max-price" className="sr-only">
              সর্বোচ্চ দাম (৳)
            </label>
            <input
              id="listing-max-price"
              name="maxPrice"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="সর্বোচ্চ"
              defaultValue={query.maxPrice ?? ""}
              className={inputClass}
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              name="inStock"
              value="1"
              defaultChecked={query.inStock}
              className="h-4 w-4 rounded border-slate-300 accent-amber-500 focus-visible:outline-2 focus-visible:outline-amber-500"
            />
            স্টকে আছে
          </label>

          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              name="onSale"
              value="1"
              defaultChecked={query.onSale}
              className="h-4 w-4 rounded border-slate-300 accent-amber-500 focus-visible:outline-2 focus-visible:outline-amber-500"
            />
            ডিসকাউন্টে আছে
          </label>

          <button
            type="submit"
            className="inline-flex h-9 items-center rounded-xl bg-amber-500 px-4 text-xs font-extrabold text-slate-950 shadow-xs transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            প্রয়োগ করুন
          </button>

          {(query.minPrice !== undefined ||
            query.maxPrice !== undefined ||
            query.inStock ||
            query.onSale) && (
            <Link
              href={buildListingHref(basePath, { sort: query.sort })}
              className="text-xs font-extrabold text-slate-600 underline underline-offset-2 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              ফিল্টার মুছুন
            </Link>
          )}
        </form>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-2">
        <label htmlFor="listing-sort" className="text-xs font-bold text-slate-600">
          সাজান
        </label>
        <select
          id="listing-sort"
          key={query.sort}
          defaultValue={query.sort}
          onChange={(event) => handleSortChange(event.target.value as ListingSort)}
          className="h-9 rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          {LISTING_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Listing shell ─────────────────────────────────────────────────────────

export interface ProductListingContentProps {
  /** Path the listing lives on, e.g. `/category/chargers`. All URL state is written under it. */
  basePath: string;
  products: PublicProductCard[];
  totalPages: number;
  query: ListingQuery;
  /** Price/stock/sale filter bar. Sort is always shown. */
  showFilters?: boolean;
  emptyMessage?: string;
}

export function ProductListingContent({
  basePath,
  products,
  totalPages,
  query,
  showFilters = true,
  emptyMessage = "এই মুহূর্তে কোনো প্রোডাক্ট পাওয়া যায়নি।",
}: ProductListingContentProps): ReactElement {
  const router = useRouter();
  const hasActiveQuery =
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    query.inStock ||
    query.onSale ||
    query.page > 1;

  return (
    <div className="space-y-4">
      <ListingToolbar basePath={basePath} query={query} showFilters={showFilters} />

      {products.length === 0 ? (
        <EmptyListing
          message={emptyMessage}
          onReset={hasActiveQuery ? (): void => router.push(basePath) : undefined}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>

          <ListingPagination basePath={basePath} query={query} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
