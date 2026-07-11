"use client";

import { useEffect, useState } from "react";
import { GitCompareArrows, Trash2 } from "lucide-react";
import { useCompare } from "@/components/providers/CompareProvider";
import { CompareTable } from "@/components/games/CompareTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { GameDeal } from "@/types";
import { useLocale } from "@/components/providers/LocaleProvider";

export function ComparePageContent() {
  const { t } = useLocale();
  const { games: compareGames, removeGame, clearAll } = useCompare();
  const [games, setGames] = useState<GameDeal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (compareGames.length < 2) {
      setGames([]);
      return;
    }

    setLoading(true);
    Promise.all(
      compareGames.map((g) =>
        fetch(`/api/games?action=game&id=${g.gameId}`).then((r) => r.json())
      )
    )
      .then((results) => setGames(results.filter(Boolean)))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, [compareGames]);

  if (compareGames.length < 2) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <EmptyState
          icon={GitCompareArrows}
          title={t("compare.titleEmpty")}
          description={t("compare.hint")}
          actionLabel={t("compare.searchGames")}
          actionHref="/search?q=game"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <GitCompareArrows className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{t("compare.title")}</h1>
            <p className="text-muted mt-1">
              {t("compare.subtitle").replace("{count}", String(compareGames.length))}
            </p>
          </div>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-red-500/30 hover:text-red-400 text-sm transition-colors w-full sm:w-auto"
        >
          <Trash2 className="w-4 h-4" />
          {t("compare.clear")}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {compareGames.map((g) => (
          <span
            key={g.gameId}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm"
          >
            {g.title}
            <button
              onClick={() => removeGame(g.gameId)}
              className="text-muted hover:text-red-400"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {loading ? (
        <SkeletonGrid count={2} />
      ) : games.length >= 2 ? (
        <CompareTable games={games} />
      ) : (
        <p className="text-center text-muted py-12">{t("compare.loadError")}</p>
      )}
    </div>
  );
}
