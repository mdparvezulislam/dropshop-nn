import NextAuth from "next-auth";
import { authConfig } from "@/shared/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
