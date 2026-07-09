"use client";

import { TrendingDown, TrendingUp, Minus, ExternalLink } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { getSteamStoreUrl } from "@/lib/api/steam";
import { SteamRegionalPrice } from "@/types";

interface SteamTurkeyPriceProps {
  appId: string;
  price: SteamRegionalPrice;
}

export function SteamTurkeyPrice({ appId, price }: SteamTurkeyPriceProps) {
  const formatTry = (amount: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="rounded-xl bg-[#1b2838]/50 border border-[#1b2838] p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎮</span>
        <div>
          <p className="font-semibold text-sm">Steam Türkiye</p>
          <p className="text-xs text-muted">Bölgesel fiyat (TRY)</p>
        </div>
      </div>
      <div className="text-right">
        {price.isFree ? (
          <span className="text-lg font-bold text-emerald-400">Ücretsiz</span>
        ) : (
          <>
            {price.discount > 0 && (
              <p className="text-xs text-muted line-through">{formatTry(price.initial)}</p>
            )}
            <p className="text-xl font-bold text-emerald-400">{formatTry(price.final)}</p>
            {price.discount > 0 && (
              <span className="text-xs font-bold text-emerald-400">-%{price.discount}</span>
            )}
          </>
        )}
      </div>
      <a
        href={getSteamStoreUrl(appId)}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

interface WorthItBadgeProps {
  currentPrice: number;
  historicalLow: number;
}

export function WorthItBadge({ currentPrice, historicalLow }: WorthItBadgeProps) {
  const { format } = useCurrency();
  const diff = ((currentPrice - historicalLow) / historicalLow) * 100;

  if (diff <= 5) {
    return (
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-start gap-3">
        <TrendingDown className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-400">Mükemmel Fırsat!</p>
          <p className="text-sm text-muted mt-1">
            Fiyat tarihi en düşük seviyeye yakın ({format(historicalLow)}).
            Şimdi almak için iyi bir zaman.
          </p>
        </div>
      </div>
    );
  }

  if (diff <= 20) {
    return (
      <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 flex items-start gap-3">
        <Minus className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-yellow-400">İyi Fiyat</p>
          <p className="text-sm text-muted mt-1">
            Tarihi en düşükten %{Math.round(diff)} daha pahalı. Yine de makul bir fiyat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 flex items-start gap-3">
      <TrendingUp className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-orange-400">Beklemeye Değer Olabilir</p>
        <p className="text-sm text-muted mt-1">
          Fiyat tarihi en düşükten %{Math.round(diff)} yüksek ({format(historicalLow)}).
          Fiyat alarmı kurarak takip edebilirsiniz.
        </p>
      </div>
    </div>
  );
}
