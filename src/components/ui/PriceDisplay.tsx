"use client";

import { useCurrency } from "@/components/providers/CurrencyProvider";

export function PriceDisplay({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  const { format } = useCurrency();
  return <span className={className}>{format(amount)}</span>;
}
