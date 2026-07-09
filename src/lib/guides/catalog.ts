export type GuideSlug =
  | "sale-calendar"
  | "price-alerts"
  | "steam-turkey-prices"
  | "when-to-buy";

export interface GuideEntry {
  slug: GuideSlug;
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  readMinutes: number;
  tagKeys: string[];
}

export const GUIDE_CATALOG: GuideEntry[] = [
  {
    slug: "sale-calendar",
    titleKey: "guides.saleCalendar.cardTitle",
    subtitleKey: "guides.saleCalendar.cardSubtitle",
    descriptionKey: "guides.saleCalendar.cardDesc",
    readMinutes: 4,
    tagKeys: ["guides.tags.steam", "guides.tags.sales"],
  },
  {
    slug: "price-alerts",
    titleKey: "guides.priceAlerts.cardTitle",
    subtitleKey: "guides.priceAlerts.cardSubtitle",
    descriptionKey: "guides.priceAlerts.cardDesc",
    readMinutes: 3,
    tagKeys: ["guides.tags.alerts", "guides.tags.deals"],
  },
  {
    slug: "steam-turkey-prices",
    titleKey: "guides.steamTurkey.cardTitle",
    subtitleKey: "guides.steamTurkey.cardSubtitle",
    descriptionKey: "guides.steamTurkey.cardDesc",
    readMinutes: 5,
    tagKeys: ["guides.tags.steam", "guides.tags.turkey"],
  },
  {
    slug: "when-to-buy",
    titleKey: "guides.whenToBuy.cardTitle",
    subtitleKey: "guides.whenToBuy.cardSubtitle",
    descriptionKey: "guides.whenToBuy.cardDesc",
    readMinutes: 4,
    tagKeys: ["guides.tags.strategy", "guides.tags.deals"],
  },
];

export function getGuide(slug: string) {
  return GUIDE_CATALOG.find((guide) => guide.slug === slug) || null;
}
