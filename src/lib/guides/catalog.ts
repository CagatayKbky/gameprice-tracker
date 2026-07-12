export type GuideSlug =
  | "sale-calendar"
  | "price-alerts"
  | "steam-turkey-prices"
  | "when-to-buy"
  | "epic-free-games"
  | "bundle-guide"
  | "steam-deck-prices"
  | "black-friday-games"
  | "gog-vs-steam"
  | "steam-deck-verified";

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
  {
    slug: "epic-free-games",
    titleKey: "guides.epicFree.cardTitle",
    subtitleKey: "guides.epicFree.cardSubtitle",
    descriptionKey: "guides.epicFree.cardDesc",
    readMinutes: 3,
    tagKeys: ["guides.tags.epic", "guides.tags.deals"],
  },
  {
    slug: "bundle-guide",
    titleKey: "guides.bundles.cardTitle",
    subtitleKey: "guides.bundles.cardSubtitle",
    descriptionKey: "guides.bundles.cardDesc",
    readMinutes: 4,
    tagKeys: ["guides.tags.bundles", "guides.tags.deals"],
  },
  {
    slug: "steam-deck-prices",
    titleKey: "guides.steamDeck.cardTitle",
    subtitleKey: "guides.steamDeck.cardSubtitle",
    descriptionKey: "guides.steamDeck.cardDesc",
    readMinutes: 4,
    tagKeys: ["guides.tags.steam", "guides.tags.strategy"],
  },
  {
    slug: "black-friday-games",
    titleKey: "guides.blackFriday.cardTitle",
    subtitleKey: "guides.blackFriday.cardSubtitle",
    descriptionKey: "guides.blackFriday.cardDesc",
    readMinutes: 5,
    tagKeys: ["guides.tags.sales", "guides.tags.deals"],
  },
  {
    slug: "gog-vs-steam",
    titleKey: "guides.gogVsSteam.cardTitle",
    subtitleKey: "guides.gogVsSteam.cardSubtitle",
    descriptionKey: "guides.gogVsSteam.cardDesc",
    readMinutes: 4,
    tagKeys: ["guides.tags.steam", "guides.tags.strategy"],
  },
  {
    slug: "steam-deck-verified",
    titleKey: "guides.deckVerified.cardTitle",
    subtitleKey: "guides.deckVerified.cardSubtitle",
    descriptionKey: "guides.deckVerified.cardDesc",
    readMinutes: 4,
    tagKeys: ["guides.tags.steam", "guides.tags.strategy"],
  },
];

export function getGuide(slug: string) {
  return GUIDE_CATALOG.find((guide) => guide.slug === slug) || null;
}
