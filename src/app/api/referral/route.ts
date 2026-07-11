import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import {
  applyReferralCode,
  ensureReferralCode,
  getReferralStats,
} from "@/lib/services/referral";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getReferralStats(sessionId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gameprice.org";

  return NextResponse.json({
    ...stats,
    link: `${appUrl}/?ref=${stats.code}`,
  });
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  if (body.action === "apply" && body.code) {
    const result = await applyReferralCode(sessionId, String(body.code));
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  const code = await ensureReferralCode(sessionId);
  return NextResponse.json({ code });
}
