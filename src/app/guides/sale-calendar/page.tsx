import Link from "next/link";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { buildArticleJsonLd, buildGuidesBreadcrumbJsonLd } from "@/lib/seo/guide-schemas";
import { JsonLd } from "@/components/seo/JsonLd";
import { SaleCalendarGlobal } from "@/components/games/SaleCalendarGlobal";
import { Calendar, ChevronRight } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("saleCalendar", locale, { path: "/guides/sale-calendar" });
}

export default async function SaleCalendarPage() {
  const locale = await getServerLocale();
  const title = t(locale, "saleCalendar.title");
  const subtitle = t(locale, "saleCalendar.subtitle");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <JsonLd data={buildArticleJsonLd({ slug: "sale-calendar", title, description: subtitle })} />
      <JsonLd data={buildGuidesBreadcrumbJsonLd("sale-calendar", title)} />

      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-[#8f98a0]">
        <Link href="/" className="hover:text-[#66c0f4]">
          {t(locale, "nav.home")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/guides" className="hover:text-[#66c0f4]">
          {t(locale, "guides.hub.title")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">{title}</span>
      </nav>

      <div className="flex items-center gap-3 mb-8">
        <Calendar className="w-6 h-6 text-accent" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          <p className="text-muted text-sm mt-1">{subtitle}</p>
        </div>
      </div>

      <SaleCalendarGlobal />

      <article className="prose prose-invert max-w-none mt-10 space-y-4 text-sm text-muted leading-relaxed">
        <p>{t(locale, "saleCalendar.description1")}</p>
        <p>{t(locale, "saleCalendar.description2")}</p>
        <div className="flex flex-wrap gap-4 not-prose">
          <Link href="/deals" className="text-accent hover:underline">
            {t(locale, "saleCalendar.goToDeals")}
          </Link>
          <Link href="/guides" className="text-accent hover:underline">
            ← {t(locale, "guides.hub.title")}
          </Link>
        </div>
      </article>
    </div>
  );
}
