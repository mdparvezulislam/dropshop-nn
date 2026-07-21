import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Building2,
  Store,
  Warehouse,
  Package,
  Plus,
  DollarSign,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  BarChart3,
  Bell,
  Newspaper,
} from "lucide-react";
import type { NavSection } from "./nav-config";
import { WORKSPACE_NAV, getBreadcrumbs, type Breadcrumb } from "./nav-config";
import { RESELLER_NAV, getResellerBreadcrumbs } from "@/features/reseller-workspace/nav-config";
import { WHOLESALE_NAV, getWholesaleBreadcrumbs } from "@/features/wholesale-workspace/nav-config";
import { SUPPLIER_NAV, getSupplierBreadcrumbs } from "@/features/supplier-workspace/nav-config";
import type { CommandItem } from "./command-palette";

export type WorkspaceId = "admin" | "reseller" | "wholesale" | "supplier";

export interface WorkspaceShellConfig {
  id: WorkspaceId;
  label: string;
  description: string;
  basePath: string;
  homeHref: string;
  nav: NavSection[];
  roles: string[];
  getBreadcrumbs: (pathname: string) => Breadcrumb[];
  searchPlaceholder: string;
  showQuickAction: boolean;
  quickActionHref?: string;
  extraCommands?: CommandItem[];
}

function flattenNavCommands(nav: NavSection[], group = "Navigate"): CommandItem[] {
  const commands: CommandItem[] = [];
  for (const section of nav) {
    for (const item of section.items) {
      if (item.href) {
        commands.push({
          id: `${section.id}-${item.label}`,
          label: item.label,
          href: item.href,
          icon: item.icon,
          group: section.label || group,
        });
      }
      if (item.children) {
        for (const child of item.children) {
          commands.push({
            id: `${section.id}-${item.label}-${child.label}`,
            label: child.label,
            href: child.href,
            icon: child.icon ?? item.icon,
            group: item.label,
          });
        }
      }
    }
  }
  return commands;
}

const ADMIN_EXTRA: CommandItem[] = [
  {
    id: "qa-product",
    label: "Create product",
    href: "/dashboard/products/new",
    icon: Plus,
    group: "Quick actions",
  },
  {
    id: "qa-supplier",
    label: "Onboard supplier",
    href: "/dashboard/suppliers/new",
    icon: Plus,
    group: "Quick actions",
  },
  {
    id: "qa-reseller",
    label: "Onboard reseller",
    href: "/dashboard/resellers/new",
    icon: Plus,
    group: "Quick actions",
  },
  {
    id: "qa-stock",
    label: "Adjust stock",
    href: "/dashboard/inventory/adjust",
    icon: Plus,
    group: "Quick actions",
  },
  {
    id: "qa-analytics",
    label: "Open analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    group: "Quick actions",
  },
  {
    id: "qa-cms",
    label: "Open CMS",
    href: "/dashboard/content",
    icon: Newspaper,
    group: "Quick actions",
  },
  {
    id: "qa-notifications",
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
    group: "Quick actions",
  },
];

const RESELLER_EXTRA: CommandItem[] = [
  {
    id: "r-order",
    label: "Create order",
    href: "/reseller/orders/new",
    icon: Plus,
    group: "Quick actions",
  },
  {
    id: "r-products",
    label: "Browse catalog",
    href: "/reseller/products",
    icon: Package,
    group: "Quick actions",
  },
];

const WHOLESALE_EXTRA: CommandItem[] = [
  {
    id: "w-bulk",
    label: "Bulk orders",
    href: "/wholesale/bulk-orders",
    icon: ShoppingCart,
    group: "Quick actions",
  },
  {
    id: "w-quote",
    label: "Quotations",
    href: "/wholesale/quotations",
    icon: FileText,
    group: "Quick actions",
  },
];

const SUPPLIER_EXTRA: CommandItem[] = [
  {
    id: "s-inventory",
    label: "Inventory",
    href: "/supplier/inventory",
    icon: Warehouse,
    group: "Quick actions",
  },
  {
    id: "s-products",
    label: "My products",
    href: "/supplier/products",
    icon: Package,
    group: "Quick actions",
  },
];

export const WORKSPACE_SHELLS: Record<WorkspaceId, WorkspaceShellConfig> = {
  admin: {
    id: "admin",
    label: "DropshopNN",
    description: "Commerce OS",
    basePath: "/dashboard",
    homeHref: "/dashboard",
    nav: WORKSPACE_NAV,
    roles: ["super_admin", "admin", "manager", "super admin", "content manager", "support"],
    getBreadcrumbs,
    searchPlaceholder: "Search workspace…",
    showQuickAction: true,
    quickActionHref: "/dashboard/products/new",
    extraCommands: ADMIN_EXTRA,
  },
  reseller: {
    id: "reseller",
    label: "My Shop",
    description: "Reseller Portal",
    basePath: "/reseller",
    homeHref: "/reseller",
    nav: RESELLER_NAV,
    roles: ["reseller", "approved reseller"],
    getBreadcrumbs: getResellerBreadcrumbs,
    searchPlaceholder: "Search reseller workspace…",
    showQuickAction: false,
    extraCommands: RESELLER_EXTRA,
  },
  wholesale: {
    id: "wholesale",
    label: "Wholesale",
    description: "Wholesale Portal",
    basePath: "/wholesale",
    homeHref: "/wholesale",
    nav: WHOLESALE_NAV,
    roles: ["wholesaler", "wholesale", "approved wholesale buyer"],
    getBreadcrumbs: getWholesaleBreadcrumbs,
    searchPlaceholder: "Search wholesale workspace…",
    showQuickAction: false,
    extraCommands: WHOLESALE_EXTRA,
  },
  supplier: {
    id: "supplier",
    label: "Supplier",
    description: "Supplier Portal",
    basePath: "/supplier",
    homeHref: "/supplier",
    nav: SUPPLIER_NAV,
    roles: ["supplier"],
    getBreadcrumbs: getSupplierBreadcrumbs,
    searchPlaceholder: "Search supplier workspace…",
    showQuickAction: false,
    extraCommands: SUPPLIER_EXTRA,
  },
};

export function normalizeRole(role?: string | null): string {
  return (role ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function resolveWorkspaceIdForRole(role?: string | null): WorkspaceId {
  const r = normalizeRole(role);
  if (r.includes("reseller")) return "reseller";
  if (r.includes("wholesale") || r === "wholesaler") return "wholesale";
  if (r.includes("supplier")) return "supplier";
  return "admin";
}

export function getWorkspaceHomeForRole(role?: string | null): string {
  return WORKSPACE_SHELLS[resolveWorkspaceIdForRole(role)].homeHref;
}

export function getWorkspaceForPath(pathname: string): WorkspaceShellConfig | null {
  if (pathname.startsWith("/reseller")) return WORKSPACE_SHELLS.reseller;
  if (pathname.startsWith("/wholesale")) return WORKSPACE_SHELLS.wholesale;
  if (pathname.startsWith("/supplier")) return WORKSPACE_SHELLS.supplier;
  if (pathname.startsWith("/dashboard")) return WORKSPACE_SHELLS.admin;
  return null;
}

export function roleCanAccessWorkspace(role: string | null | undefined, workspaceId: WorkspaceId): boolean {
  const r = normalizeRole(role);
  if (!r) return false;
  // Staff can access admin
  if (workspaceId === "admin") {
    return (
      r === "admin" ||
      r === "super_admin" ||
      r === "manager" ||
      r === "support" ||
      r === "content_manager" ||
      r.includes("admin")
    );
  }
  const cfg = WORKSPACE_SHELLS[workspaceId];
  return cfg.roles.some((allowed) => {
    const a = normalizeRole(allowed);
    return r === a || r.includes(a) || a.includes(r);
  });
}

export function buildCommandsForWorkspace(config: WorkspaceShellConfig): CommandItem[] {
  const navCommands = flattenNavCommands(config.nav);
  const home: CommandItem = {
    id: `${config.id}-home`,
    label: "Go to Home",
    href: config.homeHref,
    icon: LayoutDashboard,
    group: "Navigate",
  };
  const extras = config.extraCommands ?? [];
  // Dedupe by href
  const seen = new Set<string>();
  const all = [home, ...navCommands, ...extras];
  return all.filter((c) => {
    if (seen.has(c.href)) return false;
    seen.add(c.href);
    return true;
  });
}

export const WORKSPACE_ICON_MAP: Record<WorkspaceId, LucideIcon> = {
  admin: LayoutDashboard,
  reseller: Store,
  wholesale: Warehouse,
  supplier: Building2,
};

export { flattenNavCommands };
