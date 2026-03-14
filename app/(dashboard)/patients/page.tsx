import { createClient } from "@/lib/supabase/server";
import { PatientsClient } from "./patients-client";

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("organization_id")
    .eq("id", user!.id)
    .single();

  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .eq("organization_id", profile?.organization_id ?? "")
    .order("created_at", { ascending: false });

  return <PatientsClient patients={patients ?? []} />;
}
