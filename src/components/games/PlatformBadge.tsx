import { getPlatformById } from "@/lib/platforms";
import { cn } from "@/lib/utils";

interface PlatformBadgeProps {
  platformId: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
}

const platformIcons: Record<string, string> = {
  steam: "🎮",
  epic: "🎯",
  gog: "🌟",
  ea: "🔴",
  ubisoft: "🔵",
  battlenet: "⚔️",
  humble: "🎁",
  greenmangaming: "🟢",
  gamersgate: "🎲",
  ps5: "🎮",
  ps4: "🎮",
  "xbox-series": "🟩",
  "xbox-one": "🟩",
  switch: "🔴",
  gamepass: "🟩",
  psplus: "🔵",
};

export function PlatformBadge({
  platformId,
  size = "md",
  showName = true,
}: PlatformBadgeProps) {
  const platform = getPlatformById(platformId);
  if (!platform) return null;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizeClasses[size]
      )}
      style={{
        backgroundColor: `${platform.color}30`,
        color: platform.color === "#2f2f2f" ? "#ccc" : platform.color,
        border: `1px solid ${platform.color}50`,
      }}
    >
      <span>{platformIcons[platformId] || "🎮"}</span>
      {showName && <span>{platform.shortName}</span>}
    </span>
  );
}
