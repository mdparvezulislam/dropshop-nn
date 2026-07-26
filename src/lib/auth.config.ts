import type { NextAuthConfig } from "next-auth";

function normalizeRole(role?: string | null): string {
  return (role ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function homeForRole(role?: string | null): string {
  const r = normalizeRole(role);
  if (r.includes("reseller")) return "/reseller";
  if (r.includes("wholesale") || r === "wholesaler") return "/wholesale";
  if (r.includes("supplier")) return "/supplier";
  return "/dashboard";
}

function canAccessPath(role: string | null | undefined, pathname: string): boolean {
  const r = normalizeRole(role);
  if (!r) return false;

  const isStaff =
    r === "admin" ||
    r === "super_admin" ||
    r === "manager" ||
    r === "support" ||
    r === "content_manager" ||
    r.includes("admin");

  if (pathname.startsWith("/dashboard")) {
    // Admin workspace is staff-only. Customers were previously allowed into
    // every /dashboard page that lacked an explicit permission mapping.
    return isStaff;
  }
  if (pathname.startsWith("/reseller")) {
    return isStaff || r.includes("reseller");
  }
  if (pathname.startsWith("/wholesale")) {
    return isStaff || r.includes("wholesale") || r === "wholesaler";
  }
  if (pathname.startsWith("/supplier")) {
    return isStaff || r.includes("supplier");
  }
  return true;
}

/**
 * Route-level permission mapping.
 * Maps path prefixes to required permissions.
 * If a path is listed, the user must have at least ONE of the listed permissions.
 * If not listed, only authentication is required.
 */
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/dashboard/products": ["products.product.view", "products.product.create"],
  "/dashboard/products/new": ["products.product.create"],
  "/dashboard/pricing": ["pricing.pricing.view"],
  "/dashboard/costs": ["products.product.view"],
  "/dashboard/suppliers": ["suppliers.supplier.view", "suppliers.supplier.create"],
  "/dashboard/orders": ["orders.order.view"],
  "/dashboard/orders/board": ["orders.order.view"],
  "/dashboard/courier": ["courier.courier.view", "courier.courier.manage"],
  "/dashboard/shipments": ["orders.order.view"],
  "/dashboard/customers": ["customers.customer.view"],
  "/dashboard/resellers": ["resellers.reseller.view"],
  "/dashboard/inventory": ["inventory.inventory.view"],
  "/dashboard/inventory/adjust": ["inventory.inventory.update"],
  "/dashboard/inventory/low-stock": ["inventory.inventory.view"],
  "/dashboard/inventory/history": ["inventory.inventory.view"],
  "/dashboard/content": ["content.content.view"],
  "/dashboard/content/pages": ["content.content.view"],
  "/dashboard/content/blog": ["content.content.view"],
  "/dashboard/content/media": ["content.content.view"],
  "/dashboard/content/navigation": ["content.content.view"],
  "/dashboard/content/banners": ["content.content.view"],
  "/dashboard/content/homepage": ["content.content.view"],
  "/dashboard/analytics": ["analytics.analytics.view"],
  "/dashboard/analytics/sales": ["analytics.analytics.view"],
  "/dashboard/analytics/orders": ["analytics.analytics.view"],
  "/dashboard/analytics/catalog": ["analytics.analytics.view"],
  "/dashboard/analytics/content": ["analytics.analytics.view"],
  "/dashboard/finance": ["finance.finance.view"],
  "/dashboard/wallet": ["wallet.wallet.view"],
  "/dashboard/identity/security": ["identity.identity.view"],
  "/dashboard/identity/security-events": ["identity.identity.view"],
  "/dashboard/identity/devices": ["identity.identity.view"],
  "/dashboard/identity/failed-logins": ["identity.identity.view"],
  "/dashboard/identity/users": ["users.user.view"],
  "/dashboard/identity/roles": ["identity.identity.view"],
  "/dashboard/identity/permissions": ["identity.identity.view"],
  "/dashboard/identity/approvals": ["identity.identity.view"],
  "/dashboard/identity/sessions": ["identity.identity.sessions"],
  "/dashboard/identity/authorization": ["identity.identity.view"],
  "/dashboard/identity/staff": ["identity.identity.view"],
  "/dashboard/identity/applications": ["identity.identity.view"],
  "/dashboard/identity/activity": ["identity.identity.view"],
  "/dashboard/identity/import": ["users.user.create"],
  "/dashboard/notifications": ["notifications.notification.view"],
  "/dashboard/notifications/templates": ["notifications.notification.view"],
  "/dashboard/notifications/logs": ["notifications.notification.view"],
  "/dashboard/audit": ["identity.identity.view"],
  "/dashboard/settings": ["settings.settings.view"],
};

function getRoutePermissions(pathname: string): string[] | null {
  const sortedKeys = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);
  for (const prefix of sortedKeys) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return ROUTE_PERMISSIONS[prefix];
    }
  }
  return null;
}

function hasRequiredPermission(
  permissions: string[] | undefined,
  requiredPermissions: string[],
): boolean {
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes("*")) return true;
  return requiredPermissions.some((p) => permissions.includes(p));
}

/**
 * Edge-compatible auth config (no Node-only imports: mongoose, bcrypt, etc.).
 * Used by middleware. Full providers live in auth.ts.
 */
export const authConfig = {
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = pathname.startsWith("/auth");
      const isProtectedWorkspace =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/reseller") ||
        pathname.startsWith("/wholesale") ||
        pathname.startsWith("/supplier");
      // Account area: any authenticated user, but never anonymous.
      const isAccountArea = pathname.startsWith("/account");

      const role = (auth?.user as { role?: string } | undefined)?.role;
      const permissions = (auth?.user as { permissions?: string[] } | undefined)?.permissions;

      if (isProtectedWorkspace) {
        if (!isLoggedIn) return false;

        if (!canAccessPath(role, pathname)) {
          const home = homeForRole(role);
          return Response.redirect(new URL(home, request.nextUrl));
        }

        const requiredPermissions = getRoutePermissions(pathname);
        if (requiredPermissions && !hasRequiredPermission(permissions, requiredPermissions)) {
          return Response.redirect(new URL("/auth/unauthorized", request.nextUrl));
        }

        return true;
      }

      if (isAccountArea && !isLoggedIn) {
        return false;
      }

      if (isAuthRoute && isLoggedIn) {
        const home = homeForRole(role);
        return Response.redirect(new URL(home, request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.permissions = (user as { permissions?: string[] }).permissions;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { permissions?: string[] }).permissions = token.permissions as string[];
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/unauthorized",
  },
  trustHost: true,
} satisfies NextAuthConfig;

export default authConfig;
