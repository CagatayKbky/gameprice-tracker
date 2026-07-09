import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Steam
      { protocol: "https", hostname: "**.steamstatic.com" },
      { protocol: "https", hostname: "**.akamaihd.net" },
      { protocol: "https", hostname: "steamstore-a.akamaihd.net" },
      // GOG
      { protocol: "https", hostname: "images.gog-statics.com" },
      { protocol: "https", hostname: "**.gog-statics.com" },
      // Epic
      { protocol: "https", hostname: "**.epicgames.com" },
      { protocol: "https", hostname: "**.unrealengine.com" },
      // EA / Origin
      { protocol: "https", hostname: "**.origin.com" },
      { protocol: "https", hostname: "eaassets-a.akamaihd.net" },
      // Ubisoft
      { protocol: "https", hostname: "**.ubisoft.com" },
      { protocol: "https", hostname: "ubistatic-a.akamaihd.net" },
      // Humble
      { protocol: "https", hostname: "**.humblebundle.com" },
      // Green Man Gaming
      { protocol: "https", hostname: "**.greenmangaming.com" },
      // Battle.net
      { protocol: "https", hostname: "**.akamaized.net" },
      { protocol: "https", hostname: "blzstatic.akamaized.net" },
      // CheapShark / misc
      { protocol: "https", hostname: "www.cheapshark.com" },
      { protocol: "https", hostname: "images.igdb.com" },
      { protocol: "https", hostname: "media.rawg.io" },
      // Microsoft / Xbox
      { protocol: "https", hostname: "**.xboxservices.com" },
      { protocol: "https", hostname: "**.microsoft.com" },
      // PlayStation
      { protocol: "https", hostname: "**.playstation.com" },
      { protocol: "https", hostname: "image.api.playstation.com" },
      // Nintendo
      { protocol: "https", hostname: "**.nintendo.com" },
      // GamersGate & other stores
      { protocol: "https", hostname: "**.gamespot.com" },
      { protocol: "https", hostname: "**.fanatical.com" },
    ],
  },
};

export default nextConfig;
