import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  Building2,
  Store,
  Warehouse,
  DollarSign,
  ShoppingCart,
  Users,
  Truck,
  Wallet,
  BarChart3,
  Settings,
  Tags,
  Boxes,
  AlertTriangle,
  History,
  Layers,
  FileText,
} from "lucide-react";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  children?: { label: string; href: string; icon?: LucideIcon }[];
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const WORKSPACE_NAV: NavSection[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [{ label: "Home", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      {
        label: "Products",
        icon: Package,
        children: [
          { label: "All Products", href: "/dashboard/products", icon: Package },
          { label: "New Product", href: "/dashboard/products/new", icon: FileText },
        ],
      },
      {
        label: "Pricing",
        icon: DollarSign,
        children: [
          { label: "Price List", href: "/dashboard/pricing", icon: DollarSign },
          { label: "Bulk Update", href: "/dashboard/pricing/bulk", icon: Layers },
        ],
      },
    ],
  },
  {
    id: "partners",
    label: "Partners",
    items: [
      {
        label: "Suppliers",
        icon: Building2,
        children: [
          { label: "All Suppliers", href: "/dashboard/suppliers", icon: Building2 },
          { label: "Onboard", href: "/dashboard/suppliers/new", icon: FileText },
        ],
      },
      {
        label: "Resellers",
        icon: Store,
        children: [
          { label: "All Resellers", href: "/dashboard/resellers", icon: Store },
          { label: "Onboard", href: "/dashboard/resellers/new", icon: FileText },
        ],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        label: "Inventory",
        icon: Warehouse,
        children: [
          { label: "Overview", href: "/dashboard/inventory", icon: Boxes },
          { label: "Adjust Stock", href: "/dashboard/inventory/adjust", icon: Tags },
          { label: "Low Stock", href: "/dashboard/inventory/low-stock", icon: AlertTriangle },
          { label: "History", href: "/dashboard/inventory/history", icon: History },
        ],
      },
      {
        label: "Orders",
        icon: ShoppingCart,
        badge: "Soon",
        children: [{ label: "Coming soon", href: "/dashboard", icon: ShoppingCart }],
      },
      {
        label: "Customers",
        icon: Users,
        badge: "Soon",
        children: [{ label: "Coming soon", href: "/dashboard", icon: Users }],
      },
      {
        label: "Courier",
        icon: Truck,
        badge: "Soon",
        children: [{ label: "Coming soon", href: "/dashboard", icon: Truck }],
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      {
        label: "Wallet",
        icon: Wallet,
        badge: "Soon",
        children: [{ label: "Coming soon", href: "/dashboard", icon: Wallet }],
      },
      {
        label: "Reports",
        icon: BarChart3,
        badge: "Soon",
        children: [{ label: "Coming soon", href: "/dashboard", icon: BarChart3 }],
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        label: "Settings",
        icon: Settings,
        children: [{ label: "Workspace", href: "/dashboard", icon: Settings }],
      },
    ],
  },
];

export function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: "Workspace", href: "/dashboard" }];
  if (pathname === "/dashboard") return crumbs;

  const map: Record<string, string> = {
    products: "Products",
    suppliers: "Suppliers",
    resellers: "Resellers",
    pricing: "Pricing",
    inventory: "Inventory",
    new: "Create",
    edit: "Edit",
    bulk: "Bulk Update",
    adjust: "Stock Adjustment",
    history: "History",
    "low-stock": "Low Stock",
  };

  const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
  // skip "dashboard"
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    if (part === "dashboard") continue;
    if (/^[0-9a-fA-F]{24}$/.test(part) || /^\d+$/.test(part) || part.startsWith("rp")) {
      crumbs.push({ label: "Details", href: acc });
      continue;
    }
    crumbs.push({ label: map[part] || part, href: acc });
  }
  // last crumb is current page — no link needed optionally
  if (crumbs.length > 1) {
    const last = crumbs[crumbs.length - 1];
    crumbs[crumbs.length - 1] = { label: last.label };
  }
  return crumbs;
}
