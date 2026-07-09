import { NextRequest, NextResponse } from "next/server";
import { handleIyzicoWebhook } from "@/lib/services/billing";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let payload: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      const form = await request.formData();
      form.forEach((value, key) => {
        payload[key] = value.toString();
      });
    }

    await handleIyzicoWebhook(payload);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook error";
    console.error("iyzico webhook error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
