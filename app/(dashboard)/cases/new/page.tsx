"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save, Plus, X, Search } from "lucide-react";
import Link from "next/link";

const inputClass = "field-input w-full px-4 py-3 rounded-xl text-sm outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>{label}</label>
      {children}
    </div>
  );
}

// HPO search mock (in production, call HPO API)
const COMMON_HPO_TERMS = [
  { hpo_id: "HP:0001250", name: "Seizures" },
  { hpo_id: "HP:0001290", name: "Hypotonia" },
  { hpo_id: "HP:0001263", name: "Global developmental delay" },
  { hpo_id: "HP:0000252", name: "Microcephaly" },
  { hpo_id: "HP:0000648", name: "Optic atrophy" },
  { hpo_id: "HP:0002011", name: "Morphological abnormality of the central nervous system" },
  { hpo_id: "HP:0003326", name: "Myalgia" },
  { hpo_id: "HP:0001629", name: "Ventricular septal defect" },
  { hpo_id: "HP:0000407", name: "Sensorineural hearing impairment" },
  { hpo_id: "HP:0001513", name: "Obesity" },
  { hpo_id: "HP:0000486", name: "Strabismus" },
  { hpo_id: "HP:0002187", name: "Intellectual disability, profound" },
  { hpo_id: "HP:0001045", name: "Vitiligo" },
  { hpo_id: "HP:0000365", name: "Hearing impairment" },
  { hpo_id: "HP:0001903", name: "Anemia" },
];

function NewCaseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatient = searchParams.get("patient");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [phenoSearch, setPhenoSearch] = useState("");
  const [showPhenoDropdown, setShowPhenoDropdown] = useState(false);
  const [selectedPhenotypes, setSelectedPhenotypes] = useState<typeof COMMON_HPO_TERMS>([]);

  const [form, setForm] = useState({
    patient_id: preselectedPatient ?? "",
    priority: "routine",
    clinical_notes: "",
    family_history: "",
    inheritance_pattern: "unknown",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user!.id).single();
      const { data } = await supabase.from("patients").select("id, first_name, last_name, mrn")
        .eq("organization_id", profile?.organization_id ?? "").order("last_name");
      setPatients(data ?? []);
    };
    load();
  }, []);

  const filteredHPO = COMMON_HPO_TERMS.filter((t) =>
    t.name.toLowerCase().includes(phenoSearch.toLowerCase()) &&
    !selectedPhenotypes.find((s) => s.hpo_id === t.hpo_id)
  );

  const addPhenotype = (term: typeof COMMON_HPO_TERMS[0]) => {
    setSelectedPhenotypes((p) => [...p, term]);
    setPhenoSearch("");
    setShowPhenoDropdown(false);
  };

  const removePhenotype = (hpo_id: string) => setSelectedPhenotypes((p) => p.filter((t) => t.hpo_id !== hpo_id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user!.id).single();

    // Generate case number
    const caseNumber = `GS-${Date.now().toString().slice(-8)}`;

    const { data: newCase, error: caseErr } = await supabase.from("cases").insert({
      case_number: caseNumber,
      patient_id: form.patient_id,
      organization_id: profile?.organization_id,
      assigned_clinician_id: user!.id,
      status: "new",
      priority: form.priority,
      clinical_notes: form.clinical_notes,
      family_history: form.family_history,
      inheritance_pattern: form.inheritance_pattern,
    }).select().single();

    if (caseErr || !newCase) { setError(caseErr?.message ?? "Failed to create case"); setLoading(false); return; }

    // Insert phenotypes
    if (selectedPhenotypes.length > 0) {
      await supabase.from("case_phenotypes").insert(
        selectedPhenotypes.map((p) => ({ case_id: newCase.id, hpo_id: p.hpo_id, name: p.name }))
      );
    }

    router.push(`/cases/${newCase.id}`);
  };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="New Case" subtitle="Create a genomic analysis case" />
      <div className="p-6 max-w-3xl mx-auto w-full">
        <Link href="/cases" className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft size={16} /> Back to cases
        </Link>

        <div className="card rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Case Information</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Patient *">
                <select value={form.patient_id} onChange={(e) => set("patient_id", e.target.value)} required
                  className={inputClass}>
                  <option value="" style={{ background: "var(--bg-card-solid)" }}>Select patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id} style={{ background: "var(--bg-card-solid)" }}>
                      {p.first_name} {p.last_name} ({p.mrn})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Priority *">
                <select value={form.priority} onChange={(e) => set("priority", e.target.value)}
                  className={inputClass}>
                  <option value="routine" style={{ background: "var(--bg-card-solid)" }}>Routine</option>
                  <option value="urgent" style={{ background: "var(--bg-card-solid)" }}>Urgent</option>
                  <option value="stat" style={{ background: "var(--bg-card-solid)" }}>STAT (Emergency)</option>
                </select>
              </Field>
            </div>

            <Field label="Inheritance Pattern">
              <select value={form.inheritance_pattern} onChange={(e) => set("inheritance_pattern", e.target.value)}
                className={inputClass}>
                <option value="unknown" style={{ background: "var(--bg-card-solid)" }}>Unknown</option>
                <option value="autosomal_dominant" style={{ background: "var(--bg-card-solid)" }}>Autosomal Dominant</option>
                <option value="autosomal_recessive" style={{ background: "var(--bg-card-solid)" }}>Autosomal Recessive</option>
                <option value="x_linked" style={{ background: "var(--bg-card-solid)" }}>X-Linked</option>
                <option value="y_linked" style={{ background: "var(--bg-card-solid)" }}>Y-Linked</option>
                <option value="mitochondrial" style={{ background: "var(--bg-card-solid)" }}>Mitochondrial</option>
              </select>
            </Field>

            {/* Phenotype selector */}
            <Field label="Clinical Phenotypes (HPO Terms)">
              <div className="space-y-2">
                {selectedPhenotypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl"
                    style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}>
                    {selectedPhenotypes.map((t) => (
                      <span key={t.hpo_id} className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg text-blue-300"
                        style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)" }}>
                        <span className="text-xs text-blue-500 font-mono">{t.hpo_id}</span>
                        {t.name}
                        <button type="button" onClick={() => removePhenotype(t.hpo_id)} className="hover:text-rose-400">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input value={phenoSearch}
                    onChange={(e) => { setPhenoSearch(e.target.value); setShowPhenoDropdown(true); }}
                    onFocus={() => setShowPhenoDropdown(true)}
                    placeholder="Search HPO terms (e.g. seizures, hypotonia)..."
                    className="field-input w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none" />
                  {showPhenoDropdown && filteredHPO.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
                      style={{ background: "var(--bg-card-solid)", border: "1px solid var(--border)" }}>
                      {filteredHPO.slice(0, 8).map((t) => (
                        <button key={t.hpo_id} type="button" onClick={() => addPhenotype(t)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-center gap-3">
                          <span className="text-xs font-mono w-24 flex-shrink-0" style={{ color: "var(--text-muted)" }}>{t.hpo_id}</span>
                          <span style={{ color: "var(--text-primary)" }}>{t.name}</span>
                          <Plus size={12} className="ml-auto text-blue-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Field>

            <Field label="Clinical Notes">
              <textarea value={form.clinical_notes} onChange={(e) => set("clinical_notes", e.target.value)}
                placeholder="Describe the patient's clinical presentation, symptoms, and history..."
                rows={4}
                className="field-input w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" />
            </Field>

            <Field label="Family History">
              <textarea value={form.family_history} onChange={(e) => set("family_history", e.target.value)}
                placeholder="Describe relevant family medical history, consanguinity, affected relatives..."
                rows={3}
                className="field-input w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" />
            </Field>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                Create Case
              </button>
              <Link href="/cases"
                className="px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewCasePage() {
  return (
    <Suspense fallback={<div className="p-6" style={{ color: "var(--text-secondary)" }}>Loading...</div>}>
      <NewCaseForm />
    </Suspense>
  );
}
