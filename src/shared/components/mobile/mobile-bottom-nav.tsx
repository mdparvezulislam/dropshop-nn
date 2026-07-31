"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Package, Search, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLocalCart } from "@/features/checkout/store/local-cart";

export interface MobileNavItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ElementType;
  badgeCount?: number;
  isAction?: boolean;
}

export function MobileBottomNav(): React.ReactElement {
  const pathname = usePathname();
  const { status } = useSession();
  const cart = useLocalCart();

  const isLoggedIn = status === "authenticated";

  const handleSearchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-global-search"));
  };

  const navItems: MobileNavItem[] = React.useMemo(
    () => [
      { id: "home", label: "হোম", href: "/", icon: Home },
      { id: "products", label: "প্রোডাক্ট", href: "/products", icon: Package },
      { id: "search", label: "সার্চ", icon: Search, isAction: true },
      { id: "cart", label: "কার্ট", href: "/cart", icon: ShoppingCart, badgeCount: cart.count },
      {
        id: "account",
        label: isLoggedIn ? "অ্যাকাউন্ট" : "লগইন",
        href: isLoggedIn ? "/account" : "/auth/login",
        icon: User,
      },
    ],
    [isLoggedIn, cart.count],
  );

  return (
    <nav
      aria-label="প্রধান মোবাইল নেভিগেশন"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-6px_25px_rgba(0,0,0,0.1)] px-1.5 pt-0.5 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] rounded-t-xl"
    >
      <div className="flex items-center justify-around h-12 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            !item.isAction &&
            item.href &&
            (item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href));

          const content = (
            <>
              {/* Top active bar indicator */}
              {isActive && (
                <span className="absolute top-0.5 w-6 h-0.5 rounded-full bg-amber-500 shadow-xs animate-in fade-in duration-200" />
              )}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    isActive
                      ? "text-amber-600 dark:text-amber-400 scale-105"
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200",
                  )}
                  aria-hidden
                />
                {Boolean(item.badgeCount && item.badgeCount > 0) && (
                  <span
                    className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-slate-950 tabular-nums shadow-2xs animate-in scale-in duration-150"
                    aria-label={`${item.badgeCount} টি`}
                  >
                    {item.badgeCount! > 99 ? "99+" : item.badgeCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none mt-0.5 font-semibold tracking-tight truncate max-w-full transition-colors",
                  isActive
                    ? "text-amber-600 dark:text-amber-400 font-bold"
                    : "text-slate-500 dark:text-slate-400",
                )}
              >
                {item.label}
              </span>

              {/* Active Indicator Background Pill */}
              {isActive && (
                <span className="absolute inset-0.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 -z-10 animate-in fade-in duration-200" />
              )}
            </>
          );

          if (item.isAction) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={handleSearchClick}
                className="group relative flex flex-col items-center justify-center flex-1 h-12 min-h-[44px] py-0.5 px-0.5 rounded-lg transition-all touch-manipulation active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-500"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href!}
              className="group relative flex flex-col items-center justify-center flex-1 h-12 min-h-[44px] py-0.5 px-0.5 rounded-lg transition-all touch-manipulation active:scale-95 focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
