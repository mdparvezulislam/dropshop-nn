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
import {
  getWorkspaceBreadcrumbs,
  type NavSection,
} from "@/components/workspace/nav-config";

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
  return getWorkspaceBreadcrumbs(pathname, {
    rootLabel: "Wholesale",
    rootHref: "/wholesale",
    skipSegment: "wholesale",
    labelMap: {
      products: "Products",
      "bulk-orders": "Bulk Orders",
      quotations: "Quotations",
      orders: "Order History",
      invoices: "Invoices",
      customers: "Customers",
      profile: "Profile",
      settings: "Settings",
    },
  });
}
