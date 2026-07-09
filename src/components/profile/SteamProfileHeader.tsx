import { ReactNode } from "react";
import { ProfileAvatarFrame } from "@/components/profile/ProfileAvatarFrame";
import { getFrameDefinition } from "@/lib/profile/cosmetics";

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

  return (
    <section className={`overflow-hidden rounded-2xl border ${frame.cardClass}`}>
      <div className={`h-28 sm:h-32 ${frame.bannerClass}`} />
      <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="-mt-14 sm:-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <ProfileAvatarFrame
              avatarUrl={avatarUrl}
              displayName={displayName}
              frameId={frameId}
              effectId={effectId}
              size="xl"
              showSteamBadge={showSteamBadge}
            />
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">{displayName}</h1>
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
              {meta && <div className="mt-3 text-sm text-[#acb2b8]">{meta}</div>}
            </div>
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
