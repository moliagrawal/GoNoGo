import { Sun, CloudRain } from "lucide-react";

export interface PlanSummary {
  city: string;
  headcount: number;
  base_budget: number;
  backup_cost_delta: number;
  weather_risk: boolean;
  final_per_person_cost: number;
  currency: string;
  recommendation: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };

function formatCurrency(amount: number, code: string) {
  const symbol = CURRENCY_SYMBOLS[code] ?? `${code} `;
  return `${symbol}${amount}`;
}

export function PlanSummaryCard({ summary }: { summary: PlanSummary | null }) {
  if (!summary) return null;
  const isRisk = summary.weather_risk;
  return (
    <div className={`rounded-xl p-4 my-2 border-l-4 ${isRisk ? "border-amber-400 bg-amber-50" : "border-green-400 bg-green-50"}`}>
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-gray-800">{summary.city} — {summary.headcount} people</h3>
        <span className="text-sm flex items-center justify-center">
          {isRisk ? <CloudRain className="text-amber-500 w-5 h-5" /> : <Sun className="text-amber-500 w-5 h-5" />}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 my-2">
        {formatCurrency(summary.final_per_person_cost, summary.currency)}
        <span className="text-sm font-normal text-gray-500"> /person</span>
      </div>
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isRisk ? "bg-amber-200 text-amber-900" : "bg-green-200 text-green-900"}`}>
        {isRisk ? "⚠️ GO WITH BACKUP" : "✅ GO"}
      </span>
    </div>
  );
}
