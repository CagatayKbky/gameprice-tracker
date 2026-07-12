import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { syncGogLibrary } from "@/lib/services/gog-library";

export async function POST() {
  const sessionId = await getOrCreateSessionId();
  try {
    const result = await syncGogLibrary(sessionId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const code = error instanceof Error ? error.message : "sync_failed";
    return NextResponse.json({ error: code }, { status: 400 });
  }
}
