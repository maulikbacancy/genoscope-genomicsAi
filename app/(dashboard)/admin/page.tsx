import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { Shield, Users, Building2, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ count: userCount }, { count: orgCount }, { count: caseCount }, { data: recentUsers }] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("cases").select("*", { count: "exact", head: true }),
    supabase.from("user_profiles").select("*").order("created_at", { ascending: false }).limit(10),
  ]);

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Admin Panel" subtitle="Platform management" />
      <div className="p-6 space-y-6">
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <Shield size={18} className="text-amber-400" />
          <p className="text-sm text-amber-300">Admin access — you have elevated privileges. All actions are logged.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: userCount ?? 0, icon: Users, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", href: "/admin/users" },
            { label: "Organizations", value: orgCount ?? 0, icon: Building2, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", href: "/admin/organizations" },
            { label: "Total Cases", value: caseCount ?? 0, icon: Activity, color: "#10b981", bg: "rgba(16,185,129,0.1)", href: "/cases" },
          ].map(({ label, value, icon: Icon, color, bg, href }) => (
            <Link key={label} href={href}>
              <div className="card rounded-2xl p-5 hover:scale-[1.01] transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <ArrowRight size={14} style={{ color: "var(--text-muted)" }} />
                </div>
                <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{value}</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent users */}
        <div className="card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Recent Users</h3>
            <Link href="/admin/users" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Manage all <ArrowRight size={14} />
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["User", "Email", "Role", "Joined"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(recentUsers ?? []).map((u: any, i) => (
                <tr key={u.id} style={{ borderBottom: i < (recentUsers?.length ?? 0) - 1 ? "1px solid var(--border)" : "none" }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                        {u.full_name?.[0] ?? "U"}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-lg capitalize"
                      style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}>
                      {u.role?.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "var(--text-secondary)" }}>{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
