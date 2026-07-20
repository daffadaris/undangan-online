import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes, except /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session");

    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Validate the session cookie contains a valid userId
    if (!sessionCookie.value.includes("userId")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
