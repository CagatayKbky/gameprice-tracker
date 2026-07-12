import Link from "next/link";
import { Gift, Star, TrendingDown, Store, BarChart3, Bell } from "lucide-react";
import { getHomePageData } from "@/lib/home-data";
import { DealCard } from "@/components/games/DealCard";
import { PlatformGrid } from "@/components/games/PlatformGrid";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeStats } from "@/components/home/HomeStats";
import { HomeGameGrid } from "@/components/home/HomeGameGrid";
import { CatalogBrowseStrip } from "@/components/home/CatalogBrowseStrip";
import { HomeHowItWorks } from "@/components/home/HomeHowItWorks";
import { HomeCtaBanner } from "@/components/home/HomeCtaBanner";
import { RecentlyViewedSection } from "@/components/home/RecentlyViewedSection";
import { TrendingSearches } from "@/components/home/TrendingSearches";
import { SteamSaleBanner } from "@/components/deals/SteamSaleBanner";
import { PersonalizedHomeSection } from "@/components/home/PersonalizedHomeSection";
import { FriendActivityStrip } from "@/components/home/FriendActivityStrip";
import { HomeLiveStats } from "@/components/home/HomeLiveStats";
import { EpicFreeSection } from "@/components/home/EpicFreeSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { buildSiteJsonLd } from "@/lib/seo/site-schemas";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

export const revalidate = 300;

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("home", locale, { path: "" });
}

export default async function HomePage() {
  const locale = await getServerLocale();
  const data = await getHomePageData();

  const features = [
    {
      icon: Store,
      titleKey: "home.features.platforms.title",
      descriptionKey: "home.features.platforms.description",
    },
    {
      icon: TrendingDown,
      titleKey: "home.features.liveDeals.title",
      descriptionKey: "home.features.liveDeals.description",
    },
    {
      icon: BarChart3,
      titleKey: "home.features.priceHistory.title",
      descriptionKey: "home.features.priceHistory.description",
    },
    {
      icon: Bell,
      titleKey: "home.features.smartAlerts.title",
      descriptionKey: "home.features.smartAlerts.description",
    },
  ];

  return (
    <div>
      {buildSiteJsonLd().map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <HomeHero
        catalogCount={data.catalogCount}
        platformCount={data.platformCount}
      />

      <HomeLiveStats />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SteamSaleBanner />
      </div>

      <PersonalizedHomeSection />

      <FriendActivityStrip />

      <HomeStats
        catalogCount={data.catalogCount}
        platformCount={data.platformCount}
        dealCount={data.dealCount}
      />

      <HomeGameGrid
        title={t(locale, "home.sections.popularGames")}
        subtitle={t(locale, "home.sections.popularGamesSubtitle")}
        href="/browse"
        linkLabel={t(locale, "home.sections.browseCatalog")}
        games={data.featured}
      />

      <RecentlyViewedSection />

      <TrendingSearches />

      <EpicFreeSection />

      {data.freeGames.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-xl font-bold">{t(locale, "home.sections.freeGames")}</h2>
                <p className="text-sm text-muted">{t(locale, "home.sections.freeGamesSubtitle")}</p>
              </div>
            </div>
            <Link href="/deals?tab=free" className="text-sm text-accent hover:underline">
              {t(locale, "common.seeAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.freeGames.slice(0, 8).map((deal) => (
              <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{t(locale, "home.sections.dealsOfDay")}</h2>
              <p className="text-sm text-muted">{t(locale, "home.sections.dealsOfDaySubtitle")}</p>
            </div>
          </div>
          <Link href="/deals" className="text-sm text-accent hover:underline">
            {t(locale, "common.seeAll")}
          </Link>
        </div>
        {data.deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.deals.map((deal) => (
              <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl bg-card border border-border">
            <p className="text-muted">{t(locale, "home.sections.dealsEmpty")}</p>
            <Link href="/deals" className="text-sm text-accent hover:underline mt-2 inline-block">
              {t(locale, "home.sections.goToDeals")}
            </Link>
          </div>
        )}
      </section>

      {data.popular.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold">{t(locale, "home.sections.highRated")}</h2>
                <p className="text-sm text-muted">{t(locale, "home.sections.highRatedSubtitle")}</p>
              </div>
            </div>
            <Link href="/deals?tab=aaa" className="text-sm text-accent hover:underline">
              {t(locale, "common.seeAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.popular.map((deal) => (
              <DealCard key={deal.gameId + deal.platformName} deal={deal} />
            ))}
          </div>
        </section>
      )}

      {data.budgetDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">{t(locale, "home.sections.budgetDeals")}</h2>
              <p className="text-sm text-muted">{t(locale, "home.sections.budgetDealsSubtitle")}</p>
            </div>
            <Link href="/deals?tab=under10" className="text-sm text-accent hover:underline">
              {t(locale, "common.seeAll")}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.budgetDeals.slice(0, 8).map((deal) => (
              <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
            ))}
          </div>
        </section>
      )}

      <CatalogBrowseStrip letters={data.letters} />

      <HomeHowItWorks />

      <HomeCtaBanner />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-border/50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          {t(locale, "home.features.title")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.titleKey}
                className="p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{t(locale, feature.titleKey)}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {t(locale, feature.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-border/50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
          {t(locale, "home.sections.platforms")}
        </h2>
        <p className="text-muted text-center mb-10 max-w-xl mx-auto">
          {t(locale, "home.sections.platformsSubtitle")}
        </p>
        <PlatformGrid />
      </section>
    </div>
  );
}
