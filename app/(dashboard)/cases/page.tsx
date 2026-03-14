import { createClient } from "@/lib/supabase/server";
import { CasesClient } from "./cases-client";

export default async function CasesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user!.id).single();

  const { data: cases } = await supabase
    .from("cases")
    .select("*, patients(first_name, last_name), case_phenotypes(*)")
    .eq("organization_id", profile?.organization_id ?? "")
    .order("created_at", { ascending: false });

  return <CasesClient cases={cases ?? []} />;
}
