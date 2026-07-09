import Image from "next/image";
import { Gamepad2 } from "lucide-react";
import { getEffectDefinition, getFrameDefinition } from "@/lib/profile/cosmetics";

const sizeMap = {
  sm: 56,
  md: 88,
  lg: 112,
  xl: 136,
} as const;

interface ProfileAvatarFrameProps {
  avatarUrl?: string | null;
  displayName: string;
  frameId?: string | null;
  effectId?: string | null;
  size?: keyof typeof sizeMap;
  showSteamBadge?: boolean;
}

export function ProfileAvatarFrame({
  avatarUrl,
  displayName,
  frameId,
  effectId,
  size = "lg",
  showSteamBadge = false,
}: ProfileAvatarFrameProps) {
  const px = sizeMap[size];
  const frame = getFrameDefinition(frameId);
  const effect = getEffectDefinition(effectId);
  const inset = frame.ringWidth;

  return (
    <div className="relative shrink-0" style={{ width: px, height: px }}>
      <div
        className={`absolute inset-0 rounded-full ${frame.ringClass} ${frame.ringSpinClass} motion-reduce:animate-none`}
        aria-hidden
      />
      <div
        className="absolute rounded-full bg-[#0e1419]"
        style={{ inset }}
        aria-hidden
      />
      <div
        className={`absolute rounded-full overflow-hidden ${effect.auraClass} motion-reduce:shadow-none`}
        style={{ inset: inset + 1 }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={px}
            height={px}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-steam">
            <Gamepad2 className="h-1/3 w-1/3 text-[#66c0f4]" />
          </div>
        )}
      </div>
      {showSteamBadge && (
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#66c0f4]/50 bg-steam shadow-lg">
          <Image
            src="https://store.steampowered.com/favicon.ico"
            alt="Steam"
            width={16}
            height={16}
            className="h-4 w-4"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}
