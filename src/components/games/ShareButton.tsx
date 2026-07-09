"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  gameId: string;
}

export function ShareButton({ title, gameId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/game/${gameId}`
        : `/game/${gameId}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} — GamePrice`, url });
        return;
      }
    } catch {
      // user cancelled or share failed
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-card-hover transition-colors text-sm font-medium"
      title="Paylaş veya link kopyala"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" />
          Kopyalandı
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Paylaş
        </>
      )}
    </button>
  );
}
