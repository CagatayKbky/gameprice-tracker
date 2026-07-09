import { prisma } from "@/lib/db";
import {
  CosmeticType,
  getBadgeDefinition,
  getEffectDefinition,
  getFrameDefinition,
  isKnownCosmetic,
  PROFILE_EFFECTS,
  PROFILE_FRAMES,
} from "@/lib/profile/cosmetics";
import { computeAutoBadgeUnlocks, buildProfileBadgeViews } from "@/lib/profile/badges";

type BaseBadge = { id: string; label: string; tone?: string; toneClass?: string };

function defaultUnlocks(params: {
  isPro: boolean;
  isAdmin?: boolean;
  steamConnected?: boolean;
  libraryCount?: number;
  wishlistCount?: number;
  createdAt?: Date | null;
}) {
  const frames = ["classic", "steam-blue"];
  const effects = ["none"];

  if (params.isPro) {
    frames.push("pro-gold", "neon-purple", "holo");
    effects.push("soft-glow", "shimmer", "pulse");
  }

  const badges = computeAutoBadgeUnlocks(params);

  return { frames, effects, badges };
}

export async function grantDefaultProfileCosmetics(sessionId: string, params: {
  isPro: boolean;
  isAdmin?: boolean;
  steamConnected?: boolean;
  libraryCount?: number;
  wishlistCount?: number;
  createdAt?: Date | null;
}) {
  const defaults = defaultUnlocks(params);
  const rows = [
    ...defaults.frames.map((key) => ({ sessionId, type: "frame", key, source: params.isPro ? "pro" : "manual" })),
    ...defaults.effects.map((key) => ({ sessionId, type: "effect", key, source: params.isPro ? "pro" : "manual" })),
    ...defaults.badges.map((key) => ({ sessionId, type: "badge", key, source: params.isPro ? "pro" : "manual" })),
  ] as Array<{ sessionId: string; type: CosmeticType; key: string; source: string }>;

  if (rows.length === 0) return;

  await prisma.userCosmetic.createMany({
    data: rows,
    skipDuplicates: true,
  });
}

export async function getUnlockedCosmetics(sessionId: string) {
  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile) {
    return {
      profile: null,
      frames: PROFILE_FRAMES.map((frame) => ({ ...frame, unlocked: frame.id === "classic" || frame.id === "steam-blue" })),
      effects: PROFILE_EFFECTS.map((effect) => ({ ...effect, unlocked: effect.id === "none" })),
      badges: [] as ReturnType<typeof getBadgeDefinition>[],
      badgeCatalog: buildProfileBadgeViews({
        isPro: false,
        steamConnected: false,
        unlockedCosmeticBadgeIds: [],
      }),
    };
  }

  const libraryCount = await prisma.steamOwnedGame.count({ where: { sessionId } });
  const wishlistCount = await prisma.wishlistItem.count({ where: { sessionId } });
  await grantDefaultProfileCosmetics(sessionId, {
    isPro: profile.plan === "pro",
    isAdmin: profile.isAdmin,
    steamConnected: Boolean(profile.steamId),
    libraryCount,
    wishlistCount,
    createdAt: profile.createdAt,
  });

  const unlocked = await prisma.userCosmetic.findMany({ where: { sessionId } });
  const unlockedKeys = new Set(unlocked.map((item) => `${item.type}:${item.key}`));

  return {
    profile,
    frames: PROFILE_FRAMES.map((frame) => ({
      ...frame,
      unlocked: unlockedKeys.has(`frame:${frame.id}`),
    })),
    effects: PROFILE_EFFECTS.map((effect) => ({
      ...effect,
      unlocked: unlockedKeys.has(`effect:${effect.id}`),
    })),
    badges: unlocked
      .filter((item) => item.type === "badge")
      .map((item) => getBadgeDefinition(item.key))
      .filter(Boolean),
    badgeCatalog: buildProfileBadgeViews({
      isPro: profile.plan === "pro",
      isAdmin: profile.isAdmin,
      steamConnected: Boolean(profile.steamId),
      unlockedCosmeticBadgeIds: unlocked
        .filter((item) => item.type === "badge")
        .map((item) => item.key),
    }),
  };
}

export function buildProfileAppearance(params: {
  activeProfileFrame?: string | null;
  activeProfileEffect?: string | null;
  badges: BaseBadge[];
}) {
  const frame = getFrameDefinition(params.activeProfileFrame);
  const effect = getEffectDefinition(params.activeProfileEffect);
  const specialBadges = params.badges
    .map((badge) => {
      const def = getBadgeDefinition(badge.id);
      return def
        ? { id: def.id, label: def.label, toneClass: def.toneClass }
        : { id: badge.id, label: badge.label, toneClass: badge.toneClass || "" };
    });

  return {
    frameId: frame.id,
    effectId: effect.id,
    frame,
    effect,
    badges: specialBadges,
  };
}

export async function setEquippedCosmetic(
  sessionId: string,
  input: { type: "frame" | "effect"; key: string }
) {
  if (!isKnownCosmetic(input.type, input.key)) {
    throw new Error("cosmetic_not_found");
  }

  const unlocked = await prisma.userCosmetic.findUnique({
    where: {
      sessionId_type_key: {
        sessionId,
        type: input.type,
        key: input.key,
      },
    },
  });

  if (!unlocked) {
    throw new Error("cosmetic_locked");
  }

  return prisma.userProfile.upsert({
    where: { sessionId },
    create: {
      sessionId,
      activeProfileFrame: input.type === "frame" ? input.key : "classic",
      activeProfileEffect: input.type === "effect" ? input.key : "none",
    },
    update:
      input.type === "frame"
        ? { activeProfileFrame: input.key }
        : { activeProfileEffect: input.key },
  });
}

export async function grantUserCosmetic(
  sessionId: string,
  input: { type: CosmeticType; key: string; source?: string }
) {
  if (!isKnownCosmetic(input.type, input.key)) {
    throw new Error("cosmetic_not_found");
  }

  return prisma.userCosmetic.upsert({
    where: {
      sessionId_type_key: {
        sessionId,
        type: input.type,
        key: input.key,
      },
    },
    create: {
      sessionId,
      type: input.type,
      key: input.key,
      source: input.source || "admin",
    },
    update: {
      source: input.source || "admin",
    },
  });
}
