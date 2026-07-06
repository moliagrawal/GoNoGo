"use client";
import { useState, useRef, useEffect } from "react";
import type { ToolCall } from "@/lib/api";
import { MessageBubble } from "./MessageBubble";
import { Space_Grotesk } from "next/font/google";
import { Sidebar } from "./Sidebar";

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

interface ChatWindowProps {
  sessionId: string | null;
  onSessionChange: (id: string) => void;
}

export function ChatWindow({ sessionId, onSessionChange }: ChatWindowProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const skipFetch = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (sessionId) {
      if (skipFetch.current) {
        skipFetch.current = false;
      } else {
        handleSelectSession(sessionId);
      }
    } else {
      setMessages([]);
    }
  }, [sessionId]);

  async function handleSelectSession(id: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/session/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        const formatted: DisplayMessage[] = [];
        for (const m of data) {
          if (m.role === "assistant" && m.tool_name === "plan_summary") {
            if (formatted.length > 0) {
              try {
                formatted[formatted.length - 1].planSummary = JSON.parse(m.content);
              } catch(e) {}
            }
            continue;
          }
          if (m.role === "user" || m.role === "assistant") {
            if (m.role === "assistant" && m.tool_name === "tool_calls") continue;
            formatted.push({ role: m.role, content: m.content || "" });
          }
        }
        setMessages(formatted);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSend(overrideInput?: string) {
    const textToSend = overrideInput ?? input;
    if (!textToSend.trim()) return;
    const userMsg: DisplayMessage = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const reqBody: any = { message: textToSend, session_id: sessionId };
      if (targetDate) reqBody.target_date = targetDate;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
      if (!res.ok) throw new Error("Failed to reach GoNoGo backend");
      const data = await res.json();
      
      skipFetch.current = true;
      onSessionChange(data.session_id);
      localStorage.setItem("gonogo_session_id", data.session_id);
      
      if (data.tool_calls && data.tool_calls.length > 0) {
        let i = 0;
        const revealNext = () => {
          if (i < data.tool_calls.length) {
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMsg = newMessages[newMessages.length - 1];
              if (lastMsg && lastMsg.role === "assistant" && lastMsg.isSimulating) {
                lastMsg.toolCalls = data.tool_calls.slice(0, i + 1);
              } else {
                newMessages.push({
                  role: "assistant",
                  content: "",
                  toolCalls: data.tool_calls.slice(0, i + 1),
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
                lastMsg.content = data.reply;
                lastMsg.planSummary = data.plan_summary;
                lastMsg.isSimulating = false;
              }
              return newMessages;
            });
            setLoading(false);
          }
        };
        revealNext();
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply, toolCalls: data.tool_calls, planSummary: data.plan_summary }]);
        setLoading(false);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-3xl mx-auto p-4 pt-12 md:pt-4 text-bg-dark w-full">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <img src="/logo.jpg" width={28} height={28} alt="GoNoGo logo" />
        <h1 className={`text-2xl font-bold ${spaceGrotesk.className}`}>GoNoGo</h1>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar border border-secondary/20 shadow-lg rounded-3xl p-4 bg-white/50 backdrop-blur-sm">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
            <p className="mb-2">Try one of these:</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); handleSend(s); }}
                className="border border-secondary/30 rounded-full px-4 py-2 text-sm hover:bg-paper transition-colors text-bg-dark"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} toolCalls={m.toolCalls} planSummary={m.planSummary} />
        ))}
        {loading && <div className="text-sm text-slate-400 my-2 text-center animate-pulse">Thinking...</div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex flex-col mt-4 gap-2">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-bg-dark/70 ml-2">When:</span>
          <input 
            type="date" 
            className="bg-white border border-secondary/30 text-bg-dark rounded-full px-3 py-1 text-sm focus:outline-none"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-secondary/30 bg-white text-bg-dark rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder-slate-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your outdoor plan, or ask anything..."
          />
          <button onClick={() => handleSend()} className="bg-primary hover:bg-primary/90 transition-colors text-white rounded-full px-6 py-2 shadow-sm font-medium">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
