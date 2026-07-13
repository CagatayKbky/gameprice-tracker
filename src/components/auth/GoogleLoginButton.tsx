"use client";

import { LogIn, Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { openNativeAuth } from "@/lib/capacitor/native";

interface GoogleLoginButtonProps {
  connected?: boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
  showDisconnect?: boolean;
  onDisconnect?: () => void | Promise<void>;
}

export function GoogleLoginButton({
  connected,
  displayName,
  avatarUrl,
  showDisconnect,
  onDisconnect,
}: GoogleLoginButtonProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  if (connected) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 text-sm text-emerald-400">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : null}
          <span>{displayName || t("auth.googleConnected")}</span>
        </div>
        {showDisconnect && onDisconnect && (
          <button
            type="button"
            disabled={disconnecting}
            onClick={async () => {
              if (!confirm(t("auth.google.disconnectConfirm"))) return;
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
            {t("auth.google.disconnect")}
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setLoading(true);
        void openNativeAuth("/api/auth/google");
      }}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-800 text-sm font-medium hover:bg-gray-100 transition-colors border border-border"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
      {t("auth.googleLogin")}
    </button>
  );
}
