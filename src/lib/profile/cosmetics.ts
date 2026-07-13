export type CosmeticType = "badge" | "frame" | "effect";

export interface CosmeticDefinition {
  id: string;
  type: CosmeticType;
  label: string;
  description: string;
  tier: "free" | "pro" | "special";
  proOnly?: boolean;
}

export interface CosmeticBadgeDefinition extends CosmeticDefinition {
  type: "badge";
  toneClass: string;
  unlockHint: string;
}

export interface CosmeticFrameDefinition extends CosmeticDefinition {
  type: "frame";
  ringClass: string;
  ringSpinClass: string;
  ringWidth: number;
  bannerClass: string;
  bannerOverlayClass?: string;
  cardClass: string;
}

export interface CosmeticEffectDefinition extends CosmeticDefinition {
  type: "effect";
  auraClass: string;
  bannerOverlayClass?: string;
}

export const PROFILE_FRAMES: CosmeticFrameDefinition[] = [
  {
    id: "classic",
    type: "frame",
    label: "Classic",
    description: "Simple steel ring.",
    tier: "free",
    ringClass: "profile-ring-classic",
    ringSpinClass: "",
    ringWidth: 3,
    bannerClass: "profile-banner-classic",
    cardClass: "border-[#2a475e]/60 bg-[#0e1419]",
  },
  {
    id: "steam-blue",
    type: "frame",
    label: "Steam Blue",
    description: "Rotating Steam-blue avatar ring.",
    tier: "free",
    ringClass: "profile-ring-steam-blue",
    ringSpinClass: "profile-ring-spin",
    ringWidth: 4,
    bannerClass: "profile-banner-steam-blue",
    bannerOverlayClass: "profile-banner-overlay-waves",
    cardClass: "border-[#66c0f4]/30 bg-[#0e1419]",
  },
  {
    id: "pro-gold",
    type: "frame",
    label: "Pro Gold",
    description: "Premium gold ring with glow.",
    tier: "pro",
    proOnly: true,
    ringClass: "profile-ring-pro-gold",
    ringSpinClass: "profile-ring-spin",
    ringWidth: 5,
    bannerClass: "profile-banner-pro-gold",
    bannerOverlayClass: "profile-banner-overlay-shimmer",
    cardClass: "border-amber-400/35 bg-[#12100b]",
  },
  {
    id: "neon-purple",
    type: "frame",
    label: "Neon Purple",
    description: "Fast neon arcade ring.",
    tier: "pro",
    proOnly: true,
    ringClass: "profile-ring-neon-purple",
    ringSpinClass: "profile-ring-spin-fast",
    ringWidth: 5,
    bannerClass: "profile-banner-neon",
    bannerOverlayClass: "profile-banner-overlay-grid",
    cardClass: "border-fuchsia-500/35 bg-[#120b1d]",
  },
  {
    id: "holo",
    type: "frame",
    label: "Holo",
    description: "Iridescent holographic ring.",
    tier: "pro",
    proOnly: true,
    ringClass: "profile-ring-holo",
    ringSpinClass: "profile-ring-spin",
    ringWidth: 5,
    bannerClass: "profile-banner-holo",
    bannerOverlayClass: "profile-banner-overlay-holo",
    cardClass: "border-cyan-300/35 bg-[#0b1218]",
  },
  {
    id: "summer-sale",
    type: "frame",
    label: "Summer Sale",
    description: "Seasonal green-gold ring for deal hunters.",
    tier: "special",
    ringClass: "profile-ring-summer-sale",
    ringSpinClass: "profile-ring-spin",
    ringWidth: 5,
    bannerClass: "profile-banner-summer",
    cardClass: "border-emerald-400/35 bg-[#0b1410]",
  },
];

export const PROFILE_EFFECTS: CosmeticEffectDefinition[] = [
  {
    id: "none",
    type: "effect",
    label: "None",
    description: "No aura.",
    tier: "free",
    auraClass: "",
  },
  {
    id: "soft-glow",
    type: "effect",
    label: "Soft Glow",
    description: "Soft blue aura around avatar.",
    tier: "pro",
    proOnly: true,
    auraClass: "profile-aura-soft",
  },
  {
    id: "shimmer",
    type: "effect",
    label: "Shimmer",
    description: "Light sweep around the ring.",
    tier: "pro",
    proOnly: true,
    auraClass: "profile-aura-shimmer",
  },
  {
    id: "pulse",
    type: "effect",
    label: "Pulse",
    description: "Breathing glow pulse.",
    tier: "pro",
    proOnly: true,
    auraClass: "profile-aura-pulse",
    bannerOverlayClass: "profile-effect-banner-pulse",
  },
  {
    id: "aurora",
    type: "effect",
    label: "Aurora",
    description: "Northern lights shimmer around avatar.",
    tier: "pro",
    proOnly: true,
    auraClass: "profile-aura-aurora",
    bannerOverlayClass: "profile-effect-banner-aurora",
  },
  {
    id: "ember",
    type: "effect",
    label: "Ember",
    description: "Warm ember glow with soft flicker.",
    tier: "pro",
    proOnly: true,
    auraClass: "profile-aura-ember",
    bannerOverlayClass: "profile-effect-banner-ember",
  },
  {
    id: "frost",
    type: "effect",
    label: "Frost",
    description: "Icy cyan crystalline shimmer.",
    tier: "pro",
    proOnly: true,
    auraClass: "profile-aura-frost",
    bannerOverlayClass: "profile-effect-banner-frost",
  },
];

export const SPECIAL_BADGES: CosmeticBadgeDefinition[] = [
  {
    id: "founder",
    type: "badge",
    label: "Founder",
    description: "Early supporter badge.",
    tier: "special",
    unlockHint: "Site yöneticisi tarafından verilir.",
    toneClass: "bg-violet-600/90 text-white border-violet-400/50",
  },
  {
    id: "early-supporter",
    type: "badge",
    label: "Early Supporter",
    description: "Supporter badge for early members.",
    tier: "special",
    unlockHint: "Haziran 2026 öncesi kayıt olan kullanıcılara otomatik verilir.",
    toneClass: "bg-rose-600/90 text-white border-rose-400/50",
  },
  {
    id: "verified-collector",
    type: "badge",
    label: "Collector",
    description: "Large Steam library badge.",
    tier: "special",
    unlockHint: "Steam kütüphanende 100+ oyun olduğunda açılır.",
    toneClass: "bg-indigo-600/90 text-white border-indigo-400/50",
  },
  {
    id: "deal-hunter",
    type: "badge",
    label: "Deal Hunter",
    description: "Active wishlist deal hunter.",
    tier: "special",
    unlockHint: "İstek listene 10+ oyun eklediğinde açılır.",
    toneClass: "bg-emerald-600/90 text-white border-emerald-400/50",
  },
  {
    id: "steam-pro",
    type: "badge",
    label: "Steam Pro",
    description: "Premium Steam-connected badge.",
    tier: "pro",
    proOnly: true,
    unlockHint: "Pro üyelik + Steam hesabı bağlı olmalı.",
    toneClass: "bg-sky-600/90 text-white border-sky-300/50",
  },
];

const allCosmetics = [...PROFILE_FRAMES, ...PROFILE_EFFECTS, ...SPECIAL_BADGES];

export function getFrameDefinition(id?: string | null) {
  return PROFILE_FRAMES.find((frame) => frame.id === id) || PROFILE_FRAMES[0];
}

export function getEffectDefinition(id?: string | null) {
  return PROFILE_EFFECTS.find((effect) => effect.id === id) || PROFILE_EFFECTS[0];
}

export function getBadgeDefinition(id: string) {
  return SPECIAL_BADGES.find((badge) => badge.id === id) || null;
}

export function isKnownCosmetic(type: CosmeticType, id: string) {
  return allCosmetics.some((item) => item.type === type && item.id === id);
}
