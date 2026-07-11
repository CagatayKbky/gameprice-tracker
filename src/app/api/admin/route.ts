import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session";
import { getCatalogSyncStatus } from "@/lib/services/catalog-sync";
import { getRecentJobLogs } from "@/lib/services/job-log";
import {
  searchUserProfiles,
  setUserAccess,
  setUserAdmin,
  setUserPro,
  type UserIdentifierType,
} from "@/lib/services/admin-users";
import { grantUserCosmetic } from "@/lib/services/profile-cosmetics";

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

  const usersQuery = request.nextUrl.searchParams.get("users");
  const users = usersQuery ? await searchUserProfiles(usersQuery) : undefined;

  const [syncStatus, trackedGames, activeAlerts, wishlistItems, profiles, jobLogs, proUsers, notifications7d, referrals] =
    await Promise.all([
      getCatalogSyncStatus(),
      prisma.trackedGame.count(),
      prisma.priceAlert.count({ where: { isActive: true } }),
      prisma.wishlistItem.count(),
      prisma.userProfile.count(),
      getRecentJobLogs(15),
      prisma.userProfile.count({ where: { plan: "pro" } }),
      prisma.userNotification.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      }),
      prisma.userProfile.count({ where: { referredBySessionId: { not: null } } }),
    ]);

  return NextResponse.json({
    sync: syncStatus,
    stats: {
      trackedGames,
      activeAlerts,
      wishlistItems,
      profiles,
      proUsers,
      notifications7d,
      referrals,
    },
    env: {
      rawgEnabled: Boolean(process.env.RAWG_API_KEY),
      resendEnabled: Boolean(process.env.RESEND_API_KEY),
      pushEnabled: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
      sentryEnabled: Boolean(process.env.SENTRY_DSN),
      meiliEnabled: Boolean(
        process.env.MEILISEARCH_HOST && process.env.MEILISEARCH_API_KEY
      ),
      databaseProvider: process.env.DATABASE_URL?.startsWith("postgres")
        ? "postgresql"
        : "sqlite",
    },
    users,
    jobLogs: jobLogs.map((j: (typeof jobLogs)[number]) => ({
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

  if (action === "sync-meilisearch") {
    const { syncMeilisearchCatalog } = await import("@/lib/services/meilisearch-sync");
    const { logJobStart, logJobFinish } = await import("@/lib/services/job-log");
    const job = await logJobStart("sync-meilisearch");
    try {
      const result = await syncMeilisearchCatalog();
      if (!result.ok) {
        await logJobFinish(job.id, "error", undefined, result.error);
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }
      await logJobFinish(job.id, "success", result);
      return NextResponse.json({ ok: true, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Meilisearch sync failed";
      await logJobFinish(job.id, "error", undefined, message);
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
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

  if (action === "make-me-admin") {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "No active session" }, { status: 400 });
    }
    const profile = await setUserAdmin(sessionId, true);
    return NextResponse.json({ ok: true, profile });
  }

  if (action === "make-me-pro") {
    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "No active session" }, { status: 400 });
    }
    const profile = await setUserPro(sessionId, true);
    return NextResponse.json({ ok: true, profile });
  }

  if (action === "search-users") {
    const query = String(body.query || "").trim();
    const users = await searchUserProfiles(query);
    return NextResponse.json({ ok: true, users });
  }

  if (action === "set-user-access") {
    const identifier = String(body.identifier || "").trim();
    const identifierType = (body.identifierType || "sessionId") as UserIdentifierType;
    if (!identifier) {
      return NextResponse.json({ error: "identifier_required" }, { status: 400 });
    }
    if (body.isAdmin === undefined && body.isPro === undefined) {
      return NextResponse.json({ error: "access_field_required" }, { status: 400 });
    }

    try {
      const profile = await setUserAccess(identifier, identifierType, {
        ...(body.isAdmin !== undefined ? { isAdmin: Boolean(body.isAdmin) } : {}),
        ...(body.isPro !== undefined ? { isPro: Boolean(body.isPro) } : {}),
      });
      return NextResponse.json({ ok: true, profile });
    } catch (error) {
      const message = error instanceof Error ? error.message : "set_access_failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (action === "grant-cosmetic") {
    const targetSessionId = String(body.sessionId || "").trim();
    const type = body.type;
    const key = String(body.key || "").trim();
    if (!targetSessionId || !key || (type !== "badge" && type !== "frame" && type !== "effect")) {
      return NextResponse.json({ error: "invalid_cosmetic_payload" }, { status: 400 });
    }
    try {
      const row = await grantUserCosmetic(targetSessionId, { type, key, source: "admin" });
      return NextResponse.json({ ok: true, cosmetic: row });
    } catch (error) {
      const message = error instanceof Error ? error.message : "grant_failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
