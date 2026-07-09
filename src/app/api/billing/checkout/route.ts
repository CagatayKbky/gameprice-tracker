import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import {
  initializeSubscriptionCheckout,
  type BillingInterval,
} from "@/lib/services/billing";
import { isIyzicoConfigured } from "@/lib/iyzico";

function ensureSession(request: NextRequest, response: NextResponse): string {
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const sessionId = randomUUID();
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return sessionId;
}

export async function POST(request: NextRequest) {
  if (!isIyzicoConfigured()) {
    return NextResponse.json(
      { error: "iyzico_not_configured", message: "iyzico is not configured yet" },
      { status: 503 }
    );
  }

  const response = NextResponse.json({});
  const sessionId = ensureSession(request, response);
  const body = await request.json().catch(() => ({}));
  const interval: BillingInterval = body.interval === "yearly" ? "yearly" : "monthly";

  const { name, surname, email, gsmNumber, identityNumber, city, address } = body;
  if (!name || !surname || !email || !gsmNumber || !identityNumber) {
    return NextResponse.json({ error: "missing_customer_fields" }, { status: 400 });
  }

  try {
    const checkout = await initializeSubscriptionCheckout(sessionId, interval, {
      name: String(name),
      surname: String(surname),
      email: String(email),
      gsmNumber: String(gsmNumber),
      identityNumber: String(identityNumber),
      city: city ? String(city) : undefined,
      address: address ? String(address) : undefined,
    });

    return NextResponse.json(checkout, { headers: response.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
