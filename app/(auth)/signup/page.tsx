"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Dna, ArrowRight, CheckCircle } from "lucide-react";

const ROLES = [
  { value: "clinician",          label: "Clinician / Physician" },
  { value: "geneticist",         label: "Clinical Geneticist" },
  { value: "lab_technician",     label: "Lab Technician" },
  { value: "genetic_counselor",  label: "Genetic Counselor" },
  { value: "org_admin",          label: "Organization Admin" },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [form, setForm]     = useState({
    email: "", password: "", full_name: "",
    role: "clinician", organization_name: "", specialty: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const sb = createClient();
    const orgName = form.organization_name.trim();

    if (!orgName) {
      setError("Organization is required.");
      setLoading(false);
      return;
    }

    const { data, error: err } = await sb.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: form.role } },
    });

    if (err || !data.user) { setError(err?.message ?? "Signup failed"); setLoading(false); return; }

    let orgId: string | null = null;
    const slug = orgName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { data: existingOrg, error: orgLookupErr } = await sb
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (orgLookupErr) {
      setError(orgLookupErr.message);
      setLoading(false);
      return;
    }

    if (existingOrg?.id) {
      orgId = existingOrg.id;
    } else {
      const { data: createdOrg, error: orgCreateErr } = await sb
        .from("organizations")
        .insert({ name: orgName, slug, type: "hospital" })
        .select("id")
        .single();

      if (orgCreateErr || !createdOrg?.id) {
        setError(orgCreateErr?.message ?? "Failed to create organization");
        setLoading(false);
        return;
      }

      orgId = createdOrg.id;
    }

    const { error: profileErr } = await sb.from("user_profiles").upsert({
      id: data.user.id, email: form.email, full_name: form.full_name,
      role: form.role, organization_id: orgId, specialty: form.specialty,
    }, { onConflict: "id" });

    if (profileErr) {
      setError(profileErr.message);
      setLoading(false);
      return;
    }

    setStep(3); setLoading(false);
  };

  if (step === 3) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="auth-card w-full max-w-md rounded-2xl p-10 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(16,185,129,0.12)" }}>
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Account created!</h2>
        <p className="mb-6 text-sm" style={{ color: "var(--text-secondary)" }}>
          Check your email to confirm your account, then sign in.
        </p>
        <Link href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
          Sign in <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );

  const inputCls = "field-input w-full px-4 py-3 text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
            <Dna size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>GenoScope</span>
        </div>

        <div className="auth-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Create your account</h2>
          <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
            Join the next generation of genomic diagnostics
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm"
              style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Full name</label>
                <input type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
                  placeholder="Dr. Jane Smith" required className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Email</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="jane@hospital.org" required className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Password</label>
                <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                  placeholder="Min. 8 characters" required minLength={8} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Role</label>
                <select value={form.role} onChange={(e) => set("role", e.target.value)} className={inputCls}
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "0.75rem" }}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Specialty</label>
                <input type="text" value={form.specialty} onChange={(e) => set("specialty", e.target.value)}
                  placeholder="e.g. Neurology" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Organization *</label>
                <input type="text" value={form.organization_name} onChange={(e) => set("organization_name", e.target.value)}
                  placeholder="Boston Children's Hospital" required className={inputCls} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
              {loading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><span>Create account</span><ArrowRight size={17} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:opacity-80" style={{ color: "var(--primary)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
