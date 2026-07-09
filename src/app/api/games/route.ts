import { NextRequest, NextResponse } from "next/server";
import { getDealsOfTheDay } from "@/lib/api/cheapshark";
import { unifiedSearch, resolveGame } from "@/lib/api/unified-search";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "search": {
        const q = searchParams.get("q") || "";
        const results = await unifiedSearch(q);
        if (q.trim()) {
          const { logSearch } = await import("@/lib/services/trending-search");
          const { getSessionIdFromRequest } = await import("@/lib/session");
          logSearch(q, getSessionIdFromRequest(request) || undefined).catch(() => {});
        }
        return NextResponse.json(results);
      }
      case "game": {
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
        const game = await resolveGame(id);
        return NextResponse.json(game);
      }
      case "deals": {
        const deals = await getDealsOfTheDay();
        return NextResponse.json(deals);
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
