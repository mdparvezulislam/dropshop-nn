"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Plus,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function ResellerMobileBottomNav(): React.ReactElement {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Dashboard", href: "/reseller", icon: LayoutDashboard },
    { label: "Products", href: "/reseller/products", icon: Package },
    { label: "Create Order", href: "/reseller/orders/create", icon: Plus, isAction: true },
    { label: "Orders", href: "/reseller/orders", icon: ShoppingCart },
    { label: "Wallet", href: "/reseller/wallet", icon: Wallet },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block lg:hidden bg-card/95 backdrop-blur-md border-t border-border/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
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
                className="relative -top-4 flex items-center justify-center shrink-0"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-md border-2 border-background active:scale-95 transition-transform">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
              </Link>
            );
          }

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-colors text-center text-[10px] font-bold",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("w-5 h-5 mb-0.5 transition-transform", isActive && "scale-110")} />
              <span className="leading-none">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-primary mt-1 animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
