import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch real stats
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, organizations(*)")
    .eq("id", user!.id)
    .single();

  const orgId = profile?.organization_id;

  const [{ count: totalCases }, { count: activeCases }, { count: totalVariants }, { count: totalPatients }] = await Promise.all([
    supabase.from("cases").select("*", { count: "exact", head: true }).eq("organization_id", orgId ?? ""),
    supabase.from("cases").select("*", { count: "exact", head: true }).in("status", ["new", "sequencing", "analysis", "review"]).eq("organization_id", orgId ?? ""),
    supabase.from("variants").select("*", { count: "exact", head: true }),
    supabase.from("patients").select("*", { count: "exact", head: true }).eq("organization_id", orgId ?? ""),
  ]);

  const { data: recentCases } = await supabase
    .from("cases")
    .select("*, patients(first_name, last_name)")
    .eq("organization_id", orgId ?? "")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = {
    total_cases: totalCases ?? 0,
    active_cases: activeCases ?? 0,
    total_variants: totalVariants ?? 0,
    total_patients: totalPatients ?? 0,
    diagnostic_yield: totalCases ? Math.round(((totalCases - (activeCases ?? 0)) / totalCases) * 100) : 0,
  };

  return <DashboardClient stats={stats} recentCases={recentCases ?? []} userName={profile?.full_name ?? "User"} userRole={profile?.role ?? "clinician"} />;
}
