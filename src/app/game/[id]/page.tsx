import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { resolveGame, buildFullPlatformMatrix } from "@/lib/api/unified-search";
import { getPriceHistory } from "@/lib/api/cheapshark";
import { GameImage } from "@/components/ui/GameImage";
import { getSteamGameDetails } from "@/lib/api/steam";
import { unifiedSearch } from "@/lib/api/unified-search";
import { getSubscriptionStatus } from "@/lib/api/console-prices";
import {
  syncGamePrices,
  getDiscountHistory,
  getDbPriceHistory,
} from "@/lib/services/price-sync";
import { StoreComparison } from "@/components/games/StoreComparison";
import { PlatformMatrix } from "@/components/games/PlatformMatrix";
import { PriceChart } from "@/components/games/PriceChart";
import { GameHeader } from "@/components/games/GameHeader";
import { DiscountHistory } from "@/components/games/DiscountHistory";
import { PriceCalendar } from "@/components/games/PriceCalendar";
import { ScreenshotGallery } from "@/components/games/ScreenshotGallery";
import { GameInfo } from "@/components/games/GameInfo";
import { SteamTurkeyPrice, WorthItBadge } from "@/components/games/WorthItBadge";
import { SimilarGames } from "@/components/games/SimilarGames";
import { SimilarOnSale } from "@/components/games/SimilarOnSale";
import { RecentlyViewedTracker } from "@/components/games/RecentlyViewedTracker";
import { PlatformMatrixItem } from "@/types";
import { buildGameMetadata } from "@/lib/seo/game-metadata";
import { buildAllGameJsonLd } from "@/lib/seo/game-schemas";
import { JsonLd } from "@/components/seo/JsonLd";
import { getRegionalSteamPrices } from "@/lib/api/steam-regional";
import { RegionalPriceCompare } from "@/components/games/RegionalPriceCompare";
import { PricePrediction } from "@/components/games/PricePrediction";
import { DlcBadge } from "@/components/games/DlcBadge";
import { EditionCompare } from "@/components/games/EditionCompare";
import { predictBuyTiming } from "@/lib/game-utils";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { id } = await params;
  const game = await resolveGame(id);
  if (!game) return { title: t(await getServerLocale(), "common.gameNotFound") };
  return buildGameMetadata(game);
}

const PC_PLATFORMS = [
  "steam", "epic", "gog", "ea", "ubisoft", "battlenet",
  "humble", "greenmangaming", "gamersgate",
];
const CONSOLE_PLATFORMS = ["ps5", "ps4", "xbox-series", "xbox-one", "switch"];

export default async function GamePage({ params }: GamePageProps) {
  const locale = await getServerLocale();
  const { id } = await params;

  const game = await resolveGame(id);
  if (!game) notFound();

  // Sync price history for tracked games (including Steam-only IDs)
  if (!id.startsWith("rawg-")) {
    syncGamePrices(id).catch(() => {});
  }

  const steamDetails = game.steamAppId
    ? await getSteamGameDetails(game.steamAppId)
    : null;

  const cheapSharkHistory = !id.startsWith("steam-") && !id.startsWith("rawg-")
    ? await getPriceHistory(id)
    : [];

  const [discountHistory, dbHistory, sub, similarResults, regionalPrices] =
    await Promise.all([
    !id.startsWith("steam-") && !id.startsWith("rawg-")
      ? getDiscountHistory(id)
      : Promise.resolve([]),
    !id.startsWith("steam-") && !id.startsWith("rawg-")
      ? getDbPriceHistory(id)
      : Promise.resolve([]),
    getSubscriptionStatus(game.title),
    unifiedSearch(game.title.split(":")[0]).then((r) =>
      r.filter((g) => g.gameId !== game.gameId).slice(0, 6)
    ),
    game.steamAppId ? getRegionalSteamPrices(game.steamAppId) : Promise.resolve([]),
  ]);

  const enrichedGame = {
    ...game,
    metacritic: steamDetails?.metacritic ?? game.metacritic,
    imageUrl: steamDetails?.headerImage || game.imageUrl,
  };

  const priceHistory = dbHistory.length > 2 ? dbHistory : cheapSharkHistory;
  const pricedStores = game.stores.filter((s) => s.price > 0 && !s.isSearchLink);
  const pcStores = game.stores.filter(
    (s) => PC_PLATFORMS.includes(s.platformId) && s.price > 0
  );
  const consoleStores = game.stores.filter(
    (s) => CONSOLE_PLATFORMS.includes(s.platformId) && s.price > 0
  );

  const platformMatrix: PlatformMatrixItem[] = buildFullPlatformMatrix(
    game.title,
    game.stores
  );

  const buyPrediction = predictBuyTiming({
    currentPrice: game.cheapestStore?.price || 0,
    historicalLow: game.historicalLow,
    discount: game.cheapestStore?.discount || 0,
    discountEvents: discountHistory,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {buildAllGameJsonLd(game).map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <RecentlyViewedTracker
        gameId={game.gameId}
        title={game.title}
        imageUrl={enrichedGame.imageUrl}
        steamAppId={game.steamAppId}
      />
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="relative w-full md:w-64 lg:w-72 aspect-[3/4] rounded-2xl overflow-hidden bg-card shrink-0 mx-auto md:mx-0">
          <GameImage
            src={enrichedGame.imageUrl}
            alt={enrichedGame.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 80vw, 288px"
            priority
          />
        </div>

        <div className="flex-1 space-y-4">
          <GameHeader game={enrichedGame} subscription={sub} />
          <DlcBadge title={game.title} />
          {game.cheapestStore && game.cheapestStore.price > 0 && (
            <PricePrediction
              recommendation={buyPrediction.recommendation}
              reason={buyPrediction.reason}
            />
          )}
          {game.historicalLow && game.cheapestStore && game.cheapestStore.price > 0 && (
            <WorthItBadge
              currentPrice={game.cheapestStore.price}
              historicalLow={game.historicalLow}
            />
          )}
          {steamDetails?.price && game.steamAppId && (
            <SteamTurkeyPrice
              appId={game.steamAppId}
              price={{
                currency: steamDetails.price.currency,
                initial: steamDetails.price.initial,
                final: steamDetails.price.final,
                discount: steamDetails.price.discount,
                isFree: steamDetails.isFree,
              }}
            />
          )}
        </div>
      </div>

      {steamDetails && <GameInfo steam={steamDetails} />}

      <EditionCompare title={game.title} currentGameId={game.gameId} />

      {steamDetails?.screenshots && steamDetails.screenshots.length > 0 && (
        <ScreenshotGallery
          screenshots={steamDetails.screenshots}
          title={game.title}
        />
      )}

      <PlatformMatrix items={platformMatrix} />

      {regionalPrices.length > 1 && (
        <RegionalPriceCompare prices={regionalPrices} />
      )}

      {priceHistory.length > 0 && (
        <section className="mb-10 rounded-2xl bg-card border border-border p-6">
          <PriceChart data={priceHistory} title={t(locale, "game.priceHistory")} />
        </section>
      )}

      {(discountHistory.length > 0 || priceHistory.length > 0) && (
        <section className="mb-10 rounded-2xl bg-card border border-border p-6">
          <h2 className="text-xl font-bold mb-4">{t(locale, "game.priceCalendar")}</h2>
          <PriceCalendar events={discountHistory} />
        </section>
      )}

      {discountHistory.length > 0 && (
        <section className="mb-10 rounded-2xl bg-card border border-border p-6">
          <h2 className="text-xl font-bold mb-4">{t(locale, "game.discountHistory")}</h2>
          <DiscountHistory events={discountHistory} />
        </section>
      )}

      {pcStores.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">{t(locale, "game.pcPrices")}</h2>
          <StoreComparison
            stores={pcStores}
            cheapestPlatformId={pricedStores[0]?.platformId}
          />
        </section>
      )}

      {consoleStores.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">{t(locale, "game.consolePrices")}</h2>
          <StoreComparison stores={consoleStores} />
        </section>
      )}

      <SimilarOnSale title={game.title} excludeId={game.gameId} />
      <SimilarGames games={similarResults} />
    </div>
  );
}
