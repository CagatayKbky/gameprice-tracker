export type Currency = "USD" | "TRY" | "EUR";

export const CURRENCIES: { code: Currency; label: string; symbol: string }[] = [
  { code: "USD", label: "ABD Doları", symbol: "$" },
  { code: "TRY", label: "Türk Lirası", symbol: "₺" },
  { code: "EUR", label: "Euro", symbol: "€" },
];

export const DEFAULT_CURRENCY: Currency = "TRY";

export type PlatformCategory = "pc" | "console" | "subscription";

export interface Platform {
  id: string;
  name: string;
  shortName: string;
  category: PlatformCategory;
  color: string;
  icon: string;
  cheapSharkId?: number;
  region?: string;
  enabled: boolean;
}

export interface StorePrice {
  platformId: string;
  platformName: string;
  price: number;
  normalPrice: number;
  discount: number;
  savings: number;
  dealUrl: string;
  isOnSale: boolean;
  lastUpdated: string;
  isSearchLink?: boolean;
}

export interface GameDeal {
  gameId: string;
  steamAppId?: string;
  title: string;
  imageUrl?: string;
  metacritic?: number;
  steamRating?: number;
  steamRatingText?: string;
  stores: StorePrice[];
  cheapestStore?: StorePrice;
  historicalLow?: number;
  currentLow?: number;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  platformId: string;
  platformName: string;
}

export interface DiscountEvent {
  date: string;
  price: number;
  normalPrice: number;
  discount: number;
  platformName: string;
}

export interface BundleDeal {
  title: string;
  gameId: string;
  imageUrl?: string;
  salePrice: number;
  normalPrice: number;
  discount: number;
  platformName: string;
  dealUrl: string;
  store: string;
}

export interface SearchResult {
  gameId: string;
  title: string;
  imageUrl?: string;
  steamAppId?: string;
  cheapestPrice?: number;
  cheapestPlatform?: string;
  maxDiscount?: number;
  metacritic?: number;
  steamRating?: number;
  platforms?: string[];
  source?: "cheapshark" | "steam" | "rawg" | "catalog";
  sources?: string[];
  rawgId?: number;
  historicalLow?: number;
  isHistoricalLow?: boolean;
  worthItScore?: number;
}

export interface SteamRegionalPrice {
  currency: string;
  initial: number;
  final: number;
  discount: number;
  isFree: boolean;
}

export interface DealOfTheDay {
  title: string;
  gameId: string;
  steamAppId?: string;
  imageUrl?: string;
  normalPrice: number;
  salePrice: number;
  discount: number;
  platformName: string;
  dealUrl: string;
  historicalLow?: number;
  isHistoricalLow?: boolean;
}

export interface WishlistItemData {
  id: string;
  cheapSharkGameId: string;
  gameTitle: string;
  imageUrl?: string | null;
  addedAt: string;
  currentPrice?: number;
  cheapestPlatform?: string;
  gamepass?: boolean;
  psplus?: boolean;
}

export interface PriceAlertData {
  id: string;
  cheapSharkGameId: string;
  gameTitle: string;
  targetPrice: number;
  currentPrice?: number | null;
  platformId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PlatformMatrixItem extends StorePrice {
  status: "priced" | "search" | "unavailable";
}
