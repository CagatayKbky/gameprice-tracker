import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { getProfile, upsertProfile } from "@/lib/services/profile";
import { prisma } from "@/lib/db";
import { getPremiumStatus, assertProFeature } from "@/lib/premium/access";
import { buildProfileAppearance, getUnlockedCosmetics } from "@/lib/services/profile-cosmetics";

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

  const refCookie = request.cookies.get("gp-ref")?.value;
  if (refCookie) {
    const { applyReferralCode } = await import("@/lib/services/referral");
    await applyReferralCode(sessionId, refCookie).catch(() => {});
  }

  const profile = await getProfile(sessionId);
  const gogMeta = await prisma.userProfile.findUnique({
    where: { sessionId },
    select: { gogRefreshToken: true, gogLibrarySyncedAt: true },
  });
  const premium = await getPremiumStatus(sessionId);
  const cosmetics = await getUnlockedCosmetics(sessionId);
  const appearance = buildProfileAppearance({
    activeProfileFrame: profile?.activeProfileFrame,
    activeProfileEffect: profile?.activeProfileEffect,
    badges: [],
  });
  return NextResponse.json(
    {
      ...(profile || {
        email: null,
        name: null,
        isAdmin: false,
        publicProfile: true,
        emailNotifications: true,
        weeklyDigest: true,
        pushNotifications: true,
        wishlistDealAlerts: true,
        discordWebhook: null,
        telegramChatId: null,
        steamId: null,
        steamPersona: null,
        steamAvatar: null,
        onboardingDone: false,
        freeGameNotify: true,
        hideOwnedGames: true,
        activeProfileFrame: "classic",
        activeProfileEffect: "none",
      }),
      plan: premium.plan,
      isPro: premium.isPro,
      limits: premium.limits,
      usage: premium.usage,
      planExpiresAt: premium.planExpiresAt,
      appearance,
      unlockedCosmetics: {
        frames: cosmetics.frames,
        effects: cosmetics.effects,
        badges: cosmetics.badges,
      },
      gogConnected: Boolean(gogMeta?.gogRefreshToken),
      gogLibrarySyncedAt: gogMeta?.gogLibrarySyncedAt ?? null,
    },
    { headers: response.headers }
  );
}

export async function PUT(request: NextRequest) {
  const response = NextResponse.json({});
  const sessionId = ensureSession(request, response);
  const body = await request.json();

  const {
    email,
    name,
    emailNotifications,
    weeklyDigest,
    pushNotifications,
    wishlistDealAlerts,
    discordWebhook,
    telegramChatId,
    onboardingDone,
    freeGameNotify,
    hideOwnedGames,
    publicProfile,
  } = body;

  if (discordWebhook) {
    const check = await assertProFeature(sessionId, "discord");
    if (!check.ok) {
      return NextResponse.json(
        { error: "pro_required", feature: "discord", upgradeUrl: "/pricing" },
        { status: 403, headers: response.headers }
      );
    }
  }
  if (telegramChatId) {
    const check = await assertProFeature(sessionId, "telegram");
    if (!check.ok) {
      return NextResponse.json(
        { error: "pro_required", feature: "telegram", upgradeUrl: "/pricing" },
        { status: 403, headers: response.headers }
      );
    }
  }
  await upsertProfile(sessionId, {
    email: email || null,
    name: name || null,
    emailNotifications: emailNotifications !== false,
    weeklyDigest: weeklyDigest !== false,
    pushNotifications: pushNotifications !== false,
    wishlistDealAlerts: wishlistDealAlerts !== false,
    discordWebhook: discordWebhook || null,
    telegramChatId: telegramChatId || null,
    ...(onboardingDone !== undefined ? { onboardingDone: Boolean(onboardingDone) } : {}),
    ...(freeGameNotify !== undefined ? { freeGameNotify: freeGameNotify !== false } : {}),
    ...(hideOwnedGames !== undefined ? { hideOwnedGames: hideOwnedGames !== false } : {}),
    ...(publicProfile !== undefined ? { publicProfile: publicProfile !== false } : {}),
  });

  if (name) {
    const { syncProfileSlugFromProfile } = await import("@/lib/profile/profile-slug-service");
    await syncProfileSlugFromProfile(sessionId).catch(() => {});
  }

  const profile = await getProfile(sessionId);

  return NextResponse.json(profile, { headers: response.headers });
}
