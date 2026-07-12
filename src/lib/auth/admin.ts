import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function getAdminSessionId(request?: NextRequest): Promise<string | null> {
  if (request) {
    return request.cookies.get(SESSION_COOKIE)?.value ?? null;
  }
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function requireAdmin(request?: NextRequest) {
  const sessionId = await getAdminSessionId(request);
  if (!sessionId) {
    return { ok: false as const, status: 401, error: "unauthorized" };
  }

  const profile = await prisma.userProfile.findUnique({
    where: { sessionId },
    select: { sessionId: true, isAdmin: true, email: true, name: true },
  });

  if (!profile?.isAdmin) {
    return { ok: false as const, status: 403, error: "forbidden" };
  }

  return { ok: true as const, profile };
}

export function isGoogleAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (process.env.GOOGLE_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) return false;
  return list.includes(email.toLowerCase());
}

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    redirectUri: `${getAppUrl()}/api/auth/google/callback`,
  };
}
