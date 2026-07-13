import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getOrCreateSessionId } from "@/lib/session";
import { createNativeOAuthPending } from "@/lib/services/native-auth";
import { getGoogleOAuthConfig } from "@/lib/auth/admin";

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function POST() {
  const config = getGoogleOAuthConfig();
  if (!config) {
    return NextResponse.json({ error: "google_not_configured" }, { status: 503 });
  }

  const sessionId = await getOrCreateSessionId();
  const state = randomUUID();
  await createNativeOAuthPending(sessionId, state);

  const url = `${getAppUrl()}/api/auth/google?native=1&state=${encodeURIComponent(state)}`;
  return NextResponse.json({ url });
}
