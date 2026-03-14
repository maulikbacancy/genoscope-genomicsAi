import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/ai/openai";

export async function POST(req: NextRequest) {
  const { case_id } = await req.json();
  const supabase = await createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch case, patient, phenotypes, variants, diagnoses
  const { data: caseData } = await supabase
    .from("cases")
    .select("*, patients(*), case_phenotypes(*)")
    .eq("id", case_id)
    .single();

  const { data: variants } = await supabase.from("variants").select("*").eq("case_id", case_id)
    .in("classification", ["pathogenic", "likely_pathogenic", "vus"]);

  const { data: diagnoses } = await supabase.from("ai_diagnoses").select("*").eq("case_id", case_id).order("rank");

  const patient = caseData?.patients;

  // Build report prompt
  const reportPrompt = `Generate a clinical genomics report for:

Patient: ${patient?.first_name} ${patient?.last_name}, DOB: ${patient?.date_of_birth}, Sex: ${patient?.sex}
MRN: ${patient?.mrn}

Clinical Phenotypes: ${caseData?.case_phenotypes?.map((p: any) => p.name).join(", ") || "None"}
Clinical Notes: ${caseData?.clinical_notes || "None"}
Family History: ${caseData?.family_history || "None"}

Top Variants (non-benign):
${variants?.slice(0, 5).map((v) => `${v.gene_symbol}: ${v.hgvs_c} (${v.classification})`).join("\n") || "None found"}

AI Diagnoses:
${diagnoses?.slice(0, 3).map((d) => `${d.rank}. ${d.disease_name} (${d.confidence}% confidence): ${d.reasoning?.slice(0, 200)}`).join("\n") || "Not analyzed yet"}

Generate a JSON with:
{
  "summary": "2-3 sentence executive summary",
  "interpretation": "Detailed clinical interpretation (3-4 paragraphs)",
  "recommendations": "Numbered list of clinical recommendations"
}`;

  let summary = "", interpretation = "", recommendations = "";

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a clinical geneticist writing medical reports. Be precise, professional, and evidence-based." },
        { role: "user", content: reportPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500,
    });
    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    summary = parsed.summary ?? "";
    interpretation = parsed.interpretation ?? "";
    recommendations = parsed.recommendations ?? "";
  } catch (e) {
    summary = "Genomic analysis complete. Please review findings.";
    interpretation = "Manual review required.";
    recommendations = "1. Review variant classifications\n2. Genetic counseling recommended";
  }

  const reportNumber = `RPT-${Date.now().toString().slice(-8)}`;

  const { data: report } = await supabase.from("reports").insert({
    case_id,
    report_number: reportNumber,
    status: "draft",
    generated_by: user!.id,
    summary,
    interpretation,
    recommendations,
  }).select().single();

  return NextResponse.json(report ?? { error: "Failed to create report" });
}
