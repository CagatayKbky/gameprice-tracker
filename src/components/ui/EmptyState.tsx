import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const actionClass =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors";

  return (
    <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-card/50">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-accent" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted max-w-md mx-auto mb-6">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className={actionClass}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className={actionClass}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
