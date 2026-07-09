import { NextRequest, NextResponse } from "next/server";
import { getTrendingSearches } from "@/lib/services/trending-search";

export async function GET() {
  const trending = await getTrendingSearches(12);
  return NextResponse.json(trending);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { logSearch } = await import("@/lib/services/trending-search");
  const { getSessionIdFromRequest } = await import("@/lib/session");

  if (body.query) {
    await logSearch(body.query, getSessionIdFromRequest(request) || undefined);
  }

  return NextResponse.json({ ok: true });
}
