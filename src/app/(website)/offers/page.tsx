import Link from "next/link";
import {
  getPublicFlashDealsAction,
  getPublicFeaturedProductsAction,
} from "@/features/catalog/actions/public-actions";
import { ProductCard } from "@/components/website/product-card";
import { Zap, Clock, Sparkles, Percent } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ফ্ল্যাশ সেল ও হট অফার - DropshopNN Bangladesh",
  description: "বাংলাদেশের সেরা ড্রপশিপিং ও পাইকারি দামে হট অফার এবং ফ্ল্যাশ সেল প্রোডাক্ট কিনুন।",
};

export default async function OffersPage() {
  const [flashDealsRes, featuredRes] = await Promise.all([
    getPublicFlashDealsAction(16),
    getPublicFeaturedProductsAction(8),
  ]);

  const flashDeals = flashDealsRes.data;
  const featuredOffers = featuredRes.data;

  return (
    <div className="min-h-screen bg-[hsl(0_0%_98%)] text-slate-900 py-8">
      <div className="mx-auto max-w-(--content-max) px-4 sm:px-6 lg:px-8">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 sm:p-12 mb-12 shadow-lg">
          <div className="relative z-10 max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/30 border border-white/30 text-white text-xs font-black mb-4">
              <Zap className="w-3.5 h-3.5 fill-white text-amber-300" /> সীমিত সময়ের মেগা ছাড়
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              ফ্ল্যাশ সেল এবং বিশেষ অফার
            </h1>
            <p className="text-sm sm:text-base text-amber-50 font-semibold leading-relaxed mb-6">
              ইউগ্রিন, বেসাস, অ্যাঙ্কার এবং জেবিএল গ্যাজেট প্রোডাক্টে আকর্ষণীয় মূল্যছাড়। অরিজিনাল
              ওয়ারেন্টি এবং সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-black text-white">
              <div className="flex items-center gap-2 bg-slate-900/30 px-3.5 py-2 rounded-xl border border-white/20">
                <Clock className="w-4 h-4 text-amber-300" /> স্টক সীমিত
              </div>
              <div className="flex items-center gap-2 bg-slate-900/30 px-3.5 py-2 rounded-xl border border-white/20">
                <Percent className="w-4 h-4 text-amber-300" /> সর্বোচ্চ ৪০% ছাড়
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Flash Sales Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Zap className="w-6 h-6 text-amber-500 fill-amber-500" /> রানিং ফ্ল্যাশ ডিলসমূহ
              </h2>
              <p className="text-xs font-bold text-slate-600 mt-1">
                প্রমোশনাল রেটে সীমিত সময়ের জন্য।
              </p>
            </div>
            <span className="text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl">
              {flashDeals.length} টি ডিল লাইভ
            </span>
          </div>

          {flashDeals.length === 0 ? (
            <div className="bg-white border border-slate-300 rounded-2xl p-10 text-center shadow-xs">
              <p className="text-xs font-bold text-slate-600">
                এখন কোনো ফ্ল্যাশ সেল নেই। খুব শীঘ্রই আবার আসবে!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {flashDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Featured Campaign Deals */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-amber-500" /> ক্যাম্পেইন সেরা প্রোডাক্ট
              </h2>
              <p className="text-xs font-bold text-slate-600 mt-1">
                সবচেয়ে বেশি বিক্রি হওয়া সেরা কালেকশন।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredOffers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
