"use client";

import Link from "next/link";
import { ArrowRight, Library } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface CatalogBrowseStripProps {
  letters: { letter: string; count: number }[];
}

const DISPLAY_LETTERS = "abcdefghijklmnopqrstuvwxyz#".split("");

export function CatalogBrowseStrip({ letters }: CatalogBrowseStripProps) {
  const { locale, t } = useLocale();
  const numberLocale = locale === "en" ? "en-US" : "tr-TR";
  const letterMap = new Map(letters.map((l) => [l.letter, l.count]));
  const total = letters.reduce((sum, l) => sum + l.count, 0);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-card to-purple-500/10 border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Library className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("home.catalogStrip.title")}</h2>
              <p className="text-sm text-muted">
                {t("home.catalogStrip.subtitle").replace("{count}", total.toLocaleString(numberLocale))}
              </p>
            </div>
          </div>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            {t("home.catalogStrip.allCatalog")}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {DISPLAY_LETTERS.map((char) => {
            const count = letterMap.get(char) || 0;
            return (
              <Link
                key={char}
                href={`/browse?letter=${char}`}
                className={`min-w-9 h-9 px-2 rounded-lg text-sm font-medium flex items-center justify-center border transition-colors ${
                  count > 0
                    ? "bg-card border-border hover:border-accent/50 hover:text-accent"
                    : "bg-card/30 border-border/30 text-muted/50 pointer-events-none"
                }`}
                title={
                  count > 0
                    ? t("home.catalogStrip.gamesCount").replace("{count}", String(count))
                    : undefined
                }
              >
                {char === "#" ? "#" : char.toUpperCase()}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
