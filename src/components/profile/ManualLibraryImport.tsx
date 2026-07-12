"use client";

import { useRef, useState } from "react";
import { FileJson, Loader2, RefreshCw, Upload } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

type ManualPlatform = "epic" | "gog";

export function ManualLibraryImport({
  platform,
  gogConnected,
  onImported,
}: {
  platform: ManualPlatform;
  gogConnected?: boolean;
  onImported: () => void;
}) {
  const { t } = useLocale();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const importContent = async (content: string) => {
    if (!content.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/library/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, content }),
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

  const syncGog = async () => {
    setSyncing(true);
    setMessage("");
    try {
      const res = await fetch("/api/library/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error("failed");
      setMessage(t("library.manual.synced", { count: String(data.imported) }));
      onImported();
    } catch {
      setMessage(t("library.manual.syncError"));
    } finally {
      setSyncing(false);
    }
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      void importContent(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-xl border border-dashed border-border p-4 mb-6">
      <h3 className="text-sm font-semibold mb-1">{t(`library.manual.${platform}Title`)}</h3>
      <p className="text-xs text-muted mb-3">{t("library.manual.importHint")}</p>

      {platform === "gog" && (
        <div className="flex flex-wrap gap-2 mb-3">
          <a
            href="/api/auth/gog"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#86328a] text-white text-xs font-medium"
          >
            {gogConnected ? t("library.manual.gogReconnect") : t("library.manual.gogConnect")}
          </a>
          {gogConnected && (
            <button
              type="button"
              onClick={() => void syncGog()}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-medium disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {t("library.manual.syncNow")}
            </button>
          )}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder={t("library.manual.placeholder")}
        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm mb-3"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void importContent(text)}
          disabled={loading || !text.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {t("library.manual.import")}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium disabled:opacity-50"
        >
          <FileJson className="w-4 h-4" />
          {t("library.manual.importFile")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,.txt,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {message && <p className="text-xs text-emerald-400 mt-2">{message}</p>}
    </div>
  );
}
