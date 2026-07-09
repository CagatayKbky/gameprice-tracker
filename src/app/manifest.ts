import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GamePrice — Oyun Fiyat Takip",
    short_name: "GamePrice",
    description: "Oyun fiyatlarını karşılaştır, indirimleri takip et",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#6366f1",
    orientation: "portrait-primary",
    lang: "tr",
    categories: ["games", "shopping", "utilities"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
