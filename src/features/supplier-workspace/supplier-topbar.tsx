"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Command,
  Menu,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { getSupplierBreadcrumbs } from "./nav-config";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";

export interface SupplierTopbarProps {
  onMenuClick: () => void;
  onCommandOpen: () => void;
  collapsed: boolean;
}

export function SupplierTopbar({ onMenuClick, onCommandOpen, collapsed }: SupplierTopbarProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = getSupplierBreadcrumbs(pathname);
  const [dark, setDark] = React.useState(true);

  const toggleTheme = (): void => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-topbar-border bg-topbar/90 backdrop-blur-md px-3 sm:px-5",
      )}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 min-w-0 flex-1">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={`${crumb.label}-${i}`}>
            {i > 0 ? (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            ) : null}
            {crumb.href && i < crumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="text-xs text-muted-foreground hover:text-foreground truncate transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "text-xs truncate",
                  i === crumbs.length - 1 ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      <div className="flex-1 sm:hidden" />

      <button
        type="button"
        onClick={onCommandOpen}
        className={cn(
          "hidden md:flex items-center gap-2 h-9 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground",
          "hover:bg-muted hover:text-foreground transition-colors shadow-xs",
          collapsed ? "w-56" : "w-64 xl:w-80",
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Search supplier portal…</span>
        <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Notifications" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-3 text-xs text-muted-foreground">
              No new notifications.
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-muted transition-colors"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>SP</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Supplier Portal</span>
                <span className="text-xs font-normal text-muted-foreground">supplier@dropshop.nn</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/supplier/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/supplier/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              Switch to Admin
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default SupplierTopbar;
