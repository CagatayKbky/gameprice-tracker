import type { Metadata } from "next";
import Link from "next/link";
import { Download, Smartphone, Shield, Zap } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

const APK_URL =
  "https://github.com/CagatayKbky/gameprice-tracker/releases/download/apk-latest/gameprice.apk";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata("download", locale, { path: "/download" });
}

export default async function DownloadPage() {
  const locale = await getServerLocale();

  const features = [
    {
      icon: Zap,
      title: t(locale, "download.page.feature.speed.title"),
      desc: t(locale, "download.page.feature.speed.desc"),
    },
    {
      icon: Shield,
      title: t(locale, "download.page.feature.secure.title"),
      desc: t(locale, "download.page.feature.secure.desc"),
    },
    {
      icon: Smartphone,
      title: t(locale, "download.page.feature.mobile.title"),
      desc: t(locale, "download.page.feature.mobile.desc"),
    },
  ];

  const steps = [
    t(locale, "download.page.steps.1"),
    t(locale, "download.page.steps.2"),
    t(locale, "download.page.steps.3"),
    t(locale, "download.page.steps.4"),
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-[#0f0f18] via-[#12121f] to-[#1a1030] p-8 mb-8">
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <Logo size="xl" showWordmark={false} />
          <div>
            <h1 className="text-3xl font-bold mb-2">{t(locale, "download.page.title")}</h1>
            <p className="text-muted leading-relaxed">{t(locale, "download.page.subtitle")}</p>
          </div>
        </div>
      </div>

      <a
        href={APK_URL}
        className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25 mb-8"
      >
        <Download className="w-5 h-5" />
        {t(locale, "download.page.cta")}
      </a>

      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-4">
            <Icon className="w-5 h-5 text-accent mb-2" />
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold text-lg">{t(locale, "download.page.steps.title")}</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="text-xs text-muted">{t(locale, "download.page.pwaHint")}</p>
      </section>

      <p className="text-sm text-muted mt-8">
        <Link href="/about" className="text-accent hover:underline">
          {t(locale, "footer.account.about")}
        </Link>
        {" · "}
        <Link href="/settings" className="text-accent hover:underline">
          {t(locale, "footer.account.settings")}
        </Link>
      </p>
    </div>
  );
}
