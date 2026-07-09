"use client";

import { useState, useEffect } from "react";
import { Bell, Heart } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useRouter } from "next/navigation";

interface PriceAlertButtonProps {
  gameId: string;
  gameTitle: string;
  currentPrice: number;
}

export function PriceAlertButton({
  gameId,
  gameTitle,
  currentPrice,
}: PriceAlertButtonProps) {
  const { format, convert } = useCurrency();
  const { t } = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(
    Math.floor(convert(currentPrice) * 0.8 * 100) / 100
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTargetPrice(Math.floor(convert(currentPrice) * 0.8 * 100) / 100);
  }, [currentPrice, convert]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const targetUsd = targetPrice / (convert(1) || 1);
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cheapSharkGameId: gameId,
          gameTitle,
          targetPrice: targetUsd,
          currentPrice,
        }),
      });
      if (res.status === 403) {
        router.push("/pricing");
        return;
      }
      if (!res.ok) throw new Error("alert_failed");
      setSaved(true);
      setTimeout(() => {
        setIsOpen(false);
        setSaved(false);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-colors text-sm font-medium"
      >
        <Bell className="w-4 h-4" />
        {t("alert.setButton")}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-1">{t("alert.title")}</h3>
            <p className="text-sm text-muted mb-4">{gameTitle}</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted block mb-2">
                  {t("alert.targetLabel", { current: format(currentPrice) })}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none"
                />
              </div>

              <p className="text-xs text-muted">
                {t("alert.hint")}{" "}
                <a href="/settings" className="text-accent hover:underline">
                  {t("alert.settingsLink")}
                </a>
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border hover:bg-card-hover transition-colors text-sm"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {saved
                    ? t("alert.saved")
                    : loading
                      ? t("alert.saving")
                      : t("alert.confirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function WishlistButton({
  gameId,
  gameTitle,
  imageUrl,
}: {
  gameId: string;
  gameTitle: string;
  imageUrl?: string;
}) {
  const { t } = useLocale();
  const router = useRouter();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((items: { cheapSharkGameId: string }[]) => {
        setIsInWishlist(items.some((i) => i.cheapSharkGameId === gameId));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gameId]);

  const toggle = async () => {
    setLoading(true);
    try {
      if (isInWishlist) {
        await fetch(`/api/wishlist?gameId=${gameId}`, { method: "DELETE" });
        setIsInWishlist(false);
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cheapSharkGameId: gameId,
            gameTitle,
            imageUrl,
          }),
        });
        if (res.status === 403) {
          router.push("/pricing");
          return;
        }
        if (!res.ok) throw new Error("wishlist_failed");
        setIsInWishlist(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors text-sm font-medium disabled:opacity-50 ${
        isInWishlist
          ? "bg-pink-500/10 text-pink-400 border-pink-500/30"
          : "bg-card border-border hover:border-pink-500/30 hover:text-pink-400"
      }`}
    >
      <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current" : ""}`} />
      {isInWishlist ? t("wishlist.inList") : t("wishlist.addToList")}
    </button>
  );
}
