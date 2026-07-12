"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

type ManualPlatform = "epic" | "gog";

export function ManualLibraryImport({
  platform,
  onImported,
}: {
  platform: ManualPlatform;
  onImported: () => void;
}) {
  const { t } = useLocale();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const importGames = async () => {
    const titles = text.split("\n").map((line) => line.trim()).filter(Boolean);
    if (titles.length === 0) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/library/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, titles }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("failed");
      setMessage(t("library.manual.imported", { count: String(data.imported) }));
      setText("");
      onImported();
    } catch {
      setMessage(t("library.manual.importError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-border p-4 mb-6">
      <h3 className="text-sm font-semibold mb-1">{t(`library.manual.${platform}Title`)}</h3>
      <p className="text-xs text-muted mb-3">{t("library.manual.importHint")}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={t("library.manual.placeholder")}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm mb-3"
      />
      <button
        type="button"
        onClick={() => void importGames()}
        disabled={loading || !text.trim()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {t("library.manual.import")}
      </button>
      {message && <p className="text-xs text-emerald-400 mt-2">{message}</p>}
    </div>
  );
}
