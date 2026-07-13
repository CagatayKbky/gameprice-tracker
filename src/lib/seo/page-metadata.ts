import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo/constants";
import type { Locale } from "@/lib/i18n/translations";

type PageSeoKey =
  | "home"
  | "deals"
  | "browse"
  | "search"
  | "platforms"
  | "bundles"
  | "compare"
  | "pricing"
  | "about"
  | "download"
  | "privacy"
  | "saleCalendar"
  | "guidesHub"
  | "priceAlertsGuide"
  | "steamTurkeyGuide"
  | "whenToBuyGuide"
  | "epicFreeGuide"
  | "bundleGuide"
  | "steamDeckGuide"
  | "blackFridayGuide"
  | "gogVsSteamGuide"
  | "deckVerifiedGuide";

const SEO_COPY: Record<Locale, Record<PageSeoKey, { title: string; description: string; keywords: string[] }>> = {
  tr: {
    home: {
      title: "GamePrice — Oyun Fiyat Takip ve İndirim Karşılaştırma",
      description:
        "135.000+ oyun için Steam, Epic, Xbox ve PlayStation fiyat karşılaştırması. İndirim takibi, fiyat alarmı, istek listesi ve Türkiye Steam fiyatları.",
      keywords: [
        "oyun fiyat",
        "steam indirim",
        "oyun fiyat karşılaştırma",
        "epic games indirim",
        "türkiye steam fiyat",
        "oyun indirim takip",
      ],
    },
    deals: {
      title: "Oyun İndirimleri ve Fırsatlar",
      description:
        "Steam, Epic, GOG ve diğer mağazalardaki en iyi oyun indirimleri. Ücretsiz oyunlar, tarihsel dip fiyatlar ve mega indirimler.",
      keywords: ["oyun indirim", "steam sale", "ücretsiz oyun", "oyun fırsatları"],
    },
    browse: {
      title: "Oyun Kataloğu — Tüm Oyunlar",
      description:
        "135.000+ oyuna göz at. Platform, harf ve kategoriye göre filtrele; fiyat geçmişi ve indirimleri karşılaştır.",
      keywords: ["oyun kataloğu", "steam oyun listesi", "tüm oyunlar"],
    },
    search: {
      title: "Oyun Ara — Fiyat ve İndirim Karşılaştır",
      description:
        "Oyun adıyla ara; Steam, Epic, Xbox ve PlayStation fiyatlarını tek ekranda karşılaştır.",
      keywords: ["oyun ara", "steam fiyat ara", "oyun karşılaştır"],
    },
    platforms: {
      title: "Oyun Platformları ve Mağazalar",
      description:
        "Steam, Epic Games, GOG, Xbox, PlayStation ve daha fazlası. Platform bazlı fiyat takibi.",
      keywords: ["steam", "epic games", "gog", "xbox", "playstation", "oyun platformları"],
    },
    bundles: {
      title: "Oyun Bundle ve Paket İndirimleri",
      description: "Humble Bundle ve diğer oyun paketlerindeki indirimleri keşfet.",
      keywords: ["oyun bundle", "humble bundle", "oyun paketi indirim"],
    },
    compare: {
      title: "Oyun Fiyat Karşılaştırma",
      description: "Birden fazla oyunu yan yana karşılaştır; fiyat, indirim ve mağaza bilgilerini gör.",
      keywords: ["oyun karşılaştır", "fiyat kıyaslama"],
    },
    pricing: {
      title: "GamePrice Pro — Sınırsız Alarm ve Hızlı Arama",
      description:
        "Pro ile sınırsız fiyat alarmı, hızlı arama, push bildirimleri ve premium profil kozmetikleri.",
      keywords: ["gameprice pro", "fiyat alarmı pro", "oyun indirim bildirimi"],
    },
    about: {
      title: "GamePrice Hakkında",
      description:
        "GamePrice; oyun fiyatlarını takip etmen, indirimleri yakalaman ve en ucuz mağazayı bulman için yapıldı.",
      keywords: ["gameprice", "oyun fiyat takip sitesi"],
    },
    download: {
      title: "GamePrice Android Uygulaması İndir",
      description:
        "GamePrice Android APK indir. Oyun fiyat takibi, indirim alarmları ve istek listesi — mobilde her zaman güncel.",
      keywords: ["gameprice apk", "oyun fiyat uygulaması", "android oyun indirim"],
    },
    privacy: {
      title: "Gizlilik Politikası — GamePrice",
      description:
        "GamePrice gizlilik politikası: hangi verileri topluyoruz, çerezler, Steam/Google girişi ve haklarınız.",
      keywords: ["gameprice gizlilik", "çerez politikası", "kvkk"],
    },
    saleCalendar: {
      title: "Steam ve Oyun İndirim Takvimi 2026",
      description:
        "Steam Summer Sale, Black Friday ve büyük oyun indirim dönemlerinin takvimi. Ne zaman indirim beklenir?",
      keywords: ["steam sale takvimi", "black friday oyun", "steam yaz indirimi"],
    },
    guidesHub: {
      title: "Oyun İndirim Rehberleri — GamePrice",
      description:
        "Steam indirim takvimi, fiyat alarmı kurma, Türkiye Steam fiyatları ve ne zaman alınır rehberleri.",
      keywords: ["oyun indirim rehberi", "steam fiyat rehberi", "fiyat alarmı nasıl kurulur"],
    },
    priceAlertsGuide: {
      title: "Fiyat Alarmı Nasıl Kurulur?",
      description:
        "GamePrice ile oyun fiyat alarmı kurma rehberi. Hedef fiyata düşünce e-posta ve bildirim al.",
      keywords: ["fiyat alarmı", "oyun fiyat takip", "steam alarm"],
    },
    steamTurkeyGuide: {
      title: "Türkiye Steam Fiyatları Rehberi 2026",
      description:
        "Türkiye Steam fiyatları, bölgesel farklar ve en ucuz mağazayı bulma rehberi.",
      keywords: ["türkiye steam fiyat", "steam türkiye", "steam tl fiyat"],
    },
    whenToBuyGuide: {
      title: "Oyun Ne Zaman Alınır? Al vs Bekle Rehberi",
      description:
        "Tarihsel dip, indirim dönemleri ve wishlist stratejisi ile oyunu ne zaman alacağını öğren.",
      keywords: ["oyun ne zaman alınır", "steam indirim bekle", "tarihsel dip"],
    },
    epicFreeGuide: {
      title: "Epic Games Ücretsiz Oyunlar Rehberi",
      description: "Epic'teki haftalık ücretsiz oyunları kaçırmama ve bildirim alma rehberi.",
      keywords: ["epic ücretsiz oyun", "epic games free", "ücretsiz oyun"],
    },
    bundleGuide: {
      title: "Oyun Bundle Rehberi — Humble ve Paket İndirimleri",
      description: "Bundle alırken nelere dikkat etmeli, hangi paketler değerli?",
      keywords: ["oyun bundle", "humble bundle rehberi", "oyun paketi"],
    },
    steamDeckGuide: {
      title: "Steam Deck İçin Oyun Fiyatları Rehberi",
      description: "Steam Deck uyumlu oyunları en ucuz nereden alırsın?",
      keywords: ["steam deck fiyat", "steam deck oyun", "deck verified"],
    },
    blackFridayGuide: {
      title: "Black Friday Oyun İndirimleri 2026 Rehberi",
      description:
        "Black Friday ve Kasım indirimlerinde Steam, Epic ve konsol fırsatlarını nasıl yakalarsın?",
      keywords: ["black friday oyun", "black friday steam", "kasım indirimi oyun"],
    },
    gogVsSteamGuide: {
      title: "GOG vs Steam — Hangi Mağazada Alınır?",
      description: "DRM-free GOG ile Steam fiyatlarını karşılaştır; hangi oyunu nereden almalı?",
      keywords: ["gog vs steam", "gog steam karşılaştırma", "drm free oyun"],
    },
    deckVerifiedGuide: {
      title: "Steam Deck Verified Nedir? Rehber 2026",
      description:
        "Verified, Playable ve Unsupported rozetleri ne anlama gelir? Deck için doğru oyunu seç.",
      keywords: ["steam deck verified", "deck playable", "steam deck uyumluluk"],
    },
  },
  en: {
    home: {
      title: "GamePrice — Game Price Tracker & Deal Comparison",
      description:
        "Compare prices across Steam, Epic, Xbox, and PlayStation for 135,000+ games. Deal alerts, wishlists, and price history.",
      keywords: ["game price tracker", "steam deals", "game price comparison", "epic games sale"],
    },
    deals: {
      title: "Game Deals & Discounts",
      description:
        "Best game discounts across Steam, Epic, GOG, and more. Free games, historical lows, and mega sales.",
      keywords: ["game deals", "steam sale", "free games"],
    },
    browse: {
      title: "Game Catalog — Browse All Games",
      description: "Browse 135,000+ games. Filter by platform and letter; compare prices and discounts.",
      keywords: ["game catalog", "browse games", "steam library"],
    },
    search: {
      title: "Search Games — Compare Prices",
      description: "Search by title and compare Steam, Epic, Xbox, and PlayStation prices in one place.",
      keywords: ["search games", "compare game prices"],
    },
    platforms: {
      title: "Game Platforms & Stores",
      description: "Steam, Epic Games, GOG, Xbox, PlayStation, and more — platform-level price tracking.",
      keywords: ["steam", "epic games", "gog", "game stores"],
    },
    bundles: {
      title: "Game Bundle Deals",
      description: "Discover discounts on Humble Bundle and other game bundles.",
      keywords: ["game bundles", "humble bundle deals"],
    },
    compare: {
      title: "Compare Game Prices",
      description: "Compare multiple games side by side — price, discount, and store info.",
      keywords: ["compare games", "price comparison"],
    },
    pricing: {
      title: "GamePrice Pro — Unlimited Alerts & Fast Search",
      description: "Unlimited price alerts, fast search, push notifications, and premium profile cosmetics.",
      keywords: ["gameprice pro", "price alerts"],
    },
    about: {
      title: "About GamePrice",
      description: "GamePrice helps you track game prices, catch deals, and find the cheapest store.",
      keywords: ["gameprice", "game deal tracker"],
    },
    download: {
      title: "Download GamePrice Android App",
      description:
        "Download the GamePrice Android APK. Track game prices, deal alerts, and your wishlist — always up to date on mobile.",
      keywords: ["gameprice apk", "game price app", "android game deals"],
    },
    privacy: {
      title: "Privacy Policy — GamePrice",
      description:
        "GamePrice privacy policy: what data we collect, cookies, Steam/Google sign-in, and your rights.",
      keywords: ["gameprice privacy", "cookie policy", "gdpr"],
    },
    saleCalendar: {
      title: "Steam & Game Sale Calendar 2026",
      description: "Steam Summer Sale, Black Friday, and major gaming sale dates.",
      keywords: ["steam sale calendar", "black friday games"],
    },
    guidesHub: {
      title: "Game Deal Guides — GamePrice",
      description:
        "Steam sale calendar, price alerts, Turkey Steam prices, and when-to-buy guides.",
      keywords: ["game deal guides", "steam price guide", "how to set price alerts"],
    },
    priceAlertsGuide: {
      title: "How to Set Game Price Alerts",
      description: "Step-by-step guide to price alerts on GamePrice with email and push notifications.",
      keywords: ["price alerts", "game price tracker", "steam alert"],
    },
    steamTurkeyGuide: {
      title: "Turkey Steam Prices Guide 2026",
      description: "Regional pricing, TRY Steam prices, and how to find the cheapest store.",
      keywords: ["turkey steam prices", "steam turkey", "steam try price"],
    },
    whenToBuyGuide: {
      title: "When to Buy Games — Buy vs Wait Guide",
      description: "Learn when to buy using historical lows, sale seasons, and wishlist strategy.",
      keywords: ["when to buy games", "wait for steam sale", "historical low"],
    },
    epicFreeGuide: {
      title: "Epic Games Free Games Guide",
      description: "Never miss Epic's weekly free games — alerts and tracking tips.",
      keywords: ["epic free games", "epic games weekly free"],
    },
    bundleGuide: {
      title: "Game Bundle Buying Guide",
      description: "How to evaluate Humble bundles and multi-game packs.",
      keywords: ["game bundles", "humble bundle guide"],
    },
    steamDeckGuide: {
      title: "Steam Deck Game Prices Guide",
      description: "Find the cheapest verified Steam Deck games.",
      keywords: ["steam deck prices", "deck verified games"],
    },
    blackFridayGuide: {
      title: "Black Friday Game Deals 2026 Guide",
      description: "Catch Steam, Epic, and console deals during Black Friday and November sales.",
      keywords: ["black friday game deals", "black friday steam", "november game sales"],
    },
    gogVsSteamGuide: {
      title: "GOG vs Steam — Where to Buy?",
      description: "Compare DRM-free GOG with Steam prices and pick the right store.",
      keywords: ["gog vs steam", "gog steam comparison", "drm free games"],
    },
    deckVerifiedGuide: {
      title: "What Is Steam Deck Verified? 2026 Guide",
      description: "Verified, Playable, and Unsupported badges explained for Deck buyers.",
      keywords: ["steam deck verified", "deck playable", "steam deck compatibility"],
    },
  },
};

export function buildPageMetadata(
  key: PageSeoKey,
  locale: Locale = "tr",
  options?: {
    path?: string;
    canonicalPath?: string;
    noindex?: boolean;
    titleOverride?: string;
    descriptionOverride?: string;
  }
): Metadata {
  const copy = SEO_COPY[locale][key];
  const title = options?.titleOverride || copy.title;
  const description = options?.descriptionOverride || copy.description;
  const path = options?.canonicalPath ?? options?.path ?? "";
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords: copy.keywords,
    alternates: {
      canonical: url,
      languages: {
        tr: `${SITE_URL}${path}`,
        en: `${SITE_URL}${path}`,
        "x-default": `${SITE_URL}${path}`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: options?.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export const NOINDEX_METADATA: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
