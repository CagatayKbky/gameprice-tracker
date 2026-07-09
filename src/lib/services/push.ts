import webpush from "web-push";
import { prisma } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || `mailto:hello@${new URL(APP_URL).hostname}`;

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function savePushSubscription(
  sessionId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      sessionId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    update: {
      sessionId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function removePushSubscription(endpoint: string) {
  return prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

export async function sendPushToSession(sessionId: string, payload: PushPayload) {
  if (!configureVapid()) {
    console.log("[Push Dev Mode]", { sessionId, ...payload });
    return { sent: 0, failed: 0 };
  }

  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (profile && !profile.pushNotifications) {
    return { sent: 0, failed: 0 };
  }

  const subscriptions = await prisma.pushSubscription.findMany({ where: { sessionId } });
  let sent = 0;
  let failed = 0;

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || APP_URL,
    tag: payload.tag,
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        body
      );
      sent++;
    } catch (error: unknown) {
      failed++;
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : 0;
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
      }
    }
  }

  return { sent, failed };
}

export async function sendPriceAlertPush(
  sessionId: string,
  gameTitle: string,
  currentPrice: number,
  gameId: string
) {
  return sendPushToSession(sessionId, {
    title: "Fiyat alarmı tetiklendi!",
    body: `${gameTitle} — ${formatUsd(currentPrice)}`,
    url: `${APP_URL}/game/${gameId}`,
    tag: `alert-${gameId}`,
  });
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
