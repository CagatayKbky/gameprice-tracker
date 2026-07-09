import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { getPremiumStatus } from "@/lib/premium/access";
import { isIyzicoConfigured } from "@/lib/iyzico";

function ensureSession(request: NextRequest, response: NextResponse): string {
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const sessionId = randomUUID();
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return sessionId;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json({});
  const sessionId =
    request.cookies.get(SESSION_COOKIE)?.value ?? ensureSession(request, response);

  const status = await getPremiumStatus(sessionId);
  return NextResponse.json(
    {
      ...status,
      billingConfigured: isIyzicoConfigured(),
    },
    { headers: response.headers }
  );
}
