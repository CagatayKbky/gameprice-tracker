"use client";

import Link from "next/link";
import { Download, Smartphone, Globe } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Logo } from "@/components/brand/Logo";

const APK_URL =
  "https://github.com/CagatayKbky/gameprice-tracker/releases/download/apk-latest/gameprice.apk";

export function HomeDownloadSection() {
  const { t } = useLocale();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-border/50">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-[#0f0f18] via-[#12121f] to-[#1a1030] p-8 sm:p-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1">
            <Logo size="xl" showWordmark={false} className="mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{t("download.home.title")}</h2>
            <p className="text-muted max-w-lg text-sm sm:text-base leading-relaxed">
              {t("download.home.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <a
              href={APK_URL}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
            >
              <Download className="w-5 h-5" />
              {t("download.home.apk")}
            </a>
            <Link
              href="/download"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-card border border-border font-medium text-sm hover:border-accent/40 transition-colors"
            >
              <Smartphone className="w-5 h-5 text-accent" />
              {t("download.home.details")}
            </Link>
          </div>
        </div>

        <div className="relative mt-8 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{t("download.home.hintApk")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>{t("download.home.hintPwa")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
