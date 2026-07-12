import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getGogAuthUrl } from "@/lib/auth/gog";

export async function GET() {
  const state = randomBytes(16).toString("hex");
  const url = getGogAuthUrl(state);
  if (!url) {
    return NextResponse.json({ error: "gog_not_configured" }, { status: 503 });
  }

  const response = NextResponse.redirect(url);
  response.cookies.set("gog_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
