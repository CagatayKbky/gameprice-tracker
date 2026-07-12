"use client";

import { LogIn, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface GoogleLoginButtonProps {
  connected?: boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export function GoogleLoginButton({
  connected,
  displayName,
  avatarUrl,
}: GoogleLoginButtonProps) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);

  if (connected) {
    return (
      <div className="flex items-center gap-3 text-sm text-emerald-400">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : null}
        <span>{displayName || t("auth.googleConnected")}</span>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/google"
      onClick={() => setLoading(true)}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-800 text-sm font-medium hover:bg-gray-100 transition-colors border border-border"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
      {t("auth.googleLogin")}
    </a>
  );
}
