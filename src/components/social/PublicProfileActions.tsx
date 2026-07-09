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

  if (relationship === "self") return null;

  if (relationship === "friend") {
    return (
      <button
        onClick={() => void send("/api/social/respond", { action: "remove", otherSessionId: sessionId })}
        disabled={busy}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:text-red-300 hover:border-red-500/30 disabled:opacity-50"
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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm disabled:opacity-50"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        İsteği iptal et
      </button>
    );
  }

  if (relationship === "incoming") {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
        <Check className="w-4 h-4" />
        Gelen istek sosyal sayfada
      </span>
    );
  }

  return (
    <button
      onClick={() => void send("/api/social", { toSessionId: sessionId })}
      disabled={busy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium disabled:opacity-50"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
      Arkadaş ekle
    </button>
  );
}
