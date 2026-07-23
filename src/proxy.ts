import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

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
