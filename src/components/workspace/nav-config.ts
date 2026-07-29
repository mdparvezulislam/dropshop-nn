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
  BookOpen,
  DollarSign,
  FolderTree,
  Image,
  ScrollText,
  UserCog,
  Wallet,
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
    label: "Overview",
    items: [{ label: "Executive Dashboard", icon: LayoutDashboard, href: "/dashboard" }],
  },
  {
    id: "commerce",
    label: "Commerce & Catalog",
    items: [
      {
        label: "Orders",
        icon: ShoppingCart,
        href: "/dashboard/orders",
        anyPermission: ["Order.View", "Order.Create"],
      },
      {
        label: "Products",
        icon: Package,
        href: "/dashboard/products",
        anyPermission: ["Product.View", "Product.Create"],
      },
      {
        label: "Categories",
        icon: FolderTree,
        href: "/dashboard/catalog/categories",
        anyPermission: ["Product.View"],
      },
      {
        label: "Brands",
        icon: Award,
        href: "/dashboard/catalog/brands",
        anyPermission: ["Product.View"],
      },
      {
        label: "Inventory",
        icon: Boxes,
        href: "/dashboard/inventory",
        anyPermission: ["Inventory.View"],
      },
      {
        label: "Pricing Engine",
        icon: DollarSign,
        href: "/dashboard/pricing/products",
        anyPermission: ["Pricing.View"],
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
        href: "/dashboard/resellers",
        anyPermission: ["Reseller.View"],
      },
      {
        label: "Membership Applications",
        icon: FileText,
        href: "/dashboard/identity/applications",
        anyPermission: ["Identity.View"],
      },
      {
        label: "Customers",
        icon: Users,
        href: "/dashboard/customers",
        anyPermission: ["Customer.View"],
      },
      {
        label: "Suppliers",
        icon: Factory,
        href: "/dashboard/suppliers",
        anyPermission: ["Supplier.View"],
      },
    ],
  },
  {
    id: "content",
    label: "Marketing & Content",
    items: [
      {
        label: "CMS Pages",
        icon: FileText,
        href: "/dashboard/content/pages",
        anyPermission: ["Content.View"],
      },
      {
        label: "Banners",
        icon: Image,
        href: "/dashboard/content/banners",
        anyPermission: ["Content.View"],
      },
      {
        label: "Blog Articles",
        icon: BookOpen,
        href: "/dashboard/content/blog",
        anyPermission: ["Content.View"],
      },
    ],
  },
  {
    id: "finance",
    label: "Finance & Analytics",
    items: [
      {
        label: "Ledger & Wallet",
        icon: Wallet,
        href: "/dashboard/wallet",
        anyPermission: ["Finance.View"],
      },
      {
        label: "Financial Reports",
        icon: BarChart3,
        href: "/dashboard/analytics/reports",
        anyPermission: ["Analytics.View", "Report.View"],
      },
    ],
  },
  {
    id: "system",
    label: "System & Security",
    items: [
      {
        label: "User Management",
        icon: Users,
        href: "/dashboard/identity/users",
        anyPermission: ["User.View"],
      },
      {
        label: "Roles & Permissions",
        icon: UserCog,
        href: "/dashboard/identity/roles",
        anyPermission: ["Identity.View"],
      },
      {
        label: "Notifications",
        icon: Bell,
        href: "/dashboard/notifications",
        anyPermission: ["Notification.View"],
      },
      {
        label: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
        anyPermission: ["Settings.View"],
      },
      {
        label: "Audit Logs",
        icon: ScrollText,
        href: "/dashboard/audit",
        anyPermission: ["Identity.View"],
      },
    ],
  },
];

export const WORKSPACE_NAV_MAP: Record<string, NavSection[]> = {
  admin: WORKSPACE_NAV,
};
