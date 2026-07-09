import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { getPersonalizedHomeData } from "@/lib/services/personalized-home";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value ?? null;
  const data = await getPersonalizedHomeData(sessionId);
  return NextResponse.json(data);
}
