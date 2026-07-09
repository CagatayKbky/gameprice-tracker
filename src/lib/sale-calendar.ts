export interface SaleEvent {
  id: string;
  name: string;
  platform: string;
  typicalMonths: number[];
  description: string;
}

export const SALE_EVENTS: SaleEvent[] = [
  {
    id: "steam-summer",
    name: "Steam Yaz İndirimleri",
    platform: "Steam",
    typicalMonths: [6, 7],
    description: "Yazın en büyük Steam indirimi — genelde Haziran/Temmuz.",
  },
  {
    id: "steam-winter",
    name: "Steam Kış İndirimleri",
    platform: "Steam",
    typicalMonths: [12, 1],
    description: "Yıl sonu mega indirim — Aralık/Ocak.",
  },
  {
    id: "steam-autumn",
    name: "Steam Sonbahar İndirimi",
    platform: "Steam",
    typicalMonths: [11],
    description: "Kasım civarı orta ölçekli Steam indirimi.",
  },
  {
    id: "epic-mega",
    name: "Epic Mega Sale",
    platform: "Epic",
    typicalMonths: [5, 6],
    description: "Epic Games Store büyük yaz indirimi + ücretsiz oyunlar.",
  },
  {
    id: "ps-days-of-play",
    name: "PlayStation Days of Play",
    platform: "PlayStation",
    typicalMonths: [5, 6],
    description: "PS Store yaz indirimleri.",
  },
  {
    id: "xbox-black-friday",
    name: "Xbox Black Friday",
    platform: "Xbox",
    typicalMonths: [11],
    description: "Kasım Black Friday Xbox indirimleri.",
  },
];

export function getUpcomingSales(month = new Date().getMonth() + 1) {
  return SALE_EVENTS.filter((e) =>
    e.typicalMonths.some((m) => {
      const diff = (m - month + 12) % 12;
      return diff <= 2;
    })
  );
}
