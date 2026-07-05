export interface PlanSummary {
  city: string;
  headcount: number;
  base_budget: number;
  backup_cost_delta: number;
  weather_risk: boolean;
  final_per_person_cost: number;
  recommendation: string;
}

export function PlanSummaryCard({ summary }: { summary: PlanSummary | null }) {
  if (!summary) return null;
  return (
    <div className="border border-green-200 rounded-xl p-4 bg-green-50 my-2 text-black">
      <h3 className="font-semibold text-lg">{summary.city} — {summary.headcount} people</h3>
      <p>Base: ₹{summary.base_budget} · {summary.weather_risk ? "Rain contingency" : "Clear weather"}</p>
      <p className="font-bold mt-1 text-green-700">₹{summary.final_per_person_cost} / person</p>
      <p className="text-sm text-gray-700 mt-2">{summary.recommendation}</p>
    </div>
  );
}
