const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const WEBHOOK_RE =
  /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\/(\d+)\/([\w-]+)(\?.*)?$/i;

export function normalizeDiscordWebhookUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const match = trimmed.match(WEBHOOK_RE);
  if (!match) return null;

  const query = match[3] || "";
  return `https://discord.com/api/webhooks/${match[1]}/${match[2]}${query}`;
}

export function isValidDiscordWebhookUrl(raw: string | null | undefined): boolean {
  return normalizeDiscordWebhookUrl(raw) !== null;
}

export interface DiscordSendResult {
  ok: boolean;
  status?: number;
  error?: string;
}

async function postDiscordWebhook(
  webhookUrl: string,
  body: Record<string, unknown>
): Promise<DiscordSendResult> {
  const url = normalizeDiscordWebhookUrl(webhookUrl);
  if (!url) {
    return { ok: false, error: "invalid_webhook_url" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) return { ok: true, status: res.status };

    const text = await res.text().catch(() => "");
    console.error("Discord webhook failed:", res.status, text.slice(0, 200));
    return {
      ok: false,
      status: res.status,
      error: res.status === 404 ? "webhook_not_found" : "discord_rejected",
    };
  } catch (error) {
    console.error("Discord webhook failed:", error);
    return { ok: false, error: "network_error" };
  }
}

interface DiscordAlertPayload {
  gameTitle: string;
  targetPrice: number;
  currentPrice: number;
  gameId: string;
  type?: "price_alert" | "wishlist_deal";
}

export async function sendDiscordPriceAlert(
  webhookUrl: string,
  data: DiscordAlertPayload
): Promise<boolean> {
  const gameUrl = `${APP_URL}/game/${data.gameId}`;
  const isWishlist = data.type === "wishlist_deal";

  const embed = {
    title: isWishlist ? "🎮 İstek Listesi İndirimi" : "🔔 Fiyat Alarmı Tetiklendi",
    description: isWishlist
      ? `**${data.gameTitle}** istek listende indirime girdi!`
      : `**${data.gameTitle}** hedef fiyata ulaştı!`,
    color: isWishlist ? 0x22c55e : 0x66c0f4,
    fields: [
      {
        name: "Güncel Fiyat",
        value: `$${data.currentPrice.toFixed(2)}`,
        inline: true,
      },
      ...(isWishlist
        ? []
        : [
            {
              name: "Hedef Fiyat",
              value: `$${data.targetPrice.toFixed(2)}`,
              inline: true,
            },
          ]),
    ],
    url: gameUrl,
    footer: { text: "GamePrice" },
    timestamp: new Date().toISOString(),
  };

  const result = await postDiscordWebhook(webhookUrl, { embeds: [embed] });
  return result.ok;
}

export async function sendDiscordTestMessage(webhookUrl: string): Promise<DiscordSendResult> {
  return postDiscordWebhook(webhookUrl, {
    content: "✅ **GamePrice** Discord webhook bağlantısı çalışıyor!",
    embeds: [
      {
        title: "Test başarılı",
        description: "Fiyat alarmları ve istek listesi indirimleri bu kanala gönderilecek.",
        color: 0x66c0f4,
        footer: { text: "GamePrice" },
        timestamp: new Date().toISOString(),
      },
    ],
  });
}
