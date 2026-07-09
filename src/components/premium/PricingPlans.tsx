"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Loader2, Check, Sparkles } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { usePremium } from "@/components/providers/PremiumProvider";

export function PricingPlans() {
  const { t } = useLocale();
  const { isPro, startCheckout, cancelSubscription, billingConfigured, loading } = usePremium();
  const [busy, setBusy] = useState<"monthly" | "yearly" | "cancel" | null>(null);

  const handleCancel = async () => {
    if (!confirm(t("premium.cancelConfirm"))) return;
    setBusy("cancel");
    try {
      await cancelSubscription();
    } catch {
      alert(t("premium.cancelError"));
    } finally {
      setBusy(null);
    }
  };

  const features = [
    t("premium.feature.unlimitedWishlist"),
    t("premium.feature.unlimitedAlerts"),
    t("premium.feature.fastSearch"),
    t("premium.feature.compare10"),
    t("premium.feature.push"),
    t("premium.feature.discord"),
    t("premium.feature.telegram"),
    t("premium.feature.instantAlerts"),
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold">{t("premium.free.title")}</h3>
        <p className="text-3xl font-bold mt-2">₺0</p>
        <p className="text-sm text-muted mt-1">{t("premium.free.subtitle")}</p>
        <ul className="mt-6 space-y-2 text-sm text-muted">
          <li>• {t("premium.free.wishlist")}</li>
          <li>• {t("premium.free.alerts")}</li>
          <li>• {t("premium.free.compare")}</li>
          <li>• {t("premium.free.search")}</li>
        </ul>
      </div>

      <div className="rounded-2xl border-2 border-accent/50 bg-gradient-to-b from-accent/10 to-card p-6 relative">
        <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-accent text-white text-xs font-bold flex items-center gap-1">
          <Crown className="w-3 h-3" />
          PRO
        </div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          {t("premium.pro.title")}
        </h3>
        <p className="text-sm text-muted mt-1">{t("premium.pro.subtitle")}</p>
        <ul className="mt-6 space-y-2 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3">
          {isPro ? (
            <button
              onClick={handleCancel}
              disabled={busy === "cancel"}
              className="w-full py-3 rounded-xl bg-card border border-border hover:border-red-400/40 text-red-400 font-medium flex items-center justify-center gap-2"
            >
              {busy === "cancel" && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("premium.cancelSubscription")}
            </button>
          ) : billingConfigured ? (
            <>
              <button
                onClick={() => startCheckout("monthly")}
                disabled={!!busy}
                className="w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/90"
              >
                {t("premium.ctaMonthly")}
              </button>
              <button
                onClick={() => startCheckout("yearly")}
                disabled={!!busy}
                className="w-full py-3 rounded-xl bg-card border border-accent/40 text-accent font-semibold hover:bg-accent/10"
              >
                {t("premium.ctaYearly")}
              </button>
            </>
          ) : (
            <p className="text-sm text-amber-400 text-center">{t("premium.iyzicoPending")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function UpgradePrompt({
  feature,
  className = "",
}: {
  feature: "wishlist" | "alerts" | "compare" | "push" | "discord" | "telegram" | "search";
  className?: string;
}) {
  const { t } = useLocale();
  const { isPro } = usePremium();
  if (isPro) return null;

  return (
    <div
      className={`rounded-xl border border-accent/30 bg-accent/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Crown className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">{t(`premium.upgrade.${feature}.title`)}</p>
          <p className="text-xs text-muted mt-0.5">
            {t(`premium.upgrade.${feature}.desc`)}
          </p>
        </div>
      </div>
      <Link
        href="/pricing"
        className="shrink-0 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium text-center hover:bg-accent/90"
      >
        {t("premium.upgradeCta")}
      </Link>
    </div>
  );
}

export function ProBadge() {
  const { isPro } = usePremium();
  const { t } = useLocale();
  if (!isPro) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
      <Crown className="w-3 h-3" />
      {t("premium.badge")}
    </span>
  );
}
