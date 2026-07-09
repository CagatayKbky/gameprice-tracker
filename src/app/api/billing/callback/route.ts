import { NextRequest, NextResponse } from "next/server";
import { completeSubscriptionCheckout } from "@/lib/services/billing";
import { getAppUrl } from "@/lib/iyzico";

export const runtime = "nodejs";

async function handleCallback(sessionId: string, token: string) {
  const appUrl = getAppUrl();
  if (!sessionId || !token) {
    return NextResponse.redirect(`${appUrl}/pricing?canceled=1`);
  }
  try {
    await completeSubscriptionCheckout(sessionId, token);
    return NextResponse.redirect(`${appUrl}/pricing?success=1`);
  } catch (error) {
    console.error("iyzico callback error:", error);
    return NextResponse.redirect(`${appUrl}/pricing?canceled=1`);
  }
}

export async function POST(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sid") || "";
  const form = await request.formData();
  const token = form.get("token")?.toString() || "";
  return handleCallback(sessionId, token);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const sessionId = request.nextUrl.searchParams.get("sid") || "";
  return handleCallback(sessionId, token);
}
