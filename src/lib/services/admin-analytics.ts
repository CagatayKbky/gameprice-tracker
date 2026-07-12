import { prisma } from "@/lib/db";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function fillSeries(
  days: number,
  counts: Map<string, number>
): Array<{ date: string; count: number }> {
  const result: Array<{ date: string; count: number }> = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const key = dayKey(d);
    result.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return result;
}

export async function getAdminTimeSeries(days = 30) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));
  since.setUTCHours(0, 0, 0, 0);

  const [profiles, notifications, referred] = await Promise.all([
    prisma.userProfile.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.userNotification.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.userProfile.findMany({
      where: { referredBySessionId: { not: null }, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const signups = new Map<string, number>();
  const notificationCounts = new Map<string, number>();
  const referralCounts = new Map<string, number>();

  for (const row of profiles) {
    const key = dayKey(row.createdAt);
    signups.set(key, (signups.get(key) ?? 0) + 1);
  }
  for (const row of notifications) {
    const key = dayKey(row.createdAt);
    notificationCounts.set(key, (notificationCounts.get(key) ?? 0) + 1);
  }
  for (const row of referred) {
    const key = dayKey(row.createdAt);
    referralCounts.set(key, (referralCounts.get(key) ?? 0) + 1);
  }

  return {
    days,
    signups: fillSeries(days, signups),
    notifications: fillSeries(days, notificationCounts),
    referrals: fillSeries(days, referralCounts),
  };
}
