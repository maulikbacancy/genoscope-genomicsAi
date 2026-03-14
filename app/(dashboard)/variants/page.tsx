import { createClient } from "@/lib/supabase/server";
import { Topbar } from "@/components/layout/topbar";
import { VariantsClient } from "./variants-client";

export default async function VariantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("organization_id").eq("id", user!.id).single();

  const { data: variants } = await supabase
    .from("variants")
    .select("*, cases(case_number, organization_id)")
    .order("classification")
    .limit(200);

  // Filter by org
  const filtered = (variants ?? []).filter((v) => v.cases?.organization_id === profile?.organization_id);

  return <VariantsClient variants={filtered} />;
}
