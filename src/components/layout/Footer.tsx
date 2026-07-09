"use client";

import Link from "next/link";
import { PLATFORMS } from "@/lib/platforms";
import { useLocale } from "@/components/providers/LocaleProvider";

export function Footer() {
  const { t } = useLocale();
  const pcPlatforms = PLATFORMS.filter((p) => p.category === "pc");
  const consolePlatforms = PLATFORMS.filter((p) => p.category === "console");

  const exploreLinks = [
    { href: "/browse", label: t("footer.explore.catalog") },
    { href: "/search", label: t("footer.explore.search") },
    { href: "/deals", label: t("footer.explore.deals") },
    { href: "/bundles", label: t("footer.explore.bundles") },
    { href: "/feed.xml", label: t("footer.explore.rss") },
    { href: "/compare", label: t("footer.explore.compare") },
    { href: "/platforms", label: t("footer.explore.platforms") },
    { href: "/guides", label: t("footer.explore.guides") },
    { href: "/guides/sale-calendar", label: t("footer.explore.saleCalendar") },
  ];

  const accountLinks = [
    { href: "/wishlist", label: t("footer.account.wishlist") },
    { href: "/alerts", label: t("footer.account.alerts") },
    { href: "/settings", label: t("footer.account.settings") },
    { href: "/pricing", label: t("nav.premium") },
    { href: "/about", label: t("footer.account.about") },
  ];

  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold gradient-text mb-3">GamePrice</h3>
            <p className="text-sm text-muted leading-relaxed max-w-sm">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">{t("footer.explore")}</h4>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">{t("footer.account")}</h4>
            <ul className="space-y-2">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">{t("footer.platforms")}</h4>
            <ul className="space-y-1.5">
              {[...pcPlatforms.slice(0, 4), ...consolePlatforms.slice(0, 3)].map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/platforms/${p.id}`}
                    className="text-sm text-muted hover:text-accent transition-colors"
                  >
                    {p.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted text-center sm:text-left">
            {t("footer.copyright").replace("{year}", String(new Date().getFullYear()))}
          </p>
          <p className="text-xs text-muted text-center sm:text-right">
            {t("footer.disclaimer")}
          </p>
        </div>
      </div>
    </footer>
  );
}
