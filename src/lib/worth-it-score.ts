/** 0–100 score: higher = better time to buy */
export function calculateWorthItScore(params: {
  currentPrice: number;
  historicalLow?: number;
  discount?: number;
  metacritic?: number;
}): number {
  const { currentPrice, historicalLow, discount = 0, metacritic } = params;
  let score = 45;

  if (historicalLow && historicalLow > 0) {
    const diff = ((currentPrice - historicalLow) / historicalLow) * 100;
    if (diff <= 5) score += 35;
    else if (diff <= 15) score += 22;
    else if (diff <= 30) score += 10;
    else score -= Math.min(20, Math.round(diff / 5));
  }

  if (discount >= 75) score += 18;
  else if (discount >= 50) score += 12;
  else if (discount >= 25) score += 6;

  if (metacritic && metacritic >= 90) score += 8;
  else if (metacritic && metacritic >= 80) score += 5;
  else if (metacritic && metacritic >= 70) score += 2;

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function worthItLabel(score: number): "great" | "good" | "wait" {
  if (score >= 75) return "great";
  if (score >= 55) return "good";
  return "wait";
}
