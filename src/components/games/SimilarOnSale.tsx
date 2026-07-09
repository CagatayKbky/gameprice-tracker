import Link from "next/link";
import { TrendingDown } from "lucide-react";
import { getMegaDeals } from "@/lib/api/deals";
import { DealCard } from "@/components/games/DealCard";
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold">{t(locale, "game.similarOnSale.title")}</h2>
        </div>
        <Link href="/deals?tab=mega" className="text-sm text-accent hover:underline">
          {t(locale, "common.seeAll")}
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {similar.map((deal) => (
          <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
        ))}
      </div>
    </section>
  );
}
