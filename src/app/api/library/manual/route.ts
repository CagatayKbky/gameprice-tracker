import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOrCreateSessionId } from "@/lib/session";
import {
  deleteManualGame,
  importManualGames,
  listManualOwnedGames,
  type ManualPlatform,
} from "@/lib/services/manual-library";

const importSchema = z.object({
  platform: z.enum(["epic", "gog", "xbox", "playstation"]),
  titles: z.array(z.string()).min(1).max(500),
});

export async function GET(request: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  const platform = request.nextUrl.searchParams.get("platform") as ManualPlatform | null;
  const games = await listManualOwnedGames(sessionId, platform || undefined);
  return NextResponse.json({ games });
}

export async function POST(request: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  try {
    const body = importSchema.parse(await request.json());
    const result = await importManualGames(sessionId, body.platform, body.titles);
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const sessionId = await getOrCreateSessionId();
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
  await deleteManualGame(sessionId, id);
  return NextResponse.json({ ok: true });
}
