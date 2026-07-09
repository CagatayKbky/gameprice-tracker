import { buildGameJsonLd } from "@/lib/seo/game-metadata";
import type { GameDeal } from "@/types";
import { SITE_URL } from "@/lib/seo/constants";

const APP_URL = SITE_URL;

export function buildBreadcrumbJsonLd(game: GameDeal) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: APP_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Oyunlar",
        item: `${APP_URL}/browse`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: game.title,
        item: `${APP_URL}/game/${game.gameId}`,
      },
    ],
  };
}

export function buildGameFaqJsonLd(game: GameDeal) {
  const price = game.cheapestStore?.price;
  const platform = game.cheapestStore?.platformName;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${game.title} en ucuz nerede?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: price
            ? `${game.title} şu an en ucuz ${platform || "mağazada"} $${price.toFixed(2)} fiyatla bulunuyor.`
            : `${game.title} için fiyatlar platformlara göre değişir — GamePrice ile karşılaştırın.`,
        },
      },
      {
        "@type": "Question",
        name: `${game.title} için fiyat alarmı kurulabilir mi?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Evet. GamePrice'ta hedef fiyat belirleyerek indirim olduğunda e-posta, push veya Discord bildirimi alabilirsiniz.",
        },
      },
      {
        "@type": "Question",
        name: `${game.title} tarihi en düşük fiyatı nedir?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: game.historicalLow
            ? `Tarihi en düşük fiyat yaklaşık $${game.historicalLow.toFixed(2)}.`
            : "Fiyat geçmişi verisi toplandıkça tarihi dip fiyat bu sayfada görünecek.",
        },
      },
    ],
  };
}

export function buildAllGameJsonLd(game: GameDeal) {
  return [buildGameJsonLd(game), buildBreadcrumbJsonLd(game), buildGameFaqJsonLd(game)];
}
