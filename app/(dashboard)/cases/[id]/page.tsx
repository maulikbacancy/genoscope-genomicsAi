import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CaseDetailClient } from "./case-detail-client";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: caseData }, { data: variants }, { data: aiDiagnoses }, { data: samples }, { data: comments }] = await Promise.all([
    supabase.from("cases").select("*, patients(*), case_phenotypes(*)").eq("id", id).single(),
    supabase.from("variants").select("*").eq("case_id", id).order("classification"),
    supabase.from("ai_diagnoses").select("*").eq("case_id", id).order("rank"),
    supabase.from("samples").select("*").eq("case_id", id),
    supabase.from("case_comments").select("*, user_profiles(full_name, role)").eq("case_id", id).order("created_at"),
  ]);

  if (!caseData) notFound();

  return (
    <CaseDetailClient
      caseData={caseData}
      variants={variants ?? []}
      aiDiagnoses={aiDiagnoses ?? []}
      samples={samples ?? []}
      comments={comments ?? []}
    />
  );
}
