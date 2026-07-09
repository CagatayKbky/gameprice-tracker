import { Currency } from "@/types";

const FRANKFURTER_BASE = "https://api.frankfurter.app";

const FALLBACK_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  TRY: 34.5,
};

let cachedRates: Record<string, number> | null = null;
let cacheExpiry = 0;

export async function getExchangeRates(): Promise<Record<Currency, number>> {
  const now = Date.now();
  if (cachedRates && now < cacheExpiry) {
    return cachedRates as Record<Currency, number>;
  }

  try {
    const res = await fetch(`${FRANKFURTER_BASE}/latest?from=USD&to=EUR,TRY`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = await res.json();
    cachedRates = {
      USD: 1,
      EUR: data.rates.EUR,
      TRY: data.rates.TRY,
    };
    cacheExpiry = now + 3600_000;
    return cachedRates as Record<Currency, number>;
  } catch {
    return FALLBACK_RATES;
  }
}

export function convertPrice(
  amountUsd: number,
  rates: Record<Currency, number>,
  target: Currency
): number {
  const converted = amountUsd * rates[target];
  return Math.round(converted * 100) / 100;
}

/** Convert TRY amount to USD using live or fallback rates. */
export async function tryToUsd(amountTry: number): Promise<number> {
  const rates = await getExchangeRates();
  const tryRate = rates.TRY || FALLBACK_RATES.TRY;
  return Math.round((amountTry / tryRate) * 100) / 100;
}

export async function getRatesForClient(): Promise<Record<Currency, number>> {
  return getExchangeRates();
}
