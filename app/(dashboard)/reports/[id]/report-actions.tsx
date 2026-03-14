"use client";

import { CheckCircle, Printer } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReportActionProps {
  reportId: string;
}

export function ReportPrintAction() {
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-80"
      style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
      onClick={() => window.print()}
    >
      <Printer size={14} /> Print
    </button>
  );
}

export function ReportFinalizeAction({ reportId }: ReportActionProps) {
  const router = useRouter();

  const handleFinalize = async () => {
    await fetch("/api/reports/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_id: reportId }),
    });
    router.refresh();
  };

  return (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
      style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}
      onClick={handleFinalize}
    >
      <CheckCircle size={14} /> Approve & Finalize
    </button>
  );
}
