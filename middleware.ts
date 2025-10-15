import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow these paths freely:
  // - Home page (/)
  // - Contact page (/contact)
  // - Next.js internals (_next)
  // - Favicon & static assets
  // - Auth endpoints (login/logout)
  if (
    pathname === "/" ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  // Only block API routes server-side (UI modal handles pages)
  if (pathname.startsWith("/api/")) {
    const authed = req.cookies.get("ft_auth")?.value === "1";
    if (!authed) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return NextResponse.next();
}

// Make middleware run on all non-static routes
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
