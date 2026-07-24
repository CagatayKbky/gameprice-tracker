"use client";

import Link from "next/link";
import { Download, Smartphone, Monitor, Globe } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Logo } from "@/components/brand/Logo";

const APK_URL =
  "https://github.com/CagatayKbky/gameprice-tracker/releases/download/apk-latest/gameprice.apk";
const EXE_URL =
  "https://github.com/CagatayKbky/gameprice-tracker/releases/download/exe-latest/GamePrice-Setup.exe";

export function HomeDownloadSection() {
  const { t } = useLocale();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 border-t border-border/50">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-10">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 90% 10%, rgba(102,192,244,0.15), transparent 45%)",
          }}
          aria-hidden
        />

        <div className="relative flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1">
            <Logo size="xl" showWordmark={false} className="mb-4" />
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
              {t("download.home.title")}
            </h2>
            <p className="text-muted max-w-lg text-sm sm:text-base leading-relaxed">
              {t("download.home.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto shrink-0 justify-center">
            <a
              href={EXE_URL}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-accent text-[#0b0f14] font-semibold text-sm hover:bg-accent-hover transition-colors"
            >
              <Monitor className="w-5 h-5" />
              {t("download.home.exe")}
            </a>
            <a
              href={APK_URL}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg border border-border bg-background font-medium text-sm hover:border-accent/40 transition-colors"
            >
              <Download className="w-5 h-5" />
              {t("download.home.apk")}
            </a>
            <Link
              href="/download"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg border border-border bg-background font-medium text-sm hover:border-accent/40 transition-colors"
            >
              <Smartphone className="w-5 h-5 text-accent" />
              {t("download.home.details")}
            </Link>
          </div>
        </div>

        <div className="relative mt-8 pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-accent shrink-0" />
            <span>{t("download.home.hintExe")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-accent shrink-0" />
            <span>{t("download.home.hintApk")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent shrink-0" />
            <span>{t("download.home.hintPwa")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
