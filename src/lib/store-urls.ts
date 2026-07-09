export function getStoreSearchUrl(platformId: string, gameTitle: string): string {
  const urls: Record<string, string> = {
    steam: `https://store.steampowered.com/search/?term=${encodeURIComponent(gameTitle)}&l=turkish`,
    epic: `https://store.epicgames.com/tr/browse?q=${encodeURIComponent(gameTitle)}`,
    gog: `https://www.gog.com/tr/games?q=${encodeURIComponent(gameTitle)}`,
    ea: `https://www.ea.com/tr-tr/games?isSearch=true&q=${encodeURIComponent(gameTitle)}`,
    ubisoft: `https://store.ubisoft.com/tr/search?q=${encodeURIComponent(gameTitle)}`,
    battlenet: `https://eu.shop.battle.net/tr-tr/search?q=${encodeURIComponent(gameTitle)}`,
    humble: `https://www.humblebundle.com/store/search?search=${encodeURIComponent(gameTitle)}`,
    greenmangaming: `https://www.greenmangaming.com/search/${encodeURIComponent(gameTitle)}/`,
    gamersgate: `https://www.gamersgate.com/search?query=${encodeURIComponent(gameTitle)}`,
    ps5: `https://store.playstation.com/tr-tr/search/${encodeURIComponent(gameTitle)}`,
    ps4: `https://store.playstation.com/tr-tr/search/${encodeURIComponent(gameTitle)}`,
    "xbox-series": `https://www.xbox.com/tr-tr/games/store/search?q=${encodeURIComponent(gameTitle)}`,
    "xbox-one": `https://www.xbox.com/tr-tr/games/store/search?q=${encodeURIComponent(gameTitle)}`,
    switch: `https://www.nintendo.com/tr-tr/Search/?q=${encodeURIComponent(gameTitle)}`,
  };
  return urls[platformId] || "#";
}
