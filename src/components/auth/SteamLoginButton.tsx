"use client";

import { LogIn, Loader2 } from "lucide-react";
import { useState } from "react";

interface SteamLoginButtonProps {
  connected?: boolean;
  steamPersona?: string | null;
}

export function SteamLoginButton({ connected, steamPersona }: SteamLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  if (connected) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <span>Steam: {steamPersona || "Bağlı"}</span>
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
      Steam ile Giriş
    </a>
  );
}
