"use client";
import { useState, useEffect } from "react";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: "700" });

export function ClientRoot({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full bg-paper items-center justify-center text-bg-dark">
        <img src="/logo.jpg" width={80} height={80} alt="GoNoGo logo" className="animate-pulse mb-6" />
        <h1 className={`text-4xl font-bold tracking-widest text-primary uppercase ${spaceGrotesk.className}`}>
          GoNoGo
        </h1>
      </div>
    );
  }

  return children;
}
