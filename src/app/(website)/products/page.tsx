import Link from "next/link";
import {
  getPublicProductsCatalogAction,
  getPublicCategoriesAction,
  getPublicBrandsAction,
} from "@/features/catalog/actions/public-actions";
import { ProductCard } from "@/shared/components/website/product-card";
import { SlidersHorizontal, Grid, List, Search, ArrowRight, ShieldCheck, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "All Products - DropshopNN Enterprise Commerce",
  description: "Browse Bangladesh's largest catalog of gadgets, chargers, audio gear, and tech accessories with official warranty.",
  openGraph: {
    title: "All Products - DropshopNN",
    description: "Source gadgets and electronics at retail, reseller, and wholesale rates.",
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
    view?: "grid" | "list";
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
  const viewMode = params.view || "grid";

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

  const products = productsRes.data.items;
  const categories = categoriesRes.data;
  const brands = brandsRes.data;

  // JSON-LD ItemList Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "DropshopNN Electronics Catalog",
    "itemListElement": products.map((p, idx) => ({
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <nav className="text-xs text-slate-400 mb-2 flex items-center gap-2">
              <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-200">Catalog</span>
            </nav>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
              {q ? `Search Results for "${q}"` : "Product Catalog"}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Showing {products.length} tech accessories & gadgets available with Pathao / Steadfast delivery.
            </p>
          </div>

          {/* View & Sort Bar */}
          <div className="flex items-center gap-3">
            <form method="GET" className="flex items-center gap-2">
              {q && <input type="hidden" name="q" value={q} />}
              {category && <input type="hidden" name="category" value={category} />}
              {brand && <input type="hidden" name="brand" value={brand} />}
              <select
                name="sort"
                defaultValue={sort}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="featured">Featured</option>
              </select>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" /> Filter Catalog
                </h3>
                <Link href="/products" className="text-xs text-amber-400 hover:underline">Reset</Link>
              </div>

              <form method="GET" className="space-y-5">
                {/* Search query field */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-2">Keyword</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="q"
                      defaultValue={q}
                      placeholder="Search charger, TWS..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pl-9 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-2">Category</label>
                  <select
                    name="category"
                    defaultValue={category}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brands */}
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-2">Brand</label>
                  <select
                    name="brand"
                    defaultValue={brand}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 outline-none"
                  >
                    <option value="">All Brands</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs py-2.5 rounded-lg transition-colors shadow-md shadow-amber-500/10"
                >
                  Apply Filters
                </button>
              </form>
            </div>

            {/* B2B Assurance Banner */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300">100% Genuine Guarantee</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    All products originate from verified Bangladesh importers & brand distributors.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No matching products found</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Try adjusting your filter criteria or search for another keyword.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
