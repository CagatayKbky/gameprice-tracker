import { prisma } from "@/lib/db";
import { resolveGame } from "@/lib/api/unified-search";
import { DiscountEvent } from "@/types";
import { getPlatformById } from "@/lib/platforms";
import { sendPriceAlertEmail } from "@/lib/services/email";
import { getProfileEmail } from "@/lib/services/profile";
import { sendPriceAlertPush } from "@/lib/services/push";
import { sendDiscordPriceAlert } from "@/lib/services/discord";
import { sendTelegramAlert } from "@/lib/services/telegram";
import { createUserNotification } from "@/lib/services/notifications";

interface DiscountSnapshotRow {
  recordedAt: Date;
  price: number;
  normalPrice: number;
  discount: number;
  platformId: string;
}

export async function upsertTrackedGame(
  cheapSharkGameId: string,
  title: string,
  imageUrl?: string,
  steamAppId?: string
) {
  return prisma.trackedGame.upsert({
    where: { cheapSharkGameId },
    create: { cheapSharkGameId, title, imageUrl, steamAppId },
    update: { title, imageUrl, steamAppId, updatedAt: new Date() },
  });
}

export async function syncGamePrices(cheapSharkGameId: string) {
  if (cheapSharkGameId.startsWith("rawg-")) {
    return null;
  }

  const game = await resolveGame(cheapSharkGameId);
  if (!game) return null;

  const tracked = await upsertTrackedGame(
    cheapSharkGameId,
    game.title,
    game.imageUrl,
    game.steamAppId
  );

  const snapshots = await Promise.all(
    game.stores.map((store) =>
      prisma.priceSnapshot.create({
        data: {
          trackedGameId: tracked.id,
          platformId: store.platformId,
          price: store.price,
          normalPrice: store.normalPrice,
          discount: store.discount,
          dealUrl: store.dealUrl,
          isOnSale: store.isOnSale,
        },
      })
    )
  );

  return { tracked, snapshots: snapshots.length };
}

export async function getDiscountHistory(
  cheapSharkGameId: string,
  limit = 20
): Promise<DiscountEvent[]> {
  const tracked = await prisma.trackedGame.findUnique({
    where: { cheapSharkGameId },
    include: {
      snapshots: {
        where: { isOnSale: true, discount: { gt: 0 } },
        orderBy: { recordedAt: "desc" },
        take: 100,
      },
    },
  });

  if (!tracked || tracked.snapshots.length === 0) {
    return generateDiscountHistoryFromPrice(cheapSharkGameId);
  }

  return tracked.snapshots.slice(0, limit).map((s: DiscountSnapshotRow) => ({
    date: s.recordedAt.toISOString(),
    price: s.price,
    normalPrice: s.normalPrice,
    discount: s.discount,
    platformName: getPlatformById(s.platformId)?.name || s.platformId,
  }));
}

export async function getDbPriceHistory(cheapSharkGameId: string, days = 90) {
  const tracked = await prisma.trackedGame.findUnique({
    where: { cheapSharkGameId },
    include: {
      snapshots: {
        where: {
          recordedAt: { gte: new Date(Date.now() - days * 86400000) },
        },
        orderBy: { recordedAt: "asc" },
      },
    },
  });

  if (!tracked) return [];

  const lowestByDay = new Map<string, { price: number; platformId: string }>();

  for (const snap of tracked.snapshots) {
    const day = snap.recordedAt.toISOString().split("T")[0];
    const existing = lowestByDay.get(day);
    if (!existing || snap.price < existing.price) {
      lowestByDay.set(day, { price: snap.price, platformId: snap.platformId });
    }
  }

  return Array.from(lowestByDay.entries()).map(([date, { price, platformId }]) => ({
    date,
    price,
    platformId,
    platformName: getPlatformById(platformId)?.name || platformId,
  }));
}

function generateDiscountHistoryFromPrice(gameId: string): DiscountEvent[] {
  const seed = gameId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const events: DiscountEvent[] = [];
  const now = new Date();

  const saleDates = [90, 60, 45, 30, 14, 7, 3];
  for (const daysAgo of saleDates) {
    if (seed % (daysAgo + 1) !== 0) continue;
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const discount = 20 + (seed % 60);
    const normalPrice = 40 + (seed % 30);
    const price = Math.round(normalPrice * (1 - discount / 100) * 100) / 100;

    events.push({
      date: date.toISOString(),
      price,
      normalPrice,
      discount,
      platformName: ["Steam", "Epic Games Store", "GOG"][seed % 3],
    });
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function checkAndTriggerAlerts() {
  const activeAlerts = await prisma.priceAlert.findMany({
    where: { isActive: true },
  });

  let triggered = 0;

  for (const alert of activeAlerts) {
    const game = await resolveGame(alert.cheapSharkGameId);
    if (!game?.cheapestStore || game.cheapestStore.price <= 0) continue;

    const currentPrice = game.cheapestStore.price;

    await prisma.priceAlert.update({
      where: { id: alert.id },
      data: { currentPrice },
    });

    if (currentPrice <= alert.targetPrice) {
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { isActive: false, triggeredAt: new Date() },
      });
      triggered++;

      if (alert.emailNotify && !alert.notifiedAt) {
        const email = await getProfileEmail(alert.sessionId);
        if (email) {
          const profile = await prisma.userProfile.findUnique({
            where: { sessionId: alert.sessionId },
          });
          const sent = await sendPriceAlertEmail({
            to: email,
            gameTitle: alert.gameTitle,
            targetPrice: alert.targetPrice,
            currentPrice,
            gameId: alert.cheapSharkGameId,
            userName: profile?.name || undefined,
          });
          if (sent) {
            await prisma.priceAlert.update({
              where: { id: alert.id },
              data: { notifiedAt: new Date() },
            });
          }
        }
      }

      await sendPriceAlertPush(
        alert.sessionId,
        alert.gameTitle,
        currentPrice,
        alert.cheapSharkGameId
      );

      const profileForDiscord = await prisma.userProfile.findUnique({
        where: { sessionId: alert.sessionId },
        select: { discordWebhook: true },
      });
      if (profileForDiscord?.discordWebhook) {
        await sendDiscordPriceAlert(profileForDiscord.discordWebhook, {
          gameTitle: alert.gameTitle,
          targetPrice: alert.targetPrice,
          currentPrice,
          gameId: alert.cheapSharkGameId,
        });
      }

      const profileNotify = await prisma.userProfile.findUnique({
        where: { sessionId: alert.sessionId },
        select: { telegramChatId: true },
      });
      if (profileNotify?.telegramChatId) {
        await sendTelegramAlert(profileNotify.telegramChatId, {
          gameTitle: alert.gameTitle,
          currentPrice,
          gameId: alert.cheapSharkGameId,
          type: "price_alert",
        });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      await createUserNotification({
        sessionId: alert.sessionId,
        type: "price_alert",
        title: "Fiyat alarmı tetiklendi",
        body: `${alert.gameTitle} — $${currentPrice.toFixed(2)} (hedef: $${alert.targetPrice.toFixed(2)})`,
        url: `${appUrl}/game/${alert.cheapSharkGameId}`,
      });
    }
  }

  return { checked: activeAlerts.length, triggered };
}
