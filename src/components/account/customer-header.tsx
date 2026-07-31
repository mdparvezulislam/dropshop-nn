"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Bell, ShoppingBag } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/account": "গ্রাহক ড্যাশবোর্ড",
  "/account/orders": "আমার অর্ডারসমূহ",
  "/account/notifications": "নোটিফিকেশন",
  "/account/profile": "মাই প্রোফাইল",
  "/account/addresses": "আমার ঠিকানা",
  "/account/security": "অ্যাকাউন্ট সিকিউরিটি",
  "/account/wishlist": "উইশলিস্ট",
  "/account/reviews": "রিভিউসমূহ",
  "/account/more": "মেনু ও সেটিংস",
};

export function CustomerHeader(): ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  const title = PAGE_TITLES[pathname] ?? "মাই অ্যাকাউন্ট";
  const isSubPage = pathname !== "/account";

  return (
    <header className="sticky top-0 z-30 md:hidden h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shadow-2xs">
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
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xs">
            NN
          </div>
        )}
        <h1 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          href="/account/notifications"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation relative"
          aria-label="নোটিফিকেশন"
        >
          <Bell className="h-4.5 w-4.5" aria-hidden />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
        </Link>

        <Link
          href="/cart"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation"
          aria-label="কার্ট"
        >
          <ShoppingBag className="h-4.5 w-4.5" aria-hidden />
        </Link>
      </div>
    </header>
  );
}

export default CustomerHeader;
