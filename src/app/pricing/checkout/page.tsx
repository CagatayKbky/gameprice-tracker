"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

function CheckoutForm() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const interval = searchParams.get("interval") === "yearly" ? "yearly" : "monthly";

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [gsmNumber, setGsmNumber] = useState("+90");
  const [identityNumber, setIdentityNumber] = useState("");
  const [city, setCity] = useState("Istanbul");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [formHtml, setFormHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) {
          const parts = String(data.name).trim().split(/\s+/);
          setName(parts[0] || "");
          setSurname(parts.slice(1).join(" ") || parts[0] || "");
        }
        if (data.email) setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interval,
          name,
          surname,
          email,
          gsmNumber,
          identityNumber,
          city,
          address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Checkout failed");
      setFormHtml(data.checkoutFormContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("premium.checkoutError"));
    } finally {
      setLoading(false);
    }
  };

  if (formHtml) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div
          className="iyzico-checkout rounded-2xl border border-border bg-card p-4"
          dangerouslySetInnerHTML={{ __html: formHtml }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => router.push("/pricing")}
        className="text-sm text-muted hover:text-foreground mb-6"
      >
        ← {t("premium.checkout.back")}
      </button>
      <h1 className="text-2xl font-bold mb-2">{t("premium.checkout.title")}</h1>
      <p className="text-sm text-muted mb-2">
        {interval === "yearly" ? t("premium.ctaYearly") : t("premium.ctaMonthly")}
      </p>
      <p className="text-xs text-muted mb-6">{t("premium.checkout.trust")}</p>

      <div className="flex gap-2 mb-6">
        <span className="flex-1 rounded-lg bg-accent/15 border border-accent/30 px-3 py-2 text-xs font-medium text-accent text-center">
          1. {t("premium.checkout.stepInfo")}
        </span>
        <span className="flex-1 rounded-lg bg-card border border-border px-3 py-2 text-xs text-muted text-center">
          2. {t("premium.checkout.stepPay")}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">{t("premium.checkout.name")}</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">{t("premium.checkout.surname")}</label>
            <input
              required
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">{t("settings.emailAddress")}</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">{t("premium.checkout.phone")}</label>
          <input
            required
            value={gsmNumber}
            onChange={(e) => setGsmNumber(e.target.value)}
            placeholder="+905551234567"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">{t("premium.checkout.identity")}</label>
          <input
            required
            value={identityNumber}
            onChange={(e) => setIdentityNumber(e.target.value)}
            placeholder="11111111111"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">{t("premium.checkout.city")}</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">{t("premium.checkout.address")}</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-accent text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("premium.checkout.continue")}
        </button>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted" />
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
