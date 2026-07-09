import { prisma } from "@/lib/db";
import { getLimitsForPlan, PlanId } from "@/lib/premium/limits";
import { isIyzicoConfigured } from "@/lib/iyzico";

export interface PremiumStatus {
  isPro: boolean;
  plan: PlanId;
  limits: ReturnType<typeof getLimitsForPlan>;
  usage: {
    wishlist: number;
    alerts: number;
  };
  planExpiresAt: string | null;
  billingConfigured: boolean;
}

function isActivePro(profile: {
  plan: string;
  planExpiresAt: Date | null;
} | null): boolean {
  if (!profile || profile.plan !== "pro") return false;
  if (!profile.planExpiresAt) return true;
  return profile.planExpiresAt > new Date();
}

export async function getPremiumStatus(sessionId: string): Promise<PremiumStatus> {
  const [profile, wishlist, alerts] = await Promise.all([
    prisma.userProfile.findUnique({ where: { sessionId } }),
    prisma.wishlistItem.count({ where: { sessionId } }),
    prisma.priceAlert.count({ where: { sessionId, isActive: true } }),
  ]);

  const isPro = isActivePro(profile);
  const plan: PlanId = isPro ? "pro" : "free";

  return {
    isPro,
    plan,
    limits: getLimitsForPlan(plan),
    usage: { wishlist, alerts },
    planExpiresAt: profile?.planExpiresAt?.toISOString() ?? null,
    billingConfigured: isIyzicoConfigured(),
  };
}

export async function assertWishlistCapacity(sessionId: string) {
  const status = await getPremiumStatus(sessionId);
  if (status.usage.wishlist >= status.limits.wishlist) {
    return {
      ok: false as const,
      error: "wishlist_limit",
      limit: status.limits.wishlist,
      isPro: status.isPro,
    };
  }
  return { ok: true as const };
}

export async function assertAlertCapacity(sessionId: string) {
  const status = await getPremiumStatus(sessionId);
  if (status.usage.alerts >= status.limits.alerts) {
    return {
      ok: false as const,
      error: "alert_limit",
      limit: status.limits.alerts,
      isPro: status.isPro,
    };
  }
  return { ok: true as const };
}

export async function assertProFeature(
  sessionId: string,
  feature: "push" | "discord" | "telegram" | "fastSearch"
) {
  const status = await getPremiumStatus(sessionId);
  if (!status.limits[feature]) {
    return { ok: false as const, error: "pro_required", feature };
  }
  return { ok: true as const };
}

export async function setProPlan(
  sessionId: string,
  data: {
    iyzicoCustomerRef?: string | null;
    iyzicoSubscriptionRef?: string | null;
    planExpiresAt?: Date | null;
    plan?: PlanId;
  }
) {
  return prisma.userProfile.upsert({
    where: { sessionId },
    create: {
      sessionId,
      plan: data.plan ?? "pro",
      iyzicoCustomerRef: data.iyzicoCustomerRef ?? null,
      iyzicoSubscriptionRef: data.iyzicoSubscriptionRef ?? null,
      planExpiresAt: data.planExpiresAt ?? null,
    },
    update: {
      plan: data.plan ?? "pro",
      ...(data.iyzicoCustomerRef !== undefined
        ? { iyzicoCustomerRef: data.iyzicoCustomerRef }
        : {}),
      ...(data.iyzicoSubscriptionRef !== undefined
        ? { iyzicoSubscriptionRef: data.iyzicoSubscriptionRef }
        : {}),
      ...(data.planExpiresAt !== undefined ? { planExpiresAt: data.planExpiresAt } : {}),
    },
  });
}

export async function downgradeToFree(sessionId: string) {
  return prisma.userProfile.update({
    where: { sessionId },
    data: {
      plan: "free",
      iyzicoSubscriptionRef: null,
      planExpiresAt: null,
    },
  });
}

export async function findProfileByIyzicoCustomer(customerRef: string) {
  return prisma.userProfile.findFirst({
    where: { iyzicoCustomerRef: customerRef },
  });
}

export async function findProfileByIyzicoSubscription(subscriptionRef: string) {
  return prisma.userProfile.findFirst({
    where: { iyzicoSubscriptionRef: subscriptionRef },
  });
}
