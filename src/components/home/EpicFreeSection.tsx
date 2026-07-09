import Link from "next/link";
import { Gift } from "lucide-react";
import { getEpicFreeGames } from "@/lib/api/epic-free";
import { DealCard } from "@/components/games/DealCard";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

export async function EpicFreeSection() {
  const locale = await getServerLocale();
  const games = await getEpicFreeGames(locale);
  if (games.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold">{t(locale, "home.epicFree.title")}</h2>
            <p className="text-sm text-muted">{t(locale, "home.epicFree.subtitle")}</p>
          </div>
        </div>
        <Link
          href="https://store.epicgames.com/tr/free-games"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:underline"
        >
          Epic →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {games.slice(0, 4).map((deal) => (
          <DealCard key={deal.gameId} deal={deal} />
        ))}
      </div>
    </section>
  );
}
