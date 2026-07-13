import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getGoogleOAuthConfig } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  const config = getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.json({ error: "google_not_configured" }, { status: 503 });
  }

  const isNative = request.nextUrl.searchParams.get("native") === "1";
  const state = request.nextUrl.searchParams.get("state") || randomUUID();

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: isNative ? "none" : "lax",
    maxAge: 600,
    path: "/",
  });
  if (isNative) {
    response.cookies.set("google_oauth_native", "1", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 600,
      path: "/",
    });
  }
  return response;
}
