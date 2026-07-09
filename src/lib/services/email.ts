import { DealOfTheDay } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.EMAIL_FROM || "GamePrice <onboarding@resend.dev>";

type EmailLocale = "tr" | "en";

interface PriceAlertEmailData {
  to: string;
  gameTitle: string;
  targetPrice: number;
  currentPrice: number;
  gameId: string;
  userName?: string;
  locale?: EmailLocale;
}

interface WeeklyDigestEmailData {
  to: string;
  userName?: string;
  deals: DealOfTheDay[];
  locale?: EmailLocale;
}

const COPY = {
  tr: {
    alertSubject: (title: string) => `🎮 Fiyat Alarmı: ${title} hedef fiyata ulaştı!`,
    alertHeading: "Fiyat alarmı tetiklendi",
    alertTarget: (target: string) => `(hedef: ${target})`,
    alertBody: (name?: string) =>
      `${name ? `Merhaba ${name}, ` : ""}takip ettiğiniz oyun hedef fiyatınıza ulaştı.`,
    viewGame: "Oyunu Görüntüle",
    alertFooter: "Bu e-postayı GamePrice fiyat alarmı ayarlarınız nedeniyle aldınız.",
    digestSubject: "🎮 GamePrice — Bu Haftanın En İyi İndirimleri",
    digestHeading: "Haftalık indirim özeti",
    digestBody: (name?: string) =>
      `${name ? `Merhaba ${name}, ` : ""}bu haftanın öne çıkan indirimleri:`,
    viewAllDeals: "Tüm İndirimleri Gör",
    digestFooter: "Bu e-postayı GamePrice haftalık özet ayarlarınız nedeniyle aldınız.",
    changeSettings: "Ayarları değiştir",
  },
  en: {
    alertSubject: (title: string) => `🎮 Price alert: ${title} hit your target!`,
    alertHeading: "Price alert triggered",
    alertTarget: (target: string) => `(target: ${target})`,
    alertBody: (name?: string) =>
      `${name ? `Hi ${name}, ` : ""}a game you're tracking reached your target price.`,
    viewGame: "View Game",
    alertFooter: "You received this email because of your GamePrice alert settings.",
    digestSubject: "🎮 GamePrice — This Week's Best Deals",
    digestHeading: "Weekly deals digest",
    digestBody: (name?: string) =>
      `${name ? `Hi ${name}, ` : ""}here are this week's highlighted deals:`,
    viewAllDeals: "View All Deals",
    digestFooter: "You received this email because of your GamePrice weekly digest settings.",
    changeSettings: "Change settings",
  },
} as const;

export async function sendPriceAlertEmail(data: PriceAlertEmailData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const locale = data.locale ?? "tr";
  const copy = COPY[locale];

  const subject = copy.alertSubject(data.gameTitle);
  const gameUrl = `${APP_URL}/game/${data.gameId}`;
  const formattedTarget = formatUsd(data.targetPrice);
  const formattedCurrent = formatUsd(data.currentPrice);

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #12121a; color: #f0f0f5; padding: 32px; border-radius: 16px;">
      <h1 style="color: #818cf8; margin: 0 0 8px;">GamePrice</h1>
      <p style="color: #8888a0; margin: 0 0 24px;">${copy.alertHeading}</p>
      <h2 style="margin: 0 0 16px;">${escapeHtml(data.gameTitle)}</h2>
      <p style="font-size: 18px; color: #10b981; font-weight: bold;">
        ${formattedCurrent} <span style="color: #8888a0; font-size: 14px;">${copy.alertTarget(formattedTarget)}</span>
      </p>
      <p style="color: #8888a0; margin: 24px 0;">
        ${escapeHtml(copy.alertBody(data.userName))}
      </p>
      <a href="${gameUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600;">
        ${copy.viewGame}
      </a>
      <p style="color: #555; font-size: 12px; margin-top: 32px;">
        ${copy.alertFooter}
      </p>
    </div>
  `;

  if (!apiKey) {
    console.log("[Email Dev Mode]", { to: data.to, subject, gameUrl });
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: data.to,
        subject,
        html,
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Email send failed:", error);
    return false;
  }
}

export async function sendWeeklyDigestEmail(data: WeeklyDigestEmailData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const locale = data.locale ?? "tr";
  const copy = COPY[locale];
  const subject = copy.digestSubject;
  const dealsUrl = `${APP_URL}/deals`;

  const dealRows = data.deals
    .map(
      (deal) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3a;">
          <a href="${APP_URL}/game/${deal.gameId}" style="color: #f0f0f5; text-decoration: none; font-weight: 600;">
            ${escapeHtml(deal.title)}
          </a>
          <div style="color: #8888a0; font-size: 13px; margin-top: 4px;">${escapeHtml(deal.platformName)}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2a3a; text-align: right; white-space: nowrap;">
          <span style="color: #10b981; font-weight: bold;">${formatUsd(deal.salePrice)}</span>
          <span style="color: #8888a0; text-decoration: line-through; margin-left: 8px; font-size: 13px;">${formatUsd(deal.normalPrice)}</span>
          <div style="color: #818cf8; font-size: 13px; margin-top: 4px;">-%${deal.discount}</div>
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #12121a; color: #f0f0f5; padding: 32px; border-radius: 16px;">
      <h1 style="color: #818cf8; margin: 0 0 8px;">GamePrice</h1>
      <p style="color: #8888a0; margin: 0 0 24px;">${copy.digestHeading}</p>
      <p style="margin: 0 0 24px;">
        ${escapeHtml(copy.digestBody(data.userName))}
      </p>
      <table style="width: 100%; border-collapse: collapse;">
        ${dealRows}
      </table>
      <a href="${dealsUrl}" style="display: inline-block; margin-top: 24px; background: #6366f1; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600;">
        ${copy.viewAllDeals}
      </a>
      <p style="color: #555; font-size: 12px; margin-top: 32px;">
        ${copy.digestFooter}
        <a href="${APP_URL}/settings" style="color: #818cf8;">${copy.changeSettings}</a>
      </p>
    </div>
  `;

  if (!apiKey) {
    console.log("[Weekly Digest Dev Mode]", { to: data.to, subject, deals: data.deals.length });
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: data.to,
        subject,
        html,
      }),
    });
    return res.ok;
  } catch (error) {
    console.error("Weekly digest email failed:", error);
    return false;
  }
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
