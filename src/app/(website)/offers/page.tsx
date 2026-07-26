import type { Metadata } from "next";
import {
  getPublicFlashDealsAction,
  getPublicFeaturedProductsAction,
} from "@/features/catalog/actions/public-actions";
import { ProductCard } from "@/components/website/product-card";
import type { PublicProductCard } from "@/features/catalog/domain/public-catalog-types";
import { Zap, Sparkles, AlertTriangle } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "অফার ও ফ্ল্যাশ সেল",
  description:
    "DropshopNN-এ চলমান ফ্ল্যাশ ডিল এবং বাছাই করা প্রোডাক্ট দেখুন। অরিজিনাল প্রোডাক্ট, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।",
};

function ErrorState({ message }: { message: string }): React.ReactElement {
  return (
    <div className="bg-white border border-red-200 rounded-2xl p-10 text-center shadow-xs">
      <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-3" aria-hidden />
      <p className="text-xs font-bold text-slate-700">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }): React.ReactElement {
  return (
    <div className="bg-white border border-slate-300 rounded-2xl p-10 text-center shadow-xs">
      <p className="text-xs font-bold text-slate-600">{message}</p>
    </div>
  );
}

function DealGrid({ products }: { products: PublicProductCard[] }): React.ReactElement {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} priority={index < 4} />
      ))}
    </div>
  );
}

export default async function OffersPage(): Promise<React.ReactElement> {
  const [flashDealsRes, featuredRes] = await Promise.all([
    getPublicFlashDealsAction(16),
    getPublicFeaturedProductsAction(8),
  ]);

  const flashDeals = flashDealsRes.success ? flashDealsRes.data : [];

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        {/* Hero banner — no invented discount ceilings, brands, or scarcity claims */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 sm:p-12 mb-12 shadow-lg">
          <div className="relative z-10 max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/30 border border-white/30 text-white text-xs font-black mb-4">
              <Zap className="w-3.5 h-3.5 fill-white text-amber-300" aria-hidden /> অফার ও ফ্ল্যাশ
              সেল
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              ফ্ল্যাশ সেল এবং বিশেষ অফার
            </h1>
            <p className="text-sm sm:text-base text-amber-50 font-semibold leading-relaxed mb-2">
              চলমান ডিলগুলোতে প্রকৃত মূল্যছাড়। অরিজিনাল প্রোডাক্ট এবং সারা বাংলাদেশে ক্যাশ অন
              ডেলিভারি।
            </p>
            {flashDeals.length > 0 && (
              <span className="inline-flex items-center gap-2 bg-slate-900/30 px-3.5 py-2 rounded-xl border border-white/20 text-xs font-black text-white mt-3">
                <Zap className="w-4 h-4 text-amber-300" aria-hidden />
                {flashDeals.length} টি ডিল চলছে
              </span>
            )}
          </div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Flash deals */}
        <section className="mb-16" aria-labelledby="flash-deals-heading">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <div>
              <h2
                id="flash-deals-heading"
                className="text-2xl font-black text-slate-900 flex items-center gap-2.5"
              >
                <Zap className="w-6 h-6 text-amber-500 fill-amber-500" aria-hidden /> চলমান ফ্ল্যাশ
                ডিল
              </h2>
              <p className="text-xs font-bold text-slate-600 mt-1">সীমিত সময়ের প্রমোশনাল মূল্য।</p>
            </div>
            {flashDealsRes.success && flashDeals.length > 0 && (
              <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl">
                {flashDeals.length} টি ডিল
              </span>
            )}
          </div>

          {!flashDealsRes.success ? (
            <ErrorState message={flashDealsRes.error} />
          ) : flashDeals.length === 0 ? (
            <EmptyState message="এই মুহূর্তে কোনো ফ্ল্যাশ সেল চলছে না। নতুন ডিলের জন্য আবার দেখুন।" />
          ) : (
            <DealGrid products={flashDeals} />
          )}
        </section>

        {/* Curated products — admin-picked, never presented as "best-selling" */}
        <section className="mb-12" aria-labelledby="curated-products-heading">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <div>
              <h2
                id="curated-products-heading"
                className="text-2xl font-black text-slate-900 flex items-center gap-2.5"
              >
                <Sparkles className="w-6 h-6 text-amber-500" aria-hidden /> বাছাই করা প্রোডাক্ট
              </h2>
              <p className="text-xs font-bold text-slate-600 mt-1">
                আমাদের টিমের বাছাই করা কালেকশন।
              </p>
            </div>
          </div>

          {!featuredRes.success ? (
            <ErrorState message={featuredRes.error} />
          ) : featuredRes.data.length === 0 ? (
            <EmptyState message="এই মুহূর্তে কোনো বাছাই করা প্রোডাক্ট নেই।" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredRes.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
