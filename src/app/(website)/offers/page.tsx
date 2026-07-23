import Link from "next/link";
import { getPublicFlashDealsAction, getPublicFeaturedProductsAction } from "@/features/catalog/actions/public-actions";
import { ProductCard } from "@/components/website/product-card";
import { Zap, Clock, Sparkles, Percent, Tag, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hot Offers & Flash Sales - DropshopNN Bangladesh",
  description: "Exclusive promotional deals, flash sales, combo offers, and discounted wholesale prices on original gadgets in BD.",
};

export default async function OffersPage() {
  const [flashDealsRes, featuredRes] = await Promise.all([
    getPublicFlashDealsAction(16),
    getPublicFeaturedProductsAction(8),
  ]);

  const flashDeals = flashDealsRes.data;
  const featuredOffers = featuredRes.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8 sm:p-12 mb-12 shadow-2xl shadow-orange-500/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/40 border border-white/20 backdrop-blur-md text-amber-200 text-xs font-semibold mb-4">
              <Zap className="w-3.5 h-3.5 fill-amber-300" /> Limited Time Mega Discounts
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-heading leading-tight mb-4">
              Flash Deals & Special Campaign Offers
            </h1>
            <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed mb-6">
              Exclusive pricing on UGREEN, Baseus, Anker, and JBL tech accessories. Verified official warranty & quick courier shipping across Bangladesh.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-white">
              <div className="flex items-center gap-2 bg-slate-950/30 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10">
                <Clock className="w-4 h-4 text-amber-300" /> Ends Soon
              </div>
              <div className="flex items-center gap-2 bg-slate-950/30 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/10">
                <Percent className="w-4 h-4 text-amber-300" /> Up to 40% OFF
              </div>
            </div>
          </div>
          {/* Decorative background blur */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Flash Sales Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2.5 font-heading">
                <Zap className="w-6 h-6 text-amber-400 fill-amber-400" /> Active Flash Deals
              </h2>
              <p className="text-xs text-slate-400 mt-1">Limited stock available at promotional rates.</p>
            </div>
            <span className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              {flashDeals.length} deals live
            </span>
          </div>

          {flashDeals.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-10 text-center">
              <p className="text-xs text-slate-400">No active flash sales right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Featured Campaign Deals */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2.5 font-heading">
                <Sparkles className="w-6 h-6 text-amber-400" /> Featured Campaign Products
              </h2>
              <p className="text-xs text-slate-400 mt-1">Handpicked top performers with special bundle pricing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredOffers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
