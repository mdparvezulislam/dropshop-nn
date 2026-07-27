import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { getPublicCollectionPageAction } from "@/features/catalog/actions/public-actions";
import {
  ProductListingContent,
  type ListingQuery,
  type ListingSort,
} from "@/components/website/product-listing-content";
import { Breadcrumb } from "@/components/website/breadcrumb";
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

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Shared by generateMetadata and the page body so the deduped action sees identical args. */
function parseListing(sp: SearchParams): { params: PublicCatalogParams; query: ListingQuery } {
  const pageRaw = Number(first(sp.page));
  const page = Number.isInteger(pageRaw) && pageRaw >= 1 && pageRaw <= 1000 ? pageRaw : 1;
  const sortRaw = first(sp.sort);
  const sort: ListingSort = (SORT_VALUES as readonly string[]).includes(sortRaw ?? "")
    ? (sortRaw as ListingSort)
    : "newest";

  return {
    params: { page, limit: PAGE_SIZE, sort },
    query: { page, sort, inStock: false, onSale: false },
  };
}

function jsonLdHtml(data: object): { __html: string } {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export async function generateMetadata({
  params,
  searchParams,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseListing(await searchParams);
  const result = await getPublicCollectionPageAction(slug, parsed.params);

  if (!result.success) {
    return { title: `কালেকশন - ${SITE_NAME}` };
  }
  if (!result.data) {
    return { title: `কালেকশন পাওয়া যায়নি - ${SITE_NAME}` };
  }

  const { collection } = result.data;
  return {
    title: `${collection.name} - ${SITE_NAME}`,
    description:
      collection.description ?? `${SITE_NAME} এর ${collection.name} কালেকশনের প্রোডাক্ট দেখুন।`,
    alternates: { canonical: `${SITE_URL}/collections/${collection.slug}` },
  };
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: CollectionPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const parsed = parseListing(await searchParams);
  const result = await getPublicCollectionPageAction(slug, parsed.params);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_98%)] py-16 text-slate-900">
        <div className="mx-auto max-w-xl space-y-4 px-4 text-center">
          <h1 className="text-2xl font-black">ডেটা লোড করা যায়নি</h1>
          <p className="text-sm font-bold text-slate-600">কিছুক্ষণ পরে আবার চেষ্টা করুন।</p>
          <Link
            href="/collections"
            className="inline-flex h-10 items-center rounded-xl bg-amber-500 px-5 text-xs font-extrabold text-slate-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            সকল কালেকশন দেখুন
          </Link>
        </div>
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  const { collection, products } = result.data;
  const basePath = `/collections/${collection.slug}`;

  const breadcrumbs = [
    { name: "হোম", href: "/" },
    { name: "কালেকশন", href: "/collections" },
    { name: collection.name, href: basePath },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const itemListJsonLd = generateItemListJsonLd(
    collection.name,
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
        <Breadcrumb
          items={[{ label: "কালেকশন", href: "/collections" }, { label: collection.name }]}
        />

        <div className="rounded-3xl border border-slate-300 bg-white p-6 shadow-xs sm:p-8">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black text-amber-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" aria-hidden /> কালেকশন
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{collection.name}</h1>
              {collection.description && (
                <p className="mt-1 max-w-2xl text-xs font-bold leading-relaxed text-slate-600 sm:text-sm">
                  {collection.description}
                </p>
              )}
            </div>
            <p className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-black text-slate-700 tabular-nums">
              মোট {products.totalCount} টি প্রোডাক্ট
            </p>
          </div>
        </div>

        <ProductListingContent
          basePath={basePath}
          products={products.items}
          totalPages={products.totalPages}
          query={parsed.query}
          showFilters={false}
          emptyMessage="এই কালেকশনে কোনো প্রোডাক্ট পাওয়া যায়নি।"
        />
      </div>
    </div>
  );
}
