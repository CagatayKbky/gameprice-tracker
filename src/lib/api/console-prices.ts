import { StorePrice } from "@/types";
import { PLATFORMS } from "@/lib/platforms";
import { getXboxPrices, getXboxGamePassStatus } from "./xbox";
import { getPlayStationPrices, getPlayStationPlusStatus } from "./ps";
import { searchNintendoStore } from "./nintendo";
import { getStoreSearchUrl } from "@/lib/store-urls";

function buildConsoleSearchLinks(gameTitle: string, platformIds: string[]): StorePrice[] {
  return platformIds
    .map((platformId) => {
      const platform = PLATFORMS.find((p) => p.id === platformId);
      if (!platform) return null;
      return {
        platformId,
        platformName: platform.name,
        price: 0,
        normalPrice: 0,
        discount: 0,
        savings: 0,
        dealUrl: getStoreSearchUrl(platformId, gameTitle),
        isOnSale: false,
        lastUpdated: new Date().toISOString(),
        isSearchLink: true,
      };
    })
    .filter(Boolean) as StorePrice[];
}

export async function getConsolePrices(gameTitle: string): Promise<StorePrice[]> {
  const [xboxPrices, psPrices, nintendoPrices] = await Promise.all([
    getXboxPrices(gameTitle),
    getPlayStationPrices(gameTitle),
    searchNintendoStore(gameTitle),
  ]);

  const realPrices = [...xboxPrices, ...psPrices, ...nintendoPrices];
  const covered = new Set(realPrices.map((p) => p.platformId));

  const missingConsoleIds = ["ps5", "ps4", "xbox-series", "xbox-one", "switch"].filter(
    (id) => !covered.has(id)
  );

  return [...realPrices, ...buildConsoleSearchLinks(gameTitle, missingConsoleIds)];
}

export async function getSubscriptionStatus(
  gameTitle: string
): Promise<{ gamepass: boolean; psplus: boolean }> {
  const [gamepass, psplus] = await Promise.all([
    getXboxGamePassStatus(gameTitle),
    getPlayStationPlusStatus(gameTitle),
  ]);
  return { gamepass, psplus };
}
