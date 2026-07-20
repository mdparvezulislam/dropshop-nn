"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronsLeft, ChevronsRight, Search, Star, Clock } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { WORKSPACE_NAV, type NavItem, type NavSection } from "./nav-config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { usePermissions } from "@/shared/hooks/use-permissions";
import { WorkspaceSwitcher } from "./workspace-switcher";
import type { WorkspaceDefinition } from "@/shared/platform/platform-types";

const DEFAULT_WORKSPACES: WorkspaceDefinition[] = [
  { id: "admin", label: "Admin", description: "Full platform control", icon: "admin", roles: ["super_admin", "admin", "manager"], href: "/dashboard" },
  { id: "reseller", label: "Reseller", description: "Private catalog & orders", icon: "reseller", roles: ["reseller"], href: "/dashboard" },
  { id: "wholesaler", label: "Wholesaler", description: "Wholesale pricing & MOQ", icon: "wholesaler", roles: ["wholesaler"], href: "/dashboard" },
  { id: "supplier", label: "Supplier", description: "Product & inventory access", icon: "supplier", roles: ["supplier"], href: "/dashboard" },
  { id: "customer", label: "Customer", description: "Order & profile access", icon: "customer", roles: ["customer"], href: "/dashboard" },
];

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  nav?: NavSection[];
  workspaceLabel?: string;
  workspaceIcon?: React.ReactNode;
}

function isActivePath(pathname: string, href?: string): boolean {
  if (!href) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
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
}: SidebarProps): React.ReactElement {
  const pathname = usePathname();
  const { hasPermission, hasAnyRole, userRole } = usePermissions();
  const [query, setQuery] = React.useState("");
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const navConfig = nav ?? WORKSPACE_NAV;

  const accessibleWorkspaces = DEFAULT_WORKSPACES.filter((ws) =>
    ws.roles.some((r) => hasAnyRole([r]) || userRole === r),
  );
  const currentWorkspace = accessibleWorkspaces.find((ws) =>
    ws.roles.includes(userRole ?? ""),
  ) ?? accessibleWorkspaces[0];

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
  }, [pathname]);

  const toggleGroup = (label: string): void => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const filterMatch = (label: string): boolean => {
    if (!query.trim()) return true;
    return label.toLowerCase().includes(query.toLowerCase());
  };

  const content = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0"
          onClick={onMobileClose}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-glow">
            {workspaceIcon ?? "D"}
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight text-white truncate">
                {workspaceLabel ?? <>Dropshop<span className="text-sidebar-accent">NN</span></>}
              </div>
              <div className="text-[10px] text-sidebar-foreground/60 truncate">{workspaceLabel ? "Reseller Portal" : "Commerce OS"}</div>
            </div>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={onToggle}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-muted hover:text-white transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Search */}
      {!collapsed ? (
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find pages…"
              className="h-8 w-full rounded-md border border-sidebar-border bg-sidebar-muted pl-8 pr-2 text-xs text-white placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-1 focus:ring-sidebar-accent/50"
              aria-label="Search navigation"
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center pt-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/60 hover:bg-sidebar-muted hover:text-white"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Favorites / Recent placeholders */}
      {!collapsed ? (
        <div className="px-3 pt-3 space-y-1">
          <div className="flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            <Star className="h-3 w-3" /> Favorites
          </div>
          <p className="px-2 text-[11px] text-sidebar-foreground/35">Pin pages soon</p>
          <div className="flex items-center gap-2 px-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            <Clock className="h-3 w-3" /> Recent
          </div>
          <p className="px-2 text-[11px] text-sidebar-foreground/35">Recent pages soon</p>
        </div>
      ) : null}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto ws-scroll px-2 py-3 space-y-4">
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
              (item) => itemHasAccess(item) && (filterMatch(item.label) || item.children?.some((c) => filterMatch(c.label))),
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.id}>
                {!collapsed ? (
                  <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                    {section.label}
                  </div>
                ) : null}
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
                            "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                            active
                              ? "bg-sidebar-active text-white shadow-sm"
                              : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-white",
                            collapsed && "justify-center px-0",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-sidebar-accent" : "text-sidebar-foreground/70",
                            )}
                          />
                          {!collapsed ? <span className="truncate">{item.label}</span> : null}
                          {!collapsed && active ? (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-accent" />
                          ) : null}
                        </Link>
                      );

                      return (
                        <li key={item.label}>
                          {collapsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>{link}</TooltipTrigger>
                              <TooltipContent side="right">{item.label}</TooltipContent>
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
                            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                            active
                              ? "bg-sidebar-active/80 text-white"
                              : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-white",
                            collapsed && "justify-center px-0",
                          )}
                          aria-expanded={open}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active ? "text-sidebar-accent" : "text-sidebar-foreground/70",
                            )}
                          />
                          {!collapsed ? (
                            <>
                              <span className="truncate flex-1 text-left">{item.label}</span>
                              {item.badge ? (
                                <span className="rounded bg-sidebar-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase text-sidebar-foreground/50">
                                  {item.badge}
                                </span>
                              ) : null}
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 text-sidebar-foreground/40 transition-transform",
                                  open && "rotate-180",
                                )}
                              />
                            </>
                          ) : null}
                        </button>
                        {!collapsed && open && item.children ? (
                          <ul className="mt-0.5 ml-3 border-l border-sidebar-border pl-2 space-y-0.5">
                            {item.children
                              .filter((c) => (!c.permission || hasPermission(c.permission)) && (filterMatch(c.label) || filterMatch(item.label)))
                              .map((child) => {
                                const childActive = isActivePath(pathname, child.href);
                                return (
                                  <li key={child.href + child.label}>
                                    <Link
                                      href={child.href}
                                      onClick={onMobileClose}
                                      className={cn(
                                        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                                        childActive
                                          ? "text-white bg-sidebar-active"
                                          : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-muted",
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "h-1 w-1 rounded-full",
                                          childActive
                                            ? "bg-sidebar-accent"
                                            : "bg-sidebar-foreground/30",
                                        )}
                                      />
                                      {child.label}
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

      {/* Footer / Workspace Switcher */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        {accessibleWorkspaces.length > 1 ? (
          <WorkspaceSwitcher
            workspaces={accessibleWorkspaces}
            currentWorkspace={currentWorkspace}
            collapsed={collapsed}
          />
        ) : (
          !collapsed ? (
            <div className="rounded-lg border border-sidebar-border bg-sidebar-muted/60 px-3 py-2.5">
              <p className="text-[11px] font-medium text-white">{currentWorkspace?.label ?? "Workspace"}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{currentWorkspace?.description ?? "DropshopNN"}</p>
            </div>
          ) : (
            <div className="mx-auto h-2 w-2 rounded-full bg-success" title="Online" />
          )
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-sidebar-border transition-[width] duration-200 ease-out",
          collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
        )}
        style={
          {
            ["--sidebar-current" as string]: collapsed
              ? "var(--sidebar-collapsed)"
              : "var(--sidebar-width)",
          } as React.CSSProperties
        }
        aria-label="Main navigation"
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={onMobileClose}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(100%,var(--sidebar-width))] shadow-lg animate-[slide-in-left_0.2s_ease-out]">
            {content}
          </aside>
        </div>
      ) : null}
    </>
  );
}

export default Sidebar;
