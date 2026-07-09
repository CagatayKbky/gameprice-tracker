import { NextRequest, NextResponse } from "next/server";
import { verifyMagicLink } from "@/lib/services/magic-link";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/settings?auth=invalid", request.url));
  }

  const result = await verifyMagicLink(token);
  if (!result) {
    return NextResponse.redirect(new URL("/settings?auth=expired", request.url));
  }

  const response = NextResponse.redirect(new URL("/profile?auth=success", request.url));
  response.cookies.set(SESSION_COOKIE, result.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
