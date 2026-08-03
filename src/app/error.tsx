"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { BRAND } from "@/config/brand";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    console.error("Global App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 shadow-md">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            সাময়িক সমস্যা দেখা দিয়েছে
          </h1>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            আমাদের সার্ভারে সাময়িক সমস্যা তৈরি হয়েছে। দয়া করে পেজটি আবার রিফ্রেশ করুন।
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-all shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            আবার চেষ্টা করুন
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-black hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Home className="h-4 w-4" />
            হোমপেজে যান
          </Link>
        </div>

        <p className="text-xs text-slate-400 font-medium pt-4">
          © {new Date().getFullYear()} {BRAND.publicName}
        </p>
      </div>
    </div>
  );
}
