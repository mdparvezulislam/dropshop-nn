import {
  type LucideIcon,
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Receipt,
  History,
  Users,
  User,
  Settings,
  ClipboardList,
  PlusCircle,
} from "lucide-react";
import type { NavSection } from "@/shared/components/workspace/nav-config";

export const WHOLESALE_NAV: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/wholesale", icon: LayoutDashboard },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { label: "Products", href: "/wholesale/products", icon: Package },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    items: [
      { label: "Bulk Orders", href: "/wholesale/bulk-orders", icon: ClipboardList },
      { label: "Quotations", href: "/wholesale/quotations", icon: FileText },
      { label: "Order History", href: "/wholesale/orders", icon: History },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    items: [
      { label: "Invoices", href: "/wholesale/invoices", icon: Receipt },
    ],
  },
  {
    id: "contacts",
    label: "Contacts",
    items: [
      { label: "Customers", href: "/wholesale/customers", icon: Users },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { label: "Profile", href: "/wholesale/profile", icon: User },
      { label: "Settings", href: "/wholesale/settings", icon: Settings },
    ],
  },
];

export function getWholesaleBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: "Wholesale", href: "/wholesale" }];
  if (pathname === "/wholesale") return crumbs;

  const map: Record<string, string> = {
    products: "Products",
    "bulk-orders": "Bulk Orders",
    quotations: "Quotations",
    orders: "Order History",
    invoices: "Invoices",
    customers: "Customers",
    profile: "Profile",
    settings: "Settings",
  };

  const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    if (part === "wholesale") continue;
    if (/^[0-9a-fA-F]{24}$/.test(part) || /^\d+$/.test(part)) {
      crumbs.push({ label: "Details", href: acc });
      continue;
    }
    crumbs.push({ label: map[part] || part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), href: acc });
  }
  if (crumbs.length > 1) {
    const last = crumbs[crumbs.length - 1];
    crumbs[crumbs.length - 1] = { label: last.label };
  }
  return crumbs;
}
