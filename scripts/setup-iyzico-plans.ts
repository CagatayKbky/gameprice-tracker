import {
  createSubscriptionProduct,
  createSubscriptionPricingPlan,
  isIyzicoConfigured,
} from "../src/lib/iyzico";

async function main() {
  if (!isIyzicoConfigured() && (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY)) {
    console.error("IYZICO_API_KEY ve IYZICO_SECRET_KEY gerekli");
    process.exit(1);
  }

  const product = await createSubscriptionProduct({
    locale: "tr",
    conversationId: `setup-${Date.now()}`,
    name: "GamePrice Pro",
    description: "Sinirsiz alarm, hizli arama, bildirimler",
  });

  if (product.status !== "success" || !product.data?.referenceCode) {
    console.error("Urun olusturulamadi:", product);
    process.exit(1);
  }

  const productRef = product.data.referenceCode;
  console.log("Urun:", productRef);

  const monthly = await createSubscriptionPricingPlan(productRef, {
    locale: "tr",
    conversationId: `monthly-${Date.now()}`,
    name: "GamePrice Pro Aylik",
    price: "79.0",
    currencyCode: "TRY",
    paymentInterval: "MONTHLY",
    paymentIntervalCount: 1,
    planPaymentType: "RECURRING",
  });

  const yearly = await createSubscriptionPricingPlan(productRef, {
    locale: "tr",
    conversationId: `yearly-${Date.now()}`,
    name: "GamePrice Pro Yillik",
    price: "599.0",
    currencyCode: "TRY",
    paymentInterval: "YEARLY",
    paymentIntervalCount: 1,
    planPaymentType: "RECURRING",
  });

  console.log("\nVercel / .env.local icin:\n");
  console.log(`IYZICO_PRICING_PLAN_MONTHLY=${monthly.data?.referenceCode || ""}`);
  console.log(`IYZICO_PRICING_PLAN_YEARLY=${yearly.data?.referenceCode || ""}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
