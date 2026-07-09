import { prisma } from "@/lib/db";
import {
  getAppUrl,
  isIyzicoConfigured,
  initializeSubscriptionCheckoutForm,
  retrieveSubscriptionCheckoutForm,
  cancelIyzicoSubscription,
  retrieveIyzicoSubscription,
  type IyzicoResponse,
} from "@/lib/iyzico";
import {
  setProPlan,
  downgradeToFree,
  findProfileByIyzicoSubscription,
  findProfileByIyzicoCustomer,
} from "@/lib/premium/access";

export type BillingInterval = "monthly" | "yearly";

export interface CheckoutCustomerInput {
  name: string;
  surname: string;
  email: string;
  gsmNumber: string;
  identityNumber: string;
  city?: string;
  address?: string;
}

interface SubscriptionData {
  referenceCode?: string;
  customerReferenceCode?: string;
  subscriptionStatus?: string;
  endDate?: string;
}

function defaultAddress(name: string, city?: string, address?: string) {
  const contactName = name.trim() || "GamePrice Kullanici";
  const addr = address?.trim() || "Turkiye";
  const cityName = city?.trim() || "Istanbul";
  return {
    contactName,
    city: cityName,
    country: "Turkey",
    address: addr,
    zipCode: "34000",
  };
}

function pricingPlanCode(interval: BillingInterval): string {
  const code =
    interval === "yearly"
      ? process.env.IYZICO_PRICING_PLAN_YEARLY
      : process.env.IYZICO_PRICING_PLAN_MONTHLY;
  if (!code) throw new Error(`iyzico plan not configured for ${interval}`);
  return code;
}

function parsePlanExpiry(endDate?: string): Date | null {
  if (!endDate) return null;
  const parsed = new Date(endDate.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function initializeSubscriptionCheckout(
  sessionId: string,
  interval: BillingInterval,
  customer: CheckoutCustomerInput
) {
  if (!isIyzicoConfigured()) {
    throw new Error("iyzico not configured");
  }

  const billingAddress = defaultAddress(
    `${customer.name} ${customer.surname}`,
    customer.city,
    customer.address
  );

  const result = await initializeSubscriptionCheckoutForm({
    locale: "tr",
    conversationId: sessionId,
    callbackUrl: `${getAppUrl()}/api/billing/callback?sid=${encodeURIComponent(sessionId)}`,
    pricingPlanReferenceCode: pricingPlanCode(interval),
    subscriptionInitialStatus: "ACTIVE",
    customer: {
      name: customer.name,
      surname: customer.surname,
      identityNumber: customer.identityNumber,
      email: customer.email,
      gsmNumber: customer.gsmNumber,
      billingAddress,
      shippingAddress: billingAddress,
    },
  });

  if (result.status !== "success" || !result.checkoutFormContent) {
    throw new Error(result.errorMessage || "iyzico checkout initialize failed");
  }

  return {
    token: result.token,
    checkoutFormContent: result.checkoutFormContent,
    tokenExpireTime: result.tokenExpireTime,
  };
}

export async function completeSubscriptionCheckout(sessionId: string, token: string) {
  const result = await retrieveSubscriptionCheckoutForm(token);
  const data = result.data as SubscriptionData | undefined;

  if (result.status !== "success" || !data?.referenceCode) {
    throw new Error(result.errorMessage || "iyzico checkout retrieve failed");
  }

  const subscriptionRef = data.referenceCode;
  const customerRef = data.customerReferenceCode || subscriptionRef;
  const status = data.subscriptionStatus?.toUpperCase();
  const active = !status || status === "ACTIVE" || status === "PENDING";

  if (!active) {
    throw new Error("Subscription not active");
  }

  await setProPlan(sessionId, {
    plan: "pro",
    iyzicoCustomerRef: customerRef,
    iyzicoSubscriptionRef: subscriptionRef,
    planExpiresAt: parsePlanExpiry(data.endDate),
  });

  return { subscriptionRef, customerRef };
}

export async function cancelSubscription(sessionId: string) {
  const profile = await prisma.userProfile.findUnique({ where: { sessionId } });
  if (!profile?.iyzicoSubscriptionRef) {
    throw new Error("No active subscription");
  }

  const result = await cancelIyzicoSubscription(profile.iyzicoSubscriptionRef);
  if (result.status !== "success") {
    throw new Error(result.errorMessage || "Cancel failed");
  }

  await downgradeToFree(sessionId);
  return { ok: true };
}

export async function syncSubscriptionStatus(subscriptionReferenceCode: string) {
  const profile = await findProfileByIyzicoSubscription(subscriptionReferenceCode);
  if (!profile) return;

  const result = await retrieveIyzicoSubscription(subscriptionReferenceCode);
  if (result.status !== "success") return;

  const data = result.data as SubscriptionData | undefined;
  const status = data?.subscriptionStatus?.toUpperCase();

  if (status === "ACTIVE") {
    await setProPlan(profile.sessionId, {
      plan: "pro",
      iyzicoSubscriptionRef: subscriptionReferenceCode,
      iyzicoCustomerRef: profile.iyzicoCustomerRef,
      planExpiresAt: parsePlanExpiry(data?.endDate),
    });
  } else if (status === "CANCELED" || status === "UNPAID") {
    await downgradeToFree(profile.sessionId);
  }
}

export async function handleIyzicoWebhook(payload: Record<string, unknown>) {
  const subscriptionRef =
    (payload.subscriptionReferenceCode as string) ||
    (payload.referenceCode as string) ||
    (payload.data as SubscriptionData | undefined)?.referenceCode;

  if (subscriptionRef) {
    await syncSubscriptionStatus(subscriptionRef);
    return;
  }

  const customerRef = payload.customerReferenceCode as string | undefined;
  if (customerRef) {
    const profile = await findProfileByIyzicoCustomer(customerRef);
    if (profile?.iyzicoSubscriptionRef) {
      await syncSubscriptionStatus(profile.iyzicoSubscriptionRef);
    }
  }
}
