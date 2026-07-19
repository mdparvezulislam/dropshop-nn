import { NextResponse } from "next/server";
import { auth } from "@/shared/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (isDashboardRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
