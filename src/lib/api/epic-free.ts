import { DealOfTheDay } from "@/types";
import { cached } from "@/lib/cache";
import type { Locale } from "@/lib/i18n/translations";
import { t } from "@/lib/i18n/translations";

interface EpicPromotionElement {
  title: string;
  id: string;
  namespace?: string;
  urlSlug?: string;
  productSlug?: string;
  catalogNs?: { mappings?: Array<{ pageSlug?: string; pageType?: string }> };
  keyImages?: Array<{ type: string; url: string }>;
  price?: { totalPrice?: { originalPrice: number; discountPrice: number; currencyCode?: string } };
  promotions?: {
    promotionalOffers?: Array<{
      promotionalOffers?: Array<{
        startDate: string;
        endDate: string;
        discountSetting?: { discountPercentage?: number };
      }>;
    }>;
    upcomingPromotionalOffers?: Array<{
      promotionalOffers?: Array<{
        startDate: string;
        endDate: string;
        discountSetting?: { discountPercentage?: number };
      }>;
    }>;
  };
}

function epicImage(item: EpicPromotionElement): string | undefined {
  return (
    item.keyImages?.find((k) => k.type === "OfferImageWide")?.url ||
    item.keyImages?.find((k) => k.type === "Thumbnail")?.url ||
    item.keyImages?.[0]?.url
  );
}

function epicSlug(item: EpicPromotionElement): string {
  if (item.productSlug) return item.productSlug;
  const mapping = item.catalogNs?.mappings?.find((m) => m.pageType === "productHome");
  if (mapping?.pageSlug) return mapping.pageSlug;
  return item.urlSlug || `${item.namespace}/${item.id}`;
}

function mapEpicFree(
  item: EpicPromotionElement,
  upcoming = false,
  locale: Locale = "tr"
): DealOfTheDay | null {
  const offers = upcoming
    ? item.promotions?.upcomingPromotionalOffers?.[0]?.promotionalOffers
    : item.promotions?.promotionalOffers?.[0]?.promotionalOffers;
  const offer = offers?.[0];
  if (!offer) return null;

  const discount = offer.discountSetting?.discountPercentage ?? 100;
  const isFree = discount === 0 || discount >= 100;
  const originalCents = item.price?.totalPrice?.originalPrice ?? 0;
  const saleCents = isFree ? 0 : (item.price?.totalPrice?.discountPrice ?? 0);

  return {
    title: item.title + (upcoming ? t(locale, "deals.epicUpcomingSuffix") : ""),
    gameId: `epic-${item.id}`,
    imageUrl: epicImage(item),
    normalPrice: originalCents / 100,
    salePrice: saleCents / 100,
    discount: isFree ? 100 : Math.round(((originalCents - saleCents) / originalCents) * 100) || 0,
    platformName: "Epic Games",
    dealUrl: `https://store.epicgames.com/tr/p/${epicSlug(item)}`,
  };
}

export async function getEpicFreeGames(locale: Locale = "tr"): Promise<DealOfTheDay[]> {
  return cached(`epic-free-games:${locale}`, 30 * 60 * 1000, async () => {
    try {
      const res = await fetch(
        "https://store-site-backend-static-ipv4.ak.epicgames.com/freeGamesPromotions?locale=tr&country=TR&allowCountries=TR",
        { next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) return [];

      const json = await res.json();
      const elements: EpicPromotionElement[] =
        json?.data?.Catalog?.searchStore?.elements ?? [];

      const deals: DealOfTheDay[] = [];
      for (const item of elements) {
        const current = mapEpicFree(item, false, locale);
        if (current) deals.push(current);
        const upcoming = mapEpicFree(item, true, locale);
        if (upcoming && upcoming.salePrice === 0) deals.push(upcoming);
      }

      return deals.filter((d) => d.salePrice === 0 || d.discount >= 90);
    } catch {
      return [];
    }
  });
}
