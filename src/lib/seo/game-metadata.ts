import type { Metadata } from "next";
import type { GameDeal } from "@/types";
import { SITE_URL } from "@/lib/seo/constants";

const APP_URL = SITE_URL;

export function buildGameMetadata(game: GameDeal): Metadata {
  const price = game.cheapestStore?.price;
  const discount = game.cheapestStore?.discount;
  const platform = game.cheapestStore?.platformName;

  const priceText =
    price && price > 0
      ? `$${price.toFixed(2)}${discount ? ` (%${discount} indirim)` : ""}`
      : "fiyat karşılaştırması";

  const description = `${game.title} — Steam, Epic, Xbox, PlayStation fiyatları. En ucuz: ${priceText}${platform ? ` (${platform})` : ""}. İndirim geçmişi ve fiyat alarmı.`;

  const title = `${game.title} Fiyat Karşılaştırması`;
  const gameUrl = `${APP_URL}/game/${game.gameId}`;
  const imageUrl = game.imageUrl?.startsWith("http")
    ? game.imageUrl
    : game.imageUrl
      ? `${APP_URL}${game.imageUrl}`
      : `${APP_URL}/icon-512.png`;

  return {
    title,
    description,
    keywords: [
      game.title,
      `${game.title} fiyat`,
      `${game.title} indirim`,
      "steam fiyat",
      "oyun fiyat karşılaştırma",
    ],
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "GamePrice",
      title,
      description,
      url: gameUrl,
      images: [{ url: imageUrl, width: 460, height: 215, alt: game.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: gameUrl,
    },
  };
}

export function buildGameJsonLd(game: GameDeal) {
  const price = game.cheapestStore?.price;
  const gameUrl = `${APP_URL}/game/${game.gameId}`;
  const imageUrl = gameImageUrl(game);

  const offers =
    price && price > 0
      ? {
          "@type": "Offer",
          price: price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: game.cheapestStore?.dealUrl || gameUrl,
          seller: {
            "@type": "Organization",
            name: game.cheapestStore?.platformName || "GamePrice",
          },
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: `${game.title} için çoklu platform fiyat karşılaştırması ve indirim takibi.`,
    image: imageUrl,
    url: gameUrl,
    ...(offers ? { offers } : {}),
    publisher: {
      "@type": "Organization",
      name: "GamePrice",
      url: APP_URL,
    },
  };
}

function gameImageUrl(game: GameDeal) {
  return game.imageUrl?.startsWith("http")
    ? game.imageUrl
    : game.imageUrl
      ? `${APP_URL}${game.imageUrl}`
      : `${APP_URL}/icon-512.png`;
}
