import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs max-w-lg mx-auto">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 mb-5 shadow-2xs border border-amber-200/50 dark:border-amber-800/50">
        <ShoppingBag className="h-10 w-10 stroke-[1.75]" aria-hidden />
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
        আপনার কার্ট খালি রয়েছে
      </h2>
      <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
        আপনি এখনও কার্টে কোনো প্রোডাক্ট যুক্ত করেননি। সেরা দামে অরিজিনাল গ্যাজেট ও অ্যাক্সেসরিজ পছন্দ করে কার্টে যোগ করুন।
      </p>
      <Link
        href="/products"
        className="inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-8 shadow-md transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-amber-600 touch-manipulation"
      >
        <span>কেনাকাটা শুরু করুন</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export default EmptyCart;
