import crypto from "crypto";

export interface IyzicoResponse<T = Record<string, unknown>> {
  status?: string;
  errorMessage?: string;
  errorCode?: string;
  token?: string;
  checkoutFormContent?: string;
  tokenExpireTime?: number;
  data?: T;
}

function getBaseUrl(): string {
  return (
    process.env.IYZICO_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://api.iyzipay.com"
      : "https://sandbox-api.iyzipay.com")
  );
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function isIyzicoConfigured(): boolean {
  return Boolean(
    process.env.IYZICO_API_KEY &&
      process.env.IYZICO_SECRET_KEY &&
      (process.env.IYZICO_PRICING_PLAN_MONTHLY || process.env.IYZICO_PRICING_PLAN_YEARLY)
  );
}

function getCredentials() {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error("IYZICO_API_KEY and IYZICO_SECRET_KEY required");
  }
  return { apiKey, secretKey };
}

function randomKey(): string {
  return `${process.hrtime.bigint()}${Math.random().toString(36).slice(2)}`;
}

function buildAuth(uri: string, body: Record<string, unknown>, apiKey: string, secretKey: string) {
  const rnd = randomKey();
  const payload = JSON.stringify(body);
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(rnd + uri + payload)
    .digest("hex");
  const authorization = Buffer.from(
    `apiKey:${apiKey}&randomKey:${rnd}&signature:${signature}`
  ).toString("base64");
  return {
    Authorization: `IYZWSv2 ${authorization}`,
    "x-iyzi-rnd": rnd,
    "Content-Type": "application/json",
  };
}

export async function iyzicoRequest<T = IyzicoResponse>(
  method: "GET" | "POST",
  path: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const { apiKey, secretKey } = getCredentials();
  const uri = path.startsWith("/") ? path : `/${path}`;
  const headers = buildAuth(uri, body, apiKey, secretKey);

  const res = await fetch(`${getBaseUrl()}${uri}`, {
    method,
    headers,
    body: method === "POST" ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const json = (await res.json()) as T;
  if (!res.ok) {
    const err = json as IyzicoResponse;
    throw new Error(err.errorMessage || `iyzico HTTP ${res.status}`);
  }
  return json;
}

export async function initializeSubscriptionCheckoutForm(body: Record<string, unknown>) {
  return iyzicoRequest<IyzicoResponse>("POST", "/v2/subscription/checkoutform/initialize", body);
}

export async function retrieveSubscriptionCheckoutForm(token: string) {
  return iyzicoRequest<IyzicoResponse>(
    "GET",
    `/v2/subscription/checkoutform/${encodeURIComponent(token)}`,
    {}
  );
}

export async function cancelIyzicoSubscription(subscriptionReferenceCode: string) {
  return iyzicoRequest<IyzicoResponse>(
    "POST",
    `/v2/subscription/subscriptions/${encodeURIComponent(subscriptionReferenceCode)}/cancel`
  );
}

export async function retrieveIyzicoSubscription(subscriptionReferenceCode: string) {
  return iyzicoRequest<IyzicoResponse>(
    "GET",
    `/v2/subscription/subscriptions/${encodeURIComponent(subscriptionReferenceCode)}`,
    {}
  );
}

export async function createSubscriptionProduct(body: Record<string, unknown>) {
  return iyzicoRequest<IyzicoResponse<{ referenceCode?: string }>>(
    "POST",
    "/v2/subscription/products",
    body
  );
}

export async function createSubscriptionPricingPlan(
  productReferenceCode: string,
  body: Record<string, unknown>
) {
  return iyzicoRequest<IyzicoResponse<{ referenceCode?: string }>>(
    "POST",
    `/v2/subscription/products/${encodeURIComponent(productReferenceCode)}/pricing-plans`,
    body
  );
}
