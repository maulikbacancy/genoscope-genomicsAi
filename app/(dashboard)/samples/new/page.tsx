"use client";

import { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Dna, Download } from "lucide-react";
import Link from "next/link";
import { generateMockVCF } from "@/lib/genomics/vcf-parser";

function UploadSampleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("case");

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ variants_found: number; pathogenic_found: number } | null>(null);
  const [error, setError] = useState("");
  const [barcode, setBarcode] = useState(`BC-${Date.now().toString().slice(-8)}`);
  const [sampleType, setSampleType] = useState("whole_genome");

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const downloadMockVCF = () => {
    const content = generateMockVCF(30);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "demo_sample.vcf";
    a.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !caseId) { setError("Please select a VCF file and ensure a case is selected"); return; }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("case_id", caseId);
    formData.append("barcode", barcode);
    formData.append("sample_type", sampleType);

    const res = await fetch("/api/samples/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) { setError(data.error ?? "Upload failed"); setLoading(false); return; }
    setResult(data);
    setLoading(false);
  };

  if (result) {
    return (
      <div className="flex flex-col min-h-full">
        <Topbar title="Sample Uploaded" />
        <div className="p-6 max-w-lg mx-auto w-full">
          <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16,185,129,0.15)" }}>
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Analysis Complete!</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl p-4" style={{ background: "var(--bg-hover)" }}>
                <div className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{result.variants_found}</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Variants Found</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: "rgba(244,63,94,0.05)", border: "1px solid rgba(244,63,94,0.1)" }}>
                <div className="text-3xl font-bold text-rose-400 mb-1">{result.pathogenic_found}</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>Pathogenic</div>
              </div>
            </div>
            <Link href={`/cases/${caseId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
              View Case & Run AI Analysis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Upload Sample" subtitle="Upload VCF/genomic data file" />
      <div className="p-6 max-w-2xl mx-auto w-full">
        {caseId && (
          <Link href={`/cases/${caseId}`} className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft size={16} /> Back to case
          </Link>
        )}

        {/* Demo VCF download */}
        <div className="mb-6 rounded-xl p-4 flex items-center gap-3"
          style={{ background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <Dna size={20} className="text-blue-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>No VCF file? Download a demo</div>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>Generate a sample VCF file with 30 mock variants for testing</div>
          </div>
          <button onClick={downloadMockVCF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-blue-400 hover:text-blue-300 transition-all"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <Download size={14} /> Download Demo VCF
          </button>
        </div>

        <div className="card rounded-2xl p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm flex items-center gap-2"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#f43f5e" }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              className="cursor-pointer rounded-2xl p-10 text-center transition-all"
              style={{
                background: dragging ? "rgba(59,130,246,0.08)" : file ? "rgba(16,185,129,0.05)" : "var(--bg-hover)",
                border: `2px dashed ${dragging ? "rgba(59,130,246,0.5)" : file ? "rgba(16,185,129,0.4)" : "var(--border)"}`,
              }}>
              <input id="file-input" type="file" accept=".vcf,.vcf.gz,.txt" className="hidden"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
              {file ? (
                <>
                  <FileText size={32} className="text-emerald-400 mx-auto mb-3" />
                  <p className="font-medium text-emerald-400">{file.name}</p>
                  <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>{(file.size / 1024).toFixed(1)} KB</p>
                </>
              ) : (
                <>
                  <Upload size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                  <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>Drop your VCF file here</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>or click to browse</p>
                  <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Supports: .vcf, .vcf.gz</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Barcode / Sample ID</label>
                <input value={barcode} onChange={(e) => setBarcode(e.target.value)}
                  className="field-input w-full px-4 py-3 rounded-xl text-sm outline-none font-mono"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Sample Type</label>
                <select value={sampleType} onChange={(e) => setSampleType(e.target.value)}
                  className="field-input w-full px-4 py-3 rounded-xl text-sm outline-none">
                  <option value="whole_genome" style={{ background: "var(--bg-card-solid)" }}>Whole Genome Sequencing (WGS)</option>
                  <option value="whole_exome" style={{ background: "var(--bg-card-solid)" }}>Whole Exome Sequencing (WES)</option>
                  <option value="panel" style={{ background: "var(--bg-card-solid)" }}>Gene Panel</option>
                  <option value="rna" style={{ background: "var(--bg-card-solid)" }}>RNA Sequencing</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading || !file}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing & Annotating Variants...
                </>
              ) : (
                <><Upload size={16} /> Upload & Analyze</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UploadSamplePage() {
  return (
    <Suspense fallback={<div className="p-6" style={{ color: "var(--text-secondary)" }}>Loading...</div>}>
      <UploadSampleForm />
    </Suspense>
  );
}
