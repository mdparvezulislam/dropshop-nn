import type { NextAuthConfig } from "next-auth";

function normalizeRole(role?: string | null): string {
  return (role ?? "").trim().toLowerCase().replace(/[\s-]+/g, "_");
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
    // Staff + allow cross-workspace switch for operators; role portals stay primary for others
    return isStaff || r === "customer";
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

      const role = (auth?.user as { role?: string } | undefined)?.role;

      if (isProtectedWorkspace) {
        if (!isLoggedIn) return false;
        if (!canAccessPath(role, pathname)) {
          const home = homeForRole(role);
          return Response.redirect(new URL(home, request.nextUrl));
        }
        return true;
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
