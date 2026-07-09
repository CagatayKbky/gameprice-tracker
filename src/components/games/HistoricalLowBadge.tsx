import { Sparkles } from "lucide-react";

interface HistoricalLowBadgeProps {
  compact?: boolean;
}

export function HistoricalLowBadge({ compact }: HistoricalLowBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 ${
        compact
          ? "absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px]"
          : "px-2 py-1 rounded-lg text-xs"
      }`}
    >
      <Sparkles className={compact ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
      {compact ? "Dip" : "Tarihi Dip Fiyat"}
    </span>
  );
}
