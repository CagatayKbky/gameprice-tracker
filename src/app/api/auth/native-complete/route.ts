import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { consumeNativeAuthCode } from "@/lib/services/native-auth";

const bodySchema = z.object({
  code: z.string().min(16).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const { code } = bodySchema.parse(await request.json());
    const sessionId = await consumeNativeAuthCode(code);
    if (!sessionId) {
      return NextResponse.json({ error: "invalid_code" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
