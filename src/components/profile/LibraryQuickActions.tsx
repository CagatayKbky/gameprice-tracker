"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, Heart, Loader2 } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface LibraryQuickActionsProps {
  gameId: string;
  title: string;
  imageUrl?: string;
}

export function LibraryQuickActions({
  gameId,
  title,
  imageUrl,
}: LibraryQuickActionsProps) {
  const { t } = useLocale();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const addWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cheapSharkGameId: gameId,
          gameTitle: title,
          imageUrl,
        }),
      });
      if (res.ok) {
        setSaved(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void addWishlist();
        }}
        disabled={loading || saved}
        className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-border text-[10px] sm:text-xs hover:border-pink-400/30 hover:text-pink-300 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : saved ? (
          <Check className="w-3 h-3" />
        ) : (
          <Heart className="w-3 h-3" />
        )}
        {saved ? t("wishlist.inList") : t("wishlist.addToList")}
      </button>
      <Link
        href={`/game/${gameId}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs hover:border-accent/30 hover:text-accent"
        onClick={(e) => e.stopPropagation()}
      >
        <Bell className="w-3 h-3" />
        {t("alerts.setAlert")}
      </Link>
    </div>
  );
}
