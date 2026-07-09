import Link from "next/link";
import { Suspense } from "react";
import { unifiedSearch } from "@/lib/api/unified-search";
import { getCatalogCount } from "@/lib/services/catalog-search";
import { GameCard } from "@/components/games/GameCard";
import { SearchFilters } from "@/components/games/SearchFilters";
import { SearchBar } from "@/components/layout/SearchBar";
import { Search, WifiOff, Database } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    store?: string;
    discount?: string;
    maxPrice?: string;
    genre?: string;
    year?: string;
    metacritic?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const locale = await getServerLocale();
  const numberLocale = locale === "en" ? "en-US" : "tr-TR";
  const params = await searchParams;
  const query = params.q?.trim() || "";

  let results: Awaited<ReturnType<typeof unifiedSearch>> = [];
  let apiError = false;

  if (query) {
    try {
      const { logSearch } = await import("@/lib/services/trending-search");
      logSearch(query).catch(() => {});

      results = await unifiedSearch(query, {
        genre: params.genre,
        year: params.year,
        minMetacritic: params.metacritic ? parseInt(params.metacritic) : undefined,
      });

      if (params.discount) {
        const min = parseInt(params.discount);
        results = results.filter((r) => (r.maxDiscount || 0) >= min);
      }
      if (params.maxPrice) {
        const max = parseInt(params.maxPrice);
        results = results.filter(
          (r) => r.cheapestPrice === undefined || r.cheapestPrice <= max
        );
      }
    } catch {
      apiError = true;
    }
  }

  const sourceCounts = {
    cheapshark: results.filter((r) => r.sources?.includes("cheapshark") || r.source === "cheapshark").length,
    steam: results.filter((r) => r.sources?.includes("steam") || r.source === "steam").length,
    rawg: results.filter((r) => r.sources?.includes("rawg") || r.source === "rawg").length,
  };
  const rawgEnabled = Boolean(process.env.RAWG_API_KEY);
  const catalogTotal = await getCatalogCount();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {query ? `"${query}"` : t(locale, "search.title")}
        </h1>
        {results.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-muted text-sm">
              {t(locale, "search.results", { count: String(results.length) })}
            </p>
            <p className="text-xs text-muted flex items-center gap-1">
              <Database className="w-3 h-3" />
              {t(locale, "search.catalogLocal", {
                count: catalogTotal.toLocaleString(numberLocale),
              })}
              {sourceCounts.steam > 0 &&
                t(locale, "search.sourceSteam", { count: String(sourceCounts.steam) })}
              {sourceCounts.cheapshark > 0 &&
                t(locale, "search.sourceDeals", { count: String(sourceCounts.cheapshark) })}
              {sourceCounts.rawg > 0 &&
                t(locale, "search.sourceRawg", { count: String(sourceCounts.rawg) })}
            </p>
            {!rawgEnabled && query && sourceCounts.rawg === 0 && (
              <p className="text-xs text-amber-400/90">{t(locale, "search.rawgHint")}</p>
            )}
          </div>
        )}
      </div>

      <div className="mb-6 md:hidden">
        <Suspense fallback={<div className="h-11 bg-card rounded-xl animate-pulse" />}>
          <SearchBar />
        </Suspense>
      </div>

      {query && (
        <Suspense fallback={<div className="h-16 bg-card rounded-xl animate-pulse mb-6" />}>
          <SearchFilters rawgEnabled={rawgEnabled} />
        </Suspense>
      )}

      {!query && (
        <div className="space-y-8">
          <div className="max-w-xl">
            <Suspense fallback={null}>
              <SearchBar autoFocus />
            </Suspense>
          </div>
          <p className="text-sm text-muted max-w-xl">
            {t(locale, "search.noQuery")}
          </p>
          <Link
            href="/browse"
            className="inline-flex text-sm text-accent hover:underline"
          >
            {t(locale, "home.catalogStrip.allCatalog")} →
          </Link>
          <PopularSearches locale={locale} />
        </div>
      )}

      {apiError && (
        <div className="text-center py-16 rounded-xl bg-card border border-border">
          <WifiOff className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-muted">{t(locale, "common.error")}</p>
        </div>
      )}

      {query && !apiError && results.length === 0 && (
        <div className="text-center py-20">
          <Search className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-lg text-muted">{t(locale, "common.noResults")}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((game) => (
            <GameCard key={game.gameId + game.title} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

function PopularSearches({ locale }: { locale: Awaited<ReturnType<typeof getServerLocale>> }) {
  const tags = [
    "Cyberpunk", "Elden Ring", "Baldur's Gate", "Red Dead",
    "Witcher", "Hogwarts", "Starfield", "GTA", "DOOM", "Resident Evil",
    "God of War", "Spider-Man", "Zelda", "Minecraft",
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{t(locale, "search.trending")}</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <a
            key={tag}
            href={`/search?q=${encodeURIComponent(tag)}`}
            className="px-4 py-2 rounded-xl bg-card border border-border hover:border-accent/50 text-sm transition-colors"
          >
            {tag}
          </a>
        ))}
      </div>
    </div>
  );
}
