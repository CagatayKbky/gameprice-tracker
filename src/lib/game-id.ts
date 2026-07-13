/** Extract Steam app id from gameId (steam-123) or explicit steamAppId field. */
export function extractSteamAppId(
  gameId: string,
  steamAppId?: string | null
): string | undefined {
  if (steamAppId) return steamAppId;
  if (gameId.startsWith("steam-")) return gameId.replace("steam-", "");
  return undefined;
}
