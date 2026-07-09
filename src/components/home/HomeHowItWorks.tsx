"use client";

import Link from "next/link";
import { Search, Bell, BarChart3, ArrowRight } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function HomeHowItWorks() {
  const { t } = useLocale();

  const steps = [
    {
      icon: Search,
      step: "1",
      title: t("home.howItWorks.step1.title"),
      description: t("home.howItWorks.step1.description"),
    },
    {
      icon: BarChart3,
      step: "2",
      title: t("home.howItWorks.step2.title"),
      description: t("home.howItWorks.step2.description"),
    },
    {
      icon: Bell,
      step: "3",
      title: t("home.howItWorks.step3.title"),
      description: t("home.howItWorks.step3.description"),
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold">{t("home.howItWorks.title")}</h2>
        <p className="text-muted mt-2 max-w-lg mx-auto">
          {t("home.howItWorks.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative p-6 rounded-2xl bg-card border border-border hover:border-accent/30 transition-colors"
            >
              <span className="absolute top-4 right-4 text-4xl font-bold text-border">
                {item.step}
              </span>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
        >
          {t("home.howItWorks.cta")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
