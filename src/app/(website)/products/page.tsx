import Link from "next/link";
import {
  getPublicProductsCatalogAction,
  getPublicCategoriesAction,
  getPublicBrandsAction,
} from "@/features/catalog/actions/public-actions";
import { ProductsCatalogClient } from "@/components/website/products-catalog-client";
import type { ProductCardData } from "@/components/website/product-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "সব প্রোডাক্ট - DropshopNN Enterprise Commerce",
  description: "বাংলাদেশের সবচেয়ে বড় প্রোডাক্ট ক্যাটালগ। গ্যাজেট, চার্জার, অডিও গিয়ার এবং টেক অ্যাক্সেসরিজ সেরা পাইকারি ও রিসেলিং দামে।",
  openGraph: {
    title: "সব প্রোডাক্ট - DropshopNN",
    description: "সোর্স করুন, বিক্রি করুন, ব্যবসা বাড়ান DropshopNN এর সাথে।",
  },
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    sort?: "newest" | "price_asc" | "price_desc" | "rating" | "featured";
    stockStatus?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";
  const brand = params.brand || "";
  const minPrice = params.minPrice ? Number(params.minPrice) * 100 : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) * 100 : undefined;
  const minRating = params.rating ? Number(params.rating) : undefined;
  const sort = params.sort || "newest";

  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    getPublicProductsCatalogAction({
      search: q,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      sort,
      limit: 24,
    }),
    getPublicCategoriesAction(),
    getPublicBrandsAction(),
  ]);

  const rawProducts = productsRes.data.items;
  const categories = categoriesRes.data;
  const brands = brandsRes.data;

  // Map to ProductCardData format cleanly
  const mappedProducts: ProductCardData[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.image || "",
    retailPrice: p.retailPrice,
    resellerPrice: p.resellerPrice,
    wholesalePrice: p.wholesalePrice,
    comparePrice: p.comparePrice,
    rating: p.rating ?? 4.8,
    reviewCount: p.reviewCount ?? 12,
    brand: p.brand,
    category: p.category,
    stockStatus: (p.stockStatus || "in_stock") as "in_stock" | "low_stock" | "out_of_stock",
    moq: p.moq,
    isNew: true,
  }));

  // Schema.org ItemList JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "DropshopNN Catalog",
    "itemListElement": mappedProducts.map((p, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "url": `https://dropshop.com.bd/product/${p.slug}`,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "BDT",
          "price": (p.retailPrice / 100).toFixed(2),
          "availability": "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs */}
        <div className="mb-6 space-y-1">
          <nav className="text-xs font-bold text-slate-600 flex items-center gap-2">
            <Link href="/" className="hover:text-amber-600 transition-colors">হোম</Link>
            <span>/</span>
            <span className="text-slate-900 font-black">ক্যাটালগ</span>
          </nav>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
            {q ? `"${q}" এর অনুসন্ধান ফলাফল` : "সকল প্রোডাক্ট ক্যাটালগ"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-bold">
            সারা বাংলাদেশে দ্রুত ডেলিভারি সুবিধা সহ সেরা পাইকারি ও রিসেলিং রেটে প্রোডাক্ট কিনুন।
          </p>
        </div>

        {/* Client Catalog Suite */}
        <ProductsCatalogClient
          initialProducts={mappedProducts}
          categories={categories}
          brands={brands}
        />
      </div>
    </div>
  );
}
