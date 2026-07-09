const DLC_PATTERNS =
  /\b(dlc|expansion|season pass|soundtrack|artbook|upgrade pack|add-?on|coin set|credit pack)\b/i;

const BASE_GAME_PATTERNS = /\b(complete|goty|game of the year|definitive|ultimate|deluxe|gold edition|bundle)\b/i;

export function isLikelyDlc(title: string): boolean {
  return DLC_PATTERNS.test(title) && !BASE_GAME_PATTERNS.test(title);
}

export function isCompleteEdition(title: string): boolean {
  return BASE_GAME_PATTERNS.test(title);
}

export type BuyRecommendation = "buy" | "wait" | "neutral";

export function predictBuyTiming(params: {
  currentPrice: number;
  historicalLow?: number;
  discount: number;
  discountEvents?: { discount: number }[];
}): { recommendation: BuyRecommendation; reason: string } {
  const { currentPrice, historicalLow, discount, discountEvents = [] } = params;

  if (historicalLow && currentPrice <= historicalLow * 1.05) {
    return {
      recommendation: "buy",
      reason: "Tarihi dip fiyata yakın — iyi alım fırsatı.",
    };
  }

  if (discount >= 75) {
    return {
      recommendation: "buy",
      reason: "%75+ indirim nadir görülür — değerlendirmeye değer.",
    };
  }

  const avgDiscount =
    discountEvents.length > 0
      ? discountEvents.reduce((s, e) => s + e.discount, 0) / discountEvents.length
      : 0;

  if (discount < 25 && avgDiscount > 40) {
    return {
      recommendation: "wait",
      reason: "Geçmişte daha yüksek indirimler görüldü — bekleme önerilir.",
    };
  }

  if (discount >= 50) {
    return {
      recommendation: "buy",
      reason: "İyi bir indirim seviyesi.",
    };
  }

  return {
    recommendation: "neutral",
    reason: "Fiyat orta seviyede — acil değilse indirim takibine devam edin.",
  };
}
