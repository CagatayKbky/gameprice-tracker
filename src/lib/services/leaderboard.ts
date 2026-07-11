import { prisma } from "@/lib/db";

export interface LeaderboardEntry {
  rank: number;
  sessionId: string;
  name: string;
  avatarUrl: string | null;
  profileSlug: string | null;
  score: number;
  metric: string;
}

export async function getWeeklyLeaderboard(limit = 10): Promise<{
  wishlist: LeaderboardEntry[];
  library: LeaderboardEntry[];
}> {
  const [wishlistRows, libraryRows] = await Promise.all([
    prisma.wishlistItem.groupBy({
      by: ["sessionId"],
      _count: { sessionId: true },
      orderBy: { _count: { sessionId: "desc" } },
      take: limit,
    }),
    prisma.steamOwnedGame.groupBy({
      by: ["sessionId"],
      _count: { sessionId: true },
      orderBy: { _count: { sessionId: "desc" } },
      take: limit,
    }),
  ]);

  const sessionIds = [
    ...new Set([
      ...wishlistRows.map((r) => r.sessionId),
      ...libraryRows.map((r) => r.sessionId),
    ]),
  ];

  const profiles = sessionIds.length
    ? await prisma.userProfile.findMany({
        where: {
          sessionId: { in: sessionIds },
          publicProfile: true,
        },
        select: {
          sessionId: true,
          steamPersona: true,
          name: true,
          steamAvatar: true,
          profileSlug: true,
          steamId: true,
        },
      })
    : [];

  const profileMap = new Map(profiles.map((p) => [p.sessionId, p]));

  const toEntries = (
    rows: { sessionId: string; _count: { sessionId: number } }[],
    metric: string
  ): LeaderboardEntry[] =>
    rows
      .map((row, i) => {
        const p = profileMap.get(row.sessionId);
        if (!p) return null;
        return {
          rank: i + 1,
          sessionId: row.sessionId,
          name: p.steamPersona || p.name || "Player",
          avatarUrl: p.steamAvatar,
          profileSlug: p.profileSlug || p.steamId,
          score: row._count.sessionId,
          metric,
        };
      })
      .filter(Boolean) as LeaderboardEntry[];

  return {
    wishlist: toEntries(wishlistRows, "wishlist"),
    library: toEntries(libraryRows, "library"),
  };
}
