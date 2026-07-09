import { prisma } from "@/lib/db";
import { buildProfileAppearance, getUnlockedCosmetics } from "@/lib/services/profile-cosmetics";
import { findPublicProfileBySlug } from "@/lib/profile/profile-slug-service";
import { getPublicProfilePath } from "@/lib/profile/profile-slug";
import { getWishlist } from "@/lib/services/wishlist";
import { getLibraryGamesCount } from "@/lib/services/steam-library";

async function enrichProfiles(sessionIds: string[]) {
  if (sessionIds.length === 0) return new Map<string, Record<string, unknown>>();

  const [wishlistCounts, libraryCounts, recentWishlist] = await Promise.all([
    prisma.wishlistItem.groupBy({
      by: ["sessionId"],
      where: { sessionId: { in: sessionIds } },
      _count: { _all: true },
    }),
    prisma.steamOwnedGame.groupBy({
      by: ["sessionId"],
      where: { sessionId: { in: sessionIds } },
      _count: { _all: true },
    }),
    prisma.wishlistItem.findMany({
      where: { sessionId: { in: sessionIds } },
      select: { sessionId: true, gameTitle: true, addedAt: true },
      orderBy: { addedAt: "desc" },
    }),
  ]);

  const wishlistCountMap = new Map(wishlistCounts.map((row) => [row.sessionId, row._count._all]));
  const libraryCountMap = new Map(libraryCounts.map((row) => [row.sessionId, row._count._all]));
  const recentWishlistMap = new Map<string, { gameTitle: string; addedAt: Date }>();

  for (const item of recentWishlist) {
    if (!recentWishlistMap.has(item.sessionId)) {
      recentWishlistMap.set(item.sessionId, {
        gameTitle: item.gameTitle,
        addedAt: item.addedAt,
      });
    }
  }

  return new Map(
    sessionIds.map((sessionId) => [
      sessionId,
      {
        wishlistCount: wishlistCountMap.get(sessionId) || 0,
        libraryCount: libraryCountMap.get(sessionId) || 0,
        recentWishlist: recentWishlistMap.get(sessionId) || null,
      },
    ])
  );
}

export async function getDiscoverProfiles(sessionId: string, query?: string) {
  const q = query?.trim();
  const requests = await prisma.friendRequest.findMany({
    where: {
      OR: [{ fromSessionId: sessionId }, { toSessionId: sessionId }],
    },
    select: { fromSessionId: true, toSessionId: true, status: true },
  });

  const excluded = new Set<string>([sessionId]);
  for (const req of requests) {
    excluded.add(req.fromSessionId);
    excluded.add(req.toSessionId);
  }

  const profiles = await prisma.userProfile.findMany({
    where: {
      publicProfile: true,
      steamId: { not: null },
      sessionId: { notIn: Array.from(excluded) },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { steamPersona: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      sessionId: true,
      name: true,
      steamPersona: true,
      steamAvatar: true,
      isAdmin: true,
      plan: true,
      steamId: true,
      steamLibrarySyncedAt: true,
      profileSlug: true,
      activeProfileFrame: true,
      activeProfileEffect: true,
    },
    take: 24,
    orderBy: { updatedAt: "desc" },
  });

  const extraMap = await enrichProfiles(profiles.map((profile) => profile.sessionId));
  return profiles.map((profile) => ({
    ...profile,
    ...(extraMap.get(profile.sessionId) || {}),
  }));
}

export async function sendFriendRequest(fromSessionId: string, toSessionId: string) {
  if (fromSessionId === toSessionId) throw new Error("cannot_add_self");

  return prisma.friendRequest.upsert({
    where: {
      fromSessionId_toSessionId: {
        fromSessionId,
        toSessionId,
      },
    },
    create: {
      fromSessionId,
      toSessionId,
      status: "pending",
    },
    update: {
      status: "pending",
      updatedAt: new Date(),
    },
  });
}

export async function removeFriendRelation(sessionId: string, otherSessionId: string) {
  return prisma.friendRequest.deleteMany({
    where: {
      OR: [
        { fromSessionId: sessionId, toSessionId: otherSessionId },
        { fromSessionId: otherSessionId, toSessionId: sessionId },
      ],
    },
  });
}

export async function respondToFriendRequest(
  sessionId: string,
  requestId: string,
  action: "accept" | "reject"
) {
  const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
  if (!request || request.toSessionId !== sessionId) {
    throw new Error("request_not_found");
  }

  return prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: action === "accept" ? "accepted" : "rejected" },
  });
}

export async function getSocialGraph(sessionId: string) {
  const [incoming, outgoing, friends] = await Promise.all([
    prisma.friendRequest.findMany({
      where: { toSessionId: sessionId, status: "pending" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendRequest.findMany({
      where: { fromSessionId: sessionId, status: "pending" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendRequest.findMany({
      where: {
        status: "accepted",
        OR: [{ fromSessionId: sessionId }, { toSessionId: sessionId }],
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const requestedIds = [
    ...incoming.map((r) => r.fromSessionId),
    ...outgoing.map((r) => r.toSessionId),
    ...friends.map((r) => (r.fromSessionId === sessionId ? r.toSessionId : r.fromSessionId)),
  ];

  const profiles = await prisma.userProfile.findMany({
    where: { sessionId: { in: requestedIds } },
    select: {
      sessionId: true,
      name: true,
      steamPersona: true,
      steamAvatar: true,
      isAdmin: true,
      plan: true,
      steamId: true,
      steamLibrarySyncedAt: true,
      profileSlug: true,
      activeProfileFrame: true,
      activeProfileEffect: true,
    },
  });

  const extraMap = await enrichProfiles(profiles.map((profile) => profile.sessionId));
  const profileMap = new Map(
    profiles.map((profile) => [
      profile.sessionId,
      {
        ...profile,
        ...(extraMap.get(profile.sessionId) || {}),
      },
    ])
  );

  return {
    incoming: incoming.map((r) => ({ ...r, profile: profileMap.get(r.fromSessionId) || null })),
    outgoing: outgoing.map((r) => ({ ...r, profile: profileMap.get(r.toSessionId) || null })),
    friends: friends.map((r) => {
      const otherId = r.fromSessionId === sessionId ? r.toSessionId : r.fromSessionId;
      return { ...r, profile: profileMap.get(otherId) || null };
    }),
  };
}

export function getProfileBadges(params: {
  isAdmin?: boolean;
  isPro?: boolean;
  steamConnected?: boolean;
  libraryCount?: number;
  wishlistCount?: number;
}) {
  const badges: Array<{ id: string; label: string; tone: string }> = [];

  if (params.isAdmin) badges.push({ id: "admin", label: "Admin", tone: "red" });
  if (params.isPro) badges.push({ id: "pro", label: "Pro", tone: "amber" });
  if (params.steamConnected) badges.push({ id: "steam", label: "Steam", tone: "blue" });
  if ((params.libraryCount || 0) >= 50) {
    badges.push({ id: "collector", label: "Collector", tone: "indigo" });
  }
  if ((params.wishlistCount || 0) >= 10) {
    badges.push({ id: "deal-hunter", label: "Deal Hunter", tone: "emerald" });
  }

  return badges;
}

export async function getPublicProfileBySteamId(
  steamId: string,
  viewerSessionId?: string | null
) {
  const profile = await prisma.userProfile.findFirst({
    where: {
      steamId,
      publicProfile: true,
    },
    select: {
      sessionId: true,
      steamId: true,
      steamPersona: true,
      steamAvatar: true,
      name: true,
      isAdmin: true,
      plan: true,
      createdAt: true,
      activeProfileFrame: true,
      activeProfileEffect: true,
    },
  });

  if (!profile) return null;

  const [wishlist, libraryCount, friendship] = await Promise.all([
    getWishlist(profile.sessionId),
    getLibraryGamesCount(profile.sessionId),
    viewerSessionId
      ? prisma.friendRequest.findFirst({
          where: {
            status: "accepted",
            OR: [
              { fromSessionId: viewerSessionId, toSessionId: profile.sessionId },
              { fromSessionId: profile.sessionId, toSessionId: viewerSessionId },
            ],
          },
        })
      : null,
  ]);

  let commonWishlist: string[] = [];
  let commonLibrary: Array<{ steamAppId: string; name: string | null }> = [];
  let viewerOwnsFromWishlist = 0;
  let relationship: "self" | "friend" | "incoming" | "outgoing" | "none" = "none";

  if (viewerSessionId) {
    const [viewerWishlist, viewerLibrary, relation] = await Promise.all([
      getWishlist(viewerSessionId),
      prisma.steamOwnedGame.findMany({
        where: { sessionId: viewerSessionId },
        select: { steamAppId: true, name: true },
      }),
      prisma.friendRequest.findFirst({
        where: {
          OR: [
            { fromSessionId: viewerSessionId, toSessionId: profile.sessionId },
            { fromSessionId: profile.sessionId, toSessionId: viewerSessionId },
          ],
        },
      }),
    ]);

    const viewerWishlistIds = new Set(viewerWishlist.map((w) => w.cheapSharkGameId));
    const viewerOwnedIds = new Set(viewerLibrary.map((g) => `steam-${g.steamAppId}`));
    const viewerOwnedMap = new Map(viewerLibrary.map((g) => [g.steamAppId, g.name || null]));

    commonWishlist = wishlist
      .filter((w) => viewerWishlistIds.has(w.cheapSharkGameId))
      .slice(0, 8)
      .map((w) => w.gameTitle);

    viewerOwnsFromWishlist = wishlist.filter((w) => viewerOwnedIds.has(w.cheapSharkGameId)).length;

    const targetLibrary = await prisma.steamOwnedGame.findMany({
      where: { sessionId: profile.sessionId },
      select: { steamAppId: true, name: true },
      take: 200,
    });

    commonLibrary = targetLibrary
      .filter((g) => viewerOwnedMap.has(g.steamAppId))
      .slice(0, 8)
      .map((g) => ({ steamAppId: g.steamAppId, name: g.name || viewerOwnedMap.get(g.steamAppId) || null }));

    if (viewerSessionId === profile.sessionId) {
      relationship = "self";
    } else if (relation?.status === "accepted") {
      relationship = "friend";
    } else if (relation?.fromSessionId === viewerSessionId && relation?.status === "pending") {
      relationship = "outgoing";
    } else if (relation?.toSessionId === viewerSessionId && relation?.status === "pending") {
      relationship = "incoming";
    }
  }

  const unlockedCosmetics = await getUnlockedCosmetics(profile.sessionId);
  const appearance = buildProfileAppearance({
    activeProfileFrame: profile.activeProfileFrame,
    activeProfileEffect: profile.activeProfileEffect,
    badges: unlockedCosmetics.badges.map((badge) => ({
      id: badge!.id,
      label: badge!.label,
      toneClass: badge!.toneClass,
    })),
  });

  return {
    profile,
    badges: getProfileBadges({
      isAdmin: profile.isAdmin,
      isPro: profile.plan === "pro",
      steamConnected: true,
      libraryCount,
      wishlistCount: wishlist.length,
    }),
    stats: {
      wishlistCount: wishlist.length,
      libraryCount,
      viewerOwnsFromWishlist,
      commonWishlistCount: commonWishlist.length,
      commonLibraryCount: commonLibrary.length,
    },
    commonWishlist,
    commonLibrary,
    isFriend: Boolean(friendship),
    relationship,
    sessionId: profile.sessionId,
    appearance,
    wishlistPreview: wishlist.slice(0, 8),
  };
}

export async function getPublicProfileBySlug(
  slug: string,
  viewerSessionId?: string | null
) {
  const profile = await findPublicProfileBySlug(slug);
  if (!profile?.steamId) return null;
  return getPublicProfileBySteamId(profile.steamId, viewerSessionId);
}

export async function getSocialActivityFeed(sessionId: string) {
  const graph = await getSocialGraph(sessionId);
  const friendSessions = graph.friends
    .map((item) => item.profile?.sessionId)
    .filter((id): id is string => Boolean(id));

  if (friendSessions.length === 0) return [];

  const [wishlistEvents, friendProfiles, recentCosmetics, triggeredAlerts] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { sessionId: { in: friendSessions } },
      orderBy: { addedAt: "desc" },
      take: 24,
    }),
    prisma.userProfile.findMany({
      where: { sessionId: { in: friendSessions } },
      select: {
        sessionId: true,
        steamPersona: true,
        steamAvatar: true,
        steamId: true,
        profileSlug: true,
        steamLibrarySyncedAt: true,
        plan: true,
      },
    }),
    prisma.userCosmetic.findMany({
      where: { sessionId: { in: friendSessions } },
      orderBy: { createdAt: "desc" },
      take: 16,
    }),
    prisma.priceAlert.findMany({
      where: {
        sessionId: { in: friendSessions },
        triggeredAt: { not: null },
      },
      orderBy: { triggeredAt: "desc" },
      take: 12,
    }),
  ]);

  const profileMap = new Map(friendProfiles.map((profile) => [profile.sessionId, profile]));
  const activities: Array<{
    id: string;
    type: "wishlist_add" | "library_sync" | "cosmetic_unlock" | "alert_hit" | "pro_join";
    at: string;
    profile: (typeof friendProfiles)[number];
    gameTitle?: string;
    gameId?: string;
    cosmeticLabel?: string;
    price?: number;
  }> = [];

  for (const item of wishlistEvents) {
    const profile = profileMap.get(item.sessionId);
    if (!profile) continue;
    activities.push({
      id: `wishlist-${item.id}`,
      type: "wishlist_add",
      at: item.addedAt.toISOString(),
      profile,
      gameTitle: item.gameTitle,
      gameId: item.cheapSharkGameId,
    });
  }

  for (const profile of friendProfiles) {
    if (!profile.steamLibrarySyncedAt) continue;
    activities.push({
      id: `sync-${profile.sessionId}-${profile.steamLibrarySyncedAt.toISOString()}`,
      type: "library_sync",
      at: profile.steamLibrarySyncedAt.toISOString(),
      profile,
    });
    if (profile.plan === "pro") {
      activities.push({
        id: `pro-${profile.sessionId}`,
        type: "pro_join",
        at: profile.steamLibrarySyncedAt.toISOString(),
        profile,
      });
    }
  }

  const badgeLabels: Record<string, string> = {
    founder: "Founder",
    "early-supporter": "Early Supporter",
    "verified-collector": "Collector",
    "deal-hunter": "Deal Hunter",
    "steam-pro": "Steam Pro",
    "pro-gold": "Pro Gold",
    holo: "Holo",
  };

  for (const row of recentCosmetics) {
    const profile = profileMap.get(row.sessionId);
    if (!profile) continue;
    activities.push({
      id: `cosmetic-${row.id}`,
      type: "cosmetic_unlock",
      at: row.createdAt.toISOString(),
      profile,
      cosmeticLabel: badgeLabels[row.key] || row.key,
    });
  }

  for (const alert of triggeredAlerts) {
    const profile = profileMap.get(alert.sessionId);
    if (!profile || !alert.triggeredAt) continue;
    activities.push({
      id: `alert-${alert.id}`,
      type: "alert_hit",
      at: alert.triggeredAt.toISOString(),
      profile,
      gameTitle: alert.gameTitle,
      gameId: alert.cheapSharkGameId,
      price: alert.currentPrice || undefined,
    });
  }

  return activities
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 16);
}

export { getPublicProfilePath };
