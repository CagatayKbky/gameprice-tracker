"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function ShareProfileButton({
  slug,
  displayName,
}: {
  slug: string;
  displayName: string;
}) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${slug}`
      : `https://gameprice.org/u/${slug}`;

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${displayName} — GamePrice`, url });
        return;
      } catch {
        /* fallback */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex items-center justify-center gap-2 w-full min-[400px]:w-auto px-3 sm:px-4 py-2 rounded-xl border border-border text-xs sm:text-sm hover:border-accent/30"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      {copied ? t("referral.copied") : t("profile.share")}
    </button>
  );
}
