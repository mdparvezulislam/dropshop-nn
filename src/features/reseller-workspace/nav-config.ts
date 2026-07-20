import {
  type LucideIcon,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  LogOut,
  BarChart3,
  Settings,
  Image,
  PlusCircle,
} from "lucide-react";
import type { NavSection } from "@/shared/components/workspace/nav-config";

export const RESELLER_NAV: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/reseller", icon: LayoutDashboard },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: "/reseller/products",
        icon: Package,
      },
      {
        label: "Marketing Kit",
        href: "/reseller/marketing-kit",
        icon: Image,
      },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    items: [
      {
        label: "Create Order",
        href: "/reseller/orders/create",
        icon: PlusCircle,
      },
      {
        label: "All Orders",
        href: "/reseller/orders",
        icon: ShoppingCart,
      },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { label: "My Customers", href: "/reseller/customers", icon: Users },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { label: "Wallet", href: "/reseller/wallet", icon: Wallet },
      { label: "Withdraw", href: "/reseller/withdraw", icon: LogOut },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [
      { label: "Reports", href: "/reseller/reports", icon: BarChart3, badge: "Soon" },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { label: "Shop Settings", href: "/reseller/settings", icon: Settings },
    ],
  },
];

export function getResellerBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const crumbs: { label: string; href?: string }[] = [{ label: "Reseller", href: "/reseller" }];
  if (pathname === "/reseller") return crumbs;

  const map: Record<string, string> = {
    products: "Products",
    "marketing-kit": "Marketing Kit",
    orders: "Orders",
    create: "Create Order",
    customers: "Customers",
    wallet: "Wallet",
    withdraw: "Withdraw",
    reports: "Reports",
    settings: "Shop Settings",
  };

  const parts = pathname.replace(/^\//, "").split("/").filter(Boolean);
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    if (part === "reseller") continue;
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
