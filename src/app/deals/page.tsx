import { Suspense } from "react";
import {
  getDealsFiltered,
  getFreeGames,
  getUnderPriceDeals,
  getMegaDeals,
  getHistoricalLowDeals,
  enrichDealsWithHistoricalLow,
} from "@/lib/api/deals";
import { DealCard } from "@/components/games/DealCard";
import { DealsFilters } from "@/components/games/DealsFilters";
import { SteamSaleBanner } from "@/components/deals/SteamSaleBanner";
import { DealsMegaHero } from "@/components/deals/DealsMegaHero";
import { TrendingDown, Gift } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import { getProfile } from "@/lib/services/profile";
import { getOwnedAppIds } from "@/lib/services/steam-library";

interface DealsPageProps {
  searchParams: Promise<{ tab?: string; store?: string }>;
}

const TAB_TITLE_KEYS: Record<string, string> = {
  all: "deals.title.all",
  free: "deals.title.free",
  under10: "deals.title.under10",
  mega: "deals.title.mega",
  "historical-low": "deals.title.historicalLow",
  aaa: "deals.title.aaa",
};

const TAB_SUBTITLE_KEYS: Record<string, string> = {
  all: "deals.subtitle.all",
  free: "deals.subtitle.free",
  under10: "deals.subtitle.under10",
  mega: "deals.subtitle.mega",
  "historical-low": "deals.subtitle.historicalLow",
  aaa: "deals.subtitle.aaa",
};

export async function generateMetadata({ searchParams }: DealsPageProps) {
  const locale = await getServerLocale();
  const params = await searchParams;
  const tab = params.tab || "all";
  const base = buildPageMetadata("deals", locale, { path: "/deals", canonicalPath: "/deals" });
  if (tab === "all") return base;
  const titleKey = TAB_TITLE_KEYS[tab];
  if (!titleKey) return base;
  return buildPageMetadata("deals", locale, {
    path: "/deals",
    canonicalPath: "/deals",
    titleOverride: `${t(locale, titleKey)} | GamePrice`,
  });
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const locale = await getServerLocale();
  const params = await searchParams;
  const tab = params.tab || "all";
  const storeId = params.store;
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value ?? null;
  const [profile, ownedAppIds] = sessionId
    ? await Promise.all([getProfile(sessionId), getOwnedAppIds(sessionId)])
    : [null, new Set<string>()];

  let deals;

  if (tab === "free") {
    deals = await getFreeGames();
  } else if (tab === "under10") {
    deals = await getUnderPriceDeals(10);
  } else if (tab === "mega") {
    deals = await getMegaDeals();
  } else if (tab === "historical-low") {
    deals = await getHistoricalLowDeals();
  } else if (tab === "aaa") {
    deals = await getDealsFiltered({
      storeId,
      minDiscount: 40,
      maxPrice: 60,
      sortBy: "Metacritic",
      desc: 1,
      pageSize: 24,
    });
  } else {
    deals = await getDealsFiltered({
      storeId,
      minDiscount: 50,
      sortBy: "Savings",
      desc: 1,
      pageSize: 24,
    });
  }

  if (tab !== "free" && tab !== "historical-low") {
    deals = await enrichDealsWithHistoricalLow(deals);
  }

  if (profile?.hideOwnedGames) {
    deals = deals.filter((deal) => {
      const appId =
        deal.steamAppId || (deal.gameId.startsWith("steam-") ? deal.gameId.replace("steam-", "") : null);
      return !appId || !ownedAppIds.has(appId);
    });
  }

  const title = t(locale, TAB_TITLE_KEYS[tab] || TAB_TITLE_KEYS.all);
  const subtitle = t(locale, TAB_SUBTITLE_KEYS[tab] || TAB_SUBTITLE_KEYS.all);
  const megaDeals = tab === "all" || tab === "mega" ? await getMegaDeals() : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          {tab === "free" ? (
            <Gift className="w-5 h-5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-emerald-400" />
          )}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          <p className="text-muted mt-1">{subtitle}</p>
        </div>
      </div>

      <SteamSaleBanner />

      {(tab === "all" || tab === "mega") && megaDeals.length > 0 && (
        <DealsMegaHero deals={megaDeals} />
      )}

      <Suspense fallback={<div className="h-24 bg-card rounded-xl animate-pulse mb-8" />}>
        <DealsFilters />
      </Suspense>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deals.map((deal) => (
          <DealCard key={deal.gameId + deal.platformName + deal.dealUrl} deal={deal} />
        ))}
      </div>

      {deals.length === 0 && (
        <div className="text-center py-20 text-muted">
          <p>{t(locale, "deals.empty")}</p>
          <p className="text-sm mt-2">{t(locale, "deals.emptyHint")}</p>
        </div>
      )}
    </div>
  );
}
