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
import { cn } from "@/shared/utils/cn";
import { getBreadcrumbs, type Breadcrumb } from "./nav-config";
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
  searchPlaceholder = "Search workspace…",
  avatarFallback = "SA",
  userLabel = "Super Admin",
  userEmail = "admin@dropshop.nn",
  userMenuItems,
  showQuickAction = true,
}: TopbarProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = getBreadcrumbsFn(pathname);
  const [dark, setDark] = React.useState(true);

  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = (): void => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const menuItems: TopbarUserMenuItem[] = userMenuItems ?? [
    { label: "Profile", href: "/dashboard" },
    { label: "Settings", href: "/dashboard" },
    { label: "Sign out", destructive: true },
  ];

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
        <span className="flex-1 text-left text-xs">{searchPlaceholder}</span>
        <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="flex items-center gap-1.5">
        {showQuickAction ? (
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex gap-1.5"
            onClick={onCommandOpen}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Quick action</span>
          </Button>
        ) : null}

        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onCommandOpen}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{userLabel}</span>
                <span className="text-xs font-normal text-muted-foreground">{userEmail}</span>
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
                    onClick={() => {
                      if (item.destructive) {
                        void signOut({ callbackUrl: "/auth/login" });
                        return;
                      }
                      if (item.href) router.push(item.href);
                    }}
                  >
                    {item.label === "Profile" || item.label === "Account" ? (
                      <User className="h-4 w-4" />
                    ) : null}
                    {item.label === "Settings" ? <Settings className="h-4 w-4" /> : null}
                    {item.destructive ? <LogOut className="h-4 w-4" /> : null}
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
