"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Settings, LogIn, Heart, Bell } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { fetchJson } from "@/lib/fetch-json";
import { openNativeAuth } from "@/lib/capacitor/native";

const STEPS = [
  { icon: Settings, titleKey: "onboarding.step1.title", descKey: "onboarding.step1.desc", href: "/settings" },
  { icon: LogIn, titleKey: "onboarding.stepGoogle.title", descKey: "onboarding.stepGoogle.desc", href: "/api/auth/google", external: true },
  { icon: Heart, titleKey: "onboarding.step2.title", descKey: "onboarding.step2.desc", href: "/wishlist" },
  { icon: Bell, titleKey: "onboarding.step3.title", descKey: "onboarding.step3.desc", href: "/alerts" },
] as const;

export function OnboardingModal() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    fetchJson<{ onboardingDone?: boolean }>("/api/profile?light=1", 8_000)
      .then((p) => {
        if (p.onboardingDone === false || p.onboardingDone === undefined) {
          const dismissed = localStorage.getItem("gp_onboarding_dismissed");
          if (!dismissed) setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const dismiss = async () => {
    localStorage.setItem("gp_onboarding_dismissed", "1");
    setOpen(false);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingDone: true }),
    }).catch(() => {});
  };

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isExternal = "external" in current && current.external;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-muted">
              {step + 1}/{STEPS.length}
            </span>
            <button onClick={dismiss} className="text-muted hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-xl font-bold mb-2">{t(current.titleKey)}</h2>
          <p className="text-sm text-muted mb-6">{t(current.descKey)}</p>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium"
              >
                {t("onboarding.back")}
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-medium"
              >
                {t("onboarding.next")}
              </button>
            ) : isExternal ? (
              <button
                type="button"
                onClick={() => {
                  dismiss();
                  void openNativeAuth("/api/auth/google");
                }}
                className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-medium text-center"
              >
                {t("onboarding.finish")}
              </button>
            ) : (
              <Link
                href={current.href}
                onClick={dismiss}
                className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-medium text-center"
              >
                {t("onboarding.finish")}
              </Link>
            )}
          </div>
          {step === 0 && (
            <Link
              href="/settings"
              onClick={dismiss}
              className="block w-full mt-2 py-2.5 rounded-xl border border-border text-sm font-medium text-center hover:border-accent/30"
            >
              {t("onboarding.step1.cta")}
            </Link>
          )}
          {step === 1 && (
            <Link
              href="/settings"
              onClick={dismiss}
              className="block w-full mt-2 py-2.5 rounded-xl border border-border text-sm font-medium text-center hover:border-accent/30"
            >
              {t("onboarding.stepGoogle.alt")}
            </Link>
          )}
          <button onClick={dismiss} className="w-full mt-3 text-xs text-muted hover:text-foreground">
            {t("onboarding.skip")}
          </button>
        </div>
        <div className="h-1 bg-border">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
