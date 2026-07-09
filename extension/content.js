const DEFAULT_APP = "https://gameprice.org";

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

function formatTry(amountUsd) {
  const tryRate = 40;
  const tryAmount = amountUsd * tryRate;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(tryAmount);
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
      historicalLow: game.historicalLow,
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
    const badge = worthItLabel(priceInfo.price, priceInfo.historicalLow, priceInfo.discount);
    widget.innerHTML = `
      <span class="gp-brand">🎮 GamePrice</span>
      <span class="gp-price">${formatTry(priceInfo.price)}</span>
      ${priceInfo.discount > 0 ? `<span class="gp-discount">-%${priceInfo.discount}</span>` : ""}
      <span class="gp-badge ${badge.cls}">${badge.text}</span>
      <span class="gp-cta">Tüm platformlar →</span>
    `;
  } else {
    widget.textContent = "🎮 GamePrice — tüm platform fiyatlarını karşılaştır";
  }

  const buyArea =
    document.querySelector(".game_area_purchase") ||
    document.querySelector("#gameHighlightPlayer") ||
    document.body;
  buyArea.prepend(widget);
}

injectWidget();
