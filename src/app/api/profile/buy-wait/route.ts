import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { getBuyWaitRecommendations } from "@/lib/services/buy-wait";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ items: [], summary: { buy: 0, wait: 0, watch: 0 } });
  }

  const data = await getBuyWaitRecommendations(sessionId);
  return NextResponse.json(data);
}
