"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronRight,
  Command,
  Menu,
  Plus,
  Search,
  LogOut,
  User,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getBreadcrumbs, type Breadcrumb } from "./nav-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/features/notification/components/notification-bell";

export interface TopbarUserMenuItem {
  label: string;
  href?: string;
  destructive?: boolean;
}

export interface TopbarProps {
  onMenuClick: () => void;
  onCommandOpen: () => void;
  collapsed: boolean;
  getBreadcrumbsFn?: (pathname: string) => Breadcrumb[];
  searchPlaceholder?: string;
  avatarFallback?: string;
  userLabel?: string;
  userEmail?: string;
  userMenuItems?: TopbarUserMenuItem[];
  showQuickAction?: boolean;
}

export function Topbar({
  onMenuClick,
  onCommandOpen,
  collapsed,
  getBreadcrumbsFn = getBreadcrumbs,
  searchPlaceholder = "Search workspace… (CTRL+K)",
  avatarFallback = "SA",
  userLabel = "Super Admin",
  userEmail = "admin@dropshop.nn",
  userMenuItems,
  showQuickAction = true,
}: TopbarProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = getBreadcrumbsFn(pathname);
  const [dark, setDark] = React.useState(false);

  const toggleTheme = (): void => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const menuItems: TopbarUserMenuItem[] = userMenuItems ?? [
    { label: "Profile", href: "/dashboard" },
    { label: "Settings", href: "/dashboard/settings" },
    { label: "Sign out", destructive: true },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[var(--topbar-height)] items-center justify-between gap-3 border-b border-border bg-card/95 backdrop-blur-md px-3 sm:px-6 transition-colors duration-200 shadow-2xs",
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Desktop Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={`${crumb.label}-${i}`}>
              {i > 0 ? (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
              ) : null}
              {crumb.href && i < crumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold truncate transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "text-xs truncate",
                    i === crumbs.length - 1
                      ? "font-extrabold text-foreground"
                      : "text-muted-foreground font-medium",
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Mobile Breadcrumb summary */}
        <div className="sm:hidden min-w-0 flex-1 truncate">
          <span className="text-xs font-extrabold text-foreground truncate">
            {crumbs[crumbs.length - 1]?.label || "Dashboard"}
          </span>
        </div>
      </div>

      {/* Global Raycast Command Search Bar */}
      <button
        type="button"
        onClick={onCommandOpen}
        className={cn(
          "hidden md:flex items-center gap-2.5 h-8.5 rounded-lg border border-border bg-muted/30 px-3 text-xs text-muted-foreground",
          "hover:bg-muted/70 hover:border-primary/50 hover:text-foreground transition-all shadow-2xs group",
          collapsed ? "w-56" : "w-64 xl:w-80",
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="flex-1 text-left text-xs truncate">{searchPlaceholder}</span>
        <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-2xs font-semibold">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2 shrink-0">
        {showQuickAction ? (
          <Button
            size="sm"
            className="hidden sm:inline-flex gap-1.5 h-8 text-xs font-semibold shadow-xs"
            onClick={onCommandOpen}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Quick Action</span>
          </Button>
        ) : null}

        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onCommandOpen}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-transform hover:scale-105"
        >
          {dark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </Button>

        <NotificationBell />

        {/* Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-full p-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:ring-2 hover:ring-primary/40"
            aria-label="User menu"
          >
            <Avatar className="h-7.5 w-7.5 border border-primary/40 shadow-2xs">
              <AvatarFallback className="bg-accent text-foreground font-bold text-xs">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-xl border-border">
            <DropdownMenuLabel className="p-3">
              <div className="flex flex-col space-y-0.5">
                <span className="text-xs font-bold text-foreground">{userLabel}</span>
                <span className="text-[11px] font-normal text-muted-foreground truncate">{userEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {menuItems.map((item, index) => {
              const prev = menuItems[index - 1];
              const showSep = item.destructive && prev && !prev.destructive;
              return (
                <React.Fragment key={`${item.label}-${index}`}>
                  {showSep ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem
                    destructive={item.destructive}
                    className="text-xs font-medium gap-2 py-2 cursor-pointer"
                    onClick={() => {
                      if (item.destructive) {
                        void signOut({ callbackUrl: "/auth/login" });
                        return;
                      }
                      if (item.href) router.push(item.href);
                    }}
                  >
                    {item.label === "Profile" || item.label === "Account" ? (
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : null}
                    {item.label === "Settings" ? (
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : null}
                    {item.destructive ? <LogOut className="h-3.5 w-3.5 text-destructive" /> : null}
                    {item.label}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default Topbar;
