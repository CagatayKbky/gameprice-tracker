import { prisma } from "@/lib/db";
import { resolveGame } from "@/lib/api/unified-search";
import { getSocialGraph } from "@/lib/services/social";
import { createUserNotification } from "@/lib/services/notifications";
import { sendPushToSession } from "@/lib/services/push";

const MIN_DISCOUNT = 25;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function checkFriendDealAlerts() {
  const profiles = await prisma.userProfile.findMany({
    where: { wishlistDealAlerts: true },
    select: { sessionId: true },
  });

  let checked = 0;
  let notified = 0;

  for (const profile of profiles) {
    try {
      const graph = await getSocialGraph(profile.sessionId);
      const friendSessions = graph.friends
        .map((f) => f.profile?.sessionId)
        .filter((id): id is string => Boolean(id));

      if (friendSessions.length === 0) continue;
      checked++;

      const friendWishlist = await prisma.wishlistItem.findMany({
        where: { sessionId: { in: friendSessions } },
      });

      const grouped = new Map<
        string,
        { title: string; friendNames: string[] }
      >();

      for (const item of friendWishlist) {
        const friend = graph.friends.find((f) => f.profile?.sessionId === item.sessionId);
        const name = friend?.profile?.steamPersona || friend?.profile?.name || "Arkadaş";
        const existing = grouped.get(item.cheapSharkGameId);
        if (existing) {
          if (!existing.friendNames.includes(name)) existing.friendNames.push(name);
        } else {
          grouped.set(item.cheapSharkGameId, {
            title: item.gameTitle,
            friendNames: [name],
          });
        }
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

      for (const [gameId, meta] of grouped) {
        const recent = await prisma.friendDealAlertLog.findUnique({
          where: {
            sessionId_gameId: { sessionId: profile.sessionId, gameId },
          },
        });
        if (recent && Date.now() - recent.notifiedAt.getTime() < COOLDOWN_MS) continue;

        const game = await resolveGame(gameId);
        const store = game?.cheapestStore;
        if (!store || store.discount < MIN_DISCOUNT) continue;

        const friendLabel =
          meta.friendNames.length > 1
            ? `${meta.friendNames[0]} +${meta.friendNames.length - 1}`
            : meta.friendNames[0];

        const title = "Arkadaşların indirimde istiyor";
        const body = `${meta.title} — $${store.price.toFixed(2)} (%${store.discount}) · ${friendLabel}`;

        await createUserNotification({
          sessionId: profile.sessionId,
          type: "friend_deal",
          title,
          body,
          url: `${appUrl}/game/${gameId}`,
        });

        await sendPushToSession(profile.sessionId, {
          title,
          body,
          url: `${appUrl}/game/${gameId}`,
        });

        await prisma.friendDealAlertLog.upsert({
          where: {
            sessionId_gameId: { sessionId: profile.sessionId, gameId },
          },
          create: { sessionId: profile.sessionId, gameId },
          update: { notifiedAt: new Date() },
        });

        notified++;
      }
    } catch {
      /* skip user */
    }
  }

  return { checked, notified, users: profiles.length };
}
