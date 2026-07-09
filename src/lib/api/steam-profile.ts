export interface SteamCommunityProfile {
  steamId: string;
  persona: string;
  avatarFull: string | null;
  avatarMedium: string | null;
  profileUrl: string;
  memberSince: string | null;
  location: string | null;
  onlineState: string | null;
}

function readXmlTag(xml: string, tag: string): string | null {
  const cdata = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[(.*?)\\]\\]><\\/${tag}>`));
  if (cdata?.[1]) return cdata[1].trim();
  const plain = xml.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`));
  return plain?.[1]?.trim() || null;
}

export function parseSteamProfileXml(xml: string, steamId: string): SteamCommunityProfile {
  const persona =
    readXmlTag(xml, "steamID") || readXmlTag(xml, "customURL") || `Steam User ${steamId.slice(-4)}`;

  return {
    steamId,
    persona,
    avatarFull: readXmlTag(xml, "avatarFull"),
    avatarMedium: readXmlTag(xml, "avatarMedium"),
    profileUrl: `https://steamcommunity.com/profiles/${steamId}`,
    memberSince: readXmlTag(xml, "memberSince"),
    location: readXmlTag(xml, "location"),
    onlineState: readXmlTag(xml, "onlineState"),
  };
}

export async function fetchSteamCommunityProfile(
  steamId: string
): Promise<SteamCommunityProfile | null> {
  try {
    const res = await fetch(`https://steamcommunity.com/profiles/${steamId}/?xml=1`, {
      headers: { Accept: "application/xml,text/xml" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const xml = await res.text();
    if (!xml.includes("<profile>")) return null;
    return parseSteamProfileXml(xml, steamId);
  } catch {
    return null;
  }
}

export function getSteamAppHeaderUrl(appId: string): string {
  return `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/header.jpg`;
}
