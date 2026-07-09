"use client";

import { useState } from "react";
import { FileText, Loader2, CheckCircle2 } from "lucide-react";

interface BulkWishlistImportProps {
  onImported: () => void;
}

export function BulkWishlistImport({ onImported }: BulkWishlistImportProps) {
  const [games, setGames] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    imported: number;
    total: number;
    failed?: string[];
  } | null>(null);
  const [error, setError] = useState("");

  const handleImport = async () => {
    if (!games.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/wishlist/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ games: games.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Import başarısız");
        return;
      }
      setResult(data);
      onImported();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-accent" />
        <h2 className="font-semibold">Epic / GOG / Manuel Import</h2>
      </div>
      <p className="text-sm text-muted mb-4">
        Oyun adlarını satır satır yapıştırın. Epic ve GOG&apos;un resmi API&apos;si olmadığı
        için isim eşleştirmesi ile içe aktarılır.
      </p>
      <textarea
        value={games}
        onChange={(e) => setGames(e.target.value)}
        placeholder={"Cyberpunk 2077\nElden Ring\nBaldur's Gate 3"}
        rows={5}
        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm resize-y mb-3"
      />
      <button
        onClick={handleImport}
        disabled={loading || !games.trim()}
        className="px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        Listeyi İçe Aktar
      </button>
      {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
      {result && (
        <div className="mt-3 flex items-start gap-2 text-sm text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            {result.imported}/{result.total} oyun içe aktarıldı.
            {result.failed && result.failed.length > 0 && (
              <span className="text-muted block mt-1">
                Eşleşmeyen: {result.failed.join(", ")}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
