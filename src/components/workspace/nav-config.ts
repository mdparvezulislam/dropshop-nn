import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Store,
  Factory,
  BarChart3,
  Settings,
  Bell,
  FileText,
  Award,
  DollarSign,
  FolderTree,
  ScrollText,
  Wallet,
  Truck,
  Receipt,
  Zap,
  Activity,
  Layers,
  MessageSquare,
  Calculator,
  CheckSquare,
  Building,
  type LucideIcon,
} from "lucide-react";

export interface NavChildItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  permission?: string;
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: string | number;
  children?: NavChildItem[];
  permission?: string;
  anyPermission?: string[];
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface BreadcrumbOptions {
  rootLabel?: string;
  rootHref?: string;
  skipSegment?: string;
  labelMap?: Record<string, string>;
}

export function getWorkspaceBreadcrumbs(
  pathname: string,
  options?: BreadcrumbOptions | string,
): Breadcrumb[] {
  const rootLabel = typeof options === "object" ? (options.rootLabel ?? "Home") : "Home";
  const rootHref =
    typeof options === "object" ? (options.rootHref ?? "/dashboard") : options || "/dashboard";
  const skipSegment = typeof options === "object" ? options.skipSegment : undefined;
  const labelMap = typeof options === "object" ? options.labelMap : undefined;

  const crumbs: Breadcrumb[] = [{ label: rootLabel, href: rootHref }];
  if (pathname === rootHref) return crumbs;

  let cleanedPath = pathname;
  if (skipSegment) {
    cleanedPath = pathname.replace(new RegExp(`^/${skipSegment}/?`), "/");
  } else {
    cleanedPath = pathname.replace(new RegExp(`^${rootHref}/?`), "/");
  }

  const segments = cleanedPath.split("/").filter(Boolean);
  let currentPath = rootHref;

  for (const seg of segments) {
    currentPath += `/${seg}`;
    const mappedLabel = labelMap?.[seg];
    const label = mappedLabel || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    crumbs.push({ label, href: currentPath });
  }

  return crumbs;
}

export const getBreadcrumbs = getWorkspaceBreadcrumbs;

export const WORKSPACE_NAV: NavSection[] = [
  {
    id: "overview",
    label: "Overview & Live Ops",
    items: [
      { label: "Executive Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Real-Time Live Sales", icon: Activity, href: "/dashboard/analytics/live", badge: "LIVE" },
    ],
  },
  {
    id: "orders",
    label: "Orders & Operations",
    items: [
      {
        label: "Order Management",
        icon: ShoppingCart,
        href: "/dashboard/orders",
        children: [
          { label: "All Orders", href: "/dashboard/orders" },
          { label: "Create Order", href: "/dashboard/orders/create" },
          { label: "Order Board (Kanban)", href: "/dashboard/orders/board" },
          { label: "Returns & Refunds", href: "/dashboard/orders/returns" },
        ],
      },
    ],
  },
  {
    id: "catalog",
    label: "Products & Catalog",
    items: [
      {
        label: "Products",
        icon: Package,
        href: "/dashboard/products",
        children: [
          { label: "All Products", href: "/dashboard/products" },
          { label: "Add New Product", href: "/dashboard/products/new" },
          { label: "Product Activity Logs", href: "/dashboard/products/activity" },
        ],
      },
      { label: "Categories", icon: FolderTree, href: "/dashboard/catalog/categories" },
      { label: "Brands", icon: Award, href: "/dashboard/catalog/brands" },
      {
        label: "Pricing Engine",
        icon: DollarSign,
        href: "/dashboard/pricing",
        children: [
          { label: "Pricing Overview", href: "/dashboard/pricing" },
          { label: "Automated Rules", href: "/dashboard/pricing/rules" },
          { label: "Campaigns & Sales", href: "/dashboard/pricing/campaigns" },
          { label: "Coupons", href: "/dashboard/pricing/coupons" },
          { label: "Bulk Price Tools", href: "/dashboard/pricing/bulk-tools" },
          { label: "Price Simulator", href: "/dashboard/pricing/simulator" },
          { label: "Price Approvals", href: "/dashboard/pricing/approvals" },
        ],
      },
    ],
  },
  {
    id: "logistics",
    label: "Inventory & Logistics",
    items: [
      {
        label: "Inventory",
        icon: Boxes,
        href: "/dashboard/inventory",
        children: [
          { label: "Stock Overview", href: "/dashboard/inventory" },
          { label: "Low Stock Alerts", href: "/dashboard/inventory/low-stock" },
          { label: "Stock Adjustment", href: "/dashboard/inventory/adjust" },
          { label: "Stock History", href: "/dashboard/inventory/history" },
        ],
      },
      { label: "Shipments & Logistics", icon: Truck, href: "/dashboard/shipments" },
      {
        label: "Courier Management",
        icon: Truck,
        href: "/dashboard/courier/settings",
        children: [
          { label: "Courier Setup & Rules", href: "/dashboard/courier/settings" },
          { label: "Shipments & Tracking", href: "/dashboard/shipments" },
        ],
      },
      { label: "Suppliers", icon: Factory, href: "/dashboard/suppliers" },
    ],
  },
  {
    id: "partners",
    label: "Partners & Customers",
    items: [
      { label: "Reseller Partners", icon: Store, href: "/dashboard/resellers" },
      { label: "Wholesale Partners", icon: Building, href: "/dashboard/wholesalers" },
      { label: "Customers", icon: Users, href: "/dashboard/customers" },
    ],
  },
  {
    id: "finance",
    label: "Finance & Accounting",
    items: [
      { label: "Financial Center & P&L", icon: DollarSign, href: "/dashboard/finance" },
      { label: "Reseller Wallet & Payouts", icon: Wallet, href: "/dashboard/wallet" },
    ],
  },
  {
    id: "content",
    label: "CMS & Marketing",
    items: [
      {
        label: "Content Management",
        icon: FileText,
        href: "/dashboard/content",
        children: [
          { label: "CMS Overview", href: "/dashboard/content" },
          { label: "Homepage Builder", href: "/dashboard/content/homepage" },
          { label: "Banner Sliders", href: "/dashboard/content/banners" },
          { label: "Store Navigation", href: "/dashboard/content/navigation" },
          { label: "Blog Posts", href: "/dashboard/content/blog" },
          { label: "Custom Pages", href: "/dashboard/content/pages" },
          { label: "Media Library", href: "/dashboard/content/media" },
        ],
      },
      { label: "Product Reviews", icon: MessageSquare, href: "/dashboard/reviews" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & Reports",
    items: [
      {
        label: "Business Intelligence",
        icon: BarChart3,
        href: "/dashboard/analytics",
        children: [
          { label: "Analytics Hub", href: "/dashboard/analytics" },
          { label: "Executive Dashboard", href: "/dashboard/analytics/executive" },
          { label: "Sales & Revenue", href: "/dashboard/analytics/sales" },
          { label: "Order Analytics", href: "/dashboard/analytics/orders" },
          { label: "Reseller Analytics", href: "/dashboard/analytics/resellers" },
          { label: "Inventory Valuation", href: "/dashboard/analytics/inventory" },
          { label: "Financial Analytics", href: "/dashboard/analytics/finance" },
          { label: "Custom Reports", href: "/dashboard/analytics/reports" },
        ],
      },
    ],
  },
  {
    id: "system",
    label: "Automation & System",
    items: [
      {
        label: "Automation",
        icon: Zap,
        href: "/dashboard/automation",
        children: [
          { label: "Workflows", href: "/dashboard/automation" },
          { label: "Scheduled Jobs", href: "/dashboard/automation/schedules" },
        ],
      },
      {
        label: "Identity & Access",
        icon: Users,
        href: "/dashboard/users",
        children: [
          { label: "User & Staff Directory", href: "/dashboard/users" },
          { label: "Roles & Security", href: "/dashboard/security" },
        ],
      },
      {
        label: "Notifications",
        icon: Bell,
        href: "/dashboard/notifications",
        children: [
          { label: "Notification Center", href: "/dashboard/notifications" },
          { label: "SMS/Email Templates", href: "/dashboard/notifications/templates" },
          { label: "Delivery Logs", href: "/dashboard/notifications/logs" },
        ],
      },
      { label: "Audit Trail", icon: ScrollText, href: "/dashboard/audit" },
      { label: "System Settings", icon: Settings, href: "/dashboard/settings" },
    ],
  },
];

export const WORKSPACE_NAV_MAP: Record<string, NavSection[]> = {
  admin: WORKSPACE_NAV,
};
