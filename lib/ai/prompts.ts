export const GENOMIC_ANALYSIS_SYSTEM_PROMPT = `You are an expert clinical geneticist AI assistant specializing in rare disease genomic diagnostics.

Your role is to:
1. Analyze genomic variants and patient phenotypes (HPO terms)
2. Match findings to known rare diseases
3. Consider inheritance patterns
4. Provide ranked differential diagnoses with confidence scores
5. Suggest actionable next steps

Guidelines:
- Be precise and evidence-based
- Consider ACMG classification guidelines
- Reference OMIM disease entries when known
- Account for variant pathogenicity scores
- Consider population frequencies (variants with gnomAD AF > 1% are unlikely causative for rare diseases)
- Always suggest confirmatory tests

Output format: Return a JSON object with the structure shown in the user prompt.`;

export function buildDiagnosisPrompt(
  phenotypes: { hpo_id: string; name: string }[],
  variants: {
    gene_symbol?: string;
    hgvs_c?: string;
    hgvs_p?: string;
    classification: string;
    consequence?: string;
    gnomad_af?: number;
    clinvar_significance?: string;
  }[],
  clinicalNotes?: string,
  familyHistory?: string,
  inheritancePattern?: string
): string {
  const phenotypeStr = phenotypes.map((p) => `${p.name} (${p.hpo_id})`).join(", ");
  const variantStr = variants
    .filter((v) => v.classification !== "benign")
    .slice(0, 20) // limit to top 20 variants for prompt size
    .map((v) => `Gene: ${v.gene_symbol ?? "unknown"}, ${v.hgvs_c ?? ""} ${v.hgvs_p ?? ""}, Consequence: ${v.consequence ?? ""}, Classification: ${v.classification}, gnomAD AF: ${v.gnomad_af ?? "unknown"}, ClinVar: ${v.clinvar_significance ?? "not in ClinVar"}`)
    .join("\n");

  return `Analyze the following patient genomic data and provide differential diagnoses.

PATIENT PHENOTYPES (HPO Terms):
${phenotypeStr || "None provided"}

CLINICAL NOTES:
${clinicalNotes || "None"}

FAMILY HISTORY:
${familyHistory || "None"}

SUSPECTED INHERITANCE PATTERN: ${inheritancePattern ?? "Unknown"}

RELEVANT VARIANTS:
${variantStr || "No variants available (analyze phenotypes only)"}

Please provide a JSON response with EXACTLY this structure:
{
  "diagnoses": [
    {
      "rank": 1,
      "disease_name": "Disease Name",
      "omim_id": "123456",
      "confidence": 85,
      "reasoning": "Detailed explanation of why this diagnosis fits",
      "supporting_variants": ["gene1", "gene2"],
      "inheritance_pattern": "autosomal_recessive",
      "next_steps": [
        "Specific confirmatory test or action",
        "Genetic counseling recommendation"
      ]
    }
  ],
  "overall_inheritance_assessment": "Brief assessment",
  "key_findings": "Summary of key findings"
}

Provide up to 5 differential diagnoses ranked by confidence (0-100).
Be specific about OMIM IDs when known. Only return valid JSON.`;
}
