import Link from "next/link";
import { Package } from "lucide-react";
import { getBundleDeals } from "@/lib/api/deals";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { GameImage } from "@/components/ui/GameImage";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { BundleComparePanel } from "@/components/bundles/BundleComparePanel";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("bundles", locale, { path: "/bundles" });
}

export default async function BundlesPage() {
  const locale = await getServerLocale();
  const bundles = await getBundleDeals();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{t(locale, "bundles.title")}</h1>
          <p className="text-muted mt-1">
            {t(locale, "bundles.subtitle")}
          </p>
        </div>
      </div>

      <BundleComparePanel bundles={bundles} />

      {bundles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map((bundle) => (
            <Link
              key={bundle.gameId + bundle.dealUrl}
              href={`/game/${bundle.gameId}`}
              className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-purple-500/40 transition-colors"
            >
              <div className="relative w-24 h-28 rounded-lg overflow-hidden shrink-0 bg-card-hover">
                <GameImage
                  src={bundle.imageUrl}
                  alt={bundle.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-purple-500 text-white text-xs font-bold">
                  -%{bundle.discount}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent">
                  {bundle.title}
                </h3>
                <p className="text-xs text-muted mt-1">{bundle.platformName}</p>
                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                  <PriceDisplay amount={bundle.salePrice} className="text-lg font-bold text-emerald-400" />
                  <PriceDisplay amount={bundle.normalPrice} className="text-sm text-muted line-through" />
                  {bundle.pricePerGame != null && (
                    <span className="text-xs text-muted">
                      ≈ <PriceDisplay amount={bundle.pricePerGame} className="inline" /> / {t(locale, "bundles.perGame")}
                    </span>
                  )}
                </div>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {bundle.store}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted rounded-xl bg-card border border-border">
          {t(locale, "bundles.empty")}
        </div>
      )}
    </div>
  );
}
