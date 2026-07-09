import { NextRequest, NextResponse } from "next/server";
import { removeFriendRelation, respondToFriendRequest } from "@/lib/services/social";
import { SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const body = await request.json();
  if (body.action === "remove") {
    if (!body.otherSessionId) {
      return NextResponse.json({ error: "otherSessionId required" }, { status: 400 });
    }
    await removeFriendRelation(sessionId, body.otherSessionId);
    return NextResponse.json({ ok: true });
  }

  const action = body.action === "reject" ? "reject" : "accept";
  if (!body.requestId) {
    return NextResponse.json({ error: "requestId required" }, { status: 400 });
  }

  try {
    const result = await respondToFriendRequest(sessionId, body.requestId, action);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "respond_failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
