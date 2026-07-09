"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PriceHistoryPoint } from "@/types";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { useCurrency } from "@/components/providers/CurrencyProvider";

interface PriceChartProps {
  data: PriceHistoryPoint[];
  title?: string;
}

export function PriceChart({ data, title }: PriceChartProps) {
  const { format: formatPrice, convert } = useCurrency();

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted">
        Fiyat geçmişi verisi bulunamadı
      </div>
    );
  }

  const chartData = data.map((point) => ({
    ...point,
    displayPrice: convert(point.price),
    formattedDate: format(parseISO(point.date), "d MMM", { locale: tr }),
  }));

  const prices = data.map((d) => convert(d.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = data[data.length - 1]?.price;
  const lowestEver = data.reduce(
    (min, d) => (d.price < min.price ? d : min),
    data[0]
  ).price;

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="rounded-lg bg-card-hover p-3 text-center">
          <p className="text-xs text-muted mb-1">Güncel Fiyat</p>
          <p className="text-lg font-bold text-foreground">
            {currentPrice ? formatPrice(currentPrice) : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-card-hover p-3 text-center">
          <p className="text-xs text-muted mb-1">En Düşük</p>
          <p className="text-lg font-bold text-emerald-400">
            {formatPrice(lowestEver)}
          </p>
        </div>
        <div className="rounded-lg bg-card-hover p-3 text-center">
          <p className="text-xs text-muted mb-1">En Yüksek</p>
          <p className="text-lg font-bold text-red-400">
            {formatPrice(data.reduce((max, d) => (d.price > max ? d.price : max), 0))}
          </p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
            <XAxis
              dataKey="formattedDate"
              stroke="#8888a0"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#8888a0"
              fontSize={12}
              tickLine={false}
              domain={[minPrice * 0.9, maxPrice * 1.1]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#12121a",
                border: "1px solid #2a2a3a",
                borderRadius: "8px",
                color: "#f0f0f5",
              }}
              formatter={(value) => {
                const num = Number(value ?? 0);
                return [formatPrice(num / (convert(1) || 1)), "Fiyat"];
              }}
              labelFormatter={(label) => label}
            />
            <Area
              type="monotone"
              dataKey="displayPrice"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
