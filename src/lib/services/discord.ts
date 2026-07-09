const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface DiscordAlertPayload {
  gameTitle: string;
  targetPrice: number;
  currentPrice: number;
  gameId: string;
}

export async function sendDiscordPriceAlert(
  webhookUrl: string,
  data: DiscordAlertPayload
): Promise<boolean> {
  if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    return false;
  }

  const gameUrl = `${APP_URL}/game/${data.gameId}`;
  const embed = {
    title: "🎮 Fiyat Alarmı Tetiklendi",
    description: `**${data.gameTitle}** hedef fiyata ulaştı!`,
    color: 0x6366f1,
    fields: [
      {
        name: "Güncel Fiyat",
        value: `$${data.currentPrice.toFixed(2)}`,
        inline: true,
      },
      {
        name: "Hedef Fiyat",
        value: `$${data.targetPrice.toFixed(2)}`,
        inline: true,
      },
    ],
    url: gameUrl,
    footer: { text: "GamePrice" },
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Discord webhook failed:", error);
    return false;
  }
}
