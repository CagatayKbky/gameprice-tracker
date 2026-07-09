import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GUIDE_CATALOG } from "@/lib/guides/catalog";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo/constants";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("guidesHub", locale, { path: "/guides" });
}

export default async function GuidesHubPage() {
  const locale = await getServerLocale();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t(locale, "guides.hub.title"),
    description: t(locale, "guides.hub.subtitle"),
    url: `${SITE_URL}/guides`,
    hasPart: GUIDE_CATALOG.map((guide) => ({
      "@type": "Article",
      name: t(locale, guide.titleKey),
      url: `${SITE_URL}/guides/${guide.slug}`,
    })),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <JsonLd data={collectionJsonLd} />

      <div className="mb-10 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1b2838] border border-[#2a475e]/60">
          <BookOpen className="h-6 w-6 text-[#66c0f4]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{t(locale, "guides.hub.title")}</h1>
          <p className="mt-2 text-[#8f98a0] max-w-2xl">{t(locale, "guides.hub.subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDE_CATALOG.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group rounded-2xl border border-[#2a475e]/50 bg-[#0e1419] p-5 transition-colors hover:border-[#66c0f4]/40 hover:bg-[#1b2838]/40"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {guide.tagKeys.map((tagKey) => (
                <span
                  key={tagKey}
                  className="rounded-full border border-[#2a475e]/60 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#8f98a0]"
                >
                  {t(locale, tagKey)}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-semibold text-white group-hover:text-[#66c0f4]">
              {t(locale, guide.titleKey)}
            </h2>
            <p className="mt-1 text-sm text-[#8f98a0]">{t(locale, guide.subtitleKey)}</p>
            <p className="mt-3 text-sm text-[#c6d4df] line-clamp-2">{t(locale, guide.descriptionKey)}</p>
            <p className="mt-4 flex items-center gap-1.5 text-xs text-[#8f98a0]">
              <Clock className="h-3.5 w-3.5" />
              {t(locale, "guides.hub.readTime", { minutes: String(guide.readMinutes) })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
