import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("[Proxy] Request Path:", pathname);

  // Get auth cookies
  const session = request.cookies.get("admin_session");
  const isAuthenticated = session?.value === "authenticated_wedding_admin";

  // 1. Protect /admin/login (Make it secret using query key)
  if (pathname === "/admin/login") {
    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
      console.log("[Proxy] Already authenticated, redirecting to /admin");
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const secretKey = process.env.ADMIN_LOGIN_SECRET || "rahasia_admin_2026";
    const keyParam = request.nextUrl.searchParams.get("key");
    const loginAuthorizedCookie = request.cookies.get("admin_login_authorized");

    // If they have the correct key param, let them in and set dynamic authorized cookie
    if (keyParam === secretKey) {
      console.log("[Proxy] Secret key matched. Granting access to login page.");
      const response = NextResponse.next();
      response.cookies.set("admin_login_authorized", "true", {
        maxAge: 60 * 10, // 10 minutes access to complete login form
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return response;
    }

    // If no correct key param and no active authorization cookie, deny access
    if (loginAuthorizedCookie?.value !== "true") {
      console.log("[Proxy] Access denied to login page. Redirecting to home.");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 2. Protect all other /admin routes
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    console.log("[Proxy] admin_session cookie:", session);
    console.log("[Proxy] isAuthenticated:", isAuthenticated);

    if (!isAuthenticated) {
      console.log("[Proxy] Not authenticated, redirecting to home");
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
