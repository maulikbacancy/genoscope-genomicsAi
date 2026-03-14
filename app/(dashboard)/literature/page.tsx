"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { BookOpen, Search, ExternalLink, Loader2 } from "lucide-react";

interface Paper {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract?: string;
}

const MOCK_PAPERS: Paper[] = [
  { pmid: "35123456", title: "De novo variants in MECP2 cause Rett syndrome: a systematic review of 500 cases", authors: "Smith J, et al.", journal: "Nature Genetics", year: "2024", abstract: "We describe de novo pathogenic variants in MECP2 across 500 cases of Rett syndrome..." },
  { pmid: "35234567", title: "BRCA1/2 variant interpretation using multifactorial likelihood models", authors: "Johnson A, et al.", journal: "AJHG", year: "2024", abstract: "Multifactorial likelihood models combining functional evidence improve variant classification..." },
  { pmid: "35345678", title: "Whole genome sequencing increases diagnostic yield in pediatric rare disease", authors: "Williams C, et al.", journal: "NEJM", year: "2023", abstract: "A prospective study of 1,000 pediatric patients with rare diseases showed WGS..." },
  { pmid: "35456789", title: "CFTR variant spectrum in cystic fibrosis: implications for precision therapy", authors: "Brown D, et al.", journal: "JCI", year: "2023" },
  { pmid: "35567890", title: "AI-assisted variant interpretation reduces diagnostic time by 60%", authors: "Davis E, et al.", journal: "npj Genomic Medicine", year: "2024", abstract: "Machine learning models trained on ClinVar achieve AUC of 0.94 for pathogenicity prediction..." },
];

export default function LiteraturePage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [papers, setPapers] = useState<Paper[]>(MOCK_PAPERS);
  const [expandedPmid, setExpandedPmid] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);

    // In production: call /api/literature/search which proxies PubMed API
    await new Promise((r) => setTimeout(r, 800));
    const filtered = MOCK_PAPERS.filter((p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.authors.toLowerCase().includes(query.toLowerCase())
    );
    setPapers(filtered.length ? filtered : MOCK_PAPERS);
    setSearching(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Literature Search" subtitle="PubMed-powered genomics research" />
      <div className="p-6">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for gene, disease, or variant (e.g. 'BRCA1 pathogenic variant')"
                className="field-input w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none" />
            </div>
            <button type="submit" disabled={searching}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Search
            </button>
          </div>
        </form>

        {/* Quick searches */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["BRCA1 variant pathogenic", "rare disease WGS diagnostic", "MECP2 Rett syndrome", "AI genomics diagnosis"].map((q) => (
            <button key={q} onClick={() => { setQuery(q); }}
              className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              {q}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {papers.map((paper) => (
            <div key={paper.pmid} className="card rounded-2xl p-5 cursor-pointer transition-all"
              onClick={() => setExpandedPmid(expandedPmid === paper.pmid ? null : paper.pmid)}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 leading-relaxed" style={{ color: "var(--text-primary)" }}>{paper.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span>{paper.authors}</span>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">{paper.journal}</span>
                    <span>•</span>
                    <span>{paper.year}</span>
                    <span>•</span>
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>PMID: {paper.pmid}</span>
                  </div>
                  {expandedPmid === paper.pmid && paper.abstract && (
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{paper.abstract}</p>
                  )}
                </div>
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 flex-shrink-0 mt-1"
                  style={{ background: "rgba(59,130,246,0.1)", padding: "4px 10px", borderRadius: "8px", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <ExternalLink size={12} /> PubMed
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
