"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Star,
  Clock,
  Pin,
  HelpCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { WORKSPACE_NAV, type NavItem, type NavSection } from "./nav-config";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermissions } from "@/hooks/use-permissions";
import { WorkspaceSwitcher } from "./workspace-switcher";
import type { WorkspaceDefinition } from "@/lib/platform/platform-types";

const DEFAULT_WORKSPACES: WorkspaceDefinition[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Full platform control",
    icon: "admin",
    roles: ["super_admin", "admin", "manager"],
    href: "/dashboard",
  },
  {
    id: "reseller",
    label: "Reseller",
    description: "Private catalog & orders",
    icon: "reseller",
    roles: ["reseller"],
    href: "/reseller",
  },
  {
    id: "wholesaler",
    label: "Wholesaler",
    description: "Wholesale pricing & MOQ",
    icon: "wholesaler",
    roles: ["wholesaler"],
    href: "/wholesale",
  },
  {
    id: "supplier",
    label: "Supplier",
    description: "Product & inventory access",
    icon: "supplier",
    roles: ["supplier"],
    href: "/supplier",
  },
  {
    id: "customer",
    label: "Customer",
    description: "Order & profile access",
    icon: "customer",
    roles: ["dashboard"],
    href: "/dashboard",
  },
];

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  nav?: NavSection[];
  workspaceLabel?: string;
  workspaceIcon?: React.ReactNode;
  homeHref?: string;
  subtitle?: string;
}

function isActivePath(pathname: string, href?: string): boolean {
  if (!href) return false;
  if (
    href === "/dashboard" ||
    href === "/reseller" ||
    href === "/wholesale" ||
    href === "/supplier"
  ) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function itemIsActive(pathname: string, item: NavItem): boolean {
  if (item.href && isActivePath(pathname, item.href)) return true;
  return Boolean(item.children?.some((c) => isActivePath(pathname, c.href)));
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
  nav,
  workspaceLabel,
  workspaceIcon,
  homeHref = "/dashboard",
  subtitle,
}: SidebarProps): React.ReactElement {
  const pathname = usePathname();
  const { hasPermission, hasAnyRole, userRole } = usePermissions();
  const [query, setQuery] = React.useState("");
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const [recentPages, setRecentPages] = React.useState<{ label: string; href: string }[]>([]);
  const [pinnedPages, setPinnedPages] = React.useState<{ label: string; href: string }[]>([
    { label: "All Products", href: "/dashboard/products" },
    { label: "All Orders", href: "/dashboard/orders" },
  ]);

  const navConfig = nav ?? WORKSPACE_NAV;

  const accessibleWorkspaces = DEFAULT_WORKSPACES.filter((ws) =>
    ws.roles.some(
      (r) => hasAnyRole([r]) || userRole === r || (userRole ?? "").toLowerCase().includes(r),
    ),
  );
  const currentWorkspace =
    accessibleWorkspaces.find((ws) => pathname.startsWith(ws.href)) ??
    accessibleWorkspaces.find((ws) => ws.roles.includes(userRole ?? "")) ??
    accessibleWorkspaces[0];

  // Track recent page visits
  React.useEffect(() => {
    if (!pathname) return;
    for (const section of navConfig) {
      for (const item of section.items) {
        if (item.href && item.href === pathname) {
          const itemHref = item.href;
          setRecentPages((prev) => {
            const filtered = prev.filter((p) => p.href !== itemHref);
            return [{ label: item.label, href: itemHref }, ...filtered].slice(0, 4);
          });
        }
        if (item.children) {
          for (const child of item.children) {
            if (child.href === pathname) {
              const childHref = child.href;
              setRecentPages((prev) => {
                const filtered = prev.filter((p) => p.href !== childHref);
                return [{ label: child.label, href: childHref }, ...filtered].slice(0, 4);
              });
            }
          }
        }
      }
    }
  }, [pathname, navConfig]);

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const section of navConfig) {
      for (const item of section.items) {
        if (item.children && itemIsActive(pathname, item)) {
          next[item.label] = true;
        }
      }
    }
    setOpenGroups((prev) => ({ ...prev, ...next }));
  }, [pathname, navConfig]);

  const toggleGroup = (label: string): void => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const filterMatch = (label: string): boolean => {
    if (!query.trim()) return true;
    return label.toLowerCase().includes(query.toLowerCase());
  };

  const content = (
    <div className="flex h-full flex-col bg-card text-foreground border-r border-border select-none">
      {/* Workspace Header */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-border shrink-0 transition-all px-3.5",
          collapsed ? "justify-center px-2" : "justify-between",
        )}
      >
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-2.5 group"
          onClick={onMobileClose}
        >
          <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
            {workspaceIcon ?? "D"}
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold tracking-tight text-foreground flex items-center gap-1">
                {workspaceLabel ?? (
                  <>
                    Dropshop<span className="text-primary">NN</span>
                  </>
                )}
              </div>
              <div className="truncate text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {subtitle ?? "Enterprise Commerce OS"}
              </div>
            </div>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Search Input */}
      {!collapsed ? (
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections..."
              className="h-8 w-full rounded-lg border border-border/80 bg-muted/30 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              aria-label="Search navigation"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            ) : (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono px-1 rounded bg-muted text-muted-foreground pointer-events-none">
                /
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center pt-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Pinned & Favorites Section */}
      {!collapsed && pinnedPages.length > 0 && !query ? (
        <div className="px-3 pt-2 pb-1">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1">
              <Pin className="h-3 w-3 text-primary" /> Pinned
            </span>
          </div>
          <div className="flex flex-wrap gap-1 px-1">
            {pinnedPages.map((pin) => (
              <Link
                key={pin.href}
                href={pin.href}
                className={cn(
                  "truncate max-w-[125px] rounded-md px-2 py-1 text-[11px] font-semibold transition-colors border",
                  pathname === pin.href
                    ? "bg-accent text-foreground border-primary font-bold shadow-2xs"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted border-border/40",
                )}
              >
                {pin.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto ws-scroll px-2 py-2 space-y-3">
        <TooltipProvider delayDuration={0}>
          {navConfig.map((section) => {
            function itemHasAccess(i: NavItem): boolean {
              if (i.permission && !hasPermission(i.permission)) return false;
              if (i.anyPermission && !i.anyPermission.some((p) => hasPermission(p))) return false;
              if (i.children) {
                const visibleChildren = i.children.filter(
                  (c) => !c.permission || hasPermission(c.permission),
                );
                if (visibleChildren.length === 0) return false;
              }
              return true;
            }

            const visibleItems = section.items.filter(
              (item) =>
                itemHasAccess(item) &&
                (filterMatch(item.label) || item.children?.some((c) => filterMatch(c.label))),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.id} className="space-y-0.5">
                {!collapsed ? (
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    {section.label}
                  </div>
                ) : (
                  <div className="mx-auto my-1 h-px w-4 bg-border" />
                )}
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const active = itemIsActive(pathname, item);
                    const hasChildren = Boolean(item.children?.length);
                    const open = openGroups[item.label] ?? false;

                    if (!hasChildren && item.href) {
                      const link = (
                        <Link
                          href={item.href}
                          onClick={onMobileClose}
                          className={cn(
                            "relative group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150",
                            active
                              ? "bg-accent text-foreground font-bold border-l-4 border-primary pl-2 shadow-2xs"
                              : "text-foreground/80 hover:bg-muted/70 hover:text-foreground",
                            collapsed && "justify-center px-0 border-l-0",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              active
                                ? "text-primary font-bold"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          {!collapsed ? <span className="truncate">{item.label}</span> : null}
                          {!collapsed && item.badge ? (
                            <span className="ml-auto rounded bg-primary/15 text-primary px-1.5 py-0.5 text-[9px] font-extrabold uppercase">
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      );

                      return (
                        <li key={item.label}>
                          {collapsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>{link}</TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="bg-foreground text-background font-semibold"
                              >
                                {item.label}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            link
                          )}
                        </li>
                      );
                    }

                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          onClick={() => {
                            if (collapsed) {
                              onToggle();
                              setOpenGroups((p) => ({ ...p, [item.label]: true }));
                            } else {
                              toggleGroup(item.label);
                            }
                          }}
                          className={cn(
                            "relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150",
                            active
                              ? "bg-accent/80 text-foreground font-bold border-l-4 border-primary/70 pl-2"
                              : "text-foreground/80 hover:bg-muted/70 hover:text-foreground",
                            collapsed && "justify-center px-0 border-l-0",
                          )}
                          aria-expanded={open}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              active ? "text-primary font-bold" : "text-muted-foreground",
                            )}
                          />
                          {!collapsed ? (
                            <>
                              <span className="truncate flex-1 text-left">{item.label}</span>
                              {item.badge ? (
                                <span className="rounded bg-primary/15 text-primary px-1.5 py-0.5 text-[9px] font-extrabold uppercase">
                                  {item.badge}
                                </span>
                              ) : null}
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
                                  open && "rotate-180 text-primary",
                                )}
                              />
                            </>
                          ) : null}
                        </button>
                        {!collapsed && open && item.children ? (
                          <ul className="mt-1 ml-3.5 border-l border-border pl-2.5 space-y-0.5 animate-slide-down">
                            {item.children
                              .filter(
                                (c) =>
                                  (!c.permission || hasPermission(c.permission)) &&
                                  (filterMatch(c.label) || filterMatch(item.label)),
                              )
                              .map((child) => {
                                const childActive = isActivePath(pathname, child.href);
                                return (
                                  <li key={child.href + child.label}>
                                    <Link
                                      href={child.href}
                                      onClick={onMobileClose}
                                      className={cn(
                                        "flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors",
                                        childActive
                                          ? "text-primary font-extrabold bg-accent"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "h-1.5 w-1.5 rounded-full shrink-0",
                                          childActive ? "bg-primary" : "bg-muted-foreground/40",
                                        )}
                                      />
                                      <span className="truncate">{child.label}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Support & Workspace Switcher Footer */}
      <div className="border-t border-border p-2.5 shrink-0 space-y-2">
        {!collapsed && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
            <Link
              href="/support"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5 text-primary" /> Support Center
            </Link>
            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              v1.0
            </span>
          </div>
        )}
        {accessibleWorkspaces.length > 1 ? (
          <WorkspaceSwitcher
            workspaces={accessibleWorkspaces}
            currentWorkspace={currentWorkspace}
            collapsed={collapsed}
          />
        ) : !collapsed ? (
          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <p className="text-xs font-bold text-foreground truncate">
              {currentWorkspace?.label ?? "Workspace"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {currentWorkspace?.description ?? "NN Enterprise OS"}
            </p>
          </div>
        ) : (
          <div
            className="mx-auto h-2 w-2 rounded-full bg-primary animate-pulse"
            title="System Active"
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col transition-[width] duration-200 ease-in-out",
          collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
        )}
        aria-label="Main navigation"
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-label="Close menu"
            onClick={onMobileClose}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(85vw,var(--sidebar-width))] shadow-2xl animate-[slide-in-left_0.2s_ease-out]">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default Sidebar;
