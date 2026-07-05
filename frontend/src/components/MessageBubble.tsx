import { ToolBadge } from "./ToolBadge";
import { PlanSummaryCard, type PlanSummary } from "./PlanSummaryCard";
import type { ToolCall } from "@/lib/api";

interface Props {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  planSummary?: PlanSummary;
}

export function MessageBubble({ role, content, toolCalls, planSummary }: Props) {
  const isUser = role === "user";
  // Only render bubble if there is actual content
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} my-2`}>
      {toolCalls?.map((tc, i) => <ToolBadge key={i} name={tc.name} />)}
      {planSummary && <PlanSummaryCard summary={planSummary} />}
      {content && (
        <div className={`max-w-md rounded-2xl px-4 py-2 ${isUser ? "bg-amber-500 text-white" : "bg-gray-800 text-gray-100"}`}>
          {content}
        </div>
      )}
    </div>
  );
}
