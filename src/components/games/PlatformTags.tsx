import { PlatformBadge } from "./PlatformBadge";

interface PlatformTagsProps {
  platformIds?: string[];
  max?: number;
}

export function PlatformTags({ platformIds, max = 4 }: PlatformTagsProps) {
  if (!platformIds?.length) return null;

  const shown = platformIds.slice(0, max);
  const remaining = platformIds.length - max;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {shown.map((id) => (
        <PlatformBadge key={id} platformId={id} size="sm" showName={false} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted self-center">+{remaining}</span>
      )}
    </div>
  );
}
