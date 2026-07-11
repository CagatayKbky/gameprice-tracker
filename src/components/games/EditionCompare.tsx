import Link from "next/link";
import { unifiedSearch } from "@/lib/api/unified-search";
import { isCompleteEdition, isLikelyDlc } from "@/lib/game-utils";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { DlcBadge } from "@/components/games/DlcBadge";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

interface EditionCompareProps {
  title: string;
  currentGameId: string;
}

export async function EditionCompare({ title, currentGameId }: EditionCompareProps) {
  const locale = await getServerLocale();
  const baseTitle = title.split(":")[0].trim();
  const results = await unifiedSearch(baseTitle);
  const variants = results
    .filter((g) => g.gameId !== currentGameId)
    .filter(
      (g) =>
        isLikelyDlc(g.title) ||
        isCompleteEdition(g.title) ||
        /deluxe|goty|ultimate|gold|edition|bundle|season pass/i.test(g.title)
    )
    .slice(0, 6);

  if (variants.length === 0) return null;

  return (
    <section className="mb-10 rounded-2xl bg-card border border-border p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold mb-2">{t(locale, "game.editionCompare")}</h2>
      <p className="text-sm text-muted mb-4">{t(locale, "game.editionCompareHint")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {variants.map((game) => (
          <Link
            key={game.gameId}
            href={`/game/${game.gameId}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 hover:border-accent/30 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium line-clamp-2">{game.title}</p>
                <DlcBadge title={game.title} />
              </div>
              {game.cheapestPrice !== undefined && game.cheapestPrice > 0 && (
                <p className="text-xs text-muted mt-1">{game.cheapestPlatform}</p>
              )}
            </div>
            {game.cheapestPrice !== undefined && game.cheapestPrice > 0 && (
              <PriceDisplay amount={game.cheapestPrice} className="text-sm font-bold text-emerald-400 shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
