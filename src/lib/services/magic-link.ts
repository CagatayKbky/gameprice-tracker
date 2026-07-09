import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { upsertProfile } from "@/lib/services/profile";

const TOKEN_TTL_MS = 15 * 60 * 1000;

export async function createMagicLink(email: string, sessionId: string) {
  const normalized = email.trim().toLowerCase();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.magicLinkToken.create({
    data: { email: normalized, token, sessionId, expiresAt },
  });

  return { token, expiresAt, email: normalized };
}

export async function verifyMagicLink(token: string) {
  const record = await prisma.magicLinkToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  await upsertProfile(record.sessionId, { email: record.email });
  return { sessionId: record.sessionId, email: record.email };
}

export async function sendMagicLinkEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const link = `${appUrl}/api/auth/magic-link/verify?token=${token}`;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "GamePrice <onboarding@resend.dev>";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#12121a;color:#f0f0f5;border-radius:16px;">
      <h1 style="color:#818cf8;">GamePrice</h1>
      <p>Giriş bağlantınız (15 dakika geçerli):</p>
      <a href="${link}" style="display:inline-block;margin-top:16px;background:#6366f1;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:600;">Giriş Yap</a>
      <p style="color:#888;font-size:12px;margin-top:24px;">Bu isteği siz yapmadıysanız yok sayın.</p>
    </div>
  `;

  if (!apiKey) {
    console.log("[Magic Link Dev]", { email, link });
    return true;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "GamePrice — Giriş Bağlantısı",
      html,
    }),
  });
  return res.ok;
}
