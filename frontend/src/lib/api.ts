const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ToolCall {
  name: string;
  args: string;
  result: Record<string, unknown>;
}

export interface ChatResponse {
  session_id: number;
  reply: string;
  tool_calls: ToolCall[];
  plan_summary?: Record<string, any>;
}

export async function sendMessage(message: string, sessionId: number | null): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) throw new Error("Failed to reach GoNoGo backend");
  return res.json();
}
