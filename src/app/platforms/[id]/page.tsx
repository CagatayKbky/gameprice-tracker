import Link from "next/link";
import { getPlatformById, PLATFORMS } from "@/lib/platforms";
import { getDealsFiltered } from "@/lib/api/deals";
import { DealCard } from "@/components/games/DealCard";
import { DealGrid } from "@/components/layout/DealGrid";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

interface PlatformPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlatformPageProps) {
  const locale = await getServerLocale();
  const { id } = await params;
  const platform = getPlatformById(id);
  if (!platform) return { title: "Platform" };
  const path = `/platforms/${id}`;
  return buildPageMetadata("platforms", locale, {
    path,
    canonicalPath: path,
    titleOverride: `${platform.name} — ${locale === "tr" ? "Oyun İndirimleri" : "Game Deals"}`,
    descriptionOverride:
      locale === "tr"
        ? `${platform.name} mağazasındaki oyun indirimlerini ve fiyatlarını takip et.`
        : `Track game deals and prices on ${platform.name}.`,
  });
}

export default async function PlatformStorePage({ params }: PlatformPageProps) {
  const { id } = await params;
  const platform = getPlatformById(id);
  if (!platform) notFound();

  const deals = platform.cheapSharkId
    ? await getDealsFiltered({
        storeId: id,
        minDiscount: 20,
        pageSize: 24,
        sortBy: "Savings",
        desc: 1,
      })
    : [];

  const storeUrls: Record<string, string> = {
    ps5: "https://store.playstation.com/tr-tr/pages/latest",
    ps4: "https://store.playstation.com/tr-tr/pages/latest",
    "xbox-series": "https://www.xbox.com/tr-tr/games/store/most-played",
    "xbox-one": "https://www.xbox.com/tr-tr/games/store/most-played",
    switch: "https://www.nintendo.com/tr-tr/Store/Games/",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${platform.color}30` }}
          >
            🎮
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{platform.name}</h1>
            <p className="text-muted mt-1">
              {deals.length > 0
                ? `${deals.length} aktif indirim`
                : "Mağazaya sayfasına gidin"}
            </p>
          </div>
        </div>
        {storeUrls[id] && (
          <a
            href={storeUrls[id]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-accent/30 text-sm"
          >
            Mağazaya Git
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {deals.length > 0 ? (
        <DealGrid>
          {deals.map((deal) => (
            <DealCard key={deal.gameId + deal.dealUrl} deal={deal} />
          ))}
        </DealGrid>
      ) : (
        <div className="text-center py-16 rounded-xl bg-card border border-border">
          <p className="text-muted mb-4">
            Bu platform için indirim listesi henüz yüklenemedi.
          </p>
          <Link
            href={`/search?q=game&store=${id}`}
            className="inline-flex px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium"
          >
            Bu Mağazada Ara
          </Link>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Diğer Platformlar</h2>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.filter((p) => p.id !== id).map((p) => (
            <Link
              key={p.id}
              href={p.cheapSharkId ? `/platforms/${p.id}` : "#"}
              className="px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent/30 text-sm"
            >
              {p.shortName}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
