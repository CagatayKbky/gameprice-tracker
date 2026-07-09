import { isLikelyDlc, isCompleteEdition } from "@/lib/game-utils";
import { cn } from "@/lib/utils";

interface DlcBadgeProps {
  title: string;
  className?: string;
}

export function DlcBadge({ title, className }: DlcBadgeProps) {
  if (isCompleteEdition(title)) {
    return (
      <span
        className={cn(
          "inline-flex text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30",
          className
        )}
      >
        Complete
      </span>
    );
  }

  if (isLikelyDlc(title)) {
    return (
      <span
        className={cn(
          "inline-flex text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30",
          className
        )}
      >
        DLC
      </span>
    );
  }

  return null;
}
