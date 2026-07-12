"use client";

import { LogIn, Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface SteamLoginButtonProps {
  connected?: boolean;
  steamPersona?: string | null;
  showDisconnect?: boolean;
  onDisconnect?: () => void | Promise<void>;
}

export function SteamLoginButton({
  connected,
  steamPersona,
  showDisconnect,
  onDisconnect,
}: SteamLoginButtonProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  if (connected) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <span>{t("auth.steam.connected", { persona: steamPersona || t("auth.steam.connectedFallback") })}</span>
        </div>
        {showDisconnect && onDisconnect && (
          <button
            type="button"
            disabled={disconnecting}
            onClick={async () => {
              if (!confirm(t("profile.steamDisconnectConfirm"))) return;
              setDisconnecting(true);
              try {
                await onDisconnect();
              } finally {
                setDisconnecting(false);
              }
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-400/30 text-sm text-red-300 hover:border-red-400/50 disabled:opacity-50"
          >
            {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            {t("profile.steamDisconnect")}
          </button>
        )}
      </div>
    );
  }

  return (
    <a
      href="/api/auth/steam"
      onClick={() => setLoading(true)}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b2838] text-white text-sm font-medium hover:bg-[#2a475e] transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
      {t("auth.steam.login")}
    </a>
  );
}
