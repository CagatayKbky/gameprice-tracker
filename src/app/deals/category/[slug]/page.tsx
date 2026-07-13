import { notFound } from "next/navigation";
import Link from "next/link";
import { DealCard } from "@/components/games/DealCard";
import { DealGrid } from "@/components/layout/DealGrid";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { getCategoryMeta, getDealsForCategory, DEAL_CATEGORIES } from "@/lib/deal-categories";
import { enrichDealsWithHistoricalLow } from "@/lib/api/deals";
import { ChevronLeft } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps) {
  const locale = await getServerLocale();
  const { slug } = await params;
  const meta = getCategoryMeta(slug);
  if (!meta) return { title: "Kategori Bulunamadı" };
  const path = `/deals/category/${slug}`;
  return buildPageMetadata("deals", locale, {
    path,
    canonicalPath: path,
    titleOverride: `${meta.title} — ${locale === "tr" ? "Oyun İndirimleri" : "Game Deals"}`,
    descriptionOverride: meta.subtitle,
  });
}

export default async function DealCategoryPage({ params }: CategoryPageProps) {
  const locale = await getServerLocale();
  const { slug } = await params;
  const meta = getCategoryMeta(slug);
  if (!meta) notFound();

  let deals = await getDealsForCategory(slug);
  if (slug !== "free") {
    deals = await enrichDealsWithHistoricalLow(deals);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/deals"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        {t(locale, "deals.tabs.all")}
      </Link>

      <SectionHeader title={meta.title} subtitle={meta.subtitle} as="h1" className="mb-4" />

      <div className="flex flex-wrap gap-2 mb-8">
        {DEAL_CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/deals/category/${c.slug}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              c.slug === slug
                ? "bg-accent/10 text-accent border-accent/30"
                : "bg-card border-border hover:border-accent/30"
            }`}
          >
            {c.title}
          </Link>
        ))}
      </div>

      <DealGrid>
        {deals.map((deal) => (
          <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
        ))}
      </DealGrid>

      {deals.length === 0 && (
        <p className="text-center py-20 text-muted">{t(locale, "deals.empty")}</p>
      )}
    </div>
  );
}
