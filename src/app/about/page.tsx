import Link from "next/link";
import { Gamepad2, Search, TrendingDown, Bell, BarChart3 } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("about", locale, { path: "/about" });
}

const highlightKeys = [
  {
    icon: Search,
    titleKey: "about.highlight.catalog.title",
    textKey: "about.highlight.catalog.text",
  },
  {
    icon: TrendingDown,
    titleKey: "about.highlight.deals.title",
    textKey: "about.highlight.deals.text",
  },
  {
    icon: BarChart3,
    titleKey: "about.highlight.analysis.title",
    textKey: "about.highlight.analysis.text",
  },
  {
    icon: Bell,
    titleKey: "about.highlight.notifications.title",
    textKey: "about.highlight.notifications.text",
  },
];

const dataSourceKeys = [
  "about.dataSources.cheapshark",
  "about.dataSources.steam",
  "about.dataSources.console",
  "about.dataSources.catalog",
];

export default async function AboutPage() {
  const locale = await getServerLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-steam flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{t(locale, "about.title")}</h1>
          <p className="text-muted">{t(locale, "about.subtitle")}</p>
        </div>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-muted leading-relaxed">
        <p>{t(locale, "about.description1")}</p>
        <p>{t(locale, "about.description2")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
        {highlightKeys.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.titleKey}
              className="p-5 rounded-xl bg-card border border-border"
            >
              <Icon className="w-5 h-5 text-accent mb-3" />
              <h3 className="font-semibold mb-1">{t(locale, item.titleKey)}</h3>
              <p className="text-sm text-muted">{t(locale, item.textKey)}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 rounded-xl bg-card border border-border">
        <h2 className="font-semibold mb-3">{t(locale, "about.dataSources")}</h2>
        <ul className="text-sm text-muted space-y-2">
          {dataSourceKeys.map((key) => (
            <li key={key}>• {t(locale, key)}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/search"
          className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover"
        >
          {t(locale, "about.searchGames")}
        </Link>
        <Link
          href="/browse"
          className="px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-card-hover"
        >
          {t(locale, "about.browseCatalog")}
        </Link>
      </div>
    </div>
  );
}
