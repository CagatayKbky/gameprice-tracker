const DEFAULT_APP = "https://gameprice.org";

const APP_CANDIDATES = [
  localStorage.getItem("gameprice_app_url"),
  DEFAULT_APP,
].filter(Boolean);

function getAppUrl() {
  return APP_CANDIDATES[0] || "http://localhost:3000";
}

function extractSteamAppId() {
  const m = window.location.pathname.match(/\/app\/(\d+)/);
  return m?.[1];
}

function extractEpicSlug() {
  const m = window.location.pathname.match(/\/p\/([^/?#]+)/);
  return m?.[1];
}

function formatTry(amountUsd) {
  const tryRate = 40;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amountUsd * tryRate);
}

async function fetchGamePrice(gameId) {
  const app = getAppUrl();
  try {
    const res = await fetch(`${app}/api/games?action=game&id=${encodeURIComponent(gameId)}`);
    if (!res.ok) return null;
    const game = await res.json();
    const cheapest = game?.cheapestStore;
    if (!cheapest || cheapest.price <= 0) return null;
    return {
      gameId,
      price: cheapest.price,
      discount: cheapest.discount || 0,
      platform: cheapest.platformName || "Store",
      title: game.title,
      historicalLow: game.historicalLow,
      imageUrl: game.imageUrl,
    };
  } catch {
    return null;
  }
}

function worthItLabel(price, historicalLow, discount) {
  if (historicalLow && price <= historicalLow * 1.05) return { text: "Mükemmel fırsat", cls: "gp-great" };
  if (discount >= 50) return { text: "İyi fiyat", cls: "gp-good" };
  return { text: "Karşılaştır", cls: "gp-neutral" };
}

async function addToWishlist(gameId, title, imageUrl) {
  const app = getAppUrl();
  try {
    await fetch(`${app}/api/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cheapSharkGameId: gameId, gameTitle: title, imageUrl }),
    });
    return true;
  } catch {
    return false;
  }
}

function buildWidget(priceInfo, gameUrl) {
  const widget = document.createElement("div");
  widget.id = "gameprice-widget";
  widget.className = "gp-widget";

  if (priceInfo) {
    const badge = worthItLabel(priceInfo.price, priceInfo.historicalLow, priceInfo.discount);
    widget.innerHTML = `
      <a class="gp-main" href="${gameUrl}" target="_blank" rel="noopener">
        <span class="gp-brand">🎮 GamePrice</span>
        <span class="gp-price">${formatTry(priceInfo.price)}</span>
        ${priceInfo.discount > 0 ? `<span class="gp-discount">-%${priceInfo.discount}</span>` : ""}
        <span class="gp-badge ${badge.cls}">${badge.text}</span>
        <span class="gp-cta">Tüm platformlar →</span>
      </a>
      <button type="button" class="gp-wishlist" title="İstek listesine ekle">♥</button>
    `;
    widget.querySelector(".gp-wishlist")?.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const ok = await addToWishlist(priceInfo.gameId, priceInfo.title, priceInfo.imageUrl);
      if (ok) e.target.textContent = "✓";
    });
  } else {
    widget.innerHTML = `<a class="gp-main" href="${gameUrl}" target="_blank" rel="noopener">🎮 GamePrice — tüm platform fiyatlarını karşılaştır</a>`;
  }

  return widget;
}

async function injectSteamWidget() {
  const appId = extractSteamAppId();
  if (!appId || document.getElementById("gameprice-widget")) return;

  const app = getAppUrl();
  const gameId = `steam-${appId}`;
  const priceInfo = await fetchGamePrice(gameId);
  const widget = buildWidget(priceInfo, `${app}/game/${gameId}`);

  const buyArea =
    document.querySelector(".game_area_purchase") ||
    document.querySelector("#gameHighlightPlayer") ||
    document.body;
  buyArea.prepend(widget);
}

async function injectEpicWidget() {
  const slug = extractEpicSlug();
  if (!slug || document.getElementById("gameprice-widget")) return;

  const app = getAppUrl();
  const gameUrl = `${app}/search?q=${encodeURIComponent(slug.replace(/-/g, " "))}`;
  const widget = buildWidget(null, gameUrl);

  const target =
    document.querySelector('[data-testid="purchase-cta-button"]')?.parentElement ||
    document.querySelector("main") ||
    document.body;
  target.prepend(widget);
}

if (window.location.hostname.includes("steampowered.com")) {
  injectSteamWidget();
} else if (window.location.hostname.includes("epicgames.com")) {
  injectEpicWidget();
}
