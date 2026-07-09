import { NextRequest, NextResponse } from "next/server";
import { syncGamePrices, checkAndTriggerAlerts } from "@/lib/services/price-sync";
import { getDealsOfTheDay } from "@/lib/api/cheapshark";
import { authorizeCron } from "@/lib/cron-auth";
import { logJobFinish, logJobStart } from "@/lib/services/job-log";

export async function POST(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runSync(request);
}

export async function GET(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return runSync(request);
}

async function runSync(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const gameId = searchParams.get("gameId");
  const job = await logJobStart("sync-prices", { gameId });

  try {
    if (gameId) {
      const result = await syncGamePrices(gameId);
      await logJobFinish(job.id, "success", { synced: 1, gameId });
      return NextResponse.json({ synced: result });
    }

    const deals = await getDealsOfTheDay();
    const results = await Promise.allSettled(
      deals.map((d) => syncGamePrices(d.gameId))
    );

    const synced = results.filter((r) => r.status === "fulfilled").length;
    const alertResult = await checkAndTriggerAlerts();

    await logJobFinish(job.id, "success", {
      synced,
      total: deals.length,
      alerts: alertResult,
    });

    return NextResponse.json({
      synced,
      total: deals.length,
      alerts: alertResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    await logJobFinish(job.id, "error", undefined, message);
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
