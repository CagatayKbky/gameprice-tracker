export interface SteamWishlistItem {
  name: string;
  appId?: string;
  priority?: number;
}

function parseWishlistXml(xml: string): SteamWishlistItem[] {
  const items: SteamWishlistItem[] = [];
  const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

  for (const block of itemBlocks) {
    const nameMatch =
      block.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/) ||
      block.match(/<name>(.*?)<\/name>/);
    const appMatch = block.match(/<appid>(\d+)<\/appid>/);
    const priorityMatch = block.match(/<priority>(\d+)<\/priority>/);

    const name = nameMatch?.[1]?.trim();
    if (!name) continue;

    items.push({
      name,
      appId: appMatch?.[1],
      priority: priorityMatch ? parseInt(priorityMatch[1], 10) : undefined,
    });
  }

  return items;
}

function buildWishlistUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d{17}$/.test(trimmed)) {
    return `https://steamcommunity.com/profiles/${trimmed}/wishlist/?xml=1`;
  }

  if (trimmed.includes("steamcommunity.com")) {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (!url.pathname.includes("wishlist")) {
      url.pathname = url.pathname.replace(/\/$/, "") + "/wishlist/";
    }
    url.search = "xml=1";
    return url.toString();
  }

  const vanity = trimmed.replace(/^@/, "");
  return `https://steamcommunity.com/id/${encodeURIComponent(vanity)}/wishlist/?xml=1`;
}

export async function fetchSteamWishlist(
  profileInput: string
): Promise<SteamWishlistItem[]> {
  const url = buildWishlistUrl(profileInput);
  if (!url) return [];

  const res = await fetch(url, {
    headers: {
      "User-Agent": "GamePrice/1.0",
      Accept: "application/xml,text/xml",
    },
    next: { revalidate: 600 },
  });

  if (!res.ok) {
    throw new Error(
      res.status === 403
        ? "Steam istek listesi gizli veya erişilemiyor"
        : `Steam yanıt vermedi (${res.status})`
    );
  }

  const xml = await res.text();
  if (!xml.includes("<wishlist")) {
    throw new Error("Geçerli bir Steam istek listesi bulunamadı");
  }

  return parseWishlistXml(xml);
}
