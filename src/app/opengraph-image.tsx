import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "GamePrice — Oyun Fiyat Takip";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #0e1419 0%, #1b2838 45%, #2a475e 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            🎮
          </div>
          <div style={{ fontSize: 56, fontWeight: 800 }}>GamePrice</div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.25, maxWidth: 900 }}>
          Oyun fiyat takip · İndirim karşılaştırma · Fiyat alarmı
        </div>
        <div style={{ marginTop: 24, fontSize: 24, color: "#66c0f4" }}>
          Steam · Epic · Xbox · PlayStation — 135.000+ oyun
        </div>
      </div>
    ),
    { ...size }
  );
}
