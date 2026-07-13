import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("[Proxy] Request Path:", pathname);

  // Protect all /admin routes, except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = request.cookies.get("admin_session");
    console.log("[Proxy] admin_session cookie:", session);
    const isAuthenticated = session?.value === "authenticated_wedding_admin";
    console.log("[Proxy] isAuthenticated:", isAuthenticated);

    if (!isAuthenticated) {
      console.log("[Proxy] Not authenticated, redirecting to /admin/login");
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
