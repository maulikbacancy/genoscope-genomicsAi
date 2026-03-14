"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Dna, Eye, EyeOff, ArrowRight, Zap, Shield, Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleDemoLogin = async (role: string) => {
    const demos: Record<string, { email: string; password: string }> = {
      clinician: { email: "clinician@demo.genoscope.ai", password: "demo123456" },
      geneticist: { email: "geneticist@demo.genoscope.ai", password: "demo123456" },
      lab: { email: "lab@demo.genoscope.ai", password: "demo123456" },
    };
    const creds = demos[role];
    if (!creds) return;
    setEmail(creds.email);
    setPassword(creds.password);
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(creds);
    if (error) {
      setError("Demo account not set up yet. Please create an account.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
            <Dna size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">GenoScope</span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              Decode rare diseases
              <span className="block" style={{
                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                with AI precision
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
              AI-powered genomic diagnostics that reduce time-to-diagnosis from years to weeks.
              Serving 400+ million rare disease patients worldwide.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap, title: "10x Faster Diagnosis", desc: "AI analysis in minutes, not months" },
              { icon: Shield, title: "HIPAA & GDPR Compliant", desc: "Enterprise-grade security for clinical data" },
              { icon: Activity, title: "95% Diagnostic Accuracy", desc: "Powered by GPT-4o + genomic databases" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.15)" }}>
                  <Icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{title}</div>
                  <div className="text-slate-400 text-sm">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-slate-500 text-sm">
          Trusted by 50+ academic medical centers worldwide
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
              <Dna size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">GenoScope</span>
          </div>

          <div className="rounded-2xl p-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)"
            }}>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400 mb-8">Sign in to your GenoScope account</p>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm"
                style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hospital.org"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "inherit"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.6)"}
                  onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 rounded-xl text-white placeholder-slate-500 text-sm outline-none transition-all pr-12"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontFamily: "inherit"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "rgba(59,130,246,0.6)"}
                    onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-600" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Sign in <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <span className="text-xs text-slate-500">Demo accounts</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Clinician", role: "clinician" },
                  { label: "Geneticist", role: "geneticist" },
                  { label: "Lab Tech", role: "lab" },
                ].map(({ label, role }) => (
                  <button key={role} onClick={() => handleDemoLogin(role)}
                    className="py-2 px-3 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors text-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-400">
              No account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
                Request access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
