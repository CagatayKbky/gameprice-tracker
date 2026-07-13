import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeSectionHeaderProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}

export function HomeSectionHeader({
  icon: Icon,
  iconClassName,
  title,
  subtitle,
  href,
  linkLabel,
  className,
}: HomeSectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 mb-6", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className={cn("w-5 h-5 text-accent", iconClassName)} />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-muted mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="text-sm text-accent hover:underline flex items-center gap-1 shrink-0 font-medium"
        >
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
