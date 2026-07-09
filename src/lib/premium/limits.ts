export const PREMIUM_LIMITS = {
  free: {
    wishlist: 5,
    alerts: 1,
    compare: 3,
    fastSearch: false,
    push: false,
    discord: false,
    telegram: false,
    instantAlerts: false,
  },
  pro: {
    wishlist: Infinity,
    alerts: Infinity,
    compare: 10,
    fastSearch: true,
    push: true,
    discord: true,
    telegram: true,
    instantAlerts: true,
  },
} as const;

export type PlanId = "free" | "pro";

export function getLimitsForPlan(plan: PlanId) {
  return PREMIUM_LIMITS[plan];
}
