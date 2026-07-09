"use client";

import { GitCompareArrows } from "lucide-react";
import Link from "next/link";
import { useCompare } from "@/components/providers/CompareProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { usePremium } from "@/components/providers/PremiumProvider";

interface CompareButtonProps {
  gameId: string;
  gameTitle: string;
  imageUrl?: string;
  variant?: "icon" | "full";
}

export function CompareButton({
  gameId,
  gameTitle,
  imageUrl,
  variant = "full",
}: CompareButtonProps) {
  const { addGame, removeGame, isInCompare, games, maxCompare } = useCompare();
  const { addToast } = useToast();
  const { t } = useLocale();
  const { isPro } = usePremium();
  const active = isInCompare(gameId);

  const toggle = () => {
    if (active) {
      removeGame(gameId);
      return;
    }
    const ok = addGame({ gameId, title: gameTitle, imageUrl });
    if (!ok) {
      addToast({
        type: "deal",
        title: t("premium.compareLimitTitle"),
        message: isPro
          ? t("premium.compareLimitPro", { max: String(maxCompare) })
          : t("premium.compareLimitFree", { max: String(maxCompare) }),
        href: isPro ? "/compare" : "/pricing",
      });
      return;
    }
    addToast({
      type: "deal",
      title: t("premium.compareAdded"),
      message: t("premium.compareCount", {
        count: String(games.length + 1),
        max: String(maxCompare),
      }),
      href: "/compare",
    });
  };

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        className={`p-2 rounded-lg transition-colors ${
          active
            ? "bg-accent/20 text-accent"
            : "hover:bg-card-hover text-muted hover:text-foreground"
        }`}
        title={active ? t("premium.compareRemove") : t("premium.compareAdd")}
      >
        <GitCompareArrows className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm font-medium ${
        active
          ? "bg-accent/10 text-accent border-accent/30"
          : "bg-card border-border hover:border-accent/30"
      }`}
    >
      <GitCompareArrows className="w-4 h-4" />
      {active ? t("premium.compareActive") : t("premium.compareAdd")}
    </button>
  );
}
