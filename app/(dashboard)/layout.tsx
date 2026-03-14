import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { UserRole } from "@/types";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  // If no profile yet (new user), use defaults
  const userRole = (profile?.role ?? "clinician") as UserRole;
  const userName = profile?.full_name ?? user.email ?? "User";
  const userEmail = user.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0a0f1e" }}>
      <Sidebar userRole={userRole} userName={userName} userEmail={userEmail} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
