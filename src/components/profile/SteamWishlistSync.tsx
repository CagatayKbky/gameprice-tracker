"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface SteamWishlistSyncProps {
  steamId: string;
  steamWishlistCount?: number;
  onImported: () => void;
}

export function SteamWishlistSync({
  steamId,
  steamWishlistCount,
  onImported,
}: SteamWishlistSyncProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    total: number;
    failed?: string[];
  } | null>(null);
  const [error, setError] = useState("");

  const handleImport = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/steam/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("wishlist.steamImportError"));
        return;
      }
      setResult(data);
      onImported();
    } catch {
      setError(t("wishlist.steamImportConnectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-[#1b2838]/40 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#66c0f4]" />
            {t("profile.steamWishlistSync")}
          </h3>
          <p className="text-sm text-muted mt-1">
            {steamWishlistCount != null && steamWishlistCount > 0
              ? t("profile.steamWishlistCount", { count: String(steamWishlistCount) })
              : t("profile.steamWishlistSyncDesc")}
          </p>
        </div>
        <button
          onClick={handleImport}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b2838] text-white text-sm font-medium hover:bg-[#2a475e] disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {t("profile.steamWishlistImport")}
        </button>
      </div>
      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
      {result && (
        <div className="mt-3 flex items-start gap-2 text-sm text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            {t("wishlist.steamImportSuccess", {
              imported: String(result.imported),
              total: String(result.total),
            })}
            {result.failed && result.failed.length > 0 && (
              <span className="text-muted block mt-1">
                {t("wishlist.steamImportUnmatched")}: {result.failed.join(", ")}
              </span>
            )}
          </p>
        </div>
      )}
      <p className="text-xs text-muted mt-3 font-mono truncate">ID: {steamId}</p>
    </div>
  );
}
