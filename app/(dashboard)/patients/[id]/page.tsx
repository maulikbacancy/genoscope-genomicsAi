import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Calendar, User, Phone, Mail, FolderOpen, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate, getCaseStatusColor } from "@/lib/utils";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: patient } = await supabase.from("patients").select("*").eq("id", id).single();
  if (!patient) notFound();

  const { data: cases } = await supabase
    .from("cases")
    .select("*, case_phenotypes(*)")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  const age = Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000));

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title={`${patient.first_name} ${patient.last_name}`} subtitle={`MRN: ${patient.mrn}`}
        action={{ label: "New Case", href: `/cases/new?patient=${id}` }} />
      <div className="p-6 space-y-6">
        <Link href="/patients" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft size={16} /> Back to patients
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient info card */}
          <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                {patient.first_name[0]}{patient.last_name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{patient.first_name} {patient.last_name}</h2>
                <p className="text-slate-400 text-sm font-mono">MRN: {patient.mrn}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: Calendar, label: "Date of Birth", value: `${formatDate(patient.date_of_birth)} (Age ${age})` },
                { icon: User, label: "Sex", value: patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1) },
                ...(patient.ethnicity ? [{ icon: User, label: "Ethnicity", value: patient.ethnicity }] : []),
                ...(patient.referring_physician ? [{ icon: User, label: "Referring MD", value: patient.referring_physician }] : []),
                ...(patient.contact_email ? [{ icon: Mail, label: "Email", value: patient.contact_email }] : []),
                ...(patient.contact_phone ? [{ icon: Phone, label: "Phone", value: patient.contact_phone }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.1)" }}>
                    <Icon size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="text-sm text-slate-200">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cases */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <FolderOpen size={16} className="text-blue-400" /> Cases ({cases?.length ?? 0})
              </h3>
              <Link href={`/cases/new?patient=${id}`}
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
                <Plus size={14} /> New case
              </Link>
            </div>
            {!cases?.length ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FolderOpen size={32} className="text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">No cases for this patient yet</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {cases.map((c) => (
                  <Link key={c.id} href={`/cases/${c.id}`}>
                    <div className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-blue-400 font-medium text-sm">{c.case_number}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${getCaseStatusColor(c.status)}`}>
                            {c.status}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-lg ${
                            c.priority === "stat" ? "text-rose-400 bg-rose-400/10" :
                            c.priority === "urgent" ? "text-amber-400 bg-amber-400/10" :
                            "text-slate-400 bg-slate-400/10"}`}>
                            {c.priority}
                          </span>
                        </div>
                      </div>
                      {c.diagnosis && (
                        <p className="text-sm text-emerald-400 mb-2">✓ {c.diagnosis}</p>
                      )}
                      {c.case_phenotypes?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {c.case_phenotypes.slice(0, 4).map((p: any) => (
                            <span key={p.id} className="text-xs px-2 py-0.5 rounded-md text-slate-400"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              {p.name}
                            </span>
                          ))}
                          {c.case_phenotypes.length > 4 && (
                            <span className="text-xs px-2 py-0.5 rounded-md text-slate-500">
                              +{c.case_phenotypes.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-2">{formatDate(c.created_at)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
