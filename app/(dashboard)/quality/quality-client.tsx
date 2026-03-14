"use client";

import { Topbar } from "@/components/layout/topbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { BarChart3, CheckCircle, XCircle } from "lucide-react";

interface Props { metrics: any[]; }

export function QualityClient({ metrics }: Props) {
  if (!metrics.length) {
    return (
      <div className="flex flex-col min-h-full">
        <Topbar title="Quality Control" subtitle="Sequencing QC metrics" />
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <BarChart3 size={32} className="text-slate-600 mb-3" />
          <p className="text-slate-400">No quality metrics yet</p>
          <p className="text-slate-500 text-sm mt-1">Upload samples to generate QC data</p>
        </div>
      </div>
    );
  }

  const coverageData = metrics.slice(0, 10).map((m, i) => ({
    name: m.samples?.barcode?.slice(-6) ?? `S${i + 1}`,
    coverage: m.mean_coverage ?? 0,
    pct20x: m.percent_20x ?? 0,
  }));

  const avgCoverage = metrics.reduce((s, m) => s + (m.mean_coverage ?? 0), 0) / metrics.length;
  const avgPct20x = metrics.reduce((s, m) => s + (m.percent_20x ?? 0), 0) / metrics.length;
  const avgTsTv = metrics.reduce((s, m) => s + (m.ts_tv_ratio ?? 0), 0) / metrics.length;
  const passRate = metrics.filter((m) => (m.percent_20x ?? 0) >= 90).length / metrics.length * 100;

  const radarData = [
    { metric: "Coverage", value: Math.min((avgCoverage / 50) * 100, 100) },
    { metric: ">20x %", value: avgPct20x },
    { metric: "Ts/Tv", value: Math.min((avgTsTv / 3) * 100, 100) },
    { metric: "dbSNP %", value: metrics[0]?.dbsnp_percent ?? 0 },
    { metric: "Pass Rate", value: passRate },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Quality Control" subtitle={`${metrics.length} samples analyzed`} />
      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg Coverage", value: `${avgCoverage.toFixed(0)}x`, good: avgCoverage >= 30 },
            { label: "Avg % ≥20x", value: `${avgPct20x.toFixed(1)}%`, good: avgPct20x >= 90 },
            { label: "Avg Ts/Tv", value: avgTsTv.toFixed(2), good: avgTsTv >= 1.8 && avgTsTv <= 3.0 },
            { label: "Pass Rate", value: `${passRate.toFixed(0)}%`, good: passRate >= 80 },
          ].map(({ label, value, good }) => (
            <div key={label} className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{label}</span>
                {good ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-rose-400" />}
              </div>
              <div className="text-3xl font-bold" style={{ color: good ? "#34d399" : "#f43f5e" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="font-semibold text-white mb-4">Coverage per Sample</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
                <Bar dataKey="coverage" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Mean Coverage (x)" />
                <Bar dataKey="pct20x" fill="#10b981" radius={[4, 4, 0, 0]} name="% ≥20x" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="font-semibold text-white mb-4">QC Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 11 }} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <h3 className="font-semibold text-white">Sample QC Details</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["Barcode", "Type", "Mean Coverage", "% ≥20x", "Ts/Tv", "Total Variants", "dbSNP %", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((m, i) => {
                const pass = (m.percent_20x ?? 0) >= 90 && (m.mean_coverage ?? 0) >= 25;
                return (
                  <tr key={m.id} style={{ borderBottom: i < metrics.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm font-mono text-blue-400">{m.samples?.barcode ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 capitalize">{m.samples?.sample_type?.replace("_", " ") ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-200 font-mono">{m.mean_coverage?.toFixed(1) ?? "—"}x</td>
                    <td className="px-4 py-3 text-sm font-mono" style={{ color: (m.percent_20x ?? 0) >= 90 ? "#34d399" : "#f43f5e" }}>
                      {m.percent_20x?.toFixed(1) ?? "—"}%
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-300">{m.ts_tv_ratio?.toFixed(3) ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{m.total_variants?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-300">{m.dbsnp_percent?.toFixed(1) ?? "—"}%</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${pass ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}>
                        {pass ? "PASS" : "FAIL"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
