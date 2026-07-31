"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Bell, Search, Plus } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/reseller": "রিসেলার ড্যাশবোর্ড",
  "/reseller/products": "প্রোডাক্ট ক্যাটালগ",
  "/reseller/orders": "আমার অর্ডারসমূহ",
  "/reseller/orders/create": "নতুন কুইক অর্ডার",
  "/reseller/customers": "গ্রাহক তালিকা",
  "/reseller/wallet": "মাই ওয়ালেট",
  "/reseller/notifications": "নোটিফিকেশন",
  "/reseller/more": "মেনু ও রিসেলার সেটিংস",
};

export interface ResellerHeaderProps {
  onSearchOpen?: () => void;
}

export function ResellerHeader({ onSearchOpen }: ResellerHeaderProps): ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  const title = PAGE_TITLES[pathname] ?? "রিসেলার ওয়ার্কস্পেস";
  const isSubPage = pathname !== "/reseller";

  return (
    <header className="sticky top-0 z-30 lg:hidden h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-2 min-w-0">
        {isSubPage ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation"
            aria-label="পিছনে যান"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xs">
            RS
          </div>
        )}
        <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onSearchOpen && (
          <button
            type="button"
            onClick={onSearchOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation"
            aria-label="খুঁজুন"
          >
            <Search className="h-4.5 w-4.5" aria-hidden />
          </button>
        )}

        <Link
          href="/reseller/notifications"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation relative"
          aria-label="নোটিফিকেশন"
        >
          <Bell className="h-4.5 w-4.5" aria-hidden />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
        </Link>

        <Link
          href="/reseller/orders/create"
          className="flex h-9 px-3 items-center justify-center gap-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-600 transition-all active:scale-95 shadow-2xs touch-manipulation"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span className="hidden sm:inline">অর্ডার</span>
        </Link>
      </div>
    </header>
  );
}

export default ResellerHeader;
