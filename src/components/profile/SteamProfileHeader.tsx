import { ReactNode } from "react";
import { ProfileAvatarFrame } from "@/components/profile/ProfileAvatarFrame";
import { getEffectDefinition, getFrameDefinition } from "@/lib/profile/cosmetics";

interface SteamBadge {
  id: string;
  label: string;
  cls: string;
}

interface SteamProfileHeaderProps {
  displayName: string;
  avatarUrl?: string | null;
  frameId?: string | null;
  effectId?: string | null;
  badges?: SteamBadge[];
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  showSteamBadge?: boolean;
  children?: ReactNode;
}

export function SteamProfileHeader({
  displayName,
  avatarUrl,
  frameId,
  effectId,
  badges = [],
  subtitle,
  meta,
  actions,
  showSteamBadge = false,
  children,
}: SteamProfileHeaderProps) {
  const frame = getFrameDefinition(frameId);
  const effect = getEffectDefinition(effectId);
  const bannerOverlay = [frame.bannerOverlayClass, effect.bannerOverlayClass]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={`mb-6 overflow-hidden rounded-2xl border ${frame.cardClass}`}>
      <div className={`relative h-24 sm:h-32 ${frame.bannerClass}`}>
        {bannerOverlay && (
          <div className={`absolute inset-0 ${bannerOverlay}`} aria-hidden />
        )}
      </div>
      <div className="relative px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="-mt-12 sm:-mt-16 flex flex-col gap-4">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="sm:hidden">
              <ProfileAvatarFrame
                avatarUrl={avatarUrl}
                displayName={displayName}
                frameId={frameId}
                effectId={effectId}
                size="md"
                showSteamBadge={showSteamBadge}
              />
            </div>
            <div className="hidden sm:block">
              <ProfileAvatarFrame
                avatarUrl={avatarUrl}
                displayName={displayName}
                frameId={frameId}
                effectId={effectId}
                size="xl"
                showSteamBadge={showSteamBadge}
              />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="truncate text-xl font-bold text-white sm:text-3xl">{displayName}</h1>
              {subtitle}
              {badges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {badges.slice(0, 5).map((badge) => (
                    <span
                      key={badge.id}
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {meta && <div className="text-sm text-[#acb2b8]">{meta}</div>}

          {actions && (
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-2 sm:flex sm:flex-wrap">{actions}</div>
          )}
        </div>
        {children && <div className="mt-5 sm:mt-6">{children}</div>}
      </div>
    </section>
  );
}
