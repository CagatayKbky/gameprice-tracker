"use client";

import { useState } from "react";
import { Check, Loader2, UserMinus, UserPlus, X } from "lucide-react";

type Relationship = "self" | "friend" | "incoming" | "outgoing" | "none";

export function PublicProfileActions({
  relationship,
  sessionId,
}: {
  relationship: Relationship;
  sessionId: string;
}) {
  const [busy, setBusy] = useState(false);

  const send = async (path: string, body: Record<string, unknown>) => {
    setBusy(true);
    try {
      await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      window.location.reload();
    } finally {
      setBusy(false);
    }
  };

  const btnClass =
    "inline-flex items-center justify-center gap-2 w-full min-[400px]:w-auto px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm text-center disabled:opacity-50";

  if (relationship === "self") return null;

  if (relationship === "friend") {
    return (
      <button
        onClick={() => void send("/api/social/respond", { action: "remove", otherSessionId: sessionId })}
        disabled={busy}
        className={`${btnClass} border border-border hover:text-red-300 hover:border-red-500/30`}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
        Arkadaşı kaldır
      </button>
    );
  }

  if (relationship === "outgoing") {
    return (
      <button
        onClick={() => void send("/api/social/respond", { action: "remove", otherSessionId: sessionId })}
        disabled={busy}
        className={`${btnClass} border border-border`}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        İsteği iptal et
      </button>
    );
  }

  if (relationship === "incoming") {
    return (
      <span className={`${btnClass} bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 break-words`}>
        <Check className="w-4 h-4 shrink-0" />
        Gelen istek sosyal sayfada
      </span>
    );
  }

  return (
    <button
      onClick={() => void send("/api/social", { toSessionId: sessionId })}
      disabled={busy}
      className={`${btnClass} bg-accent text-white font-medium`}
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
      Arkadaş ekle
    </button>
  );
}
