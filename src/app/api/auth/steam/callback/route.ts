import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

const STEAM_OPENID = "https://steamcommunity.com/openid/login";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function extractSteamId(claimedId: string): string | null {
  const match = claimedId.match(/\/id\/(\d+)$/);
  return match?.[1] || null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const verifyParams = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    if (key.startsWith("openid.")) {
      verifyParams.set(key, value);
    }
  }
  verifyParams.set("openid.mode", "check_authentication");

  try {
    const verifyRes = await fetch(STEAM_OPENID, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyParams.toString(),
    });

    const text = await verifyRes.text();
    if (!text.includes("is_valid:true")) {
      return NextResponse.redirect(`${getAppUrl()}/settings?steam=error`);
    }

    const claimedId = params.get("openid.claimed_id");
    if (!claimedId) {
      return NextResponse.redirect(`${getAppUrl()}/settings?steam=error`);
    }

    const steamId = extractSteamId(claimedId);
    if (!steamId) {
      return NextResponse.redirect(`${getAppUrl()}/settings?steam=error`);
    }

    const sessionId = request.cookies.get(SESSION_COOKIE)?.value || randomUUID();

    const personaRes = await fetch(
      `https://steamcommunity.com/profiles/${steamId}/?xml=1`,
      { headers: { Accept: "application/xml" } }
    );
    const personaXml = await personaRes.text();
    const nameMatch = personaXml.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
    const avatarMatch = personaXml.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
    const steamPersona = nameMatch?.[1] || `Steam User ${steamId.slice(-4)}`;
    const steamAvatar = avatarMatch?.[1] || null;

    await prisma.userProfile.updateMany({
      where: { steamId, NOT: { sessionId } },
      data: { steamId: null, steamPersona: null, steamAvatar: null },
    });

    await prisma.userProfile.upsert({
      where: { sessionId },
      create: {
        sessionId,
        steamId,
        steamPersona,
        steamAvatar,
        name: steamPersona,
      },
      update: {
        steamId,
        steamPersona,
        steamAvatar,
        name: steamPersona,
        updatedAt: new Date(),
      },
    });

    const response = NextResponse.redirect(`${getAppUrl()}/profile?steam=ok`);
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    response.cookies.delete("steam_auth_nonce");

    return response;
  } catch {
    return NextResponse.redirect(`${getAppUrl()}/settings?steam=error`);
  }
}
