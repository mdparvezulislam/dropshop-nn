"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { ACCOUNT_NAV_ITEMS } from "./account-sidebar";

export function AccountMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden sticky top-16 z-30 border-b border-border/50 bg-background/95 backdrop-blur-sm"
      aria-label="Account navigation"
    >
      <div className="flex gap-1 overflow-x-auto px-3 py-2 scrollbar-none">
        {ACCOUNT_NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/account" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
