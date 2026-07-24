"use client";

import Link from "next/link";
import { Bell, Heart } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function HomeCtaBanner() {
  const { t } = useLocale();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-2xl font-bold">{t("home.cta.title")}</h2>
          <p className="text-muted mt-2 max-w-md">
            {t("home.cta.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/wishlist"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-border hover:border-pink-500/50 font-medium text-sm transition-colors"
          >
            <Heart className="w-4 h-4 text-pink-400" />
            {t("home.cta.wishlist")}
          </Link>
          <Link
            href="/alerts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-[#0b0f14] font-medium text-sm hover:bg-accent-hover transition-colors"
          >
            <Bell className="w-4 h-4" />
            {t("home.cta.alerts")}
          </Link>
        </div>
      </div>
    </section>
  );
}
