import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEVICE_COOKIE } from "@/lib/privacy";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes, except /admin/login
  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login") {
      const session = request.cookies.get("admin_session");

      if (!session?.value) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
    return NextResponse.next();
  }

  // Invitation routes (/{username}/{slug}): give every browser a random id so
  // Mode Privat can limit how many browsers each guest link opens on.
  const response = NextResponse.next();
  if (!pathname.startsWith("/api/") && !pathname.includes(".") && !request.cookies.get(DEVICE_COOKIE)) {
    response.cookies.set({
      name: DEVICE_COOKIE,
      value: crypto.randomUUID(),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/:username/:slug"],
};
