"use client";

import { GitCompareArrows } from "lucide-react";
import { useCompare } from "@/components/providers/CompareProvider";
import { useToast } from "@/components/providers/ToastProvider";

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
  const { addGame, removeGame, isInCompare, games } = useCompare();
  const { addToast } = useToast();
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
        title: "Karşılaştırma limiti",
        message: "En fazla 3 oyun karşılaştırabilirsiniz.",
        href: "/compare",
      });
      return;
    }
    addToast({
      type: "deal",
      title: "Karşılaştırmaya eklendi",
      message: `${gameTitle} eklendi (${games.length + 1}/3)`,
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
        title={active ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
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
      {active ? "Karşılaştırmada" : "Karşılaştır"}
    </button>
  );
}
