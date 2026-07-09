import { getSteamGameDetails } from "@/lib/api/steam";
import { cached } from "@/lib/cache";

export interface RegionalSteamPrice {
  region: string;
  currency: string;
  final: number;
  initial: number;
  discount: number;
  label: string;
}

const REGIONS = [
  { code: "tr", label: "Türkiye", currency: "TRY" },
  { code: "us", label: "ABD", currency: "USD" },
  { code: "eu", label: "Avrupa", currency: "EUR" },
] as const;

export async function getRegionalSteamPrices(
  appId: string
): Promise<RegionalSteamPrice[]> {
  return cached(`steam-regional:${appId}`, 60 * 60 * 1000, async () => {
    const results = await Promise.all(
      REGIONS.map(async (region) => {
        const details = await getSteamGameDetails(appId, region.code);
        if (!details?.price) return null;
        return {
          region: region.code,
          currency: details.price.currency,
          final: details.price.final,
          initial: details.price.initial,
          discount: details.price.discount,
          label: region.label,
        };
      })
    );
    return results.filter(Boolean) as RegionalSteamPrice[];
  });
}
