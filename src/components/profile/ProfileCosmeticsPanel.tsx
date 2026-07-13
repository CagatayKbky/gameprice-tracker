"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Loader2, Lock, Medal, Sparkles } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ProfileAvatarFrame } from "@/components/profile/ProfileAvatarFrame";
import { getEffectDefinition, getFrameDefinition } from "@/lib/profile/cosmetics";
import { cosmeticI18nKey } from "@/lib/profile/cosmetic-labels";

function translatedCosmetic(
  t: (key: string) => string,
  type: "frame" | "effect",
  id: string,
  fallbackLabel: string,
  fallbackDescription: string
) {
  const labelKey = cosmeticI18nKey(type, id, "label");
  const descKey = cosmeticI18nKey(type, id, "description");
  const label = t(labelKey);
  const description = t(descKey);
  return {
    label: label === labelKey ? fallbackLabel : label,
    description: description === descKey ? fallbackDescription : description,
  };
}

interface CosmeticItem {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  proOnly?: boolean;
}

interface BadgeItem {
  id: string;
  label: string;
  toneClass: string;
  description: string;
  unlockHint: string;
  unlocked: boolean;
  kind: "status" | "cosmetic";
}

interface CosmeticsPanelProps {
  frames: CosmeticItem[];
  effects: CosmeticItem[];
  badgeCatalog?: {
    statusBadges: BadgeItem[];
    cosmeticBadges: BadgeItem[];
  };
  equipped: {
    frame: string;
    effect: string;
  };
  isPro: boolean;
  avatarUrl?: string | null;
  displayName: string;
  onUpdated: () => Promise<void> | void;
}

function FrameSwatch({ frameId }: { frameId: string }) {
  const frame = getFrameDefinition(frameId);
  return (
    <div
      className={`h-10 w-10 shrink-0 rounded-full p-[3px] ${frame.ringClass} ${frame.ringSpinClass} motion-reduce:animate-none`}
    >
      <div className="h-full w-full rounded-full bg-[#0e1419]" />
    </div>
  );
}

function EffectSwatch({ effectId }: { effectId: string }) {
  const effect = getEffectDefinition(effectId);
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2a475e] bg-[#1b2838] text-[#66c0f4] ${effect.auraClass}`}
    >
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

export function ProfileCosmeticsPanel({
  frames,
  effects,
  badgeCatalog,
  equipped,
  isPro,
  avatarUrl,
  displayName,
  onUpdated,
}: CosmeticsPanelProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"frame" | "effect" | "badge">("frame");
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [previewFrame, setPreviewFrame] = useState(equipped.frame);
  const [previewEffect, setPreviewEffect] = useState(equipped.effect);

  useEffect(() => {
    setPreviewFrame(equipped.frame);
    setPreviewEffect(equipped.effect);
  }, [equipped.frame, equipped.effect]);

  const equip = async (type: "frame" | "effect", key: string) => {
    setBusy(`${type}:${key}`);
    setSaved(false);
    try {
      const res = await fetch("/api/profile/cosmetics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "equip_failed");
      if (type === "frame") setPreviewFrame(key);
      if (type === "effect") setPreviewEffect(key);
      await onUpdated();
      setSaved(true);
    } finally {
      setBusy(null);
    }
  };

  const badgeItems = badgeCatalog
    ? [...badgeCatalog.statusBadges, ...badgeCatalog.cosmeticBadges]
    : [];
  const items = tab === "frame" ? frames : tab === "effect" ? effects : [];
  const activeId = tab === "frame" ? equipped.frame : tab === "effect" ? equipped.effect : "";

  const previewItem = (itemId: string) => {
    if (tab === "frame") setPreviewFrame(itemId);
    else if (tab === "effect") setPreviewEffect(itemId);
  };

  const resetPreview = () => {
    setPreviewFrame(equipped.frame);
    setPreviewEffect(equipped.effect);
  };

  return (
    <section className="mb-6 sm:mb-8 overflow-hidden rounded-2xl border border-[#2a475e]/50 bg-[#0e1419]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-[#1b2838]/40 transition-colors sm:gap-4 sm:px-5"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b2838] border border-[#2a475e]/60">
            <Sparkles className="h-4 w-4 text-[#66c0f4]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-white">{t("profileCosmetics.title")}</h2>
            <p className="text-xs text-[#8f98a0] truncate">
              {translatedCosmetic(t, "frame", equipped.frame, getFrameDefinition(equipped.frame).label, "").label}
              {" · "}
              {translatedCosmetic(t, "effect", equipped.effect, getEffectDefinition(equipped.effect).label, "").label}
            </p>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-[#8f98a0] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-[#2a475e]/40 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6">
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#2a475e]/40 bg-[#1b2838]/50 py-5 sm:py-6">
              <ProfileAvatarFrame
                avatarUrl={avatarUrl}
                displayName={displayName}
                frameId={previewFrame}
                effectId={previewEffect}
                size="lg"
              />
              <p className="mt-4 text-xs text-[#8f98a0]">{t("profileCosmetics.preview")}</p>
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex gap-1 rounded-lg bg-[#1b2838] p-1">
                {(["frame", "effect", "badge"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`flex-1 rounded-md px-1.5 py-2 text-[10px] font-medium transition-colors truncate sm:px-3 sm:text-sm ${
                      tab === key
                        ? "bg-[#2a475e] text-white"
                        : "text-[#8f98a0] hover:text-white"
                    }`}
                  >
                    {key === "frame"
                      ? t("profileCosmetics.frames")
                      : key === "effect"
                        ? t("profileCosmetics.effects")
                        : t("profileCosmetics.badges")}
                  </button>
                ))}
              </div>

              {tab === "badge" ? (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {badgeItems.map((badge) => (
                    <div
                      key={badge.id}
                      className={`rounded-xl border px-3 py-3 ${
                        badge.unlocked
                          ? "border-[#66c0f4]/30 bg-[#2a475e]/30"
                          : "border-[#2a475e]/40 bg-[#1b2838]/40 opacity-80"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-flex shrink-0 items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.toneClass}`}
                        >
                          {badge.label}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white">{badge.description}</p>
                          <p className="mt-1 text-xs text-[#8f98a0]">
                            {badge.unlocked ? t("profileCosmetics.badgeUnlocked") : badge.unlockHint}
                          </p>
                        </div>
                        {badge.unlocked ? (
                          <Check className="h-4 w-4 shrink-0 text-[#66c0f4]" />
                        ) : (
                          <Lock className="h-4 w-4 shrink-0 text-amber-400/80" />
                        )}
                      </div>
                    </div>
                  ))}
                  <p className="flex items-start gap-2 rounded-lg bg-[#1b2838]/60 px-3 py-2 text-xs text-[#8f98a0]">
                    <Medal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#66c0f4]" />
                    {t("profileCosmetics.badgeHelp")}
                  </p>
                </div>
              ) : (
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                {items.map((item) => {
                  const locked = !item.unlocked;
                  const activeNow = activeId === item.id;
                  const isBusy = busy === `${tab}:${item.id}`;
                  const text = translatedCosmetic(
                    t,
                    tab as "frame" | "effect",
                    item.id,
                    item.label,
                    item.description
                  );

                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={locked || busy !== null}
                      onMouseEnter={() => previewItem(item.id)}
                      onMouseLeave={resetPreview}
                      onTouchStart={() => previewItem(item.id)}
                      onTouchEnd={resetPreview}
                      onClick={() => void equip(tab, item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        activeNow
                          ? "bg-[#2a475e]/70 ring-1 ring-[#66c0f4]/40"
                          : locked
                            ? "opacity-55"
                            : "hover:bg-[#1b2838]"
                      }`}
                    >
                      {tab === "frame" ? (
                        <FrameSwatch frameId={item.id} />
                      ) : (
                        <EffectSwatch effectId={item.id} />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{text.label}</p>
                        <p className="text-xs text-[#8f98a0] truncate">{text.description}</p>
                      </div>
                      <div className="shrink-0">
                        {isBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#66c0f4]" />
                        ) : locked ? (
                          <Lock className="h-4 w-4 text-amber-400/80" />
                        ) : activeNow ? (
                          <Check className="h-4 w-4 text-[#66c0f4]" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              )}

              {tab !== "badge" && !isPro && (
                <p className="mt-3 text-xs text-[#8f98a0]">
                  <Link href="/pricing" className="text-[#66c0f4] hover:underline">
                    {t("profileCosmetics.upgrade")}
                  </Link>
                </p>
              )}
              {saved && (
                <p className="mt-2 text-xs text-emerald-400">{t("profileCosmetics.saved")}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
