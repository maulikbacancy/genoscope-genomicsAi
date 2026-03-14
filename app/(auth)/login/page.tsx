"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Dna, Eye, EyeOff, ArrowRight, Zap, Shield, Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const sb = createClient();
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  };

  const demoLogin = async (role: string) => {
    const demos: Record<string, { email: string; password: string }> = {
      clinician:  { email: "clinician@demo.genoscope.ai",  password: "demo123456" },
      geneticist: { email: "geneticist@demo.genoscope.ai", password: "demo123456" },
      lab:        { email: "lab@demo.genoscope.ai",        password: "demo123456" },
    };
    const creds = demos[role];
    if (!creds) return;
    setLoading(true); setError("");
    const sb = createClient();
    const { error: err } = await sb.auth.signInWithPassword(creds);
    if (err) { setError("Demo account not set up. Please create an account."); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
            <Dna size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>GenoScope</span>
        </div>

        {/* Hero text */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-4" style={{ color: "var(--text-primary)" }}>
              Decode rare diseases
              <span className="block geno-gradient-text">with AI precision</span>
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              AI-powered genomic diagnostics that reduce time-to-diagnosis from years to weeks.
              Serving 400M+ rare disease patients worldwide.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Zap, title: "10x Faster Diagnosis", desc: "AI analysis in minutes, not months" },
              { icon: Shield, title: "HIPAA & GDPR Compliant", desc: "Enterprise-grade security for clinical data" },
              { icon: Activity, title: "95% Diagnostic Accuracy", desc: "Powered by GPT-4o + genomic databases" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--primary-glow)" }}>
                  <Icon size={18} style={{ color: "var(--primary)" }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{title}</div>
                  <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Trusted by 50+ academic medical centers worldwide
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
              <Dna size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>GenoScope</span>
          </div>

          <div className="auth-card rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Welcome back</h2>
            <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>Sign in to your GenoScope account</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
                style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Email address
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hospital.org" required
                  className="field-input w-full px-4 py-3 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Password
                </label>
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="field-input w-full px-4 py-3 pr-12 text-sm" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
                    style={{ color: "var(--text-muted)" }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                  <input type="checkbox" className="rounded" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-sm hover:opacity-80"
                  style={{ color: "var(--primary)" }}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                {loading
                  ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span>Sign in</span><ArrowRight size={17} /></>}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Try demo</span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Clinician",  role: "clinician" },
                  { label: "Geneticist", role: "geneticist" },
                  { label: "Lab Tech",   role: "lab" },
                ].map(({ label, role }) => (
                  <button key={role} onClick={() => demoLogin(role)}
                    className="card py-2 px-3 rounded-xl text-xs text-center transition-all hover:scale-105"
                    style={{ color: "var(--text-secondary)" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
              No account?{" "}
              <Link href="/signup" className="font-medium hover:opacity-80" style={{ color: "var(--primary)" }}>
                Request access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
