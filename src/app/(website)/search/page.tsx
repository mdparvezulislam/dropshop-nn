import type { ReactElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import {
  getPublicBrandsAction,
  getPublicCategoriesAction,
  searchProductsAction,
} from "@/features/catalog/actions/public-actions";
import type {
  PublicCatalogParams,
  PublicCatalogSort,
  PublicListResult,
} from "@/features/catalog/domain/public-catalog-types";
import { SearchResultsContent } from "@/components/website/search-results-content";
import { ProductPagination } from "@/components/website/product-pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

type RawSearchParams = Record<string, string | string[] | undefined>;

interface SearchPageProps {
  searchParams: Promise<RawSearchParams>;
}

// ── searchParams parsing (all guarded; prices stay in raw BDT) ────────────

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseQuery(value: string | undefined): string {
  return (value ?? "").trim().slice(0, 200);
}

function parsePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 1000 ? n : 1;
}

/** BDT major units, passed through untouched — the server layer owns conversion. */
function parsePrice(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function parseFlag(value: string | undefined): true | undefined {
  return value === "1" || value === "true" ? true : undefined;
}

const SEARCH_SORTS: readonly PublicCatalogSort[] = [
  "relevance",
  "newest",
  "price_asc",
  "price_desc",
  "featured",
  "name_asc",
];

function parseSort(value: string | undefined): PublicCatalogSort | undefined {
  return SEARCH_SORTS.includes(value as PublicCatalogSort)
    ? (value as PublicCatalogSort)
    : undefined;
}

function parseSlug(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^[a-zA-Z0-9_-]{1,160}$/.test(value) ? value : undefined;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = parseQuery(first(sp.q));

  return {
    title: q ? `${q} - সার্চ ফলাফল - DropshopNN` : "প্রোডাক্ট অনুসন্ধান - DropshopNN",
    description: q
      ? `DropshopNN ক্যাটালগে "${q}" এর সার্চ ফলাফল`
      : "DropshopNN ক্যাটালগে প্রোডাক্ট, ব্র্যান্ড ও ক্যাটাগরি খুঁজুন",
    robots: q ? { index: false, follow: true } : { index: true, follow: true },
  };
}

function SearchErrorState({ message }: { message: string }): ReactElement {
  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8 text-slate-900">
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        <div className="space-y-4 rounded-3xl border border-red-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-lg font-black text-slate-900">সার্চ ফলাফল লোড করা যায়নি</h1>
          <p className="mx-auto max-w-md text-xs font-bold text-slate-600">{message}</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            আবার চেষ্টা করুন
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps): Promise<ReactElement> {
  const sp = await searchParams;

  const q = parseQuery(first(sp.q));
  const page = parsePage(first(sp.page));
  const sort = parseSort(first(sp.sort));
  const categorySlug = parseSlug(first(sp.category));
  const brandSlug = parseSlug(first(sp.brand));
  const minPrice = parsePrice(first(sp.minPrice));
  const maxPrice = parsePrice(first(sp.maxPrice));
  const inStock = parseFlag(first(sp.inStock));
  const onSale = parseFlag(first(sp.onSale));

  const params: PublicCatalogParams = {
    page,
    limit: PAGE_SIZE,
    categorySlug,
    brandSlug,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    sort,
  };

  const [searchRes, categoriesRes, brandsRes] = await Promise.all([
    q ? searchProductsAction(q, params) : Promise.resolve(null),
    getPublicCategoriesAction(),
    getPublicBrandsAction(),
  ]);

  if (searchRes && !searchRes.success) {
    return <SearchErrorState message={searchRes.error} />;
  }

  const result: (PublicListResult & { query: string }) | null =
    searchRes && searchRes.success ? searchRes.data : null;

  // Taxonomy failures degrade to a visible per-section error inside the
  // sidebar (null), never to a silently empty list.
  const categories = categoriesRes.success ? categoriesRes.data : null;
  const brands = brandsRes.success ? brandsRes.data : null;

  // Real top categories (by live product count) replace the old hardcoded
  // "trending" terms on the empty search landing.
  const trendingTerms = (categories ?? [])
    .filter((c) => c.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 8)
    .map((c) => c.name);

  // Params preserved by pagination links (page itself is overwritten).
  const preservedParams: Record<string, string | undefined> = {
    q: q || undefined,
    sort,
    category: categorySlug,
    brand: brandSlug,
    minPrice: minPrice !== undefined ? String(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? String(maxPrice) : undefined,
    inStock: inStock ? "1" : undefined,
    onSale: onSale ? "1" : undefined,
  };

  return (
    <SearchResultsContent
      query={q}
      result={result}
      categories={categories}
      brands={brands}
      trendingTerms={trendingTerms}
      pagination={
        result ? (
          <ProductPagination
            currentPage={result.page}
            totalPages={result.totalPages}
            basePath="/search"
            searchParams={preservedParams}
          />
        ) : undefined
      }
    />
  );
}
