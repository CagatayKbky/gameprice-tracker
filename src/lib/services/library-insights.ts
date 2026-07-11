import { prisma } from "@/lib/db";

export async function getLibraryInsights(sessionId: string) {
  const games = await prisma.steamOwnedGame.findMany({
    where: { sessionId },
    select: {
      steamAppId: true,
      name: true,
      playtimeMinutes: true,
      lastPlayedAt: true,
    },
  });

  if (games.length === 0) {
    return {
      totalGames: 0,
      totalPlaytimeHours: 0,
      unplayedCount: 0,
      staleBacklogCount: 0,
      backlogScore: 0,
      avgPlaytimeHours: 0,
      topUnplayed: [] as Array<{ steamAppId: string; name: string | null }>,
    };
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  let totalPlaytimeMinutes = 0;
  let unplayedCount = 0;
  let staleBacklogCount = 0;
  const unplayedGames: Array<{ steamAppId: string; name: string | null; playtimeMinutes: number }> = [];

  for (const game of games) {
    totalPlaytimeMinutes += game.playtimeMinutes;
    if (game.playtimeMinutes < 10) {
      unplayedCount += 1;
      unplayedGames.push(game);
    }
    const stale =
      game.playtimeMinutes < 60 &&
      (!game.lastPlayedAt || game.lastPlayedAt < oneYearAgo);
    if (stale) staleBacklogCount += 1;
  }

  const backlogScore = Math.min(
    100,
    Math.round((unplayedCount / games.length) * 100)
  );

  unplayedGames.sort((a, b) => a.playtimeMinutes - b.playtimeMinutes);

  return {
    totalGames: games.length,
    totalPlaytimeHours: Math.round(totalPlaytimeMinutes / 60),
    unplayedCount,
    staleBacklogCount,
    backlogScore,
    avgPlaytimeHours: Math.round(totalPlaytimeMinutes / games.length / 60),
    topUnplayed: unplayedGames.slice(0, 5).map((g) => ({
      steamAppId: g.steamAppId,
      name: g.name,
    })),
  };
}
