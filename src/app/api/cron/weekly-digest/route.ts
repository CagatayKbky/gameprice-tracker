import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getHistoricalLowDeals } from "@/lib/api/deals";
import { notifyFreeGames } from "@/lib/services/free-game-notify";
import { sendWeeklyDigestEmail } from "@/lib/services/email";
import { getPersonalizedDigestDeals } from "@/lib/services/weekly-digest";
import { authorizeCron } from "@/lib/cron-auth";
import { logJobFinish, logJobStart } from "@/lib/services/job-log";

async function runWeeklyDigest() {
  const freeGamesResult = await notifyFreeGames().catch(() => ({ notified: 0, newGames: 0 }));
  const deals = await getHistoricalLowDeals();
  const topDeals = deals.length > 0 ? deals.slice(0, 10) : [];

  if (topDeals.length === 0) {
    const { getMegaDeals } = await import("@/lib/api/deals");
    const fallback = await getMegaDeals();
    topDeals.push(...fallback.slice(0, 10));
  }

  const subscribers = await prisma.userProfile.findMany({
    where: {
      email: { not: null },
      emailNotifications: true,
      weeklyDigest: true,
    },
  });

  let sent = 0;
  let failed = 0;

  for (const profile of subscribers) {
    if (!profile.email) continue;
    const userDeals = await getPersonalizedDigestDeals(profile.sessionId, topDeals);
    const ok = await sendWeeklyDigestEmail({
      to: profile.email,
      userName: profile.name || profile.steamPersona || undefined,
      deals: userDeals,
    });
    if (ok) sent++;
    else failed++;
  }

  return { sent, failed, subscribers: subscribers.length, deals: topDeals.length, freeGamesResult };
}

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const job = await logJobStart("weekly-digest");
    const result = await runWeeklyDigest();
    await logJobFinish(job.id, "success", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Weekly digest error:", error);
    return NextResponse.json({ error: "Digest failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const job = await logJobStart("weekly-digest");
    const result = await runWeeklyDigest();
    await logJobFinish(job.id, "success", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Weekly digest error:", error);
    return NextResponse.json({ error: "Digest failed" }, { status: 500 });
  }
}
