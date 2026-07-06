"use client";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gonogo_session_id");
    if (saved) {
      setSessionId(saved);
    }
  }, []);

  function handleSelectSession(id: string) {
    setSessionId(id);
    localStorage.setItem("gonogo_session_id", id);
  }

  function handleNewSession() {
    setSessionId(null);
    localStorage.removeItem("gonogo_session_id");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 md:relative md:translate-x-0 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar 
          currentSessionId={sessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onNavigate={() => setDrawerOpen(false)} 
        />
      </div>

      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} className="fixed inset-0 bg-black/50 z-30 md:hidden" />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <button className="md:hidden p-3 text-slate-300 absolute top-2 left-2 z-20" onClick={() => setDrawerOpen(true)}>
          <Menu size={24} />
        </button>
        <ChatWindow 
          sessionId={sessionId}
          onSessionChange={setSessionId}
        />
      </div>
    </div>
  );
}
