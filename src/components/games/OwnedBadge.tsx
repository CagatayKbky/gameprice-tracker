interface OwnedBadgeProps {
  compact?: boolean;
}

export function OwnedBadge({ compact }: OwnedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-bold bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 ${
        compact
          ? "absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px]"
          : "px-2 py-1 rounded-lg text-xs"
      }`}
    >
      {compact ? "Sahip" : "Kütüphanende"}
    </span>
  );
}
