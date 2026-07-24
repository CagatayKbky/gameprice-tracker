const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gameprice.org";
const EMBED_COLOR = 0x66c0f4;

export const DISCORD_COMMANDS = [
  {
    name: "fiyat",
    description: "Bir oyunun en ucuz fiyatını göster",
    options: [
      {
        name: "oyun",
        description: "Oyun adı",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "ara",
    description: "Oyun ara (en fazla 5 sonuç)",
    options: [
      {
        name: "sorgu",
        description: "Arama metni",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "indirimler",
    description: "Günün büyük indirimlerini listele",
    options: [],
  },
] as const;

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  thumbnail?: { url: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
}

export function gameUrl(gameId: string) {
  return `${APP_URL}/game/${gameId}`;
}

export function embedPrice(game: {
  title: string;
  gameId: string;
  price: number;
  normalPrice?: number;
  discount?: number;
  storeName?: string;
  imageUrl?: string | null;
}): DiscordEmbed {
  const fields: DiscordEmbed["fields"] = [
    {
      name: "Fiyat",
      value: `$${game.price.toFixed(2)}`,
      inline: true,
    },
  ];
  if (game.normalPrice && game.normalPrice > game.price) {
    fields.push({
      name: "Normal",
      value: `$${game.normalPrice.toFixed(2)}`,
      inline: true,
    });
  }
  if (game.discount && game.discount > 0) {
    fields.push({
      name: "İndirim",
      value: `%${Math.round(game.discount)}`,
      inline: true,
    });
  }
  if (game.storeName) {
    fields.push({
      name: "Mağaza",
      value: game.storeName,
      inline: true,
    });
  }

  return {
    title: game.title,
    url: gameUrl(game.gameId),
    description: `[GamePrice'ta aç](${gameUrl(game.gameId)})`,
    color: EMBED_COLOR,
    thumbnail: game.imageUrl ? { url: game.imageUrl } : undefined,
    fields,
    footer: { text: "GamePrice" },
    timestamp: new Date().toISOString(),
  };
}

export function embedSearchResults(
  query: string,
  results: Array<{
    title: string;
    gameId: string;
    cheapestPrice?: number | null;
  }>
): DiscordEmbed {
  if (results.length === 0) {
    return {
      title: `"${query}" için sonuç yok`,
      description: "Farklı bir arama dene veya siteye bak.",
      color: EMBED_COLOR,
      footer: { text: "GamePrice" },
    };
  }

  const lines = results.map((r, i) => {
    const price =
      r.cheapestPrice != null ? ` — $${r.cheapestPrice.toFixed(2)}` : "";
    return `**${i + 1}.** [${r.title}](${gameUrl(r.gameId)})${price}`;
  });

  return {
    title: `Arama: ${query}`,
    description: lines.join("\n"),
    color: EMBED_COLOR,
    footer: { text: "GamePrice · /fiyat ile detay" },
    timestamp: new Date().toISOString(),
  };
}

export function embedDeals(
  deals: Array<{
    title: string;
    gameId: string;
    salePrice: number;
    discount: number;
    platformName?: string;
  }>
): DiscordEmbed {
  if (deals.length === 0) {
    return {
      title: "İndirim bulunamadı",
      description: "Biraz sonra tekrar dene.",
      color: EMBED_COLOR,
      footer: { text: "GamePrice" },
    };
  }

  const lines = deals.slice(0, 8).map((d, i) => {
    const store = d.platformName ? ` · ${d.platformName}` : "";
    return `**${i + 1}.** [${d.title}](${gameUrl(d.gameId)}) — $${d.salePrice.toFixed(2)} (%${Math.round(d.discount)})${store}`;
  });

  return {
    title: "Günün büyük indirimleri",
    description: lines.join("\n"),
    url: `${APP_URL}/deals?tab=mega`,
    color: EMBED_COLOR,
    footer: { text: "GamePrice" },
    timestamp: new Date().toISOString(),
  };
}

export function getBotInviteUrl(applicationId: string): string {
  const perms = "0";
  const scopes = encodeURIComponent("bot applications.commands");
  return `https://discord.com/api/oauth2/authorize?client_id=${applicationId}&permissions=${perms}&scope=${scopes}`;
}
