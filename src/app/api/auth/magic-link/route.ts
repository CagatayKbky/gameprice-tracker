import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { createMagicLink, sendMagicLinkEmail } from "@/lib/services/magic-link";
import { z } from "zod";

const bodySchema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const body = bodySchema.parse(await request.json());
    const sessionId = await getOrCreateSessionId();
    const { token, email } = await createMagicLink(body.email, sessionId);
    const sent = await sendMagicLinkEmail(email, token);
    if (!sent) {
      return NextResponse.json({ error: "Email gönderilemedi" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Geçersiz e-posta" }, { status: 400 });
  }
}
