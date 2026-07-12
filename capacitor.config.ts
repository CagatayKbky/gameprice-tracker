import type { CapacitorConfig } from "@capacitor/cli";

const appUrl = process.env.CAPACITOR_SERVER_URL || "https://gameprice.org";

const config: CapacitorConfig = {
  appId: "org.gameprice.app",
  appName: "GamePrice",
  webDir: "android-shell",
  server: {
    url: appUrl,
    cleartext: appUrl.startsWith("http://"),
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
