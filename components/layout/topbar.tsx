"use client";

import { useState } from "react";
import { Search, Bell, Settings, Plus } from "lucide-react";
import Link from "next/link";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  action?: { label: string; href: string };
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b flex-shrink-0"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.07)",
        backdropFilter: "blur(8px)",
      }}>
      {/* Title area */}
      <div>
        {title && <h1 className="text-lg font-semibold text-white">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases, patients..."
            className="pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-slate-500 outline-none w-64 transition-all"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              fontFamily: "inherit",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/5"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <Bell size={16} className="text-slate-400" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        {/* Action button */}
        {action && (
          <Link href={action.href}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            <Plus size={16} />
            {action.label}
          </Link>
        )}
      </div>
    </header>
  );
}
