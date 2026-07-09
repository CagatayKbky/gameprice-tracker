const DEFAULT_APP = "https://gameprice.org";

async function resolveAppUrl() {
  try {
    const stored = await chrome.storage?.local?.get?.("gameprice_app_url");
    return stored?.gameprice_app_url || DEFAULT_APP;
  } catch {
    return DEFAULT_APP;
  }
}

resolveAppUrl().then((APP_URL) => {
  const link = document.getElementById("open");
  link.href = APP_URL;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.url) return;
    const match = tab.url.match(/store\.steampowered\.com\/app\/(\d+)/);
    if (match) {
      link.href = `${APP_URL}/game/steam-${match[1]}`;
    }
  });
});
