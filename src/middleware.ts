import NextAuth from "next-auth";
import { authConfig } from "@/shared/lib/auth.config";

/**
 * Edge-compatible auth middleware.
 *
 * Responsibilities:
 * 1. Authenticate all protected routes
 * 2. Role-based path access (existing)
 * 3. Redirect unauthenticated users to login
 */

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/reseller/:path*",
    "/wholesale/:path*",
    "/supplier/:path*",
    "/auth/:path*",
  ],
};
