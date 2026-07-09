import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { getProfile } from "@/lib/services/profile";
import {
  buildProfileAppearance,
  getUnlockedCosmetics,
  setEquippedCosmetic,
} from "@/lib/services/profile-cosmetics";

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
  const [profile, cosmetics] = await Promise.all([
    getProfile(sessionId),
    getUnlockedCosmetics(sessionId),
  ]);

  const appearance = buildProfileAppearance({
    activeProfileFrame: profile?.activeProfileFrame,
    activeProfileEffect: profile?.activeProfileEffect,
    badges: cosmetics.badges.map((badge) => ({
      id: badge!.id,
      label: badge!.label,
      toneClass: badge!.toneClass,
    })),
  });

  return NextResponse.json(
    {
      appearance,
      equipped: {
        frame: profile?.activeProfileFrame || "classic",
        effect: profile?.activeProfileEffect || "none",
      },
      cosmetics: {
        frames: cosmetics.frames,
        effects: cosmetics.effects,
        badges: cosmetics.badges,
        badgeCatalog: cosmetics.badgeCatalog,
      },
    },
    { headers: response.headers }
  );
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({});
  const sessionId = ensureSession(request, response);
  const body = await request.json();

  if ((body.type !== "frame" && body.type !== "effect") || !body.key) {
    return NextResponse.json(
      { error: "type_and_key_required" },
      { status: 400, headers: response.headers }
    );
  }

  try {
    const profile = await setEquippedCosmetic(sessionId, {
      type: body.type,
      key: body.key,
    });
    return NextResponse.json({ ok: true, profile }, { headers: response.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "equip_failed";
    return NextResponse.json({ error: message }, { status: 400, headers: response.headers });
  }
}
