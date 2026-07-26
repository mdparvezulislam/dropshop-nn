"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  MapPin,
  Package,
  Heart,
  Shield,
  Bell,
  UserCog,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AccountSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const ACCOUNT_NAV_ITEMS = [
  { label: "Overview", href: "/account", icon: LayoutDashboard },
  { label: "Profile", href: "/account/profile", icon: User },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Wishlist", href: "/account/wishlist", icon: Heart },
  { label: "Security", href: "/account/security", icon: Shield },
  { label: "Notifications", href: "/account/notifications", icon: Bell },
  { label: "Role & Permissions", href: "/account/role", icon: UserCog },
];

export function AccountSidebar({ collapsed, onToggle }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-card border-r border-border/50 transition-all duration-200 ease-out flex flex-col",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-border/30">
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/60"
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")}
          />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {ACCOUNT_NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/account" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-2">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
          title={collapsed ? "Back to Website" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Back to Site</span>}
        </Link>
      </div>
    </aside>
  );
}
