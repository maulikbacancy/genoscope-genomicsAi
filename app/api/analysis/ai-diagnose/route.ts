import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/ai/openai";
import { GENOMIC_ANALYSIS_SYSTEM_PROMPT, buildDiagnosisPrompt } from "@/lib/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const { case_id } = await req.json();
    if (!case_id) return NextResponse.json({ error: "case_id required" }, { status: 400 });

    const supabase = await createServiceClient();

    // Fetch case data
    const { data: caseData } = await supabase
      .from("cases")
      .select("*, case_phenotypes(*)")
      .eq("id", case_id)
      .single();

    if (!caseData) return NextResponse.json({ error: "Case not found" }, { status: 404 });

    // Fetch variants
    const { data: variants } = await supabase
      .from("variants")
      .select("*")
      .eq("case_id", case_id)
      .neq("classification", "benign")
      .order("classification");

    const prompt = buildDiagnosisPrompt(
      caseData.case_phenotypes ?? [],
      variants ?? [],
      caseData.clinical_notes,
      caseData.family_history,
      caseData.inheritance_pattern
    );

    // Call GPT-4o
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: GENOMIC_ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(responseText);
    const diagnosisList = parsed.diagnoses ?? [];

    // Delete old AI diagnoses for this case
    await supabase.from("ai_diagnoses").delete().eq("case_id", case_id);

    // Save new diagnoses
    const toInsert = diagnosisList.map((d: any) => ({
      case_id,
      rank: d.rank,
      disease_name: d.disease_name,
      omim_id: d.omim_id,
      confidence: d.confidence,
      reasoning: d.reasoning,
      supporting_variants: d.supporting_variants ?? [],
      inheritance_pattern: d.inheritance_pattern ?? "unknown",
      next_steps: d.next_steps ?? [],
    }));

    const { data: saved } = await supabase
      .from("ai_diagnoses")
      .insert(toInsert)
      .select();

    // Update case status to "analysis"
    await supabase.from("cases").update({ status: "analysis" }).eq("id", case_id);

    return NextResponse.json({
      diagnoses: saved ?? [],
      key_findings: parsed.key_findings,
      overall_inheritance: parsed.overall_inheritance_assessment,
    });
  } catch (error: any) {
    console.error("AI analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
