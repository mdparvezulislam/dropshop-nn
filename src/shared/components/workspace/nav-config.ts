import {
  type LucideIcon,
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
  KanbanSquare,
  Navigation,
  CreditCard,
  Receipt,
} from "lucide-react";

import type { UserRole } from "@/shared/core/types";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  permission?: string;
  anyPermission?: string[];
  children?: { label: string; href: string; icon?: LucideIcon; permission?: string }[];
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
        anyPermission: ["Product.View", "Product.Create"],
        children: [
          { label: "All Products", href: "/dashboard/products", icon: Package, permission: "Product.View" },
          { label: "New Product", href: "/dashboard/products/new", icon: FileText, permission: "Product.Create" },
        ],
      },
      {
        label: "Pricing",
        icon: DollarSign,
        anyPermission: ["Pricing.View", "Pricing.Update"],
        children: [
          { label: "Price List", href: "/dashboard/pricing", icon: DollarSign, permission: "Pricing.View" },
          { label: "Bulk Update", href: "/dashboard/pricing/bulk", icon: Layers, permission: "Pricing.Update" },
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
        anyPermission: ["Supplier.View", "Supplier.Create"],
        children: [
          { label: "All Suppliers", href: "/dashboard/suppliers", icon: Building2, permission: "Supplier.View" },
          { label: "Onboard", href: "/dashboard/suppliers/new", icon: FileText, permission: "Supplier.Create" },
        ],
      },
      {
        label: "Resellers",
        icon: Store,
        anyPermission: ["Reseller.View", "Reseller.Create"],
        children: [
          { label: "All Resellers", href: "/dashboard/resellers", icon: Store, permission: "Reseller.View" },
          { label: "Onboard", href: "/dashboard/resellers/new", icon: FileText, permission: "Reseller.Create" },
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
        anyPermission: ["Inventory.View", "Inventory.Update"],
        children: [
          { label: "Overview", href: "/dashboard/inventory", icon: Boxes, permission: "Inventory.View" },
          { label: "Adjust Stock", href: "/dashboard/inventory/adjust", icon: Tags, permission: "Inventory.Update" },
          { label: "Low Stock", href: "/dashboard/inventory/low-stock", icon: AlertTriangle, permission: "Inventory.View" },
          { label: "History", href: "/dashboard/inventory/history", icon: History, permission: "Inventory.View" },
        ],
      },
      {
        label: "Orders",
        icon: ShoppingCart,
        anyPermission: ["Order.View", "Order.Create"],
        children: [
          { label: "All Orders", href: "/dashboard/orders", icon: ShoppingCart, permission: "Order.View" },
          { label: "Status Board", href: "/dashboard/orders/board", icon: KanbanSquare, permission: "Order.View" },
        ],
      },
      {
        label: "Customers",
        icon: Users,
        anyPermission: ["Customer.View"],
        children: [
          { label: "My Customers", href: "/dashboard/customers", icon: Users, permission: "Customer.View" },
        ],
      },
      {
        label: "Courier",
        icon: Truck,
        anyPermission: ["Order.View"],
        children: [
          { label: "Admin Console", href: "/dashboard/courier", icon: Navigation, permission: "Order.Update" },
          { label: "My Shipments", href: "/dashboard/shipments", icon: Truck, permission: "Order.View" },
        ],
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
        anyPermission: ["Finance.View"],
        children: [
          { label: "Admin Console", href: "/dashboard/finance", icon: DollarSign, permission: "Finance.View" },
          { label: "My Wallet", href: "/dashboard/wallet", icon: Wallet, permission: "Finance.View" },
        ],
      },
      {
        label: "Reports",
        icon: BarChart3,
        badge: "Soon",
        anyPermission: ["Report.View"],
        children: [{ label: "Coming soon", href: "/dashboard", icon: BarChart3, permission: "Report.View" }],
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
        permission: "Settings.View",
      },
    ],
  },
];

export type Breadcrumb = { label: string; href?: string };

export function getWorkspaceBreadcrumbs(
  pathname: string,
  options: {
    rootLabel: string;
    rootHref: string;
    skipSegment: string;
    labelMap?: Record<string, string>;
  },
): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label: options.rootLabel, href: options.rootHref }];
  if (pathname === options.rootHref) return crumbs;

  const map = options.labelMap ?? {};
  const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    if (part === options.skipSegment) continue;
    if (/^[0-9a-fA-F]{24}$/.test(part) || /^\d+$/.test(part) || part.startsWith("rp")) {
      crumbs.push({ label: "Details", href: acc });
      continue;
    }
    const fallback = part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label: map[part] || fallback, href: acc });
  }
  if (crumbs.length > 1) {
    const last = crumbs[crumbs.length - 1];
    crumbs[crumbs.length - 1] = { label: last.label };
  }
  return crumbs;
}

export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  return getWorkspaceBreadcrumbs(pathname, {
    rootLabel: "Workspace",
    rootHref: "/dashboard",
    skipSegment: "dashboard",
    labelMap: {
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
      orders: "Orders",
      customers: "Customers",
      finance: "Finance",
      wallet: "Wallet",
      courier: "Courier",
      shipments: "Shipments",
      board: "Board",
    },
  });
}
