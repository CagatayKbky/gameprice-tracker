const STEAM_API = "https://api.steampowered.com";

export interface SteamOwnedGameApi {
  appid: number;
  name?: string;
  playtime_forever: number;
  rtime_last_played?: number;
}

export function isSteamApiConfigured(): boolean {
  return Boolean(process.env.STEAM_API_KEY?.trim());
}

export async function fetchSteamOwnedGames(
  steamId: string
): Promise<SteamOwnedGameApi[]> {
  const key = process.env.STEAM_API_KEY?.trim();
  if (!key) {
    throw new Error("STEAM_API_KEY yapılandırılmamış");
  }

  const url = new URL(`${STEAM_API}/IPlayerService/GetOwnedGames/v0001/`);
  url.searchParams.set("key", key);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("include_appinfo", "1");
  url.searchParams.set("include_played_free_games", "1");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Steam API yanıt vermedi (${res.status})`);
  }

  const data = (await res.json()) as {
    response?: { game_count?: number; games?: SteamOwnedGameApi[] };
  };

  if (data.response?.game_count === undefined) {
    throw new Error(
      "Steam kütüphanesi okunamadı — profil gizlilik ayarlarında oyun detayları herkese açık olmalı"
    );
  }

  return data.response.games ?? [];
}
