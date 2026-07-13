/** Human-readable cosmetic names for activity feeds and admin. */
export const COSMETIC_DISPLAY_LABELS: Record<string, string> = {
  classic: "Classic",
  "steam-blue": "Steam Blue",
  "pro-gold": "Pro Gold",
  "neon-purple": "Neon Purple",
  holo: "Holo",
  "summer-sale": "Summer Sale",
  none: "None",
  "soft-glow": "Soft Glow",
  shimmer: "Shimmer",
  pulse: "Pulse",
  aurora: "Aurora",
  ember: "Ember",
  frost: "Frost",
  founder: "Founder",
  "early-supporter": "Early Supporter",
  "verified-collector": "Collector",
  "deal-hunter": "Deal Hunter",
  "steam-pro": "Steam Pro",
};

export function getCosmeticDisplayLabel(key: string): string {
  return COSMETIC_DISPLAY_LABELS[key] || key;
}

export function cosmeticI18nKey(type: "frame" | "effect", id: string, field: "label" | "description") {
  return `profileCosmetics.${type}s.${id}.${field}`;
}
