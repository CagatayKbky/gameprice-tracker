const DEFAULT_APP = "https://gameprice-tracker.vercel.app";

const APP_CANDIDATES = [
  localStorage.getItem("gameprice_app_url"),
  DEFAULT_APP,
].filter(Boolean);

function getAppUrl() {
  return APP_CANDIDATES[0] || "http://localhost:3000";
}

function extractAppId() {
  const m = window.location.pathname.match(/\/app\/(\d+)/);
  return m?.[1];
}

function formatUsd(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

async function fetchGamePrice(appId) {
  const app = getAppUrl();
  try {
    const res = await fetch(`${app}/api/games?action=game&id=steam-${appId}`);
    if (!res.ok) return null;
    const game = await res.json();
    const cheapest = game?.cheapestStore;
    if (!cheapest || cheapest.price <= 0) return null;
    return {
      price: cheapest.price,
      discount: cheapest.discount || 0,
      platform: cheapest.platformName || "Store",
      title: game.title,
    };
  } catch {
    return null;
  }
}

async function injectWidget() {
  const appId = extractAppId();
  if (!appId || document.getElementById("gameprice-widget")) return;

  const app = getAppUrl();
  const priceInfo = await fetchGamePrice(appId);

  const widget = document.createElement("a");
  widget.id = "gameprice-widget";
  widget.href = `${app}/game/steam-${appId}`;
  widget.target = "_blank";
  widget.rel = "noopener";

  if (priceInfo) {
    widget.innerHTML = `
      <span class="gp-brand">🎮 GamePrice</span>
      <span class="gp-price">${formatUsd(priceInfo.price)}</span>
      ${priceInfo.discount > 0 ? `<span class="gp-discount">-%${priceInfo.discount}</span>` : ""}
      <span class="gp-cta">Tüm platformları karşılaştır →</span>
    `;
  } else {
    widget.textContent = "🎮 GamePrice'ta tüm platform fiyatlarını karşılaştır";
  }

  const buyArea =
    document.querySelector(".game_area_purchase") ||
    document.querySelector("#gameHighlightPlayer") ||
    document.body;
  buyArea.prepend(widget);
}

injectWidget();
