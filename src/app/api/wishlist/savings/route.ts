import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { getWishlistSavings } from "@/lib/services/personalized-home";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ onSale: 0, total: 0, savings: 0 });
  }
  const data = await getWishlistSavings(sessionId);
  return NextResponse.json(data);
}
