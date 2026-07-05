"use client";
import { useState, useRef, useEffect } from "react";
import { sendMessage, type ToolCall } from "@/lib/api";
import { MessageBubble } from "./MessageBubble";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "700" });

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  planSummary?: any;
  isSimulating?: boolean;
}

const SUGGESTIONS = [
  "Picnic for 8 in Miami, $400 budget",
  "Rooftop party for 20 people in Mumbai, ₹15000 budget",
  "What's a good icebreaker game for 12 people?",
];

export function ChatWindow() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(overrideInput?: string) {
    const textToSend = overrideInput ?? input;
    if (!textToSend.trim()) return;
    const userMsg: DisplayMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await sendMessage(textToSend, sessionId);
      setSessionId(res.session_id);
      
      if (res.tool_calls && res.tool_calls.length > 0) {
        let i = 0;
        const revealNext = () => {
          if (i < res.tool_calls.length) {
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg && lastMsg.role === "assistant" && lastMsg.isSimulating) {
                lastMsg.toolCalls = res.tool_calls.slice(0, i + 1);
              } else {
                newMessages.push({
                  role: "assistant",
                  content: "",
                  toolCalls: res.tool_calls.slice(0, i + 1),
                  isSimulating: true
                });
              }
              return newMessages;
            });
            i++;
            setTimeout(revealNext, 400);
          } else {
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg && lastMsg.role === "assistant" && lastMsg.isSimulating) {
                lastMsg.content = res.reply;
                lastMsg.planSummary = res.plan_summary;
                lastMsg.isSimulating = false;
              }
              return newMessages;
            });
            setLoading(false);
          }
        };
        revealNext();
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: res.reply, toolCalls: res.tool_calls, planSummary: res.plan_summary }]);
        setLoading(false);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 text-white">
      <h1 className={`text-2xl font-semibold mb-4 ${spaceGrotesk.className}`}>GoNoGo</h1>
      <div className="flex-1 overflow-y-auto border border-white/10 shadow-lg rounded-3xl p-4 bg-black">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
            <p className="mb-2">Try one of these:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); handleSend(s); }}
                className="border border-gray-700 rounded-full px-4 py-2 text-sm hover:bg-gray-900 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} toolCalls={m.toolCalls} planSummary={m.planSummary} />
        ))}
        {loading && <div className="text-sm text-gray-400 my-2 text-center animate-pulse">Thinking...</div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex mt-4 gap-2">
        <input
          className="flex-1 border border-gray-700 bg-gray-900 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Describe your outdoor plan, or ask anything..."
        />
        <button onClick={() => handleSend()} className="bg-amber-500 hover:bg-amber-600 transition-colors text-white rounded-full px-6 py-2">
          Send
        </button>
      </div>
    </div>
  );
}
