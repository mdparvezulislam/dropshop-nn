import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  DollarSign,
  Boxes,
  Truck,
  ShoppingCart,
  Users,
  Store,
  Building2,
  Factory,
  BarChart3,
  Settings,
  Shield,
  Bell,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  HelpCircle,
  Activity,
  Award,
  BookOpen,
  Calendar,
  Camera,
  Compass,
  CreditCard,
  Database,
  Download,
  Eye,
  FileCheck,
  FolderTree,
  Gift,
  Globe,
  Grid,
  Heart,
  Image,
  Inbox,
  Key,
  Laptop,
  LifeBuoy,
  Link,
  List,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Mic,
  Monitor,
  Moon,
  Navigation,
  Percent,
  Phone,
  PieChart,
  Play,
  Printer,
  Radio,
  RefreshCw,
  Repeat,
  Scale,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Smartphone,
  Star,
  Sun,
  Tablet,
  ThumbsUp,
  Ticket,
  Trash,
  TrendingUp,
  Tv,
  Upload,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  Video,
  Volume2,
  Wallet,
  Wrench,
  Zap,
  KanbanSquare,
  ScrollText,
  Building,
  History,
  GitBranch,
  Timer,
  ClipboardCheck,
  Newspaper,
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

export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label: "Dashboard", href: "/dashboard" }];
  if (pathname === "/dashboard") return crumbs;
  const segments = pathname
    .replace(/^\/dashboard\/?/, "")
    .split("/")
    .filter(Boolean);
  let currentPath = "/dashboard";
  for (const seg of segments) {
    currentPath += `/${seg}`;
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    crumbs.push({ label, href: currentPath });
  }
  return crumbs;
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

export const WORKSPACE_NAV: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ label: "Executive Dashboard", icon: LayoutDashboard, href: "/dashboard" }],
  },
  {
    id: "catalog",
    label: "Catalog & Pricing",
    items: [
      {
        label: "Products",
        icon: Package,
        anyPermission: ["Product.View", "Product.Create"],
        children: [
          {
            label: "All Products",
            href: "/dashboard/products",
            icon: Package,
            permission: "Product.View",
          },
          {
            label: "New Product",
            href: "/dashboard/products/new",
            icon: FileText,
            permission: "Product.Create",
          },
          {
            label: "Product Activity",
            href: "/dashboard/products/activity",
            icon: Activity,
            permission: "Product.View",
          },
        ],
      },
      {
        label: "Pricing Engine",
        icon: DollarSign,
        anyPermission: ["Pricing.View", "Pricing.Manage"],
        children: [
          {
            label: "Pricing Overview",
            href: "/dashboard/pricing",
            icon: LayoutDashboard,
            permission: "Pricing.View",
          },
          {
            label: "Simulator & Calculator",
            href: "/dashboard/pricing/simulator",
            icon: Sliders,
            permission: "Pricing.View",
          },
          {
            label: "Product Price Lists",
            href: "/dashboard/pricing/products",
            icon: DollarSign,
            permission: "Pricing.View",
          },
          {
            label: "Approval Queue",
            href: "/dashboard/pricing/approvals",
            icon: CheckCircle2,
            permission: "Pricing.Manage",
          },
          {
            label: "Category Rules",
            href: "/dashboard/pricing/rules/categories",
            icon: Layers,
            permission: "Pricing.Manage",
          },
          {
            label: "Brand Rules",
            href: "/dashboard/pricing/rules/brands",
            icon: Tag,
            permission: "Pricing.Manage",
          },
          {
            label: "Supplier Rules",
            href: "/dashboard/pricing/rules/suppliers",
            icon: Factory,
            permission: "Pricing.Manage",
          },
          {
            label: "Bulk Update Tools",
            href: "/dashboard/pricing/bulk-tools",
            icon: Wrench,
            permission: "Pricing.Manage",
          },
          {
            label: "Bulk Editor",
            href: "/dashboard/pricing/bulk",
            icon: Sliders,
            permission: "Pricing.Manage",
          },
          {
            label: "Import / Export",
            href: "/dashboard/pricing/import-export",
            icon: Download,
            permission: "Pricing.Manage",
          },
          {
            label: "Campaign Rules",
            href: "/dashboard/pricing/campaigns",
            icon: Tag,
            permission: "Pricing.View",
          },
          {
            label: "Price Profiles",
            href: "/dashboard/pricing/profiles",
            icon: Sliders,
            permission: "Pricing.View",
          },
          {
            label: "Price Schedules",
            href: "/dashboard/pricing/schedule",
            icon: Calendar,
            permission: "Pricing.View",
          },
          {
            label: "Price History",
            href: "/dashboard/pricing/history",
            icon: History,
            permission: "Pricing.View",
          },
        ],
      },
      {
        label: "Inventory Engine",
        icon: Boxes,
        anyPermission: ["Inventory.View", "Inventory.Manage"],
        children: [
          {
            label: "Stock Overview",
            href: "/dashboard/inventory",
            icon: Boxes,
            permission: "Inventory.View",
          },
          {
            label: "Low Stock Alerts",
            href: "/dashboard/inventory/low-stock",
            icon: Clock,
            permission: "Inventory.View",
          },
          {
            label: "Stock Adjustments",
            href: "/dashboard/inventory/adjust",
            icon: Sliders,
            permission: "Inventory.Manage",
          },
          {
            label: "Movement History",
            href: "/dashboard/inventory/history",
            icon: History,
            permission: "Inventory.View",
          },
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
          {
            label: "All Orders",
            href: "/dashboard/orders",
            icon: ShoppingCart,
            permission: "Order.View",
          },
          {
            label: "Status Board",
            href: "/dashboard/orders/board",
            icon: KanbanSquare,
            permission: "Order.View",
          },
        ],
      },
      {
        label: "Courier & Shipments",
        icon: Truck,
        anyPermission: ["Order.View"],
        children: [
          {
            label: "Admin Console",
            href: "/dashboard/courier",
            icon: Navigation,
            permission: "Order.Update",
          },
          {
            label: "Delivery Automation",
            href: "/dashboard/courier/automation",
            icon: Zap,
            permission: "Order.Update",
          },
          {
            label: "Courier Integration",
            href: "/dashboard/courier/settings",
            icon: Settings,
            permission: "Order.Update",
          },
          {
            label: "My Shipments",
            href: "/dashboard/shipments",
            icon: Truck,
            permission: "Order.View",
          },
        ],
      },
    ],
  },
  {
    id: "partners",
    label: "Partners & Customers",
    items: [
      {
        label: "Reseller Partners",
        icon: Store,
        anyPermission: ["Reseller.View", "Reseller.Create"],
        children: [
          {
            label: "All Resellers",
            href: "/dashboard/resellers",
            icon: Store,
            permission: "Reseller.View",
          },
          {
            label: "Onboard Reseller",
            href: "/dashboard/resellers/new",
            icon: FileText,
            permission: "Reseller.Create",
          },
        ],
      },
      {
        label: "Wholesale Partners",
        icon: Building2,
        anyPermission: ["Wholesale.View"],
        children: [
          {
            label: "Wholesale Portal",
            href: "/wholesale",
            icon: Building2,
            permission: "Wholesale.View",
          },
          {
            label: "Bulk Orders",
            href: "/wholesale/bulk-orders",
            icon: Boxes,
            permission: "Wholesale.View",
          },
          {
            label: "Quotations",
            href: "/wholesale/quotations",
            icon: FileText,
            permission: "Wholesale.View",
          },
          {
            label: "Wholesale Customers",
            href: "/wholesale/customers",
            icon: Users,
            permission: "Wholesale.View",
          },
          {
            label: "Invoices",
            href: "/wholesale/invoices",
            icon: FileText,
            permission: "Wholesale.View",
          },
        ],
      },
      {
        label: "Suppliers",
        icon: Factory,
        anyPermission: ["Supplier.View"],
        children: [
          {
            label: "Supplier Console",
            href: "/supplier",
            icon: Factory,
            permission: "Supplier.View",
          },
          {
            label: "Suppliers Directory",
            href: "/dashboard/suppliers",
            icon: Factory,
            permission: "Supplier.View",
          },
          {
            label: "Purchase Orders",
            href: "/supplier/purchase-orders",
            icon: FileText,
            permission: "Supplier.View",
          },
          {
            label: "Inventory Intake",
            href: "/supplier/inventory",
            icon: Boxes,
            permission: "Supplier.View",
          },
        ],
      },
      {
        label: "Customer Engine",
        icon: Users,
        anyPermission: ["Customer.View"],
        children: [
          {
            label: "All Customers",
            href: "/dashboard/customers",
            icon: Users,
            permission: "Customer.View",
          },
        ],
      },
    ],
  },
  {
    id: "finance",
    label: "Finance & Accounting",
    items: [
      {
        label: "Financial Ledger",
        icon: DollarSign,
        anyPermission: ["Finance.View"],
        children: [
          {
            label: "Overview",
            href: "/dashboard/finance",
            icon: DollarSign,
            permission: "Finance.View",
          },
          {
            label: "Cost Accounting",
            href: "/dashboard/costs",
            icon: Scale,
            permission: "Finance.View",
          },
        ],
      },
      {
        label: "Wallet & Ledger",
        icon: Wallet,
        anyPermission: ["Finance.View"],
        children: [
          {
            label: "Admin Console",
            href: "/dashboard/finance",
            icon: DollarSign,
            permission: "Finance.View",
          },
          {
            label: "My Wallet",
            href: "/dashboard/wallet",
            icon: Wallet,
            permission: "Finance.View",
          },
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
          {
            label: "Overview",
            href: "/dashboard/content",
            icon: LayoutDashboard,
            permission: "Content.View",
          },
          {
            label: "Pages",
            href: "/dashboard/content/pages",
            icon: FileText,
            permission: "Content.View",
          },
          {
            label: "Blog",
            href: "/dashboard/content/blog",
            icon: BookOpen,
            permission: "Content.View",
          },
          {
            label: "Media Library",
            href: "/dashboard/content/media",
            icon: Image,
            permission: "Content.View",
          },
          {
            label: "Navigation",
            href: "/dashboard/content/navigation",
            icon: Navigation,
            permission: "Content.View",
          },
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
          {
            label: "Executive Dashboard",
            href: "/dashboard/analytics/executive",
            icon: LayoutDashboard,
            permission: "Analytics.View",
          },
          {
            label: "Overview",
            href: "/dashboard/analytics",
            icon: PieChart,
            permission: "Analytics.View",
          },
          {
            label: "Live Dashboard",
            href: "/dashboard/analytics/live",
            icon: Activity,
            permission: "Analytics.View",
          },
          {
            label: "Order Analytics",
            href: "/dashboard/analytics/orders",
            icon: ShoppingCart,
            permission: "Analytics.View",
          },
          {
            label: "Sales & Profitability",
            href: "/dashboard/analytics/sales",
            icon: TrendingUp,
            permission: "Analytics.View",
          },
          {
            label: "Product Analytics",
            href: "/dashboard/analytics/products",
            icon: Package,
            permission: "Analytics.View",
          },
          {
            label: "Customer Analytics",
            href: "/dashboard/analytics/customers",
            icon: Users,
            permission: "Analytics.View",
          },
          {
            label: "Reseller Analytics",
            href: "/dashboard/analytics/resellers",
            icon: Store,
            permission: "Analytics.View",
          },
          {
            label: "Wholesale Analytics",
            href: "/dashboard/analytics/wholesale",
            icon: Building2,
            permission: "Analytics.View",
          },
          {
            label: "Inventory Analytics",
            href: "/dashboard/analytics/inventory",
            icon: Boxes,
            permission: "Analytics.View",
          },
          {
            label: "Finance & Profitability",
            href: "/dashboard/analytics/finance",
            icon: DollarSign,
            permission: "Analytics.View",
          },
          {
            label: "Logistics Performance",
            href: "/dashboard/analytics/logistics",
            icon: Truck,
            permission: "Analytics.View",
          },
          {
            label: "Catalog Report",
            href: "/dashboard/analytics/catalog",
            icon: Package,
            permission: "Analytics.View",
          },
          {
            label: "Content Performance",
            href: "/dashboard/analytics/content",
            icon: Newspaper,
            permission: "Analytics.View",
          },
          {
            label: "Report Center",
            href: "/dashboard/analytics/reports",
            icon: FileText,
            permission: "Report.View",
          },
        ],
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        label: "Automation Center",
        icon: Zap,
        anyPermission: ["Admin"],
        children: [
          {
            label: "Dashboard",
            href: "/dashboard/automation",
            icon: LayoutDashboard,
            permission: "Admin",
          },
          {
            label: "Workflows",
            href: "/dashboard/automation/workflows",
            icon: GitBranch,
            permission: "Admin",
          },
          {
            label: "Executions",
            href: "/dashboard/automation/executions",
            icon: History,
            permission: "Admin",
          },
          {
            label: "Schedules",
            href: "/dashboard/automation/schedules",
            icon: Timer,
            permission: "Admin",
          },
        ],
      },
      {
        label: "Identity & Roles",
        icon: Shield,
        anyPermission: ["Identity.View", "User.View", "identity.identity.view", "users.user.view"],
        children: [
          {
            label: "Overview",
            href: "/dashboard/identity",
            icon: Shield,
            permission: "Identity.View",
          },
          {
            label: "Business Memberships",
            href: "/dashboard/identity/memberships",
            icon: ShieldCheck,
            permission: "Identity.View",
          },
          {
            label: "Membership Applications",
            href: "/dashboard/identity/applications",
            icon: FileText,
            permission: "Identity.View",
          },
          {
            label: "Security Center",
            href: "/dashboard/identity/security",
            icon: ShieldCheck,
            permission: "Identity.View",
          },
          {
            label: "Secrets Security",
            href: "/dashboard/identity/security/secrets",
            icon: ShieldCheck,
            permission: "Identity.View",
          },
          {
            label: "Authorization",
            href: "/dashboard/identity/authorization",
            icon: ShieldCheck,
            permission: "Identity.View",
          },
          {
            label: "Approvals Queue",
            href: "/dashboard/identity/approvals",
            icon: ClipboardCheck,
            permission: "Identity.View",
          },
          {
            label: "Users & Memberships",
            href: "/dashboard/identity/users",
            icon: Users,
            permission: "User.View",
          },
          {
            label: "Roles",
            href: "/dashboard/identity/roles",
            icon: UserCog,
            permission: "Identity.View",
          },
          {
            label: "Permissions",
            href: "/dashboard/identity/permissions",
            icon: ShieldCheck,
            permission: "Identity.View",
          },
          {
            label: "Sessions",
            href: "/dashboard/identity/sessions",
            icon: Monitor,
            permission: "Identity.Sessions",
          },
        ],
      },
      {
        label: "Notifications",
        icon: Bell,
        anyPermission: ["Notification.View"],
        children: [
          {
            label: "Overview",
            href: "/dashboard/notifications",
            icon: Bell,
            permission: "Notification.View",
          },
          {
            label: "Templates",
            href: "/dashboard/notifications/templates",
            icon: FileText,
            permission: "Notification.View",
          },
          {
            label: "Delivery Logs",
            href: "/dashboard/notifications/logs",
            icon: ScrollText,
            permission: "Notification.View",
          },
        ],
      },
      {
        label: "Audit Logs",
        href: "/dashboard/audit",
        icon: ScrollText,
        permission: "Identity.View",
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        permission: "Settings.View",
      },
    ],
  },
];

export const WORKSPACE_NAV_MAP: Record<string, NavSection[]> = {
  admin: WORKSPACE_NAV,
};
