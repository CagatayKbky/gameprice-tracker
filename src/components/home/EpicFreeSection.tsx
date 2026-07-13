import { Gift } from "lucide-react";
import { getEpicFreeGames } from "@/lib/api/epic-free";
import { DealCard } from "@/components/games/DealCard";
import { DealGrid } from "@/components/layout/DealGrid";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import type { DealOfTheDay } from "@/types";

interface EpicFreeSectionProps {
  games?: DealOfTheDay[];
}

export async function EpicFreeSection({ games }: EpicFreeSectionProps = {}) {
  const locale = await getServerLocale();
  const epicGames = games ?? (await getEpicFreeGames(locale));
  if (epicGames.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 border-t border-border/40">
      <HomeSectionHeader
        icon={Gift}
        iconClassName="text-purple-400"
        title={t(locale, "home.epicFree.title")}
        subtitle={t(locale, "home.epicFree.subtitle")}
      />
      <a
        href="https://store.epicgames.com/tr/free-games"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-accent hover:underline -mt-2 mb-4"
      >
        Epic Games Store →
      </a>
      <DealGrid>
        {epicGames.slice(0, 4).map((deal) => (
          <DealCard key={deal.gameId} deal={deal} />
        ))}
      </DealGrid>
    </section>
  );
}
