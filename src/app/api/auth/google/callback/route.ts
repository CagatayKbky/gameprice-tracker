import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { getGoogleOAuthConfig, isGoogleAdminEmail } from "@/lib/auth/admin";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

interface GoogleUserInfo {
  id: string;
  email?: string;
  verified_email?: boolean;
  name?: string;
  picture?: string;
}

export async function GET(request: NextRequest) {
  const config = getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.redirect(`${getAppUrl()}/settings?google=error`);
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("google_oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${getAppUrl()}/settings?google=error`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${getAppUrl()}/settings?google=error`);
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${getAppUrl()}/settings?google=error`);
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(`${getAppUrl()}/settings?google=error`);
    }

    const googleUser = (await userRes.json()) as GoogleUserInfo;
    if (!googleUser.id) {
      return NextResponse.redirect(`${getAppUrl()}/settings?google=error`);
    }

    const sessionId = request.cookies.get(SESSION_COOKIE)?.value || randomUUID();
    const email = googleUser.email || null;
    const name = googleUser.name || email?.split("@")[0] || "Player";
    const grantAdmin = isGoogleAdminEmail(email);

    await prisma.userProfile.updateMany({
      where: { googleId: googleUser.id, NOT: { sessionId } },
      data: { googleId: null, googleAvatar: null },
    });

    const existing = await prisma.userProfile.findUnique({ where: { sessionId } });

    await prisma.userProfile.upsert({
      where: { sessionId },
      create: {
        sessionId,
        googleId: googleUser.id,
        googleAvatar: googleUser.picture || null,
        email,
        name,
        isAdmin: grantAdmin,
      },
      update: {
        googleId: googleUser.id,
        googleAvatar: googleUser.picture || null,
        email: email || existing?.email,
        name: name || existing?.name,
        ...(grantAdmin ? { isAdmin: true } : {}),
        updatedAt: new Date(),
      },
    });

    const response = NextResponse.redirect(`${getAppUrl()}/profile?google=ok`);
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    response.cookies.delete("google_oauth_state");
    return response;
  } catch {
    return NextResponse.redirect(`${getAppUrl()}/settings?google=error`);
  }
}
