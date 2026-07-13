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
import { HomeDownloadSection } from "@/components/home/HomeDownloadSection";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { resolveGameImage } from "@/lib/game-images";
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

  const heroImages = [
    ...data.deals.map((d) =>
      resolveGameImage({ imageUrl: d.imageUrl, steamAppId: d.steamAppId })
    ),
    ...data.featured.map((g) =>
      resolveGameImage({ imageUrl: g.imageUrl, steamAppId: g.steamAppId })
    ),
  ].filter((url): url is string => Boolean(url));

  return (
    <div>
      {buildSiteJsonLd().map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <HomeHero
        catalogCount={data.catalogCount}
        platformCount={data.platformCount}
        backdropImages={heroImages}
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/40">
          <HomeSectionHeader
            icon={Gift}
            iconClassName="text-emerald-400"
            title={t(locale, "home.sections.freeGames")}
            subtitle={t(locale, "home.sections.freeGamesSubtitle")}
            href="/deals?tab=free"
            linkLabel={t(locale, "common.seeAll")}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.freeGames.slice(0, 8).map((deal) => (
              <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/40">
        <HomeSectionHeader
          icon={TrendingDown}
          iconClassName="text-emerald-400"
          title={t(locale, "home.sections.dealsOfDay")}
          subtitle={t(locale, "home.sections.dealsOfDaySubtitle")}
          href="/deals"
          linkLabel={t(locale, "common.seeAll")}
        />
        {data.deals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.deals.map((deal) => (
              <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-2xl bg-card/50 border border-border">
            <p className="text-muted">{t(locale, "home.sections.dealsEmpty")}</p>
            <Link href="/deals" className="text-sm text-accent hover:underline mt-2 inline-block">
              {t(locale, "home.sections.goToDeals")}
            </Link>
          </div>
        )}
      </section>

      {data.popular.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/40">
          <HomeSectionHeader
            icon={Star}
            iconClassName="text-yellow-400"
            title={t(locale, "home.sections.highRated")}
            subtitle={t(locale, "home.sections.highRatedSubtitle")}
            href="/deals?tab=aaa"
            linkLabel={t(locale, "common.seeAll")}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.popular.map((deal) => (
              <DealCard key={deal.gameId + deal.platformName} deal={deal} />
            ))}
          </div>
        </section>
      )}

      {data.budgetDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/40">
          <HomeSectionHeader
            title={t(locale, "home.sections.budgetDeals")}
            subtitle={t(locale, "home.sections.budgetDealsSubtitle")}
            href="/deals?tab=under10"
            linkLabel={t(locale, "common.seeAll")}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {data.budgetDeals.slice(0, 8).map((deal) => (
              <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
            ))}
          </div>
        </section>
      )}

      <CatalogBrowseStrip letters={data.letters} />

      <HomeHowItWorks />

      <HomeCtaBanner />

      <HomeDownloadSection />

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
