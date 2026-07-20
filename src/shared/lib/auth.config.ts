import type { NextAuthConfig } from "next-auth";

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

      if (isProtectedWorkspace) {
        return isLoggedIn;
      }

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
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
