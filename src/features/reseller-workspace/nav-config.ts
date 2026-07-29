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
  Bell,
  LifeBuoy,
} from "lucide-react";
import { getWorkspaceBreadcrumbs, type NavSection } from "@/components/workspace/nav-config";

export const RESELLER_NAV: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ label: "Dashboard", href: "/reseller", icon: LayoutDashboard }],
  },
  {
    id: "catalog",
    label: "Catalog & Sales",
    items: [
      {
        label: "Products",
        href: "/reseller/products",
        icon: Package,
      },
      {
        label: "Create Order",
        href: "/reseller/orders/create",
        icon: PlusCircle,
      },
      {
        label: "Orders",
        href: "/reseller/orders",
        icon: ShoppingCart,
      },
      {
        label: "Customers",
        href: "/reseller/customers",
        icon: Users,
      },
      {
        label: "Marketing Kit",
        href: "/reseller/marketing-kit",
        icon: Image,
      },
    ],
  },
  {
    id: "finance",
    label: "Finance & Reports",
    items: [
      { label: "Wallet", href: "/reseller/wallet", icon: Wallet },
      { label: "Withdraw", href: "/reseller/withdraw", icon: LogOut },
      { label: "Reports", href: "/reseller/reports", icon: BarChart3 },
    ],
  },
  {
    id: "system",
    label: "System & Help",
    items: [
      { label: "Shop Settings", href: "/reseller/settings", icon: Settings },
      { label: "Notifications", href: "/reseller/notifications", icon: Bell },
      { label: "Support", href: "/reseller/support", icon: LifeBuoy },
    ],
  },
];

export function getResellerBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  return getWorkspaceBreadcrumbs(pathname, {
    rootLabel: "Reseller Hub",
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
      notifications: "Notifications",
      support: "Support Center",
    },
  });
}
