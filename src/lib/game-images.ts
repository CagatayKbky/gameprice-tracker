export function getSteamLibraryImage(appId: string): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
}

export function getSteamHeaderImage(appId: string): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

export function resolveGameImage(options: {
  imageUrl?: string | null;
  steamAppId?: string | null;
}): string | undefined {
  if (options.imageUrl) return options.imageUrl;
  if (options.steamAppId) return getSteamLibraryImage(options.steamAppId);
  return undefined;
}
