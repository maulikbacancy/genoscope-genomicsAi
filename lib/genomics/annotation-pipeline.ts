import { ParsedVariant } from "./vcf-parser";

export interface AnnotatedVariant extends ParsedVariant {
  classification: "pathogenic" | "likely_pathogenic" | "vus" | "likely_benign" | "benign";
  consequence?: string;
  hgvs_c?: string;
  hgvs_p?: string;
  gnomad_af?: number;
  clinvar_id?: string;
  clinvar_significance?: string;
  acmg_criteria?: string[];
}

// Simplified ACMG classification logic
function classifyVariant(variant: ParsedVariant, gnomadAF?: number, clinvarSig?: string): AnnotatedVariant["classification"] {
  if (clinvarSig?.toLowerCase().includes("pathogenic") && !clinvarSig.toLowerCase().includes("benign")) {
    return clinvarSig.toLowerCase().includes("likely") ? "likely_pathogenic" : "pathogenic";
  }
  if (clinvarSig?.toLowerCase().includes("benign")) {
    return clinvarSig.toLowerCase().includes("likely") ? "likely_benign" : "benign";
  }
  if (gnomadAF && gnomadAF > 0.01) return "benign"; // Common variant, likely not causative
  if (gnomadAF && gnomadAF > 0.001) return "likely_benign";

  const consequence = variant.info?.["CSQ"] ?? "";
  if (["stop_gained", "frameshift_variant", "splice_site_variant"].some((c) => consequence.includes(c))) {
    return gnomadAF && gnomadAF < 0.0001 ? "likely_pathogenic" : "vus";
  }

  return "vus";
}

// Annotate variants using public APIs
export async function annotateVariants(variants: ParsedVariant[]): Promise<AnnotatedVariant[]> {
  const annotated: AnnotatedVariant[] = [];

  for (const variant of variants) {
    try {
      // Generate mock annotations for demo (in production: call ClinVar/gnomAD APIs)
      const gnomadAF = Math.random() < 0.3 ? Math.random() * 0.001 : Math.random() < 0.5 ? Math.random() * 0.05 : undefined;
      const clinvarSigs = ["Pathogenic", "Likely pathogenic", "Uncertain significance", "Likely benign", "Benign", undefined];
      const clinvarSig = clinvarSigs[Math.floor(Math.random() * clinvarSigs.length)];

      const consequence = variant.info?.["CSQ"] ?? "missense_variant";
      const classification = classifyVariant(variant, gnomadAF, clinvarSig);

      // Generate HGVS notation
      const hgvs_c = `c.${variant.position % 1000}${variant.reference_allele}>${variant.alternate_allele}`;
      const hgvs_p = consequence.includes("missense") ? `p.${getAminoAcid(variant.reference_allele)}${Math.floor(variant.position / 3)}${getAminoAcid(variant.alternate_allele)}` : undefined;

      annotated.push({
        ...variant,
        classification,
        consequence,
        hgvs_c: variant.gene_symbol ? `${variant.gene_symbol}:${hgvs_c}` : hgvs_c,
        hgvs_p,
        gnomad_af: gnomadAF,
        clinvar_significance: clinvarSig,
        acmg_criteria: generateACMGCriteria(classification),
      });
    } catch (e) {
      // If annotation fails for a variant, still include it as VUS
      annotated.push({ ...variant, classification: "vus" });
    }
  }

  return annotated;
}

function getAminoAcid(base: string): string {
  const map: Record<string, string> = { A: "Ala", T: "Thr", G: "Gly", C: "Cys" };
  return map[base] ?? "Val";
}

function generateACMGCriteria(classification: string): string[] {
  const criteriaMap: Record<string, string[]> = {
    pathogenic: ["PVS1", "PS1", "PM2"],
    likely_pathogenic: ["PS1", "PM1", "PM2"],
    vus: ["PM2", "PP3"],
    likely_benign: ["BS1", "BP4"],
    benign: ["BA1", "BS1"],
  };
  return criteriaMap[classification] ?? ["PM2"];
}
