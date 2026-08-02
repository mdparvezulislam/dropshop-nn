"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Bell, Search, ShieldAlert } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Operations Center",
  "/dashboard/orders": "Order Management",
  "/dashboard/products": "Product Catalog",
  "/dashboard/users": "User Management",
  "/dashboard/approvals": "Approval Center",
  "/dashboard/inventory": "Inventory Alerts",
  "/dashboard/analytics": "Business Analytics",
  "/dashboard/notifications": "System Notifications",
  "/dashboard/more": "Operations Hub",
};

export interface AdminHeaderProps {
  onSearchOpen?: () => void;
}

export function AdminHeader({ onSearchOpen }: AdminHeaderProps): ReactElement {
  const pathname = usePathname();
  const router = useRouter();

  const title = PAGE_TITLES[pathname] ?? "Admin Workspace";
  const isSubPage = pathname !== "/dashboard";

  return (
    <header className="sticky top-0 z-30 lg:hidden h-14 bg-slate-950/95 text-slate-100 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2 min-w-0">
        {isSubPage ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xs">
            OP
          </div>
        )}
        <h1 className="text-sm font-black text-slate-100 truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onSearchOpen && (
          <button
            type="button"
            onClick={onSearchOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation"
            aria-label="Search"
          >
            <Search className="h-4.5 w-4.5" aria-hidden />
          </button>
        )}

        <Link
          href="/dashboard/approvals"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-amber-400 hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation relative"
          aria-label="Approvals"
        >
          <ShieldAlert className="h-4.5 w-4.5" aria-hidden />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        </Link>

        <Link
          href="/dashboard/notifications"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 transition-colors active:scale-95 touch-manipulation relative"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5" aria-hidden />
        </Link>
      </div>
    </header>
  );
}

export default AdminHeader;
