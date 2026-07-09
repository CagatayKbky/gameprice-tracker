"use client";

import { DiscountEvent } from "@/types";

const MONTHS = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

interface PriceCalendarProps {
  events: DiscountEvent[];
}

export function PriceCalendar({ events }: PriceCalendarProps) {
  const monthCounts = new Array(12).fill(0) as number[];

  for (const event of events) {
    const month = new Date(event.date).getMonth();
    if (!Number.isNaN(month)) monthCounts[month] += 1;
  }

  const max = Math.max(...monthCounts, 1);
  const bestMonth = monthCounts.indexOf(Math.max(...monthCounts));
  const hasData = events.length > 0;

  if (!hasData) {
    return (
      <p className="text-sm text-muted">
        Henüz yeterli indirim geçmişi yok. Veri biriktikçe takvim dolacak.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted mb-4">
        Geçmiş indirimlere göre en aktif ay:{" "}
        <span className="text-accent font-medium">{MONTHS[bestMonth]}</span>
      </p>
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
        {monthCounts.map((count, index) => (
          <div key={MONTHS[index]} className="text-center">
            <div className="h-20 flex items-end justify-center mb-1">
              <div
                className="w-full max-w-8 rounded-t-md bg-accent/80 transition-all"
                style={{ height: `${Math.max(8, (count / max) * 100)}%` }}
                title={`${count} indirim`}
              />
            </div>
            <span className="text-[10px] text-muted">{MONTHS[index]}</span>
            {count > 0 && (
              <span className="block text-[10px] text-accent font-medium">{count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
