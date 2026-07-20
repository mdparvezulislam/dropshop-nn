import {
  type LucideIcon,
  LayoutDashboard,
  Package,
  Warehouse,
  ClipboardList,
  Truck,
  ShoppingCart,
  Wallet,
  BarChart3,
  User,
  Settings,
} from "lucide-react";
import {
  getWorkspaceBreadcrumbs,
  type NavSection,
} from "@/shared/components/workspace/nav-config";

export const SUPPLIER_NAV: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/supplier", icon: LayoutDashboard },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      { label: "Products", href: "/supplier/products", icon: Package },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { label: "Inventory", href: "/supplier/inventory", icon: Warehouse },
      { label: "Purchase Orders", href: "/supplier/purchase-orders", icon: ClipboardList },
      { label: "Deliveries", href: "/supplier/deliveries", icon: Truck },
      { label: "Orders", href: "/supplier/orders", icon: ShoppingCart },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { label: "Payments", href: "/supplier/payments", icon: Wallet },
      { label: "Reports", href: "/supplier/reports", icon: BarChart3 },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { label: "Profile", href: "/supplier/profile", icon: User },
      { label: "Settings", href: "/supplier/settings", icon: Settings },
    ],
  },
];

export function getSupplierBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  return getWorkspaceBreadcrumbs(pathname, {
    rootLabel: "Supplier",
    rootHref: "/supplier",
    skipSegment: "supplier",
    labelMap: {
      products: "Products",
      inventory: "Inventory",
      "purchase-orders": "Purchase Orders",
      deliveries: "Deliveries",
      orders: "Orders",
      payments: "Payments",
      reports: "Reports",
      profile: "Profile",
      settings: "Settings",
    },
  });
}
