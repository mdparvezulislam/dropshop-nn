"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/products", label: "Products", icon: ShoppingBag },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/more", label: "More", icon: MoreHorizontal },
];

export function AdminMobileBottomNav(): ReactElement {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 block lg:hidden bg-slate-900/95 text-slate-100 backdrop-blur-md border-t border-slate-800 px-2 py-1 shadow-[0_-6px_25px_rgba(0,0,0,0.2)] pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <nav aria-label="Admin Navigation" className="flex items-center justify-around h-12 max-w-md mx-auto px-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all touch-manipulation active:scale-95",
                isActive
                  ? "text-amber-400 font-bold"
                  : "text-slate-400 hover:text-slate-200 font-medium",
              )}
            >
              {/* Active Accent Top Line Indicator */}
              {isActive && (
                <span className="absolute top-0 w-6 h-0.5 bg-amber-400 rounded-full animate-in fade-in zoom-in-50 duration-200" />
              )}

              <div
                className={cn(
                  "flex items-center justify-center p-1 rounded-xl transition-all",
                  isActive ? "bg-amber-400/15" : "bg-transparent",
                )}
              >
                <Icon className={cn("h-5 w-5 stroke-[1.75]", isActive && "stroke-[2.25]")} aria-hidden />
              </div>

              <span className="text-[10px] tracking-tight truncate leading-none mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default AdminMobileBottomNav;
