import { ComparePageContent } from "@/components/games/ComparePageContent";
import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return buildPageMetadata("compare", locale, { path: "/compare" });
}

export default function ComparePage() {
  return <ComparePageContent />;
}
