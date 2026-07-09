import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCatalogSyncStatus } from "@/lib/services/catalog-sync";
import { getRecentJobLogs } from "@/lib/services/job-log";

function authorizeAdmin(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  const queryKey = request.nextUrl.searchParams.get("key");
  return header === `Bearer ${secret}` || queryKey === secret;
}

export async function GET(request: NextRequest) {
  if (!authorizeAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [syncStatus, trackedGames, activeAlerts, wishlistItems, profiles, jobLogs] =
    await Promise.all([
      getCatalogSyncStatus(),
      prisma.trackedGame.count(),
      prisma.priceAlert.count({ where: { isActive: true } }),
      prisma.wishlistItem.count(),
      prisma.userProfile.count(),
      getRecentJobLogs(15),
    ]);

  return NextResponse.json({
    sync: syncStatus,
    stats: {
      trackedGames,
      activeAlerts,
      wishlistItems,
      profiles,
    },
    env: {
      rawgEnabled: Boolean(process.env.RAWG_API_KEY),
      resendEnabled: Boolean(process.env.RESEND_API_KEY),
      pushEnabled: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      sentryEnabled: Boolean(process.env.SENTRY_DSN),
      meiliEnabled: Boolean(process.env.MEILISEARCH_HOST),
      databaseProvider: process.env.DATABASE_URL?.startsWith("postgres")
        ? "postgresql"
        : "sqlite",
    },
    jobLogs: jobLogs.map((j) => ({
      id: j.id,
      type: j.type,
      status: j.status,
      startedAt: j.startedAt.toISOString(),
      finishedAt: j.finishedAt?.toISOString() ?? null,
      error: j.error,
    })),
  });
}

export async function POST(request: NextRequest) {
  if (!authorizeAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action;

  if (action === "sync-catalog") {
    const { runCatalogSync } = await import("@/lib/services/catalog-sync");
    const result = await runCatalogSync({
      forceSteam: Boolean(body.forceSteam),
      rawgPages: body.rawgPages ? parseInt(body.rawgPages, 10) : 5,
    });
    return NextResponse.json({ ok: true, result });
  }

  if (action === "sync-prices") {
    const { checkAndTriggerAlerts } = await import("@/lib/services/price-sync");
    const { getDealsOfTheDay } = await import("@/lib/api/cheapshark");
    const deals = await getDealsOfTheDay();
    const { syncGamePrices } = await import("@/lib/services/price-sync");
    const results = await Promise.allSettled(
      deals.slice(0, 12).map((d) => syncGamePrices(d.gameId))
    );
    const synced = results.filter((r) => r.status === "fulfilled").length;
    const alerts = await checkAndTriggerAlerts();
    return NextResponse.json({ ok: true, synced, alerts });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
