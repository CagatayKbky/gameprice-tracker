import { SALE_EVENTS, getUpcomingSales } from "@/lib/sale-calendar";
import { Calendar } from "lucide-react";

export function SaleCalendarGlobal() {
  const upcoming = getUpcomingSales();
  const month = new Date().getMonth() + 1;

  return (
    <section className="rounded-2xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold">İndirim Takvimi</h2>
      </div>
      <p className="text-sm text-muted mb-4">
        Büyük platform indirimlerinin tipik dönemleri — kesin tarihler platform duyurularına bağlıdır.
      </p>
      <div className="space-y-3">
        {(upcoming.length > 0 ? upcoming : SALE_EVENTS.slice(0, 4)).map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border"
          >
            <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
            <div>
              <p className="font-medium text-sm">{event.name}</p>
              <p className="text-xs text-muted">{event.platform}</p>
              <p className="text-xs text-muted mt-1">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted mt-4">
        Şu anki ay: {month}. Yaklaşan veya bu dönemdeki etkinlikler öne çıkarılır.
      </p>
    </section>
  );
}
