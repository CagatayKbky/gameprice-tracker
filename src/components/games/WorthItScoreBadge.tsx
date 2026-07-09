import { cn } from "@/lib/utils";
import { worthItLabel } from "@/lib/worth-it-score";

interface WorthItScoreBadgeProps {
  score: number;
  compact?: boolean;
  className?: string;
}

const styles = {
  great: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  good: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  wait: "bg-orange-500/20 text-orange-300 border-orange-500/40",
};

export function WorthItScoreBadge({ score, compact, className }: WorthItScoreBadgeProps) {
  const label = worthItLabel(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-bold border",
        styles[label],
        compact ? "px-1.5 py-0.5 rounded text-[10px]" : "px-2 py-1 rounded-lg text-xs",
        className
      )}
    >
      {compact ? score : `Değer: ${score}/100`}
    </span>
  );
}
