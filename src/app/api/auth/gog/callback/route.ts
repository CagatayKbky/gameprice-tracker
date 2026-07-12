import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { exchangeGogCode } from "@/lib/auth/gog";
import { syncGogLibrary } from "@/lib/services/gog-library";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("gog_oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${getAppUrl()}/profile/library?gog=error`);
  }

  try {
    const tokens = await exchangeGogCode(code);
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value || randomUUID();

    await prisma.userProfile.upsert({
      where: { sessionId },
      create: {
        sessionId,
        gogRefreshToken: tokens.refresh_token || null,
        gogUserId: tokens.user_id ? String(tokens.user_id) : null,
      },
      update: {
        gogRefreshToken: tokens.refresh_token || undefined,
        gogUserId: tokens.user_id ? String(tokens.user_id) : undefined,
      },
    });

    await syncGogLibrary(sessionId).catch(() => {});

    const response = NextResponse.redirect(`${getAppUrl()}/profile/library?gog=connected`);
    if (!request.cookies.get(SESSION_COOKIE)?.value) {
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      });
    }
    response.cookies.delete("gog_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(`${getAppUrl()}/profile/library?gog=error`);
  }
}
