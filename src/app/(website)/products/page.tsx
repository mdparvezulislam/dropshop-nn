import type { ReactElement } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import {
  getPublicBrandsAction,
  getPublicCatalogAction,
  getPublicCategoriesAction,
} from "@/features/catalog/actions/public-actions";
import type {
  PublicCatalogParams,
  PublicCatalogSort,
} from "@/features/catalog/domain/public-catalog-types";
import { ProductsCatalogClient } from "@/components/website/products-catalog-client";
import { ProductPagination } from "@/components/website/product-pagination";
import { generateItemListJsonLd } from "@/lib/seo/json-ld-generator";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "সব প্রোডাক্ট - DropshopNN Enterprise Commerce",
  description:
    "বাংলাদেশের সবচেয়ে বড় প্রোডাক্ট ক্যাটালগ। গ্যাজেট, চার্জার, অডিও গিয়ার এবং টেক অ্যাক্সেসরিজ সেরা পাইকারি ও রিসেলিং দামে।",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "সব প্রোডাক্ট - DropshopNN",
    description: "সোর্স করুন, বিক্রি করুন, ব্যবসা বাড়ান DropshopNN এর সাথে।",
  },
};

type RawSearchParams = Record<string, string | string[] | undefined>;

interface PageProps {
  searchParams: Promise<RawSearchParams>;
}

// ── searchParams parsing (all guarded; prices stay in raw BDT) ────────────

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
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

const CATALOG_SORTS: readonly PublicCatalogSort[] = [
  "newest",
  "price_asc",
  "price_desc",
  "featured",
  "name_asc",
];

function parseSort(value: string | undefined): PublicCatalogSort | undefined {
  return CATALOG_SORTS.includes(value as PublicCatalogSort)
    ? (value as PublicCatalogSort)
    : undefined;
}

function parseSlug(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return /^[a-zA-Z0-9_-]{1,160}$/.test(value) ? value : undefined;
}

function parseQuery(value: string | undefined): string | undefined {
  const q = value?.trim().slice(0, 200);
  return q ? q : undefined;
}

// ── Error state (real failures are shown, never an empty grid) ────────────

function CatalogErrorState({ message }: { message: string }): ReactElement {
  return (
    <div className="space-y-4 rounded-3xl border border-red-200 bg-white p-12 text-center shadow-xs">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <h2 className="text-lg font-black text-slate-900">প্রোডাক্ট লোড করা যায়নি</h2>
      <p className="mx-auto max-w-md text-xs font-bold text-slate-600">{message}</p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-extrabold text-slate-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        আবার চেষ্টা করুন
      </Link>
    </div>
  );
}

export default async function ProductsPage({ searchParams }: PageProps): Promise<ReactElement> {
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

  const catalogParams: PublicCatalogParams = {
    page,
    limit: PAGE_SIZE,
    search: q,
    categorySlug,
    brandSlug,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    sort,
  };

  const [catalogRes, categoriesRes, brandsRes] = await Promise.all([
    getPublicCatalogAction(catalogParams),
    getPublicCategoriesAction(),
    getPublicBrandsAction(),
  ]);

  const header = (
    <div className="mb-6 space-y-1">
      <nav
        aria-label="ব্রেডক্রাম্ব"
        className="flex items-center gap-2 text-xs font-bold text-slate-600"
      >
        <Link
          href="/"
          className="rounded transition-colors hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-amber-600"
        >
          হোম
        </Link>
        <span aria-hidden>/</span>
        <span aria-current="page" className="font-black text-slate-900">
          ক্যাটালগ
        </span>
      </nav>
      <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
        {q ? `"${q}" এর অনুসন্ধান ফলাফল` : "সকল প্রোডাক্ট ক্যাটালগ"}
      </h1>
      <p className="text-xs font-bold text-slate-700 sm:text-sm">
        সারা বাংলাদেশে দ্রুত ডেলিভারি সুবিধা সহ সেরা পাইকারি ও রিসেলিং রেটে প্রোডাক্ট কিনুন।
      </p>
    </div>
  );

  if (!catalogRes.success) {
    return (
      <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8 text-slate-900">
        <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
          {header}
          <CatalogErrorState message={catalogRes.error} />
        </div>
      </div>
    );
  }

  const catalog = catalogRes.data;
  // Taxonomy failures degrade to a visible per-section error inside the
  // sidebar (null), never to a silently empty list.
  const categories = categoriesRes.success ? categoriesRes.data : null;
  const brands = brandsRes.success ? brandsRes.data : null;

  const jsonLd = generateItemListJsonLd(
    "সকল প্রোডাক্ট ক্যাটালগ - DropshopNN",
    catalog.items.map((p) => ({
      name: p.name,
      slug: p.slug,
      price: p.price > 0 ? p.price : undefined,
      inStock: p.stockStatus !== "out_of_stock",
    })),
  );

  // Params preserved by pagination links (page itself is overwritten).
  const preservedParams: Record<string, string | undefined> = {
    q,
    sort,
    category: categorySlug,
    brand: brandSlug,
    minPrice: minPrice !== undefined ? String(minPrice) : undefined,
    maxPrice: maxPrice !== undefined ? String(maxPrice) : undefined,
    inStock: inStock ? "1" : undefined,
    onSale: onSale ? "1" : undefined,
  };

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] py-8 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-(--content-max) px-3 sm:px-6 lg:px-8">
        {header}

        <ProductsCatalogClient
          products={catalog.items}
          totalCount={catalog.totalCount}
          categories={categories}
          brands={brands}
          resetHref="/products"
          pagination={
            <ProductPagination
              currentPage={catalog.page}
              totalPages={catalog.totalPages}
              basePath="/products"
              searchParams={preservedParams}
            />
          }
        />
      </div>
    </div>
  );
}
