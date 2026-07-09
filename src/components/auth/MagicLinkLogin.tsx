"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function MagicLinkLogin() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    setSent(false);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-muted" />
        <h2 className="font-semibold">{t("auth.magicLink.title")}</h2>
      </div>
      <p className="text-sm text-muted">{t("auth.magicLink.subtitle")}</p>

      {sent ? (
        <p className="text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {t("auth.magicLink.sent")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.magicLink.emailPlaceholder")}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-accent focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={sending || !email}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("auth.magicLink.sending")}
              </>
            ) : (
              t("auth.magicLink.send")
            )}
          </button>
        </form>
      )}

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {t("auth.magicLink.error")}
        </p>
      )}
    </div>
  );
}
