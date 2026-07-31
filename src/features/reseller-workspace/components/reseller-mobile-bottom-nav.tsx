"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Plus,
  ClipboardList,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ResellerMobileBottomNav(): React.ReactElement {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "ড্যাশবোর্ড", href: "/reseller", icon: LayoutDashboard },
    { label: "প্রোডাক্টস", href: "/reseller/products", icon: Package },
    { label: "কুইক অর্ডার", href: "/reseller/orders/create", icon: Plus, isAction: true },
    { label: "অর্ডারসমূহ", href: "/reseller/orders", icon: ClipboardList },
    { label: "আরও", href: "/reseller/more", icon: MoreHorizontal },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 block lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-[0_-6px_25px_rgba(0,0,0,0.08)] pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/reseller"
              ? pathname === "/reseller"
              : pathname.startsWith(item.href);

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4 flex flex-col items-center justify-center shrink-0 group active:scale-95 transition-transform touch-manipulation"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 border-4 border-white dark:border-slate-900 font-black">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  কুইক অর্ডার
                </span>
              </Link>
            );
          }

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-2.5 min-w-[52px] rounded-xl transition-all text-center touch-manipulation active:scale-95",
                isActive
                  ? "text-amber-600 dark:text-amber-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium",
              )}
            >
              {isActive && (
                <span className="absolute top-0 w-6 h-0.5 bg-amber-500 rounded-full animate-in fade-in zoom-in-50 duration-200" />
              )}
              <div
                className={cn(
                  "flex items-center justify-center p-1 rounded-xl transition-all",
                  isActive ? "bg-amber-500/10 dark:bg-amber-500/20" : "bg-transparent",
                )}
              >
                <Icon className={cn("w-5 h-5 stroke-[1.75]", isActive && "stroke-[2.25]")} />
              </div>
              <span className="text-[10px] tracking-tight truncate leading-none mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ResellerMobileBottomNav;
