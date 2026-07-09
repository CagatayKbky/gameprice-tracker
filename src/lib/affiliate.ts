const AFFILIATE_TAGS: Record<string, string | undefined> = {
  greenmangaming: process.env.AFFILIATE_GMG_ID,
  humble: process.env.AFFILIATE_HUMBLE_ID,
  fanatical: process.env.AFFILIATE_FANATICAL_ID,
  gog: process.env.AFFILIATE_GOG_ID,
  epic: process.env.AFFILIATE_EPIC_ID,
};

export function wrapAffiliateUrl(url: string, platformId?: string): string {
  if (!url || !platformId) return url;

  const tag = AFFILIATE_TAGS[platformId];
  if (!tag) return url;

  try {
    const parsed = new URL(url);
    if (platformId === "greenmangaming") {
      parsed.searchParams.set("tap_a", tag);
    }
    if (platformId === "humble") {
      parsed.searchParams.set("partner", tag);
    }
    if (platformId === "fanatical") {
      parsed.searchParams.set("ref", tag);
    }
    if (platformId === "gog") {
      parsed.searchParams.set("pp", tag);
    }
    if (platformId === "epic") {
      parsed.searchParams.set("epic_affiliate", tag);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
