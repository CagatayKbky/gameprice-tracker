"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const { t } = useLocale();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("gp-pwa-dismissed")) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || dismissed) return null;

  const install = async () => {
    await deferred.prompt();
    setDeferred(null);
    localStorage.setItem("gp-pwa-dismissed", "1");
  };

  const dismiss = () => {
    setDismissed(true);
    setDeferred(null);
    localStorage.setItem("gp-pwa-dismissed", "1");
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 rounded-2xl bg-card border border-border shadow-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{t("install.title")}</p>
          <p className="text-xs text-muted mt-1">{t("install.subtitle")}</p>
          <button
            onClick={install}
            className="mt-3 px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover"
          >
            {t("install.button")}
          </button>
        </div>
        <button onClick={dismiss} className="text-muted hover:text-foreground p-1" aria-label={t("common.close")}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
