import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { FileText } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user!.id).single();

  const { data: reports } = await supabase
    .from("reports")
    .select("*, cases(case_number, organization_id, patients(first_name, last_name))")
    .order("created_at", { ascending: false });

  const filtered = (reports ?? []).filter((r) => r.cases?.organization_id === profile?.organization_id);

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Reports" subtitle={`${filtered.length} clinical reports`} />
      <div className="p-6">
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {!filtered.length ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText size={32} className="text-slate-600 mb-3" />
              <p className="text-slate-400 mb-2">No reports generated yet</p>
              <p className="text-slate-500 text-sm">Generate reports from case detail pages</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Report #", "Patient", "Case", "Status", "Summary", "Created"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any, i) => (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                    className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <Link href={`/reports/${r.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-sm font-medium">
                        {r.report_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">
                      {r.cases?.patients?.first_name} {r.cases?.patients?.last_name}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/cases/${r.case_id}`} className="text-sm text-blue-400 hover:text-blue-300 font-mono">
                        {r.cases?.case_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        r.status === "final" ? "text-emerald-400 bg-emerald-400/10" :
                        r.status === "review" ? "text-amber-400 bg-amber-400/10" :
                        "text-blue-400 bg-blue-400/10"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">{r.summary?.slice(0, 80)}...</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{formatDate(r.created_at)}</td>
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
