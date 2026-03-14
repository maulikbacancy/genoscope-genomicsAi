import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { formatDate, getPathogenicityBadgeClass } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Download, Printer } from "lucide-react";
import Link from "next/link";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("reports")
    .select("*, cases(*, patients(*), case_phenotypes(*))")
    .eq("id", id)
    .single();

  if (!report) notFound();

  const { data: variants } = await supabase
    .from("variants")
    .select("*")
    .eq("case_id", report.case_id)
    .in("classification", ["pathogenic", "likely_pathogenic", "vus"]);

  const { data: diagnoses } = await supabase
    .from("ai_diagnoses")
    .select("*")
    .eq("case_id", report.case_id)
    .order("rank");

  const patient = report.cases?.patients;

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title={report.report_number} subtitle="Clinical Genomics Report" />
      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <Link href="/reports" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
            <ArrowLeft size={16} /> Back to reports
          </Link>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
              report.status === "final" ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" :
              "text-amber-400 bg-amber-400/10 border border-amber-400/20"}`}>
              {report.status}
            </span>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-300 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onClick={() => window.print()}>
              <Printer size={14} /> Print
            </button>
          </div>
        </div>

        {/* Report content */}
        <div className="space-y-6" id="report-content">
          {/* Header */}
          <div className="rounded-2xl p-6"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-white">Clinical Genomics Report</h1>
                <p className="text-slate-400 text-sm">{report.report_number}</p>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>Generated: {formatDate(report.created_at)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {[
                { label: "Patient Name", value: `${patient?.first_name} ${patient?.last_name}` },
                { label: "MRN", value: patient?.mrn },
                { label: "Date of Birth", value: patient?.date_of_birth ? formatDate(patient.date_of_birth) : "—" },
                { label: "Sex", value: patient?.sex ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) : "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-slate-500 mb-1">{label}</div>
                  <div className="text-sm font-medium text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Executive Summary</h2>
            <p className="text-slate-300 leading-relaxed">{report.summary}</p>
          </div>

          {/* Clinical Interpretation */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Clinical Interpretation</h2>
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.interpretation}</div>
          </div>

          {/* Variants */}
          {variants && variants.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                <h2 className="text-lg font-bold text-white">Reportable Variants</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {["Gene", "Variant", "Classification", "Consequence", "gnomAD AF"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: i < variants.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <td className="px-6 py-3 text-sm font-bold text-white font-mono">{v.gene_symbol ?? "—"}</td>
                      <td className="px-6 py-3 text-xs font-mono text-slate-300">{v.hgvs_c ?? `${v.chromosome}:${v.position}`}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getPathogenicityBadgeClass(v.classification)}`}>
                          {v.classification?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-400">{v.consequence ?? "—"}</td>
                      <td className="px-6 py-3 text-xs font-mono text-slate-400">
                        {v.gnomad_af ? v.gnomad_af.toExponential(2) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* AI Diagnoses */}
          {diagnoses && diagnoses.length > 0 && (
            <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 className="text-lg font-bold text-white mb-4">Differential Diagnoses</h2>
              <div className="space-y-3">
                {diagnoses.slice(0, 3).map((d: any) => (
                  <div key={d.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="text-slate-500 text-sm font-mono">#{d.rank}</span>
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm">{d.disease_name}</div>
                      {d.omim_id && <div className="text-xs text-slate-500">OMIM: {d.omim_id}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm" style={{ color: d.confidence >= 70 ? "#10b981" : d.confidence >= 40 ? "#fbbf24" : "#94a3b8" }}>
                        {d.confidence}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-lg font-bold text-white mb-4">Recommendations</h2>
            <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.recommendations}</div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-xs text-slate-500">
              This report is generated by GenoScope AI. Clinical validation by a certified geneticist is required before clinical use.
            </p>
            {report.status === "draft" && (
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
                onClick={async () => {
                  await fetch(`/api/reports/finalize`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ report_id: id }) });
                  window.location.reload();
                }}>
                <CheckCircle size={14} /> Approve & Finalize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
