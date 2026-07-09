import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { getAlerts, createAlert, deleteAlert } from "@/lib/services/alerts";

function ensureSession(request: NextRequest, response: NextResponse): string {
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = randomUUID();
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return sessionId;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json({});
  const sessionId =
    request.cookies.get(SESSION_COOKIE)?.value ?? ensureSession(request, response);

  const alerts = await getAlerts(sessionId);
  return NextResponse.json(alerts, { headers: response.headers });
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({});
  const sessionId = ensureSession(request, response);
  const body = await request.json();

  const { cheapSharkGameId, gameTitle, targetPrice, currentPrice, platformId } = body;
  if (!cheapSharkGameId || !gameTitle || targetPrice === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const alert = await createAlert(sessionId, {
    cheapSharkGameId,
    gameTitle,
    targetPrice,
    currentPrice,
    platformId,
  });

  return NextResponse.json(alert, { headers: response.headers });
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await deleteAlert(sessionId, id);
  return NextResponse.json({ success: true });
}
