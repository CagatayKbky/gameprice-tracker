"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

interface SeriesPoint {
  date: string;
  count: number;
}

interface AnalyticsData {
  signups: SeriesPoint[];
  notifications: SeriesPoint[];
  referrals: SeriesPoint[];
}

function MiniChart({
  title,
  data,
  color,
}: {
  title: string;
  data: SeriesPoint[];
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4">
      <p className="text-sm font-medium mb-3">{title}</p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#888" }}
              tickFormatter={(v) => String(v).slice(5)}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#888" }} width={28} />
            <Tooltip
              contentStyle={{ background: "#1a1a24", border: "1px solid #333", borderRadius: 8 }}
              labelFormatter={(v) => String(v)}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={color}
              fill={`url(#grad-${color})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AdminCharts() {
  const { t } = useLocale();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics?days=30")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8 mb-6">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <section className="rounded-2xl bg-card border border-border p-6 mb-8">
      <h2 className="font-semibold mb-4">{t("admin.charts.title")}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MiniChart title={t("admin.charts.signups")} data={data.signups} color="#6366f1" />
        <MiniChart title={t("admin.charts.notifications")} data={data.notifications} color="#10b981" />
        <MiniChart title={t("admin.charts.referrals")} data={data.referrals} color="#f59e0b" />
      </div>
    </section>
  );
}
