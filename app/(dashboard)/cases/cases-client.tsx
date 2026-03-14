"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { FolderOpen, ChevronRight, AlertTriangle, Zap, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatDate, getCaseStatusColor } from "@/lib/utils";

const STATUSES = ["new", "sequencing", "analysis", "review", "closed", "reanalysis"] as const;

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  new: { label: "New", icon: FolderOpen, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
  sequencing: { label: "Sequencing", icon: Zap, color: "#c084fc", bg: "rgba(192,132,252,0.1)" },
  analysis: { label: "Analysis", icon: Clock, color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  review: { label: "Review", icon: AlertTriangle, color: "#22d3ee", bg: "rgba(34,211,238,0.1)" },
  closed: { label: "Closed", icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  reanalysis: { label: "Reanalysis", icon: AlertTriangle, color: "#fb7185", bg: "rgba(251,113,133,0.1)" },
};

interface Props { cases: any[]; }

export function CasesClient({ cases }: Props) {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = cases.filter((c) => priorityFilter === "all" || c.priority === priorityFilter);

  if (view === "list") {
    return (
      <div className="flex flex-col min-h-full">
        <Topbar title="Cases" subtitle={`${cases.length} total cases`} action={{ label: "New Case", href: "/cases/new" }} />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {(["kanban", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className="px-4 py-2 text-sm font-medium transition-all capitalize"
                  style={{
                    background: view === v ? "rgba(59,130,246,0.2)" : "transparent",
                    color: view === v ? "#60a5fa" : "#94a3b8",
                  }}>
                  {v}
                </button>
              ))}
            </div>
            {["all", "stat", "urgent", "routine"].map((p) => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className="px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all"
                style={{
                  background: priorityFilter === p ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${priorityFilter === p ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.07)"}`,
                  color: priorityFilter === p ? "#60a5fa" : "#94a3b8",
                }}>
                {p}
              </button>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Case #", "Patient", "Status", "Priority", "Phenotypes", "Created"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/cases/${c.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-sm font-medium">{c.case_number}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">{c.patients?.first_name} {c.patients?.last_name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getCaseStatusColor(c.status)}`}>{c.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg ${c.priority === "stat" ? "text-rose-400 bg-rose-400/10" : c.priority === "urgent" ? "text-amber-400 bg-amber-400/10" : "text-slate-400 bg-slate-400/10"}`}>{c.priority}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{c.case_phenotypes?.length ?? 0} terms</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Kanban view
  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Cases" subtitle={`${cases.length} total cases`} action={{ label: "New Case", href: "/cases/new" }} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {(["kanban", "list"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="px-4 py-2 text-sm font-medium transition-all capitalize"
                style={{ background: view === v ? "rgba(59,130,246,0.2)" : "transparent", color: view === v ? "#60a5fa" : "#94a3b8" }}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map((status) => {
            const meta = STATUS_META[status];
            const StatusIcon = meta.icon;
            const statusCases = filtered.filter((c) => c.status === status);
            return (
              <div key={status} className="flex-shrink-0 w-72">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: meta.bg }}>
                    <StatusIcon size={12} style={{ color: meta.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{meta.label}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full text-slate-400"
                    style={{ background: "rgba(255,255,255,0.05)" }}>
                    {statusCases.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {statusCases.length === 0 && (
                    <div className="rounded-xl p-4 text-center text-sm text-slate-600"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.06)" }}>
                      No cases
                    </div>
                  )}
                  {statusCases.map((c) => (
                    <Link key={c.id} href={`/cases/${c.id}`}>
                      <div className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01]"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = meta.color + "55")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono text-blue-400">{c.case_number}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${c.priority === "stat" ? "text-rose-400 bg-rose-400/10" : c.priority === "urgent" ? "text-amber-400 bg-amber-400/10" : "text-slate-500 bg-slate-500/10"}`}>
                            {c.priority}
                          </span>
                        </div>
                        <div className="font-medium text-white text-sm mb-2">
                          {c.patients?.first_name} {c.patients?.last_name}
                        </div>
                        {c.case_phenotypes?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {c.case_phenotypes.slice(0, 2).map((p: any) => (
                              <span key={p.id} className="text-xs px-1.5 py-0.5 rounded text-slate-500"
                                style={{ background: "rgba(255,255,255,0.04)" }}>
                                {p.name}
                              </span>
                            ))}
                            {c.case_phenotypes.length > 2 && (
                              <span className="text-xs text-slate-600">+{c.case_phenotypes.length - 2}</span>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-slate-600 mt-2">{formatDate(c.created_at)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
