import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import { getProfile } from "@/lib/services/profile";
import { assertProFeature } from "@/lib/premium/access";
import {
  isValidDiscordWebhookUrl,
  normalizeDiscordWebhookUrl,
  sendDiscordTestMessage,
} from "@/lib/services/discord";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const proCheck = await assertProFeature(sessionId, "discord");
  if (!proCheck.ok) {
    return NextResponse.json(
      { error: "pro_required", feature: "discord", upgradeUrl: "/pricing" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const profile = await getProfile(sessionId);
  const rawUrl =
    typeof body.webhookUrl === "string" && body.webhookUrl.trim()
      ? body.webhookUrl.trim()
      : profile?.discordWebhook;

  if (!rawUrl) {
    return NextResponse.json({ error: "webhook_required" }, { status: 400 });
  }

  if (!isValidDiscordWebhookUrl(rawUrl)) {
    return NextResponse.json({ error: "invalid_discord_webhook" }, { status: 400 });
  }

  const webhookUrl = normalizeDiscordWebhookUrl(rawUrl)!;
  const result = await sendDiscordTestMessage(webhookUrl);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "send_failed", status: result.status },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
