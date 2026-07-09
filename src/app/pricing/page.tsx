import { Suspense } from "react";
import { Sparkles } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { PricingPlans } from "@/components/premium/PricingPlans";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

interface PricingPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("pricing", locale, { path: "/pricing" });
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const locale = await getServerLocale();
  const params = await searchParams;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          GamePrice Pro
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">{t(locale, "premium.pageTitle")}</h1>
        <p className="text-muted mt-3 max-w-2xl mx-auto">{t(locale, "premium.pageDesc")}</p>
        {params.success && (
          <p className="mt-4 text-emerald-400 text-sm">{t(locale, "premium.success")}</p>
        )}
        {params.canceled && (
          <p className="mt-4 text-amber-400 text-sm">{t(locale, "premium.canceled")}</p>
        )}
      </div>

      <Suspense
        fallback={<div className="h-64 rounded-2xl bg-card border border-border animate-pulse" />}
      >
        <PricingPlans />
      </Suspense>
    </div>
  );
}
