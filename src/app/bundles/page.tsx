import Link from "next/link";
import { Package } from "lucide-react";
import { getBundleDeals } from "@/lib/api/deals";
import { DealCard } from "@/components/games/DealCard";
import { DealGrid } from "@/components/layout/DealGrid";
import { SectionHeader } from "@/components/layout/SectionHeader";
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
      <SectionHeader
        icon={Package}
        iconClassName="text-purple-400"
        title={t(locale, "bundles.title")}
        subtitle={t(locale, "bundles.subtitle")}
        as="h1"
        className="mb-8"
      />

      <BundleComparePanel bundles={bundles} />

      {bundles.length > 0 ? (
        <DealGrid>
          {bundles.map((bundle) => (
            <DealCard key={bundle.gameId + bundle.dealUrl} deal={bundle} />
          ))}
        </DealGrid>
      ) : (
        <div className="text-center py-20 text-muted rounded-2xl bg-card/50 border border-border">
          {t(locale, "bundles.empty")}
        </div>
      )}
    </div>
  );
}
