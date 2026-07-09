const EXCLUDE_PATTERNS = [
  /dedicated server/i,
  /soundtrack/i,
  /\bdemo\b/i,
  /\bbeta\b/i,
  /\btrailer\b/i,
  /\bsdk\b/i,
  /\btoolkit?\b/i,
  /\bwallpaper\b/i,
  /\bost\b/i,
  /mod kit/i,
  /playtest/i,
  /steam client/i,
  /steamworks/i,
  /\- editor$/i,
  /\- modding/i,
  /cinema\b/i,
  /\- video$/i,
  /\- wallpapers$/i,
  /\- soundtrack$/i,
  /\- artbook$/i,
];

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[™®©:]/g, "")
    .replace(
      /\s*[-–—]?\s*(goty|game of the year|deluxe|ultimate|gold|complete|definitive|edition|remastered|remake|director'?s cut|special)\s*(edition)?/gi,
      ""
    )
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCatalogLetter(titleNorm: string): string {
  const first = titleNorm.charAt(0);
  if (first >= "a" && first <= "z") return first;
  if (first >= "0" && first <= "9") return "#";
  return "#";
}

export function isLikelyGame(name: string): boolean {
  const title = name?.trim();
  if (!title || title.length < 2) return false;
  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(title))) return false;
  return true;
}

export function parsePlatforms(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
