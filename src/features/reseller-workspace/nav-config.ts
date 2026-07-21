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
import {
  getWorkspaceBreadcrumbs,
  type NavSection,
} from "@/shared/components/workspace/nav-config";

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
        { label: "Reports", href: "/reseller/reports", icon: BarChart3 },
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
  return getWorkspaceBreadcrumbs(pathname, {
    rootLabel: "Reseller",
    rootHref: "/reseller",
    skipSegment: "reseller",
    labelMap: {
      products: "Products",
      "marketing-kit": "Marketing Kit",
      orders: "Orders",
      create: "Create Order",
      customers: "Customers",
      wallet: "Wallet",
      withdraw: "Withdraw",
      reports: "Reports",
      settings: "Shop Settings",
    },
  });
}
