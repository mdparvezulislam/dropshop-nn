import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCategoryPageAction } from "@/features/catalog/actions/public-actions";
import {
  ProductListingContent,
  type ListingQuery,
  type ListingSort,
} from "@/components/website/product-listing-content";
import { ProductListingHeader } from "@/components/website/product-listing-header";
import { generateBreadcrumbJsonLd, generateItemListJsonLd } from "@/lib/seo/json-ld-generator";
import { SITE_NAME, SITE_URL } from "@/config/site";
import type { PublicCatalogParams } from "@/features/catalog/domain/public-catalog-types";

const PAGE_SIZE = 24;
const SORT_VALUES: readonly ListingSort[] = [
  "newest",
  "price_asc",
  "price_desc",
  "featured",
  "name_asc",
];

type SearchParams = Record<string, string | string[] | undefined>;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePrice(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return undefined;
  return Math.min(Math.round(value), 100_000_000);
}

/**
 * Parses URL state once; generateMetadata and the page body call the
 * (React.cache-deduped) action with the identical result, so only one DB
 * roundtrip happens per request.
 */
function parseListing(sp: SearchParams): { params: PublicCatalogParams; query: ListingQuery } {
  const pageRaw = Number(first(sp.page));
  const page = Number.isInteger(pageRaw) && pageRaw >= 1 && pageRaw <= 1000 ? pageRaw : 1;
  const sortRaw = first(sp.sort);
  const sort: ListingSort = (SORT_VALUES as readonly string[]).includes(sortRaw ?? "")
    ? (sortRaw as ListingSort)
    : "newest";
  const minPrice = parsePrice(first(sp.minPrice));
  const maxPrice = parsePrice(first(sp.maxPrice));
  const inStock = first(sp.inStock) === "1";
  const onSale = first(sp.onSale) === "1";

  return {
    params: {
      page,
      limit: PAGE_SIZE,
      sort,
      minPrice,
      maxPrice,
      inStock: inStock ? true : undefined,
      onSale: onSale ? true : undefined,
    },
    query: { page, sort, minPrice, maxPrice, inStock, onSale },
  };
}

function jsonLdHtml(data: object): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseListing(await searchParams);
  const result = await getPublicCategoryPageAction(slug, parsed.params);

  if (!result.success) {
    return { title: `ক্যাটাগরি - ${SITE_NAME}` };
  }
  if (!result.data) {
    return { title: `ক্যাটাগরি পাওয়া যায়নি - ${SITE_NAME}` };
  }

  const { category } = result.data;
  return {
    title: `${category.name} - ${SITE_NAME}`,
    description:
      category.description ?? `${SITE_NAME} এ ${category.name} ক্যাটাগরির প্রোডাক্ট ব্রাউজ করুন।`,
    alternates: { canonical: `${SITE_URL}/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const parsed = parseListing(await searchParams);
  const result = await getPublicCategoryPageAction(slug, parsed.params);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_98%)] py-16 text-slate-900">
        <div className="mx-auto max-w-xl space-y-4 px-4 text-center">
          <h1 className="text-2xl font-black">ডেটা লোড করা যায়নি</h1>
          <p className="text-sm font-bold text-slate-600">কিছুক্ষণ পরে আবার চেষ্টা করুন।</p>
          <Link
            href="/categories"
            className="inline-flex h-10 items-center rounded-xl bg-amber-500 px-5 text-xs font-extrabold text-slate-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            সকল ক্যাটাগরি দেখুন
          </Link>
        </div>
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  const { category, breadcrumbs, children, products } = result.data;
  const basePath = `/category/${category.slug}`;

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const itemListJsonLd = generateItemListJsonLd(
    category.name,
    products.items.map((product) => ({
      name: product.name,
      slug: product.slug,
      price: product.price > 0 ? product.price : undefined,
      inStock: product.stockStatus !== "out_of_stock",
    })),
  );

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(breadcrumbJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(itemListJsonLd)} />

      <div className="mx-auto max-w-(--content-max) space-y-6 px-3 sm:px-6 lg:px-8">
        <ProductListingHeader
          title={category.name}
          description={category.description}
          breadcrumbs={breadcrumbs}
          totalCount={products.totalCount}
        />

        {children.length > 0 && (
          <nav aria-label="সাব-ক্যাটাগরি" className="flex flex-wrap gap-2">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-extrabold text-slate-800 transition-colors hover:border-amber-400 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                {child.name}
                <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-black text-amber-800 tabular-nums">
                  {child.productCount}
                </span>
              </Link>
            ))}
          </nav>
        )}

        <ProductListingContent
          basePath={basePath}
          products={products.items}
          totalPages={products.totalPages}
          query={parsed.query}
          emptyMessage="এই ক্যাটাগরিতে কোনো প্রোডাক্ট পাওয়া যায়নি।"
        />
      </div>
    </div>
  );
}
