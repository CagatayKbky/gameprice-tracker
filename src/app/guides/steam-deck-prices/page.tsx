import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("steamDeckGuide", locale, { path: "/guides/steam-deck-prices" });
}

export default async function SteamDeckGuidePage() {
  const locale = await getServerLocale();

  return (
    <GuideLayout
      slug="steam-deck-prices"
      title={t(locale, "guides.steamDeck.title")}
      subtitle={t(locale, "guides.steamDeck.subtitle")}
      readMinutes={4}
      cta={{ href: "/browse", label: t(locale, "guides.steamDeck.cta") }}
    >
      <p>{t(locale, "guides.steamDeck.p1")}</p>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.steamDeck.h2tips")}</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.steamDeck.tip1")}</li>
        <li>{t(locale, "guides.steamDeck.tip2")}</li>
        <li>{t(locale, "guides.steamDeck.tip3")}</li>
      </ul>
    </GuideLayout>
  );
}
