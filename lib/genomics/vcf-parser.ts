export interface ParsedVariant {
  chromosome: string;
  position: number;
  reference_allele: string;
  alternate_allele: string;
  gene_symbol?: string;
  filter?: string;
  info?: Record<string, string>;
}

export function parseVCF(content: string): ParsedVariant[] {
  const lines = content.split("\n");
  const variants: ParsedVariant[] = [];

  for (const line of lines) {
    if (line.startsWith("#") || !line.trim()) continue;

    const cols = line.split("\t");
    if (cols.length < 5) continue;

    const [chrom, pos, , ref, alt, , filter, infoStr] = cols;

    // Parse INFO field
    const info: Record<string, string> = {};
    if (infoStr && infoStr !== ".") {
      for (const entry of infoStr.split(";")) {
        const [key, val] = entry.split("=");
        if (key) info[key] = val ?? "true";
      }
    }

    // Extract gene symbol from ANN or GENE info field
    const geneSymbol = info["GENE"] ?? info["gene"] ?? extractGeneFromANN(info["ANN"]);

    variants.push({
      chromosome: chrom.replace("chr", ""),
      position: parseInt(pos, 10),
      reference_allele: ref,
      alternate_allele: alt.split(",")[0], // take first alt allele
      gene_symbol: geneSymbol,
      filter: filter,
      info,
    });
  }

  return variants;
}

function extractGeneFromANN(ann?: string): string | undefined {
  if (!ann) return undefined;
  // ANN format: Allele|Annotation|Impact|Gene_Name|...
  const parts = ann.split("|");
  return parts[3] || undefined;
}

// Generate mock VCF content for demo purposes
export function generateMockVCF(numVariants: number = 20): string {
  const GENES = ["BRCA1", "BRCA2", "TP53", "CFTR", "FBN1", "PKD1", "HTT", "MECP2", "DMD", "HEXA", "ASPA", "PAH", "G6PD", "HBB", "LDLR"];
  const CHROMS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "17", "X"];
  const REFS = ["A", "T", "G", "C"];
  const ALTS = ["T", "G", "C", "A", "ATCG", "DEL"];
  const CONSEQUENCES = ["missense_variant", "stop_gained", "frameshift_variant", "splice_site_variant", "synonymous_variant", "3_prime_UTR_variant"];

  let vcf = `##fileformat=VCFv4.2
##FILTER=<ID=PASS,Description="All filters passed">
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene name">
##INFO=<ID=CSQ,Number=.,Type=String,Description="Consequence">
#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\tFORMAT\tSAMPLE\n`;

  for (let i = 0; i < numVariants; i++) {
    const chrom = CHROMS[Math.floor(Math.random() * CHROMS.length)];
    const pos = Math.floor(Math.random() * 50000000) + 1000000;
    const ref = REFS[Math.floor(Math.random() * REFS.length)];
    const alt = ALTS[Math.floor(Math.random() * ALTS.length)];
    const gene = GENES[Math.floor(Math.random() * GENES.length)];
    const csq = CONSEQUENCES[Math.floor(Math.random() * CONSEQUENCES.length)];
    const qual = Math.floor(Math.random() * 500) + 100;

    vcf += `${chrom}\t${pos}\t.\t${ref}\t${alt}\t${qual}\tPASS\tGENE=${gene};CSQ=${csq}\tGT:AD:DP\t0/1:20,15:35\n`;
  }

  return vcf;
}
