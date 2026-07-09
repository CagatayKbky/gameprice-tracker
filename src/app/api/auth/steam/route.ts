import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

const STEAM_OPENID = "https://steamcommunity.com/openid/login";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function GET() {
  const returnUrl = `${getAppUrl()}/api/auth/steam/callback`;
  const realm = getAppUrl();
  const nonce = randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnUrl,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  const response = NextResponse.redirect(`${STEAM_OPENID}?${params.toString()}`);
  response.cookies.set("steam_auth_nonce", nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
