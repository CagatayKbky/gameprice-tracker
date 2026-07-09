import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import {
  getLibraryGames,
  getLibraryGamesCount,
  getLibrarySummary,
  getOwnedAppIds,
  syncSteamLibrary,
} from "@/lib/services/steam-library";
import { getLibraryInsights } from "@/lib/services/library-insights";
import { isSteamApiConfigured } from "@/lib/api/steam-web-api";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ connected: false, appIds: [] });
  }

  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile?.steamId) {
    return NextResponse.json({ connected: false, appIds: [] });
  }

  const q = request.nextUrl.searchParams.get("q") || undefined;
  const sortParam = request.nextUrl.searchParams.get("sort");
  const mode = request.nextUrl.searchParams.get("mode");
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") || "1", 10) || 1);
  const perPage = Math.min(
    48,
    Math.max(1, parseInt(request.nextUrl.searchParams.get("perPage") || "24", 10) || 24)
  );
  const minHours = Math.max(
    0,
    parseInt(request.nextUrl.searchParams.get("minHours") || "0", 10) || 0
  );
  const recentOnly = request.nextUrl.searchParams.get("recentOnly") === "1";
  const insightsOnly = request.nextUrl.searchParams.get("insights") === "1";
  const sort =
    sortParam === "name" || sortParam === "recent" || sortParam === "playtime"
      ? sortParam
      : "playtime";

  const [summary, appIds, insights] = await Promise.all([
    getLibrarySummary(sessionId),
    getOwnedAppIds(sessionId),
    insightsOnly ? getLibraryInsights(sessionId) : Promise.resolve(null),
  ]);

  const [games, filteredCount] =
    mode === "all"
      ? await Promise.all([
          getLibraryGames(sessionId, {
            q,
            sort,
            minHours,
            recentOnly,
            limit: perPage,
            skip: (page - 1) * perPage,
          }),
          getLibraryGamesCount(sessionId, {
            q,
            minHours,
            recentOnly,
          }),
        ])
      : [undefined, undefined];

  return NextResponse.json({
    connected: true,
    steamId: profile.steamId,
    apiConfigured: isSteamApiConfigured(),
    syncedAt: profile.steamLibrarySyncedAt,
    count: summary.count,
    topPlayed: summary.topPlayed,
    recentPlayed: summary.recentPlayed,
    games,
    filteredCount,
    page,
    perPage,
    appIds: Array.from(appIds),
    insights,
  });
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Oturum gerekli" }, { status: 401 });
  }

  try {
    const result = await syncSteamLibrary(sessionId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync başarısız";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
