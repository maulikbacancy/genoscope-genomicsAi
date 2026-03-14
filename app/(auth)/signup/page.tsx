"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Dna, ArrowRight, CheckCircle } from "lucide-react";

const ROLES = [
  { value: "clinician", label: "Clinician / Physician" },
  { value: "geneticist", label: "Clinical Geneticist" },
  { value: "lab_technician", label: "Lab Technician" },
  { value: "genetic_counselor", label: "Genetic Counselor" },
  { value: "org_admin", label: "Organization Admin" },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "clinician",
    organization_name: "",
    specialty: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // 1. Sign up the user
    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          role: form.role,
        },
      },
    });

    if (signupError || !data.user) {
      setError(signupError?.message ?? "Signup failed");
      setLoading(false);
      return;
    }

    // 2. Create or find organization
    let orgId: string | null = null;
    if (form.organization_name) {
      const slug = form.organization_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { data: org } = await supabase
        .from("organizations")
        .upsert({ name: form.organization_name, slug, type: "hospital" }, { onConflict: "slug" })
        .select("id")
        .single();
      orgId = org?.id ?? null;
    }

    // 3. Create user profile
    await supabase.from("user_profiles").insert({
      id: data.user.id,
      email: form.email,
      full_name: form.full_name,
      role: form.role,
      organization_id: orgId,
      specialty: form.specialty,
    });

    setStep(3); // success
    setLoading(false);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center rounded-2xl p-10"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(16,185,129,0.15)" }}>
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Account created!</h2>
          <p className="text-slate-400 mb-6">
            Check your email to confirm your account, then sign in to start diagnosing.
          </p>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            Sign in <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            <Dna size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">GenoScope</span>
        </div>

        <div className="rounded-2xl p-8"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}>
          <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-slate-400 mb-8">Join the next generation of genomic diagnostics</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Full name</label>
                <input type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
                  placeholder="Dr. Jane Smith" required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit" }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="jane@hospital.org" required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit" }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                  placeholder="Min. 8 characters" required minLength={8}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit" }} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <select value={form.role} onChange={(e) => set("role", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit" }}>
                  {ROLES.map((r) => <option key={r.value} value={r.value} style={{ background: "#1e293b" }}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Specialty (optional)</label>
                <input type="text" value={form.specialty} onChange={(e) => set("specialty", e.target.value)}
                  placeholder="e.g. Neurology"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit" }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Organization name</label>
                <input type="text" value={form.organization_name} onChange={(e) => set("organization_name", e.target.value)}
                  placeholder="Boston Children's Hospital"
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit" }} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : <>Create account <ArrowRight size={18} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
