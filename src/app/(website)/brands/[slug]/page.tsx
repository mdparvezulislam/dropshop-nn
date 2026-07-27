import type { Metadata } from "next";
import type { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Award } from "lucide-react";
import { getPublicBrandPageAction } from "@/features/catalog/actions/public-actions";
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

interface BrandPageProps {
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
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseListing(await searchParams);
  const result = await getPublicBrandPageAction(slug, parsed.params);

  if (!result.success) {
    return { title: `ব্র্যান্ড - ${SITE_NAME}` };
  }
  if (!result.data) {
    return { title: `ব্র্যান্ড পাওয়া যায়নি - ${SITE_NAME}` };
  }

  const { brand } = result.data;
  return {
    title: `${brand.name} - ${SITE_NAME}`,
    description:
      brand.description ?? `${SITE_NAME} এ ${brand.name} ব্র্যান্ডের প্রোডাক্ট ব্রাউজ করুন।`,
    alternates: { canonical: `${SITE_URL}/brands/${brand.slug}` },
  };
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: BrandPageProps): Promise<ReactElement> {
  const { slug } = await params;
  const parsed = parseListing(await searchParams);
  const result = await getPublicBrandPageAction(slug, parsed.params);

  if (!result.success) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_98%)] py-16 text-slate-900">
        <div className="mx-auto max-w-xl space-y-4 px-4 text-center">
          <h1 className="text-2xl font-black">ডেটা লোড করা যায়নি</h1>
          <p className="text-sm font-bold text-slate-600">কিছুক্ষণ পরে আবার চেষ্টা করুন।</p>
          <Link
            href="/brands"
            className="inline-flex h-10 items-center rounded-xl bg-amber-500 px-5 text-xs font-extrabold text-slate-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            সকল ব্র্যান্ড দেখুন
          </Link>
        </div>
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  const { brand, products } = result.data;
  const basePath = `/brands/${brand.slug}`;

  const breadcrumbs = [
    { name: "হোম", href: "/" },
    { name: "ব্র্যান্ড", href: "/brands" },
    { name: brand.name, href: basePath },
  ];
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const itemListJsonLd = generateItemListJsonLd(
    brand.name,
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
        <Breadcrumb items={[{ label: "ব্র্যান্ড", href: "/brands" }, { label: brand.name }]} />

        <div className="flex flex-col gap-6 rounded-3xl border border-slate-300 bg-white p-6 shadow-xs sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-300 bg-slate-100 p-3">
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt={`${brand.name} লোগো`}
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              ) : (
                <Award className="h-10 w-10 text-amber-500" aria-hidden />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{brand.name}</h1>
              {brand.description && (
                <p className="mt-1 max-w-xl text-xs font-bold leading-relaxed text-slate-600 sm:text-sm">
                  {brand.description}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-center">
            <span className="block text-xl font-black text-amber-900 tabular-nums">
              {products.totalCount}
            </span>
            <span className="text-[10px] font-black uppercase text-amber-950">টি প্রোডাক্ট</span>
          </div>
        </div>

        <ProductListingContent
          basePath={basePath}
          products={products.items}
          totalPages={products.totalPages}
          query={parsed.query}
          showFilters={false}
          emptyMessage="এই ব্র্যান্ডের কোনো প্রোডাক্ট পাওয়া যায়নি।"
        />
      </div>
    </div>
  );
}
