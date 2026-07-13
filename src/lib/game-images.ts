export function getSteamLibraryImage(appId: string): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
}

export function getSteamHeaderImage(appId: string): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

function imageQualityScore(url: string): number {
  if (!url) return 0;
  if (url.includes("library_600x900") || url.includes("library_2x")) return 100;
  if (url.includes("header.jpg") || url.includes("header_image")) return 85;
  if (url.includes("large_capsule") || url.includes("capsule_616x353")) return 70;
  if (url.includes("background_image") || url.includes("rawg.io")) return 55;
  if (url.includes("store_item_assets")) return 50;
  if (url.includes("cheapshark.com")) return 20;
  if (url.includes("tiny_image") || url.includes("capsule_sm") || url.includes("small_capsule")) {
    return 10;
  }
  return 40;
}

/** Pick the highest-quality image URL from candidates. */
export function pickBestImageUrl(...urls: (string | null | undefined)[]): string | undefined {
  let best: string | undefined;
  let bestScore = 0;
  for (const url of urls) {
    if (!url) continue;
    const score = imageQualityScore(url);
    if (score > bestScore) {
      bestScore = score;
      best = url;
    }
  }
  return best;
}

export function resolveGameImage(options: {
  imageUrl?: string | null;
  steamAppId?: string | null;
  preferPortrait?: boolean;
}): string | undefined {
  const steamLibrary = options.steamAppId
    ? getSteamLibraryImage(options.steamAppId)
    : undefined;
  const steamHeader = options.steamAppId
    ? getSteamHeaderImage(options.steamAppId)
    : undefined;

  const candidates =
    options.preferPortrait === false
      ? [options.imageUrl, steamHeader, steamLibrary]
      : [steamLibrary, options.imageUrl, steamHeader];

  const best = pickBestImageUrl(...candidates);

  if (best) return best;
  if (steamLibrary) return steamLibrary;
  return options.imageUrl ?? undefined;
}
