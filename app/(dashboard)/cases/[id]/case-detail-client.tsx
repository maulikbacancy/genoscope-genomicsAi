"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { formatDate, getCaseStatusColor, getPathogenicityBadgeClass } from "@/lib/utils";
import {
  ArrowLeft, FlaskConical, Brain, FileText, MessageSquare, User, Calendar,
  GitBranch, Activity, Zap, ChevronDown, Send, Loader2, CheckCircle, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const TABS = ["Overview", "Variants", "AI Analysis", "Reports", "Discussion"] as const;

interface Props {
  caseData: any;
  variants: any[];
  aiDiagnoses: any[];
  samples: any[];
  comments: any[];
}

export function CaseDetailClient({ caseData, variants, aiDiagnoses: initialDiagnoses, samples, comments: initialComments }: Props) {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Overview");
  const [running, setRunning] = useState(false);
  const [diagnoses, setDiagnoses] = useState(initialDiagnoses);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const patient = caseData.patients;
  const phenotypes = caseData.case_phenotypes ?? [];

  const runAIAnalysis = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/analysis/ai-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseData.id }),
      });
      const data = await res.json();
      if (data.diagnoses) setDiagnoses(data.diagnoses);
      setActiveTab("AI Analysis");
    } catch (e) {
      console.error(e);
    } finally {
      setRunning(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("case_comments").insert({
      case_id: caseData.id, user_id: user!.id, content: newComment,
    }).select("*, user_profiles(full_name, role)").single();
    if (data) { setComments((c) => [...c, data]); setNewComment(""); }
  };

  const updateStatus = async (status: string) => {
    setStatusUpdating(true);
    const supabase = createClient();
    await supabase.from("cases").update({ status }).eq("id", caseData.id);
    setStatusUpdating(false);
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar
        title={caseData.case_number}
        subtitle={`${patient?.first_name} ${patient?.last_name}`}
        action={{ label: "Upload Sample", href: `/samples/new?case=${caseData.id}` }}
      />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Link href="/cases" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <ArrowLeft size={16} /> Back
          </Link>
          <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${getCaseStatusColor(caseData.status)}`}>
            {caseData.status}
          </span>
          <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
            caseData.priority === "stat" ? "text-rose-400 bg-rose-400/10" :
            caseData.priority === "urgent" ? "text-amber-400 bg-amber-400/10" :
            "text-slate-400 bg-slate-400/10"}`}>
            {caseData.priority}
          </span>

          {/* Status update */}
          <div className="ml-auto flex items-center gap-2">
            <select
              onChange={(e) => updateStatus(e.target.value)}
              defaultValue={caseData.status}
              disabled={statusUpdating}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-300 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit" }}>
              <option value="new" style={{ background: "#1e293b" }}>New</option>
              <option value="sequencing" style={{ background: "#1e293b" }}>Sequencing</option>
              <option value="analysis" style={{ background: "#1e293b" }}>Analysis</option>
              <option value="review" style={{ background: "#1e293b" }}>Review</option>
              <option value="closed" style={{ background: "#1e293b" }}>Closed</option>
              <option value="reanalysis" style={{ background: "#1e293b" }}>Reanalysis</option>
            </select>
            <button onClick={runAIAnalysis} disabled={running}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
              {running ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
              {running ? "Analyzing..." : "Run AI Analysis"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-sm font-medium transition-all relative"
              style={{ color: activeTab === tab ? "#60a5fa" : "#64748b" }}>
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: "#3b82f6" }} />
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <User size={16} className="text-blue-400" /> Patient
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name</span>
                    <Link href={`/patients/${patient?.id}`} className="text-blue-400 hover:text-blue-300">
                      {patient?.first_name} {patient?.last_name}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MRN</span>
                    <span className="text-slate-200 font-mono text-xs">{patient?.mrn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sex</span>
                    <span className="text-slate-200 capitalize">{patient?.sex}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-purple-400" /> Phenotypes
                </h3>
                {phenotypes.length === 0 ? (
                  <p className="text-slate-500 text-sm">No phenotypes recorded</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {phenotypes.map((p: any) => (
                      <span key={p.id} className="text-xs px-2.5 py-1 rounded-lg"
                        style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#c4b5fd" }}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="font-semibold text-white mb-4">Clinical Notes</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {caseData.clinical_notes || <span className="text-slate-500 italic">No clinical notes recorded</span>}
                </p>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="font-semibold text-white mb-4">Family History</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {caseData.family_history || <span className="text-slate-500 italic">No family history recorded</span>}
                </p>
              </div>

              {/* Samples */}
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <FlaskConical size={16} className="text-cyan-400" /> Samples
                  </h3>
                  <Link href={`/samples/new?case=${caseData.id}`} className="text-sm text-blue-400 hover:text-blue-300">+ Upload</Link>
                </div>
                {samples.length === 0 ? (
                  <div className="text-center py-6">
                    <FlaskConical size={24} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No samples uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {samples.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)" }}>
                        <div>
                          <span className="text-sm font-medium text-slate-200 font-mono">{s.barcode}</span>
                          <span className="text-xs text-slate-500 ml-2">{s.sample_type.replace("_", " ")}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-lg ${
                          s.status === "completed" ? "text-emerald-400 bg-emerald-400/10" :
                          s.status === "processing" ? "text-amber-400 bg-amber-400/10" :
                          "text-slate-400 bg-slate-400/10"}`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Variants Tab */}
        {activeTab === "Variants" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {variants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <GitBranch size={32} className="text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm mb-2">No variants found</p>
                <p className="text-slate-500 text-xs">Upload a VCF file to start variant analysis</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["Gene", "Variant", "Consequence", "Classification", "gnomAD AF", "ClinVar"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: i < variants.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                      className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm font-semibold text-white font-mono">{v.gene_symbol ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-mono text-slate-300">{v.hgvs_c ?? `${v.chromosome}:${v.position}`}</div>
                        {v.hgvs_p && <div className="text-xs font-mono text-slate-500">{v.hgvs_p}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{v.consequence ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getPathogenicityBadgeClass(v.classification)}`}>
                          {v.classification?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-400">
                        {v.gnomad_af ? v.gnomad_af.toExponential(2) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{v.clinvar_significance ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === "AI Analysis" && (
          <div className="space-y-4">
            {running && (
              <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse"
                  style={{ background: "rgba(139,92,246,0.15)" }}>
                  <Brain size={28} className="text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">AI Analysis Running</h3>
                <p className="text-slate-400 text-sm">Analyzing variants and phenotypes with GPT-4o...</p>
                <div className="flex justify-center gap-1 mt-4">
                  {[0,1,2].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            )}
            {!running && diagnoses.length === 0 && (
              <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <Brain size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">No AI analysis yet</p>
                <p className="text-slate-500 text-sm mb-4">Upload samples and run AI analysis to get disease predictions</p>
                <button onClick={runAIAnalysis}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #8b5cf6, #3b82f6)" }}>
                  Run Analysis Now
                </button>
              </div>
            )}
            {diagnoses.map((d: any) => (
              <div key={d.id} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-mono text-slate-400"
                        style={{ background: "rgba(255,255,255,0.05)" }}>#{d.rank}</span>
                      <h3 className="text-white font-semibold">{d.disease_name}</h3>
                      {d.omim_id && <span className="text-xs text-slate-500 font-mono">OMIM:{d.omim_id}</span>}
                    </div>
                    {d.inheritance_pattern && (
                      <span className="text-xs text-slate-400">{d.inheritance_pattern.replace(/_/g, " ")}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{
                      color: d.confidence >= 70 ? "#10b981" : d.confidence >= 40 ? "#fbbf24" : "#94a3b8"
                    }}>
                      {d.confidence}%
                    </div>
                    <div className="text-xs text-slate-500">confidence</div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="h-1.5 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${d.confidence}%`,
                      background: d.confidence >= 70 ? "#10b981" : d.confidence >= 40 ? "#fbbf24" : "#94a3b8",
                    }} />
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-4">{d.reasoning}</p>

                {d.next_steps?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Recommended Next Steps</h4>
                    <ul className="space-y-1">
                      {d.next_steps.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "Reports" && (
          <div className="text-center py-16">
            <FileText size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Generate a clinical report for this case</p>
            <button
              onClick={async () => {
                const res = await fetch("/api/reports/generate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ case_id: caseData.id }),
                });
                const data = await res.json();
                if (data.id) window.location.href = `/reports/${data.id}`;
              }}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
              Generate Report
            </button>
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === "Discussion" && (
          <div className="space-y-4 max-w-3xl">
            {comments.map((c: any) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                  {c.user_profiles?.full_name?.[0] ?? "U"}
                </div>
                <div className="flex-1 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-white">{c.user_profiles?.full_name}</span>
                    <span className="text-xs text-slate-500 capitalize">{c.user_profiles?.role?.replace("_", " ")}</span>
                    <span className="text-xs text-slate-600 ml-auto">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{c.content}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <div className="flex-1 relative">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "inherit" }} />
                <button onClick={addComment} disabled={!newComment.trim()}
                  className="absolute right-3 bottom-3 p-2 rounded-lg transition-all disabled:opacity-40"
                  style={{ background: "rgba(59,130,246,0.2)" }}>
                  <Send size={14} className="text-blue-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
