import { NextRequest, NextResponse } from "next/server";
import { runCatalogSync, getCatalogSyncStatus } from "@/lib/services/catalog-sync";

export async function GET() {
  try {
    const status = await getCatalogSyncStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Catalog status error:", error);
    return NextResponse.json({ error: "Status failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const force = searchParams.get("force") === "1";
  const rawgPages = parseInt(searchParams.get("rawgPages") || "25", 10);

  try {
    const result = await runCatalogSync({
      forceSteam: force,
      rawgPages: Number.isFinite(rawgPages) ? rawgPages : 25,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Catalog sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
