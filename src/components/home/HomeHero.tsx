"use client";

import Link from "next/link";
import {
  Search,
  TrendingDown,
  Gift,
  Library,
} from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Logo } from "@/components/brand/Logo";

const popularTags = [
  "Cyberpunk 2077",
  "Elden Ring",
  "Baldur's Gate 3",
  "GTA V",
  "Hogwarts Legacy",
  "Palworld",
  "Counter-Strike 2",
  "DOOM",
];

interface HomeHeroProps {
  catalogCount: number;
  platformCount: number;
  backdropImages?: string[];
}

export function HomeHero({ catalogCount, platformCount, backdropImages = [] }: HomeHeroProps) {
  const { locale, t } = useLocale();
  const numberLocale = locale === "en" ? "en-US" : "tr-TR";

  return (
    <section className="relative overflow-hidden border-b border-border/50">
      {/* Ambient backdrop from featured game covers */}
      {backdropImages.length > 0 && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 grid grid-cols-4 sm:grid-cols-6 gap-1 opacity-[0.12] scale-110 blur-sm">
            {backdropImages.slice(0, 12).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${url}-${i}`}
                src={url}
                alt=""
                className="w-full aspect-3/4 object-cover rounded-lg"
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 via-purple-500/8 to-transparent" />
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
      <div className="absolute top-32 right-1/4 w-80 h-80 bg-violet-500/12 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <Logo size="md" showWordmark={false} />
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
              {t("home.hero.badge")
                .replace("{games}", catalogCount.toLocaleString(numberLocale))
                .replace("{platforms}", String(platformCount))}
            </p>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            {t("home.hero.title")}{" "}
            <span className="gradient-text">{t("home.hero.titleHighlight")}</span>
            {t("home.hero.titleSuffix") ? ` ${t("home.hero.titleSuffix")}` : ""}
          </h1>

          <p className="mt-5 text-lg text-muted max-w-xl leading-relaxed">
            {t("home.hero.subtitle")}
          </p>

          <form action="/search" className="mt-8 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-accent transition-colors" />
              <input
                name="q"
                type="text"
                placeholder={t("home.hero.searchPlaceholder")}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card/90 backdrop-blur border border-border focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 text-base shadow-xl shadow-black/25"
              />
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1.5 rounded-full text-xs bg-card/70 backdrop-blur border border-border/80 hover:border-accent/50 hover:bg-accent/5 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              <Library className="w-4 h-4" />
              {t("home.hero.browseCatalog")}
            </Link>
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/80 backdrop-blur hover:bg-card-hover font-medium transition-colors"
            >
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              {t("home.hero.deals")}
            </Link>
            <Link
              href="/deals?tab=free"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/80 backdrop-blur hover:bg-card-hover font-medium transition-colors"
            >
              <Gift className="w-4 h-4 text-emerald-400" />
              {t("home.hero.free")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
