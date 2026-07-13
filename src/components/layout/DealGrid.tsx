import { cn } from "@/lib/utils";

export const DEAL_GRID_CLASS =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4";

interface DealGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DealGrid({ children, className }: DealGridProps) {
  return <div className={cn(DEAL_GRID_CLASS, className)}>{children}</div>;
}
