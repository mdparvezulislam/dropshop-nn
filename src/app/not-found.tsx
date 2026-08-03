import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { BRAND } from "@/config/brand";

export default function NotFound(): React.ReactElement {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-4xl border border-amber-500/30 shadow-md">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            পেজটি পাওয়া যায়নি
          </h1>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            আপনি যে পেজটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা ঠিকানা ভুল লিখেছেন।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-xs"
          >
            <Home className="h-4 w-4" />
            হোমপেজে ফিরে যান
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Search className="h-4 w-4" />
            প্রোডাক্টস খুঁজুন
          </Link>
        </div>

        <p className="text-xs text-slate-400 font-medium pt-4">
          © {new Date().getFullYear()} {BRAND.publicName}
        </p>
      </div>
    </div>
  );
}
