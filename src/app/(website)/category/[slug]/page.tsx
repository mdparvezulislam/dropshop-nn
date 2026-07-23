import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPublicCategoryBySlugAction,
  getPublicCategoryProductsAction,
} from "@/features/catalog/actions/public-actions";
import { ProductListingContent } from "@/components/website/product-listing-content";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryRes = await getPublicCategoryBySlugAction(slug);

  if (!categoryRes.success || !categoryRes.data) {
    return { title: "Category Not Found - DropshopNN" };
  }

  return {
    title: `${categoryRes.data.name} - DropshopNN`,
    description: categoryRes.data.description ?? `Shop ${categoryRes.data.name} on DropshopNN`,
    alternates: {
      canonical: `/category/${categoryRes.data.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  const categoryRes = await getPublicCategoryBySlugAction(slug);

  if (!categoryRes.success || !categoryRes.data) {
    notFound();
  }

  const parsed = parseSearchParams(sp);
  const filters = {
    minPrice: parsed.minPrice ? Number(parsed.minPrice) : undefined,
    maxPrice: parsed.maxPrice ? Number(parsed.maxPrice) : undefined,
    inStock: parsed.inStock === "1" ? true : undefined,
    onSale: parsed.onSale === "1" ? true : undefined,
    minRating: parsed.minRating ? Number(parsed.minRating) : undefined,
    brand: parsed.brand || undefined,
    sort: (parsed.sort as "newest" | "price_asc" | "price_desc" | "rating" | "featured") || undefined,
  };

  const result = await getPublicCategoryProductsAction(slug, {}, filters, filters.sort);

  return (
    <ProductListingContent
      slug={slug}
      category={categoryRes.data}
      initialProducts={result.data?.items ?? []}
      initialCursor={result.data?.cursor ?? null}
      initialHasMore={result.data?.hasMore ?? false}
      initialTotal={result.data?.totalCount ?? 0}
      initialFilters={filters}
    />
  );
}
