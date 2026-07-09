import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const LOCALE_COOKIE = "gameprice-locale";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const { ok } = rateLimit(`api:${ip}`, 120, 60_000);
    if (!ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  if (!request.cookies.get(LOCALE_COOKIE)) {
    const accept = request.headers.get("accept-language") || "";
    const locale = accept.toLowerCase().startsWith("tr") ? "tr" : "en";
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon-|sw.js).*)"],
};
