import { prisma } from "@/lib/db";
import { getSteamFreeGames } from "@/lib/api/steam-deals";
import { getEpicFreeGames } from "@/lib/api/epic-free";
import { sendPriceAlertEmail } from "@/lib/services/email";
import { sendPushToSession } from "@/lib/services/push";

export async function notifyFreeGames() {
  const [steamFree, epicFree] = await Promise.all([
    getSteamFreeGames().catch(() => []),
    getEpicFreeGames("tr").catch(() => []),
  ]);

  const candidates = [
    ...steamFree.map((g) => ({ ...g, platform: "Steam" })),
    ...epicFree.filter((g) => g.salePrice === 0).map((g) => ({ ...g, platform: "Epic" })),
  ];

  let notified = 0;
  const newGames: string[] = [];

  for (const game of candidates) {
    const existing = await prisma.freeGameNotification.findUnique({
      where: { gameId_platform: { gameId: game.gameId, platform: game.platform } },
    });
    if (existing) continue;

    await prisma.freeGameNotification.create({
      data: { gameId: game.gameId, platform: game.platform, title: game.title },
    });
    newGames.push(`${game.title} (${game.platform})`);
  }

  if (newGames.length === 0) {
    return { notified: 0, newGames: 0 };
  }

  const subscribers = await prisma.userProfile.findMany({
    where: { freeGameNotify: true, email: { not: null } },
  });

  for (const profile of subscribers) {
    if (!profile.email) continue;
    const ok = await sendPriceAlertEmail({
      to: profile.email,
      gameTitle: newGames.slice(0, 3).join(", "),
      targetPrice: 0,
      currentPrice: 0,
      gameId: candidates[0]?.gameId || "free",
      userName: profile.name || undefined,
    });
    if (ok) notified++;

    if (profile.pushNotifications) {
      await sendPushToSession(profile.sessionId, {
        title: "Ücretsiz oyun!",
        body: newGames[0] || "Yeni ücretsiz oyunlar mevcut",
        url: "/deals?tab=free",
      }).catch(() => {});
    }
  }

  return { notified, newGames: newGames.length, titles: newGames };
}
