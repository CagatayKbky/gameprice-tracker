const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramAlertPayload {
  gameTitle: string;
  currentPrice: number;
  discount?: number;
  gameId: string;
  type: "price_alert" | "wishlist_deal";
}

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) {
    console.log("[Telegram Dev Mode]", { chatId, text });
    return true;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Telegram send failed:", error);
    return false;
  }
}

export async function sendTelegramAlert(
  chatId: string,
  payload: TelegramAlertPayload
): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const gameUrl = `${appUrl}/game/${payload.gameId}`;

  const title =
    payload.type === "wishlist_deal"
      ? "🎮 İstek Listesi İndirimi"
      : "🔔 Fiyat Alarmı";

  const text = [
    `<b>${title}</b>`,
    ``,
    `<b>${escapeHtml(payload.gameTitle)}</b>`,
    `Fiyat: $${payload.currentPrice.toFixed(2)}`,
    payload.discount ? `İndirim: %${payload.discount}` : "",
    ``,
    `<a href="${gameUrl}">Oyunu Görüntüle</a>`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendTelegramMessage(chatId, text);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
