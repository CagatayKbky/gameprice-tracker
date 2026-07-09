import { getDealsFiltered, enrichDealsWithHistoricalLow } from "@/lib/api/deals";
import { SITE_URL } from "@/lib/seo/constants";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const baseUrl = SITE_URL;
  const rawDeals = await getDealsFiltered({
    minDiscount: 40,
    sortBy: "Savings",
    desc: 1,
    pageSize: 20,
  });
  const deals = await enrichDealsWithHistoricalLow(rawDeals);

  const items = deals
    .map((deal) => {
      const link = `${baseUrl}/game/${deal.gameId}`;
      const badge = deal.isHistoricalLow ? " [Tarihi Dip]" : "";
      return `
    <item>
      <title>${escapeXml(deal.title + badge)} — %${deal.discount} (${deal.platformName})</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(
        `${deal.title} şu an $${deal.salePrice.toFixed(2)} (${deal.platformName}). Normal fiyat: $${deal.normalPrice.toFixed(2)}`
      )}</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>GamePrice — Oyun İndirimleri</title>
    <link>${baseUrl}</link>
    <description>Steam, Epic, GOG ve daha fazlasında güncel oyun indirimleri</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
