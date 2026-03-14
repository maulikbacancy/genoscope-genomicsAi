"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none";
const inputStyle = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit" };

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "", last_name: "", date_of_birth: "", sex: "male",
    mrn: "", ethnicity: "", referring_physician: "", contact_email: "", contact_phone: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user!.id).single();

    const { data, error: err } = await supabase.from("patients").insert({
      ...form,
      organization_id: profile?.organization_id,
    }).select().single();

    if (err) { setError(err.message); setLoading(false); return; }
    router.push(`/patients/${data.id}`);
  };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="New Patient" subtitle="Register a new patient" />
      <div className="p-6 max-w-2xl mx-auto w-full">
        <Link href="/patients" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6">
          <ArrowLeft size={16} /> Back to patients
        </Link>

        <div className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-xl font-bold text-white mb-6">Patient Information</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name *">
                <input type="text" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required
                  placeholder="Jane" className={inputClass} style={inputStyle} />
              </Field>
              <Field label="Last name *">
                <input type="text" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} required
                  placeholder="Smith" className={inputClass} style={inputStyle} />
              </Field>
              <Field label="Medical Record Number *">
                <input type="text" value={form.mrn} onChange={(e) => set("mrn", e.target.value)} required
                  placeholder="MRN-001234" className={inputClass} style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} />
              </Field>
              <Field label="Date of birth *">
                <input type="date" value={form.date_of_birth} onChange={(e) => set("date_of_birth", e.target.value)} required
                  className={inputClass} style={{ ...inputStyle, colorScheme: "dark" }} />
              </Field>
              <Field label="Biological sex *">
                <select value={form.sex} onChange={(e) => set("sex", e.target.value)}
                  className={inputClass} style={{ ...inputStyle }}>
                  <option value="male" style={{ background: "#1e293b" }}>Male</option>
                  <option value="female" style={{ background: "#1e293b" }}>Female</option>
                  <option value="other" style={{ background: "#1e293b" }}>Other</option>
                </select>
              </Field>
              <Field label="Ethnicity">
                <input type="text" value={form.ethnicity} onChange={(e) => set("ethnicity", e.target.value)}
                  placeholder="e.g. European" className={inputClass} style={inputStyle} />
              </Field>
            </div>

            <div className="border-t pt-4 mt-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <h3 className="text-sm font-medium text-slate-300 mb-4">Clinical Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Referring physician">
                  <input type="text" value={form.referring_physician} onChange={(e) => set("referring_physician", e.target.value)}
                    placeholder="Dr. John Anderson" className={inputClass} style={inputStyle} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Contact email">
                    <input type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)}
                      placeholder="patient@email.com" className={inputClass} style={inputStyle} />
                  </Field>
                  <Field label="Contact phone">
                    <input type="tel" value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)}
                      placeholder="+1 (555) 000-0000" className={inputClass} style={inputStyle} />
                  </Field>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                Save Patient
              </button>
              <Link href="/patients"
                className="px-6 py-3 rounded-xl font-semibold text-slate-400 hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
