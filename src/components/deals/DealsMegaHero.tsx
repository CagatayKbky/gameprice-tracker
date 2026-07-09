import Link from "next/link";
import { DealOfTheDay } from "@/types";
import { GameImage } from "@/components/ui/GameImage";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Zap } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";

interface DealsMegaHeroProps {
  deals: DealOfTheDay[];
}

export async function DealsMegaHero({ deals }: DealsMegaHeroProps) {
  const locale = await getServerLocale();
  const mega = deals.filter((d) => d.discount >= 75).slice(0, 3);
  if (mega.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-bold">{t(locale, "deals.megaHero.title")}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mega.map((deal) => (
          <Link
            key={deal.gameId + deal.dealUrl}
            href={`/game/${deal.gameId}`}
            className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-card p-4 hover:border-amber-400/50 transition-all"
          >
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-amber-500 text-black text-sm font-bold">
              -%{deal.discount}
            </div>
            <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-card-hover">
              <GameImage
                src={deal.imageUrl}
                alt={deal.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="400px"
              />
            </div>
            <h3 className="font-semibold line-clamp-2 group-hover:text-accent transition-colors">
              {deal.title}
            </h3>
            <p className="text-xs text-muted mt-1">{deal.platformName}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <PriceDisplay amount={deal.salePrice} className="text-xl font-bold text-emerald-400" />
              <PriceDisplay amount={deal.normalPrice} className="text-sm text-muted line-through" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
