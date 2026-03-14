"use client";

import { Topbar } from "@/components/layout/topbar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Users, FolderOpen, GitBranch, Target, Clock, Activity, ArrowRight, Dna, Zap } from "lucide-react";
import Link from "next/link";
import { getCaseStatusColor, formatDate } from "@/lib/utils";

const mockMonthlyData = [
  { month: "Sep", cases: 12, diagnosed: 8 },
  { month: "Oct", cases: 18, diagnosed: 13 },
  { month: "Nov", cases: 15, diagnosed: 11 },
  { month: "Dec", cases: 22, diagnosed: 16 },
  { month: "Jan", cases: 19, diagnosed: 15 },
  { month: "Feb", cases: 28, diagnosed: 22 },
  { month: "Mar", cases: 24, diagnosed: 20 },
];

const variantDistribution = [
  { name: "Pathogenic", value: 12, color: "#f43f5e" },
  { name: "Likely Path.", value: 23, color: "#fb923c" },
  { name: "VUS", value: 45, color: "#fbbf24" },
  { name: "Likely Benign", value: 31, color: "#6ee7b7" },
  { name: "Benign", value: 89, color: "#10b981" },
];

interface Props {
  stats: { total_cases: number; active_cases: number; total_variants: number; total_patients: number; diagnostic_yield: number; };
  recentCases: any[];
  userName: string;
  userRole: string;
}

const GREETINGS = ["Good morning", "Good afternoon", "Good evening"];
function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? GREETINGS[0] : h < 17 ? GREETINGS[1] : GREETINGS[2];
}

export function DashboardClient({ stats, recentCases, userName, userRole }: Props) {
  const firstName = userName.split(" ")[0];

  const statCards = [
    {
      label: "Total Cases",
      value: stats.total_cases,
      icon: FolderOpen,
      change: "+12%",
      positive: true,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
    },
    {
      label: "Active Cases",
      value: stats.active_cases,
      icon: Activity,
      change: "+3",
      positive: true,
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
    },
    {
      label: "Total Patients",
      value: stats.total_patients,
      icon: Users,
      change: "+8%",
      positive: true,
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.1)",
    },
    {
      label: "Diagnostic Yield",
      value: `${stats.diagnostic_yield}%`,
      icon: Target,
      change: "+2.1%",
      positive: true,
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <Topbar action={{ label: "New Case", href: "/cases/new" }} />

      <div className="flex-1 p-6 space-y-6">
        {/* Welcome banner */}
        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(6,182,212,0.1) 100%)",
            border: "1px solid rgba(59,130,246,0.2)",
          }}>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <Dna size={100} className="text-blue-400" />
          </div>
          <div className="relative">
            <p className="text-slate-400 text-sm mb-1">{getGreeting()},</p>
            <h2 className="text-2xl font-bold text-white mb-2">{firstName} 👋</h2>
            <p className="text-slate-400 text-sm max-w-md">
              You have <span className="text-blue-400 font-semibold">{stats.active_cases} active cases</span> awaiting attention.
              {stats.active_cases > 0 && " 2 cases are marked urgent."}
            </p>
            <Link href="/cases" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: "rgba(59,130,246,0.25)", border: "1px solid rgba(59,130,246,0.3)" }}>
              View all cases <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, change, positive, color, bg }) => (
            <div key={label} className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <span className={`text-xs font-medium flex items-center gap-1 ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                  {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{value}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases over time */}
          <div className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-white">Cases Over Time</h3>
                <p className="text-sm text-slate-400">Monthly case volume and diagnoses</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full text-blue-400"
                style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                Last 7 months
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockMonthlyData}>
                <defs>
                  <linearGradient id="gradCases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDiag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
                <Area type="monotone" dataKey="cases" stroke="#3b82f6" fill="url(#gradCases)" strokeWidth={2} name="Total Cases" />
                <Area type="monotone" dataKey="diagnosed" stroke="#10b981" fill="url(#gradDiag)" strokeWidth={2} name="Diagnosed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Variant distribution */}
          <div className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="font-semibold text-white mb-2">Variant Classification</h3>
            <p className="text-sm text-slate-400 mb-4">Distribution across cases</p>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={variantDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {variantDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {variantDistribution.map(({ name, value, color }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-slate-400">{name}</span>
                  </div>
                  <span className="text-slate-300 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent cases table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h3 className="font-semibold text-white">Recent Cases</h3>
            <Link href="/cases" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(59,130,246,0.1)" }}>
                <FolderOpen size={28} className="text-blue-400" />
              </div>
              <h4 className="text-white font-medium mb-2">No cases yet</h4>
              <p className="text-slate-400 text-sm mb-4">Create your first case to get started</p>
              <Link href="/cases/new"
                className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                Create Case
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Case #", "Patient", "Status", "Priority", "Created"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c, i) => (
                  <tr key={c.id}
                    style={{ borderBottom: i < recentCases.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/cases/${c.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-sm font-medium">
                        {c.case_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      {c.patients?.first_name} {c.patients?.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getCaseStatusColor(c.status)}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        c.priority === "stat" ? "text-rose-400 bg-rose-400/10" :
                        c.priority === "urgent" ? "text-amber-400 bg-amber-400/10" :
                        "text-slate-400 bg-slate-400/10"}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(c.created_at)}</td>
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
