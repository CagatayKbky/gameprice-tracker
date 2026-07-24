"use client";

import Link from "next/link";
import { Search, TrendingDown } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Logo } from "@/components/brand/Logo";

interface HomeHeroProps {
  catalogCount: number;
  platformCount: number;
  backdropImages?: string[];
}

export function HomeHero({ catalogCount, platformCount, backdropImages = [] }: HomeHeroProps) {
  const { locale, t } = useLocale();
  const numberLocale = locale === "en" ? "en-US" : "tr-TR";
  const cover = backdropImages[0];

  return (
    <section className="relative min-h-[min(88vh,760px)] overflow-hidden border-b border-border">
      {cover ? (
        <div className="absolute inset-0" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f14] via-[#0b0f14]/92 to-[#0b0f14]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14] via-transparent to-[#0b0f14]/40" />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 20%, rgba(102,192,244,0.12), transparent 50%), linear-gradient(160deg, #0b0f14 0%, #121a22 55%, #1b2838 100%)",
          }}
          aria-hidden
        />
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 flex flex-col justify-end min-h-[min(88vh,760px)]">
        <Logo size="lg" className="mb-6" />

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] max-w-2xl text-white">
          GamePrice
        </h1>
        <p className="mt-3 font-display text-xl sm:text-2xl text-[#66c0f4] max-w-xl">
          {t("home.hero.title")}{" "}
          <span className="text-white">{t("home.hero.titleHighlight")}</span>
          {t("home.hero.titleSuffix") ? ` ${t("home.hero.titleSuffix")}` : ""}
        </p>
        <p className="mt-4 text-base sm:text-lg text-[#acb2b8] max-w-lg leading-relaxed">
          {t("home.hero.subtitle")}
        </p>
        <p className="mt-2 text-xs text-[#8b9aab]">
          {t("home.hero.badge")
            .replace("{games}", catalogCount.toLocaleString(numberLocale))
            .replace("{platforms}", String(platformCount))}
        </p>

        <form action="/search" className="mt-8 max-w-xl w-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              name="q"
              type="text"
              placeholder={t("home.hero.searchPlaceholder")}
              className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-[#121a22]/95 border border-[#243447] focus:border-[#66c0f4] focus:outline-none text-base"
            />
          </div>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#66c0f4] text-[#0b0f14] font-semibold hover:bg-[#8fd3ff] transition-colors"
          >
            <TrendingDown className="w-4 h-4" />
            {t("home.hero.deals")}
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#243447] bg-[#121a22]/80 text-white font-medium hover:border-[#66c0f4]/50 transition-colors"
          >
            {t("home.hero.browseCatalog")}
          </Link>
        </div>
      </div>
    </section>
  );
}
