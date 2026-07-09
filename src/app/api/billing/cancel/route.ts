import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { cancelSubscription } from "@/lib/services/billing";
import { getPremiumStatus } from "@/lib/premium/access";
import { isIyzicoConfigured } from "@/lib/iyzico";

export async function POST(request: NextRequest) {
  if (!isIyzicoConfigured()) {
    return NextResponse.json({ error: "iyzico_not_configured" }, { status: 503 });
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const status = await getPremiumStatus(sessionId);
  if (!status.isPro) {
    return NextResponse.json({ error: "pro_required" }, { status: 403 });
  }

  try {
    await cancelSubscription(sessionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancel failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
