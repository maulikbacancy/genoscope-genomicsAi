"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { getPathogenicityBadgeClass } from "@/lib/utils";
import Link from "next/link";
import { GitBranch, Filter } from "lucide-react";

const CLASSIFICATIONS = ["all", "pathogenic", "likely_pathogenic", "vus", "likely_benign", "benign"] as const;

interface Props { variants: any[]; }

export function VariantsClient({ variants }: Props) {
  const [classFilter, setClassFilter] = useState("all");
  const [geneSearch, setGeneSearch] = useState("");

  const filtered = variants.filter((v) => {
    const matchClass = classFilter === "all" || v.classification === classFilter;
    const matchGene = !geneSearch || (v.gene_symbol ?? "").toLowerCase().includes(geneSearch.toLowerCase());
    return matchClass && matchGene;
  });

  const counts = CLASSIFICATIONS.reduce((acc, c) => {
    acc[c] = c === "all" ? variants.length : variants.filter((v) => v.classification === c).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Variants" subtitle={`${variants.length} variants across all cases`} />
      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <input value={geneSearch} onChange={(e) => setGeneSearch(e.target.value)}
            placeholder="Filter by gene symbol..."
            className="field-input px-4 py-2.5 rounded-xl text-sm outline-none w-48"
            style={{ fontFamily: "'JetBrains Mono', monospace" }} />
          <div className="flex flex-wrap gap-2">
            {CLASSIFICATIONS.map((c) => (
              <button key={c} onClick={() => setClassFilter(c)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all capitalize flex items-center gap-1.5 ${classFilter === c ? "ring-1 ring-white/20" : ""}`}
                style={{
                  background: classFilter === c ? "rgba(59,130,246,0.2)" : "var(--bg-card)",
                  border: `1px solid ${classFilter === c ? "rgba(59,130,246,0.3)" : "var(--border)"}`,
                  color: classFilter === c ? "#60a5fa" : "var(--text-secondary)",
                }}>
                {c.replace("_", " ")}
                <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: "var(--bg-input)" }}>
                  {counts[c]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="card rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <GitBranch size={32} className="mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No variants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Gene", "HGVS", "Consequence", "Classification", "gnomAD AF", "ClinVar", "Case", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 100).map((v, i) => (
                    <tr key={v.id}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                      className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-sm font-bold font-mono" style={{ color: "var(--text-primary)" }}>{v.gene_symbol ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-mono max-w-xs truncate" style={{ color: "var(--text-primary)" }}>{v.hgvs_c ?? `chr${v.chromosome}:${v.position}`}</div>
                        {v.hgvs_p && <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{v.hgvs_p}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-32 truncate" style={{ color: "var(--text-secondary)" }}>{v.consequence ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getPathogenicityBadgeClass(v.classification)}`}>
                          {v.classification?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                        {v.gnomad_af ? v.gnomad_af.toExponential(2) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-28 truncate" style={{ color: "var(--text-secondary)" }}>{v.clinvar_significance ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Link href={`/cases/${v.case_id}`} className="text-xs text-blue-400 hover:text-blue-300 font-mono">
                          {v.cases?.case_number ?? "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          defaultValue={v.classification}
                          onChange={async (e) => {
                            await fetch("/api/variants/classify", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ variant_id: v.id, classification: e.target.value }),
                            });
                          }}
                          className="field-input text-xs px-2 py-1 rounded-lg outline-none">
                          {["pathogenic", "likely_pathogenic", "vus", "likely_benign", "benign"].map((c) => (
                            <option key={c} value={c} style={{ background: "var(--bg-card-solid)" }}>{c.replace(/_/g, " ")}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 100 && (
                <div className="px-6 py-3 text-sm border-t" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                  Showing 100 of {filtered.length} variants
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
