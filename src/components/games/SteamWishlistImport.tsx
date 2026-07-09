"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface SteamWishlistImportProps {
  onImported: () => void;
  defaultProfile?: string;
}

export function SteamWishlistImport({ onImported, defaultProfile }: SteamWishlistImportProps) {
  const { t } = useLocale();
  const [profile, setProfile] = useState(defaultProfile || "");
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
        body: JSON.stringify(profile.trim() ? { profile: profile.trim() } : {}),
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
    <div className="rounded-2xl bg-card border border-border p-6 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <Download className="w-5 h-5 text-accent" />
        <h2 className="font-semibold">{t("wishlist.steamImportTitle")}</h2>
      </div>
      <p className="text-sm text-muted mb-4">{t("wishlist.steamImportDesc")}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          placeholder={t("wishlist.steamImportPlaceholder")}
          className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm"
        />
        <button
          onClick={handleImport}
          disabled={loading || (!profile.trim() && !defaultProfile)}
          className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {t("wishlist.importSteam")}
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
    </div>
  );
}
