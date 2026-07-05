import { ToolBadge } from "./ToolBadge";
import type { ToolCall } from "@/lib/api";

interface Props {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
}

export function MessageBubble({ role, content, toolCalls }: Props) {
  const isUser = role === "user";
  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} my-2`}>
      {toolCalls?.map((tc, i) => <ToolBadge key={i} name={tc.name} />)}
      <div className={`max-w-md rounded-2xl px-4 py-2 ${isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"}`}>
        {content}
      </div>
    </div>
  );
}
