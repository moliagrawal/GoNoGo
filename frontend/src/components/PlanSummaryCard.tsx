export interface PlanSummary {
  city: string;
  headcount: number;
  base_budget: number;
  backup_cost_delta: number;
  weather_risk: boolean;
  final_per_person_cost: number;
  currency: string;
  recommendation: string;
  precip_chance: number;
  temp: number | null;
  date: string;
}

const CURRENCY_SYMBOLS: Record<string, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };

function formatCurrency(amount: number, code: string) {
  const symbol = CURRENCY_SYMBOLS[code] ?? `${code} `;
  return `${symbol}${amount}`;
}

function getCondition(precipChance: number): "clear" | "cloudy" | "rain" {
  if (precipChance > 50) return "rain";
  if (precipChance > 20) return "cloudy";
  return "clear";
}

const WEATHER_BG: Record<string, string> = {
  clear: "bg-gradient-to-br from-amber-300 to-orange-400",
  cloudy: "bg-gradient-to-br from-slate-400 to-slate-600",
  rain: "bg-gradient-to-br from-blue-500 to-slate-700",
};

export function PlanSummaryCard({ summary }: { summary: PlanSummary | null }) {
  if (!summary) return null;
  const isRisk = summary.weather_risk;
  const displayCost = summary.final_per_person_cost;
  const precip = summary.precip_chance ?? (isRisk ? 80 : 0);
  const condition = getCondition(precip);

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg w-full max-w-sm ${WEATHER_BG[condition]} my-4`}>
      {/* Top: weather section */}
      <div className="p-4 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{summary.city}</h3>
            <p className="text-sm opacity-90">{summary.date}</p>
            <p className="text-sm opacity-90">{summary.headcount} people</p>
          </div>
          <img src={`/weather-icons/${condition}.svg`} width={48} height={48} alt={condition} />
        </div>
        {summary.temp != null && (
          <p className="text-3xl font-bold mt-2">{summary.temp}°</p>
        )}
        <p className="text-sm opacity-90">{precip}% chance of rain</p>
      </div>

      {/* Bottom: cost + verdict, on a contrasting solid panel for readability */}
      <div className="bg-white p-4">
        <div className="text-3xl font-bold text-bg-dark">
          {formatCurrency(displayCost, summary.currency)}
          <span className="text-sm font-normal text-secondary"> /person</span>
        </div>
        <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full border ${
          isRisk ? "bg-danger text-white border-danger/50" : "bg-primary text-black border-primary/50"
        }`}>
          {isRisk ? "⚠️ GO WITH BACKUP" : "✅ GO"}
        </span>
      </div>
    </div>
  );
}
