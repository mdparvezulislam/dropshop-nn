import type { Metadata } from "next";
import { searchProductsAction } from "@/features/catalog/actions/public-actions";
import { SearchResultsContent } from "@/components/website/search-results-content";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

function parseSearchParams(
  sp: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (typeof value === "string") {
      result[key] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      result[key] = value[0];
    }
  }
  return result;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const parsed = parseSearchParams(sp);
  const q = parsed.q || "";

  return {
    title: q ? `${q} - Search Results - DropshopNN` : "Search - DropshopNN",
    description: q ? `Search results for "${q}" on DropshopNN` : "Search products on DropshopNN",
    robots: q ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const parsed = parseSearchParams(sp);
  const q = parsed.q || "";

  const filters = {
    minPrice: parsed.minPrice ? Number(parsed.minPrice) : undefined,
    maxPrice: parsed.maxPrice ? Number(parsed.maxPrice) : undefined,
    inStock: parsed.inStock === "1" ? true : undefined,
    onSale: parsed.onSale === "1" ? true : undefined,
    minRating: parsed.minRating ? Number(parsed.minRating) : undefined,
    brand: parsed.brand || undefined,
    sort: (parsed.sort as "newest" | "price_asc" | "price_desc" | "rating" | "featured") || undefined,
  };

  const result = q.trim()
    ? await searchProductsAction(q, {}, filters)
    : { success: true, data: null };

  return (
    <SearchResultsContent
      initialQuery={q}
      initialProducts={result?.data?.items ?? []}
      initialCursor={result?.data?.cursor ?? null}
      initialHasMore={result?.data?.hasMore ?? false}
      initialTotal={result?.data?.totalCount ?? 0}
    />
  );
}
