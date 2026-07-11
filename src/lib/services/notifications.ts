import { prisma } from "@/lib/db";

export type NotificationType =
  | "price_alert"
  | "price_alert_instant"
  | "wishlist_deal"
  | "buy_wait"
  | "friend_deal"
  | "system";

export async function createUserNotification(input: {
  sessionId: string;
  type: NotificationType;
  title: string;
  body: string;
  url?: string;
}) {
  return prisma.userNotification.create({
    data: {
      sessionId: input.sessionId,
      type: input.type,
      title: input.title,
      body: input.body,
      url: input.url,
    },
  });
}

export async function getUserNotifications(sessionId: string, limit = 40) {
  return prisma.userNotification.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadNotificationCount(sessionId: string) {
  return prisma.userNotification.count({
    where: { sessionId, readAt: null },
  });
}

export async function markNotificationRead(sessionId: string, id: string) {
  return prisma.userNotification.updateMany({
    where: { id, sessionId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(sessionId: string) {
  return prisma.userNotification.updateMany({
    where: { sessionId, readAt: null },
    data: { readAt: new Date() },
  });
}
