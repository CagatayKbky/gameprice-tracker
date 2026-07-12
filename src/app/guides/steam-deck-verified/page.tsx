import { getServerLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/translations";
import { GuideLayout } from "@/components/guides/GuideLayout";
import { buildPageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("deckVerifiedGuide", locale, { path: "/guides/steam-deck-verified" });
}

export default async function DeckVerifiedGuidePage() {
  const locale = await getServerLocale();

  return (
    <GuideLayout
      slug="steam-deck-verified"
      title={t(locale, "guides.deckVerified.title")}
      subtitle={t(locale, "guides.deckVerified.subtitle")}
      readMinutes={4}
      cta={{ href: "/guides/steam-deck-prices", label: t(locale, "guides.deckVerified.cta") }}
    >
      <p>{t(locale, "guides.deckVerified.p1")}</p>
      <h2 className="text-lg font-semibold text-white">{t(locale, "guides.deckVerified.h2tips")}</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>{t(locale, "guides.deckVerified.tip1")}</li>
        <li>{t(locale, "guides.deckVerified.tip2")}</li>
        <li>{t(locale, "guides.deckVerified.tip3")}</li>
      </ul>
    </GuideLayout>
  );
}
