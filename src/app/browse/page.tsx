import Link from "next/link";
import { Suspense } from "react";
import { GameCard } from "@/components/games/GameCard";
import { BrowseFilters } from "@/components/games/BrowseFilters";
import {
  browseCatalog,
  getCatalogCount,
  getCatalogLetters,
} from "@/lib/services/catalog-search";
import { getCatalogSyncStatus } from "@/lib/services/catalog-sync";
import { SearchResult } from "@/types";
import { ChevronLeft, ChevronRight, Library } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

interface BrowsePageProps {
  searchParams: Promise<{
    letter?: string;
    page?: string;
    platform?: string;
  }>;
}

function browseHref(letter: string, page?: number, platform?: string) {
  const q = new URLSearchParams({ letter });
  if (page && page > 1) q.set("page", String(page));
  if (platform) q.set("platform", platform);
  return `/browse?${q.toString()}`;
}

const LETTERS = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "#",
];

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const locale = await getServerLocale();
  const numberLocale = locale === "en" ? "en-US" : "tr-TR";
  const params = await searchParams;
  const letter = (params.letter || "a").toLowerCase();
  const page = parseInt(params.page || "1", 10) || 1;
  const platform = params.platform || undefined;

  const [browse, totalGames, letters, syncStatus] = await Promise.all([
    browseCatalog({ letter, page, platform }),
    getCatalogCount(),
    getCatalogLetters(),
    getCatalogSyncStatus(),
  ]);

  const letterMap = new Map<string, number>(
    letters.map((entry) => [entry.letter, entry.count])
  );

  const letterLabel = letter === "#" ? t(locale, "browse.letterNumeric") : letter.toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Library className="w-6 h-6 text-accent" />
          <h1 className="text-2xl sm:text-3xl font-bold">{t(locale, "browse.title")}</h1>
        </div>
        <p className="text-muted text-sm max-w-2xl">
          {t(locale, "browse.subtitle").replace("{count}", totalGames.toLocaleString(numberLocale))}
          {syncStatus.steamDone ? t(locale, "browse.syncDone") : t(locale, "browse.syncing")}
          {syncStatus.rawgEnabled ? t(locale, "browse.rawgEnriching") : ""}
        </p>
        {totalGames < 1000 && (
          <p className="text-xs text-amber-400 mt-2">
            {t(locale, "browse.syncHint")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-8">
        {LETTERS.map((char) => {
          const count = letterMap.get(char) || 0;
          const active = letter === char;
          return (
            <Link
              key={char}
              href={browseHref(char, 1, platform)}
              className={`min-w-9 h-9 px-2 rounded-lg text-sm font-medium flex items-center justify-center border transition-colors ${
                active
                  ? "bg-accent text-white border-accent"
                  : count > 0
                    ? "bg-card border-border hover:border-accent/50"
                    : "bg-card/40 border-border/40 text-muted"
              }`}
            >
              {char.toUpperCase()}
            </Link>
          );
        })}
      </div>

      <Suspense fallback={<div className="h-10 bg-card rounded-xl animate-pulse mb-6" />}>
        <BrowseFilters />
      </Suspense>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          {t(locale, "browse.letterHeading")
            .replace("{letter}", letterLabel)
            .replace("{count}", browse.total.toLocaleString(numberLocale))}
        </h2>
        <span className="text-sm text-muted">
          {t(locale, "browse.page")
            .replace("{page}", String(browse.page))
            .replace("{total}", String(browse.totalPages || 1))}
        </span>
      </div>

      {browse.games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {browse.games.map((game: SearchResult) => (
            <GameCard key={game.gameId + game.title} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-xl bg-card border border-border">
          <p className="text-muted">{t(locale, "browse.empty")}</p>
          {totalGames < 1000 && (
            <p className="text-sm text-muted mt-2">{t(locale, "browse.emptySyncing")}</p>
          )}
        </div>
      )}

      {browse.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          {browse.page > 1 ? (
            <Link
              href={browseHref(letter, browse.page - 1, platform)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-card border border-border hover:border-accent/50 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              {t(locale, "browse.prev")}
            </Link>
          ) : (
            <span className="px-4 py-2 text-sm text-muted">{t(locale, "browse.prev")}</span>
          )}
          {browse.page < browse.totalPages ? (
            <Link
              href={browseHref(letter, browse.page + 1, platform)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-card border border-border hover:border-accent/50 text-sm"
            >
              {t(locale, "browse.next")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="px-4 py-2 text-sm text-muted">{t(locale, "browse.next")}</span>
          )}
        </div>
      )}
    </div>
  );
}
