import { useEffect, useState, useRef } from "react";

export interface SessionData {
  id: string;
  title: string;
  created_at: string;
}

interface SidebarProps {
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ currentSessionId, onSelectSession, onNewSession, onNavigate }: SidebarProps) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [width, setWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("gonogo_sidebar_width");
      return saved ? Number(saved) : 280;
    }
    return 280;
  });
  const isDragging = useRef(false);

  useEffect(() => {
    fetchSessions();
  }, [currentSessionId]);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isDragging.current) setWidth(Math.min(Math.max(e.clientX, 200), 480));
    }
    function handleMouseUp() {
      if (isDragging.current) {
        isDragging.current = false;
        localStorage.setItem("gonogo_sidebar_width", String(width));
      }
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [width]);

  async function fetchSessions() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  }



  function handleSelect(id: string) {
    onSelectSession(id);
    if (onNavigate) onNavigate();
  }

  return (
    <div style={{ width: `${width}px` }} className="relative bg-white/80 h-screen flex-shrink-0 hidden md:flex flex-col border-r border-secondary/20 text-bg-dark p-4 overflow-y-auto no-scrollbar">
      <h2 className="text-xl font-bold mb-6 text-secondary">History</h2>
      
      <button 
        onClick={() => { onNewSession(); if (onNavigate) onNavigate(); }}
        className="mb-4 bg-paper hover:bg-paper/80 transition border border-secondary/30 rounded-lg py-2 px-4 text-sm font-medium w-full text-left flex items-center gap-2 text-secondary"
      >
        <span className="text-lg">+</span> New Plan
      </button>

      <div className="flex flex-col gap-2">
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => handleSelect(s.id)}
            className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition ${s.id === currentSessionId ? "bg-primary/20 border border-primary text-secondary" : "hover:bg-paper text-bg-dark/70"}`}
          >
            <span className="truncate text-sm">{s.title}</span>
          </div>
        ))}
      </div>
      
      <div
        onMouseDown={() => (isDragging.current = true)}
        className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 hidden md:block"
      />
    </div>
  );
}
