import { prisma } from "@/lib/db";
import { fetchSteamOwnedGames, isSteamApiConfigured } from "@/lib/api/steam-web-api";

export async function syncSteamLibrary(sessionId: string): Promise<{
  synced: number;
  steamId: string;
}> {
  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile?.steamId) {
    throw new Error("Steam hesabı bağlı değil");
  }
  if (!isSteamApiConfigured()) {
    throw new Error("STEAM_API_KEY sunucuda yapılandırılmamış");
  }

  const games = await fetchSteamOwnedGames(profile.steamId);
  const now = new Date();

  await prisma.steamOwnedGame.deleteMany({ where: { sessionId } });
  if (games.length > 0) {
    await prisma.steamOwnedGame.createMany({
      data: games.map((g) => ({
        sessionId,
        steamAppId: String(g.appid),
        name: g.name || null,
        playtimeMinutes: g.playtime_forever || 0,
        lastPlayedAt: g.rtime_last_played
          ? new Date(g.rtime_last_played * 1000)
          : null,
        syncedAt: now,
      })),
    });
  }
  await prisma.userProfile.update({
    where: { sessionId },
    data: { steamLibrarySyncedAt: now, updatedAt: now },
  });

  return { synced: games.length, steamId: profile.steamId };
}

export async function getOwnedAppIds(sessionId: string): Promise<Set<string>> {
  const rows = await prisma.steamOwnedGame.findMany({
    where: { sessionId },
    select: { steamAppId: true },
  });
  return new Set(rows.map((r) => r.steamAppId));
}

export async function isGameOwned(sessionId: string, gameId: string): Promise<boolean> {
  const appId = gameId.startsWith("steam-") ? gameId.replace("steam-", "") : null;
  if (!appId) return false;
  const row = await prisma.steamOwnedGame.findUnique({
    where: { sessionId_steamAppId: { sessionId, steamAppId: appId } },
  });
  return Boolean(row);
}

export async function getLibrarySummary(sessionId: string) {
  const [count, topPlayed, recentPlayed] = await Promise.all([
    prisma.steamOwnedGame.count({ where: { sessionId } }),
    prisma.steamOwnedGame.findMany({
      where: { sessionId },
      orderBy: { playtimeMinutes: "desc" },
      take: 6,
    }),
    prisma.steamOwnedGame.findMany({
      where: {
        sessionId,
        lastPlayedAt: { not: null },
      },
      orderBy: [{ lastPlayedAt: "desc" }, { playtimeMinutes: "desc" }],
      take: 6,
    }),
  ]);
  return { count, topPlayed, recentPlayed };
}

export async function getLibraryGames(
  sessionId: string,
  options?: {
    q?: string;
    sort?: "playtime" | "recent" | "name";
    limit?: number;
    skip?: number;
    minHours?: number;
    recentOnly?: boolean;
  }
) {
  const q = options?.q?.trim();
  const sort = options?.sort || "playtime";
  const minHours = options?.minHours ?? 0;

  return prisma.steamOwnedGame.findMany({
    where: {
      sessionId,
      ...(minHours > 0 ? { playtimeMinutes: { gte: minHours * 60 } } : {}),
      ...(options?.recentOnly ? { lastPlayedAt: { not: null } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { steamAppId: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy:
      sort === "name"
        ? [{ name: "asc" }]
        : sort === "recent"
          ? [{ lastPlayedAt: "desc" }, { playtimeMinutes: "desc" }]
          : [{ playtimeMinutes: "desc" }, { name: "asc" }],
    ...(options?.skip ? { skip: options.skip } : {}),
    ...(options?.limit ? { take: options.limit } : {}),
  });
}

export async function getLibraryGamesCount(
  sessionId: string,
  options?: {
    q?: string;
    minHours?: number;
    recentOnly?: boolean;
  }
) {
  const q = options?.q?.trim();
  const minHours = options?.minHours ?? 0;

  return prisma.steamOwnedGame.count({
    where: {
      sessionId,
      ...(minHours > 0 ? { playtimeMinutes: { gte: minHours * 60 } } : {}),
      ...(options?.recentOnly ? { lastPlayedAt: { not: null } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { steamAppId: { contains: q } },
            ],
          }
        : {}),
    },
  });
}
