"use client";

import { useState } from "react";
import { Search, Bell, Plus, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

interface TopbarProps {
  title?: string;
  subtitle?: string;
  action?: { label: string; href: string };
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  const [search, setSearch] = useState("");
  const { theme, toggle } = useTheme();

  return (
    <header className="topbar h-16 flex items-center justify-between px-6 flex-shrink-0">
      {/* Title */}
      <div>
        {title && (
          <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cases, patients..."
            className="field-input pl-9 pr-4 py-2 text-sm w-60"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? (
            <Sun size={16} style={{ color: "#fbbf24" }} />
          ) : (
            <Moon size={16} style={{ color: "#6366f1" }} />
          )}
        </button>

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all hover:scale-105"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <Bell size={16} style={{ color: "var(--text-secondary)" }} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </button>

        {/* Action button */}
        {action && (
          <Link
            href={action.href}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}
          >
            <Plus size={15} />
            {action.label}
          </Link>
        )}
      </div>
    </header>
  );
}
