"use client";

import { Topbar } from "@/components/layout/topbar";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Users, FolderOpen, Target, Activity, ArrowRight, Dna } from "lucide-react";
import Link from "next/link";
import { getCaseStatusColor, formatDate } from "@/lib/utils";

const mockMonthly = [
  { month: "Sep", cases: 12, diagnosed: 8 },
  { month: "Oct", cases: 18, diagnosed: 13 },
  { month: "Nov", cases: 15, diagnosed: 11 },
  { month: "Dec", cases: 22, diagnosed: 16 },
  { month: "Jan", cases: 19, diagnosed: 15 },
  { month: "Feb", cases: 28, diagnosed: 22 },
  { month: "Mar", cases: 24, diagnosed: 20 },
];

const variantDist = [
  { name: "Pathogenic",    value: 12, color: "#f43f5e" },
  { name: "Likely Path.",  value: 23, color: "#fb923c" },
  { name: "VUS",           value: 45, color: "#f59e0b" },
  { name: "Likely Benign", value: 31, color: "#6ee7b7" },
  { name: "Benign",        value: 89, color: "#10b981" },
];

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/* ── Tooltip shared style ── */
const tooltipStyle = {
  contentStyle: {
    background: "var(--bg-card-solid)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    color: "var(--text-primary)",
    fontSize: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
};

interface Props {
  stats: { total_cases: number; active_cases: number; total_variants: number; total_patients: number; diagnostic_yield: number };
  recentCases: any[];
  userName: string;
  userRole: string;
}

export function DashboardClient({ stats, recentCases, userName }: Props) {
  const firstName = userName.split(" ")[0];

  const statCards = [
    { label: "Total Cases",      value: stats.total_cases,     icon: FolderOpen, change: "+12%", up: true,  gradient: "135deg, #3b82f6, #1d4ed8" },
    { label: "Active Cases",     value: stats.active_cases,    icon: Activity,   change: "+3",   up: true,  gradient: "135deg, #8b5cf6, #6d28d9" },
    { label: "Total Patients",   value: stats.total_patients,  icon: Users,      change: "+8%",  up: true,  gradient: "135deg, #06b6d4, #0284c7" },
    { label: "Diagnostic Yield", value: `${stats.diagnostic_yield}%`, icon: Target, change: "+2.1%", up: true, gradient: "135deg, #10b981, #059669" },
  ];

  return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg-page)" }}>
      <Topbar action={{ label: "New Case", href: "/cases/new" }} />

      <div className="flex-1 p-6 space-y-6">

        {/* Welcome banner */}
        <div className="card rounded-2xl p-6 relative overflow-hidden"
          style={{ border: "1px solid rgba(59,130,246,0.2)" }}>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Dna size={120} />
          </div>
          <div className="relative">
            <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>{getGreeting()},</p>
            <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {firstName} 👋
            </h2>
            <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
              You have{" "}
              <span className="font-semibold" style={{ color: "var(--primary)" }}>
                {stats.active_cases} active cases
              </span>{" "}
              awaiting attention.
            </p>
            <Link href="/cases"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{ background: "var(--primary-glow)", color: "var(--text-accent)", border: "1px solid rgba(59,130,246,0.2)" }}>
              View all cases <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, change, up, gradient }) => (
            <div key={label}
              className="card rounded-2xl p-5 hover:scale-[1.02] transition-all cursor-default">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(${gradient})`, opacity: 0.9 }}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${up ? "text-emerald-500" : "text-rose-500"}`}>
                  {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {change}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{value}</div>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area chart */}
          <div className="card lg:col-span-2 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Cases Over Time</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Monthly volume & diagnoses</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: "var(--primary-glow)", color: "var(--text-accent)", border: "1px solid rgba(59,130,246,0.2)" }}>
                Last 7 months
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockMonthly}>
                <defs>
                  <linearGradient id="gCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDiag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="cases"    stroke="#3b82f6" fill="url(#gCases)" strokeWidth={2} name="Total Cases" />
                <Area type="monotone" dataKey="diagnosed" stroke="#10b981" fill="url(#gDiag)"  strokeWidth={2} name="Diagnosed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="card rounded-2xl p-6">
            <h3 className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Variant Classification</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Distribution across cases</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={variantDist} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                  {variantDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-3">
              {variantDist.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span style={{ color: "var(--text-secondary)" }}>{name}</span>
                  </div>
                  <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent cases */}
        <div className="card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Recent Cases</h3>
            <Link href="/cases"
              className="text-sm flex items-center gap-1 hover:opacity-80"
              style={{ color: "var(--text-accent)" }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {recentCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "var(--primary-glow)" }}>
                <FolderOpen size={24} style={{ color: "var(--primary)" }} />
              </div>
              <h4 className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>No cases yet</h4>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Create your first case to get started</p>
              <Link href="/cases/new"
                className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                Create Case
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Case #", "Patient", "Status", "Priority", "Created"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c, i) => (
                  <tr key={c.id} className="table-row"
                    style={{ borderBottom: i < recentCases.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <td className="px-6 py-4">
                      <Link href={`/cases/${c.id}`}
                        className="font-mono text-sm font-medium hover:opacity-80"
                        style={{ color: "var(--text-accent)" }}>
                        {c.case_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                      {c.patients?.first_name} {c.patients?.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getCaseStatusColor(c.status)}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        c.priority === "stat"   ? "text-rose-500 bg-rose-500/10" :
                        c.priority === "urgent" ? "text-amber-500 bg-amber-500/10" :
                        "text-slate-500 bg-slate-500/10"}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
                      {formatDate(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
