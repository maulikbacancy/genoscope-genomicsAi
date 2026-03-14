import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { FlaskConical } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function SamplesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user!.id).single();

  // Get case IDs for this org first
  const { data: orgCases } = await supabase
    .from("cases")
    .select("id")
    .eq("organization_id", profile?.organization_id ?? "");

  const caseIds = (orgCases ?? []).map((c) => c.id);

  const { data: samples } = caseIds.length > 0
    ? await supabase
        .from("samples")
        .select("*, cases(case_number, patients(first_name, last_name))")
        .in("case_id", caseIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Samples" subtitle={`${samples?.length ?? 0} samples tracked`} action={{ label: "Upload Sample", href: "/samples/new" }} />
      <div className="p-6">
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {!samples?.length ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FlaskConical size={32} className="text-slate-600 mb-3" />
              <p className="text-slate-400 mb-4">No samples uploaded yet</p>
              <Link href="/samples/new" className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                Upload First Sample
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Barcode", "Patient", "Case", "Type", "Status", "QC", "Date"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(samples ?? []).map((s: any, i: number) => (
                  <tr key={s.id}
                    style={{ borderBottom: i < (samples?.length ?? 0) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 text-sm font-mono text-blue-400">{s.barcode}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      {s.cases?.patients?.first_name} {s.cases?.patients?.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/cases/${s.case_id}`} className="text-sm text-blue-400 hover:text-blue-300 font-mono">
                        {s.cases?.case_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 capitalize">{s.sample_type?.replace("_", " ")}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        s.status === "completed" ? "text-emerald-400 bg-emerald-400/10" :
                        s.status === "processing" ? "text-amber-400 bg-amber-400/10" :
                        s.status === "failed" ? "text-rose-400 bg-rose-400/10" :
                        "text-slate-400 bg-slate-400/10"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {s.qc_status ? (
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium ${s.qc_status === "pass" ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"}`}>
                          {s.qc_status}
                        </span>
                      ) : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(s.created_at)}</td>
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
