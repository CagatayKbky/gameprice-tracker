import { prisma } from "@/lib/db";
import { resolveGame } from "@/lib/api/unified-search";
import { sendPriceAlertEmail } from "@/lib/services/email";
import { sendDiscordPriceAlert } from "@/lib/services/discord";
import { sendTelegramAlert } from "@/lib/services/telegram";
import { sendPushToSession } from "@/lib/services/push";
import { getProfileEmail } from "@/lib/services/profile";
import { createUserNotification } from "@/lib/services/notifications";
import { getPremiumStatus } from "@/lib/premium/access";

const MIN_DISCOUNT_NOTIFY = 25;

export async function checkWishlistDealAlerts() {
  const items = await prisma.wishlistItem.findMany({
    orderBy: { addedAt: "desc" },
    take: 100,
  });

  let notified = 0;
  let checked = 0;

  for (const item of items) {
    try {
      const game = await resolveGame(item.cheapSharkGameId);
      if (!game?.cheapestStore || game.cheapestStore.price <= 0) continue;

      checked++;
      const price = game.cheapestStore.price;
      const discount = game.cheapestStore.discount;

      const profile = await prisma.userProfile.findUnique({
        where: { sessionId: item.sessionId },
      });

      if (!profile?.wishlistDealAlerts) {
        await prisma.wishlistItem.update({
          where: { id: item.id },
          data: { lastKnownPrice: price, lastKnownDiscount: discount },
        });
        continue;
      }

      const priceDropped =
        item.lastKnownPrice !== null &&
        item.lastKnownPrice !== undefined &&
        price < item.lastKnownPrice * 0.95;

      const newGoodDeal =
        discount >= MIN_DISCOUNT_NOTIFY &&
        (item.lastKnownDiscount === null ||
          item.lastKnownDiscount === undefined ||
          discount > item.lastKnownDiscount + 10);

      const shouldNotify =
        (priceDropped || newGoodDeal) &&
        (!item.dealNotifiedAt ||
          Date.now() - item.dealNotifiedAt.getTime() > 24 * 60 * 60 * 1000);

      await prisma.wishlistItem.update({
        where: { id: item.id },
        data: { lastKnownPrice: price, lastKnownDiscount: discount },
      });

      if (!shouldNotify) continue;

      const email = await getProfileEmail(item.sessionId);
      if (email) {
        await sendPriceAlertEmail({
          to: email,
          gameTitle: item.gameTitle,
          targetPrice: price,
          currentPrice: price,
          gameId: item.cheapSharkGameId,
          userName: profile?.name || undefined,
        });
      }

      const premium = await getPremiumStatus(item.sessionId);

      if (premium.isPro && profile?.discordWebhook) {
        await sendDiscordPriceAlert(profile.discordWebhook, {
          gameTitle: item.gameTitle,
          targetPrice: price,
          currentPrice: price,
          gameId: item.cheapSharkGameId,
          type: "wishlist_deal",
        });
      }

      if (profile?.telegramChatId) {
        await sendTelegramAlert(profile.telegramChatId, {
          gameTitle: item.gameTitle,
          currentPrice: price,
          discount,
          gameId: item.cheapSharkGameId,
          type: "wishlist_deal",
        });
      }

      await sendPushToSession(item.sessionId, {
        title: "İstek listesi indirimi!",
        body: `${item.gameTitle} — $${price.toFixed(2)} (%${discount})`,
        url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/game/${item.cheapSharkGameId}`,
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      await createUserNotification({
        sessionId: item.sessionId,
        type: "wishlist_deal",
        title: "İstek listesi indirimi",
        body: `${item.gameTitle} — $${price.toFixed(2)} (%${discount} indirim)`,
        url: `${appUrl}/game/${item.cheapSharkGameId}`,
      });

      await prisma.wishlistItem.update({
        where: { id: item.id },
        data: { dealNotifiedAt: new Date() },
      });

      notified++;
    } catch {
      // skip item
    }
  }

  return { checked, notified, total: items.length };
}
