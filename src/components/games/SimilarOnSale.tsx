import { TrendingDown } from "lucide-react";
import { getMegaDeals } from "@/lib/api/deals";
import { DealCard } from "@/components/games/DealCard";
import { DealGrid } from "@/components/layout/DealGrid";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

interface SimilarOnSaleProps {
  title: string;
  excludeId: string;
}

export async function SimilarOnSale({ title, excludeId }: SimilarOnSaleProps) {
  const locale = await getServerLocale();
  const deals = await getMegaDeals();
  const words = title
    .toLowerCase()
    .split(/[\s:]+/)
    .filter((w) => w.length > 3);

  const similar = deals
    .filter(
      (d) =>
        d.gameId !== excludeId &&
        words.some((w) => d.title.toLowerCase().includes(w))
    )
    .slice(0, 4);

  if (similar.length === 0) return null;

  return (
    <section className="mb-10">
      <HomeSectionHeader
        icon={TrendingDown}
        iconClassName="text-amber-400"
        title={t(locale, "game.similarOnSale.title")}
        href="/deals?tab=mega"
        linkLabel={t(locale, "common.seeAll")}
      />
      <DealGrid>
        {similar.map((deal) => (
          <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
        ))}
      </DealGrid>
    </section>
  );
}
