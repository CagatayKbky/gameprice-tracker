import { BuyRecommendation } from "@/lib/game-utils";
import { TrendingDown, Clock, Minus } from "lucide-react";

interface PricePredictionProps {
  recommendation: BuyRecommendation;
  reason: string;
}

const config = {
  buy: {
    icon: TrendingDown,
    label: "Alım önerilir",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  wait: {
    icon: Clock,
    label: "Bekleme önerilir",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  neutral: {
    icon: Minus,
    label: "Nötr",
    className: "text-muted bg-card-hover border-border",
  },
};

export function PricePrediction({ recommendation, reason }: PricePredictionProps) {
  const { icon: Icon, label, className } = config[recommendation];

  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <p className="text-sm text-muted">{reason}</p>
    </div>
  );
}
