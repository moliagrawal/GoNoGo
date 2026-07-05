"use client";
import { useState, useRef, useEffect } from "react";
import { sendMessage, type ToolCall } from "@/lib/api";
import { MessageBubble } from "./MessageBubble";

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  planSummary?: any;
}

export function ChatWindow() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg: DisplayMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendMessage(input, sessionId);
      setSessionId(res.session_id);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply, toolCalls: res.tool_calls, planSummary: res.plan_summary }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">GoNoGo</h1>
      <div className="flex-1 overflow-y-auto border rounded-xl p-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} toolCalls={m.toolCalls} planSummary={m.planSummary} />
        ))}
        {loading && <div className="text-sm text-gray-400">Thinking...</div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex mt-4 gap-2">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Describe your outdoor plan, or ask anything..."
        />
        <button onClick={handleSend} className="bg-blue-600 text-white rounded-full px-6 py-2">
          Send
        </button>
      </div>
    </div>
  );
}
