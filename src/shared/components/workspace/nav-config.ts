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
  Newspaper,
  Image,
  PanelTop,
  BookOpen,
  Megaphone,
  Bell,
  ScrollText,
  Shield,
  ShieldCheck,
  UserCog,
  ClipboardCheck,
  Monitor,
  PieChart,
  Tag,
  Zap,
} from "lucide-react";

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
          { label: "Dashboard", href: "/dashboard/pricing", icon: DollarSign, permission: "Pricing.View" },
          { label: "Global Rules", href: "/dashboard/pricing/rules", icon: Shield, permission: "Pricing.View" },
          { label: "Profiles", href: "/dashboard/pricing/profiles", icon: Layers, permission: "Pricing.View" },
          { label: "Campaigns", href: "/dashboard/pricing/campaigns", icon: Tag, permission: "Pricing.View" },
          { label: "Simulator", href: "/dashboard/pricing/simulator", icon: PieChart, permission: "Pricing.View" },
          { label: "Approvals", href: "/dashboard/pricing/approvals", icon: ClipboardCheck, permission: "Pricing.Override" },
          { label: "Bulk Update", href: "/dashboard/pricing/bulk", icon: Layers, permission: "Pricing.Update" },
          { label: "History", href: "/dashboard/pricing/history", icon: History, permission: "Pricing.View" },
        ],
      },
      {
        label: "Cost Intelligence",
        icon: DollarSign,
        anyPermission: ["Product.View"],
        children: [
          { label: "Dashboard", href: "/dashboard/costs", icon: DollarSign, permission: "Product.View" },
        ],
      },
      {
        label: "Suppliers",
        icon: Building2,
        anyPermission: ["Supplier.View", "Supplier.Create"],
        children: [
          { label: "All Suppliers", href: "/dashboard/suppliers", icon: Building2, permission: "Supplier.View" },
          { label: "Onboard Supplier", href: "/dashboard/suppliers/new", icon: FileText, permission: "Supplier.Create" },
        ],
      },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    items: [
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
        label: "Courier & Shipments",
        icon: Truck,
        anyPermission: ["Order.View"],
        children: [
          { label: "Admin Console", href: "/dashboard/courier", icon: Navigation, permission: "Order.Update" },
          { label: "Delivery Automation", href: "/dashboard/courier/automation", icon: Zap, permission: "Order.Update" },
          { label: "Courier Integration", href: "/dashboard/courier/settings", icon: Settings, permission: "Order.Update" },
          { label: "My Shipments", href: "/dashboard/shipments", icon: Truck, permission: "Order.View" },
        ],
      },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      {
        label: "Customers",
        icon: Users,
        anyPermission: ["Customer.View"],
        children: [
          { label: "Customer List", href: "/dashboard/customers", icon: Users, permission: "Customer.View" },
        ],
      },
      {
        label: "Reseller Partners",
        icon: Store,
        anyPermission: ["Reseller.View", "Reseller.Create"],
        children: [
          { label: "All Resellers", href: "/dashboard/resellers", icon: Store, permission: "Reseller.View" },
          { label: "Onboard Reseller", href: "/dashboard/resellers/new", icon: FileText, permission: "Reseller.Create" },
        ],
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    items: [
      {
        label: "Inventory Ops",
        icon: Warehouse,
        anyPermission: ["Inventory.View", "Inventory.Update"],
        children: [
          { label: "Stock Overview", href: "/dashboard/inventory", icon: Boxes, permission: "Inventory.View" },
          { label: "Adjust Stock", href: "/dashboard/inventory/adjust", icon: Tags, permission: "Inventory.Update" },
          { label: "Low Stock Alerts", href: "/dashboard/inventory/low-stock", icon: AlertTriangle, permission: "Inventory.View" },
          { label: "Audit Trail", href: "/dashboard/inventory/history", icon: History, permission: "Inventory.View" },
        ],
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      {
        label: "Promotions & Banners",
        icon: Megaphone,
        anyPermission: ["Content.View"],
        children: [
          { label: "Banners", href: "/dashboard/content/banners", icon: Megaphone, permission: "Content.View" },
          { label: "Homepage Hero", href: "/dashboard/content/homepage", icon: PanelTop, permission: "Content.View" },
        ],
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      {
        label: "Wallet & Ledger",
        icon: Wallet,
        anyPermission: ["Finance.View"],
        children: [
          { label: "Admin Console", href: "/dashboard/finance", icon: DollarSign, permission: "Finance.View" },
          { label: "My Wallet", href: "/dashboard/wallet", icon: Wallet, permission: "Finance.View" },
        ],
      },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      {
        label: "CMS Pages & Blog",
        icon: Newspaper,
        anyPermission: ["Content.View", "Content.Create"],
        children: [
          { label: "Overview", href: "/dashboard/content", icon: LayoutDashboard, permission: "Content.View" },
          { label: "Pages", href: "/dashboard/content/pages", icon: FileText, permission: "Content.View" },
          { label: "Blog", href: "/dashboard/content/blog", icon: BookOpen, permission: "Content.View" },
          { label: "Media Library", href: "/dashboard/content/media", icon: Image, permission: "Content.View" },
          { label: "Navigation", href: "/dashboard/content/navigation", icon: Navigation, permission: "Content.View" },
        ],
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    items: [
      {
        label: "Analytics & Reports",
        icon: BarChart3,
        anyPermission: ["Analytics.View", "Report.View"],
        children: [
          { label: "Overview", href: "/dashboard/analytics", icon: PieChart, permission: "Analytics.View" },
          { label: "Sales Report", href: "/dashboard/analytics/sales", icon: DollarSign, permission: "Analytics.View" },
          { label: "Orders Report", href: "/dashboard/analytics/orders", icon: ShoppingCart, permission: "Analytics.View" },
          { label: "Catalog Report", href: "/dashboard/analytics/catalog", icon: Package, permission: "Analytics.View" },
          { label: "Content Performance", href: "/dashboard/analytics/content", icon: Newspaper, permission: "Analytics.View" },
        ],
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        label: "Identity & Roles",
        icon: Shield,
        anyPermission: ["Identity.View", "User.View", "identity.identity.view", "users.user.view"],
        children: [
          { label: "Overview", href: "/dashboard/identity", icon: Shield, permission: "Identity.View" },
          { label: "Security Center", href: "/dashboard/identity/security", icon: ShieldCheck, permission: "Identity.View" },
          { label: "Secrets Security", href: "/dashboard/identity/security/secrets", icon: ShieldCheck, permission: "Identity.View" },
          { label: "Authorization", href: "/dashboard/identity/authorization", icon: ShieldCheck, permission: "Identity.View" },
          { label: "Approvals", href: "/dashboard/identity/approvals", icon: ClipboardCheck, permission: "Identity.View" },
          { label: "Users", href: "/dashboard/identity/users", icon: Users, permission: "User.View" },
          { label: "Roles", href: "/dashboard/identity/roles", icon: UserCog, permission: "Identity.View" },
          { label: "Permissions", href: "/dashboard/identity/permissions", icon: ShieldCheck, permission: "Identity.View" },
          { label: "Sessions", href: "/dashboard/identity/sessions", icon: Monitor, permission: "Identity.Sessions" },
        ],
      },
      {
        label: "Notifications",
        icon: Bell,
        anyPermission: ["Notification.View"],
        children: [
          { label: "Overview", href: "/dashboard/notifications", icon: Bell, permission: "Notification.View" },
          { label: "Templates", href: "/dashboard/notifications/templates", icon: FileText, permission: "Notification.View" },
          { label: "Delivery Logs", href: "/dashboard/notifications/logs", icon: ScrollText, permission: "Notification.View" },
        ],
      },
      { label: "Audit Logs", href: "/dashboard/audit", icon: ScrollText, permission: "Identity.View" },
      { label: "Settings", href: "/dashboard/settings", icon: Settings, permission: "Settings.View" },
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
      costs: "Cost Intelligence",
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
      content: "Content",
      blog: "Blog",
      pages: "Pages",
      media: "Media",
      navigation: "Navigation",
      homepage: "Homepage",
      banners: "Banners",
      analytics: "Analytics",
      sales: "Sales",
      notifications: "Notifications",
      templates: "Templates",
      logs: "Delivery Logs",
      identity: "Identity",
      security: "Security Center",
      approvals: "Approvals",
      users: "Users",
      roles: "Roles",
      permissions: "Permissions",
      authorization: "Authorization",
      sessions: "Sessions",
      staff: "Staff",
      applications: "Applications",
      activity: "Activity Log",
      devices: "Device Management",
      "failed-logins": "Failed Logins",
      "security-events": "Security Events",
      settings: "Settings",
      audit: "Audit Center",
    },
  });
}
