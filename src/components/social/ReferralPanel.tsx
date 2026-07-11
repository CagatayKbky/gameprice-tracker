"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Gift } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function ReferralPanel() {
  const { t } = useLocale();
  const [link, setLink] = useState("");
  const [code, setCode] = useState("");
  const [count, setCount] = useState(0);
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((data) => {
        setLink(data.link || "");
        setCode(data.code || "");
        setCount(data.count || 0);
      })
      .catch(() => {});
  }, []);

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const apply = async () => {
    setMessage("");
    const res = await fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply", code: inputCode }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(t("referral.applied", { name: data.referrerName || "" }));
    } else {
      setMessage(t("referral.error.invalid"));
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-accent" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold">{t("referral.title")}</h2>
          <p className="text-sm text-muted mt-1">{t("referral.subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          readOnly
          value={link}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-background border border-border text-sm truncate"
        />
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium shrink-0"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t("referral.copied") : t("referral.copy")}
        </button>
      </div>

      <p className="text-xs text-muted mb-4">
        {t("referral.stats", { code, count: String(count) })}
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase())}
          placeholder={t("referral.placeholder")}
          className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-background border border-border text-sm uppercase"
        />
        <button
          type="button"
          onClick={() => void apply()}
          disabled={!inputCode.trim()}
          className="px-4 py-2.5 rounded-xl border border-border text-sm hover:border-accent/30 disabled:opacity-50 shrink-0"
        >
          {t("referral.apply")}
        </button>
      </div>
      {message && <p className="text-sm text-accent mt-2">{message}</p>}
    </section>
  );
}
