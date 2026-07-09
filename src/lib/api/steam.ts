export interface SteamGameDetails {
  appId: string;
  name: string;
  shortDescription: string;
  description: string;
  headerImage: string;
  screenshots: { url: string; thumbnail: string }[];
  genres: string[];
  metacritic?: number;
  steamRating?: { percent: number; text: string; count: number };
  price?: {
    currency: string;
    initial: number;
    final: number;
    discount: number;
  };
  isFree: boolean;
  releaseDate?: string;
  developers: string[];
  publishers: string[];
}

interface SteamApiResponse {
  [appId: string]: {
    success: boolean;
    data?: {
      name: string;
      short_description: string;
      detailed_description: string;
      header_image: string;
      screenshots: Array<{ path_thumbnail: string; path_full: string }>;
      genres: Array<{ description: string }>;
      metacritic?: { score: number };
      price_overview?: {
        currency: string;
        initial: number;
        final: number;
        discount_percent: number;
      };
      is_free: boolean;
      release_date?: { date: string };
      developers?: string[];
      publishers?: string[];
      recommendations?: { total: number };
      steam_rating?: { rating: number; rating_text: string };
    };
  };
}

export async function getSteamGameDetails(
  appId: string,
  region = "tr"
): Promise<SteamGameDetails | null> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${region}&l=turkish`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const json: SteamApiResponse = await res.json();
    const entry = json[appId];
    if (!entry?.success || !entry.data) return null;

    const data = entry.data;

    return {
      appId,
      name: data.name,
      shortDescription: stripHtml(data.short_description || ""),
      description: stripHtml(data.detailed_description || ""),
      headerImage: data.header_image,
      screenshots: (data.screenshots || []).slice(0, 8).map((s) => ({
        url: s.path_full,
        thumbnail: s.path_thumbnail,
      })),
      genres: (data.genres || []).map((g) => g.description),
      metacritic: data.metacritic?.score,
      steamRating: data.recommendations
        ? {
            percent: 0,
            text: "Olumlu",
            count: data.recommendations.total,
          }
        : undefined,
      price: data.price_overview
        ? {
            currency: data.price_overview.currency,
            initial: data.price_overview.initial / 100,
            final: data.price_overview.final / 100,
            discount: data.price_overview.discount_percent,
          }
        : data.is_free
          ? { currency: "TRY", initial: 0, final: 0, discount: 0 }
          : undefined,
      isFree: data.is_free,
      releaseDate: data.release_date?.date,
      developers: data.developers || [],
      publishers: data.publishers || [],
    };
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function getSteamStoreUrl(appId: string, region = "tr"): string {
  return `https://store.steampowered.com/app/${appId}/?cc=${region}&l=turkish`;
}
