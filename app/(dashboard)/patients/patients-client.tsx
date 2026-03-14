"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Search, User, Calendar, Phone, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Patient } from "@/types";

export function PatientsClient({ patients }: { patients: Patient[] }) {
  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState("all");

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q);
    const matchSex = sexFilter === "all" || p.sex === sexFilter;
    return matchSearch && matchSex;
  });

  return (
    <div className="flex flex-col min-h-full" style={{ background: "var(--bg-page)" }}>
      <Topbar title="Patients" subtitle={`${patients.length} registered`} action={{ label: "Add Patient", href: "/patients/new" }} />
      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or MRN..."
              className="field-input w-full pl-9 pr-4 py-2.5 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            {["all", "male", "female", "other"].map((s) => (
              <button key={s} onClick={() => setSexFilter(s)}
                className="px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all"
                style={{
                  background: sexFilter === s ? "var(--primary-glow)" : "var(--bg-card)",
                  border: `1px solid ${sexFilter === s ? "rgba(59,130,246,0.3)" : "var(--border)"}`,
                  color: sexFilter === s ? "var(--text-accent)" : "var(--text-secondary)",
                  boxShadow: "var(--shadow-card)",
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card rounded-2xl flex flex-col items-center justify-center py-20"
            style={{ borderStyle: "dashed" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "var(--primary-glow)" }}>
              <Users size={24} style={{ color: "var(--primary)" }} />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              {search ? "No patients found" : "No patients yet"}
            </h4>
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
              {search ? "Try a different term" : "Register your first patient"}
            </p>
            {!search && (
              <Link href="/patients/new"
                className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                Add Patient
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((patient) => (
              <Link key={patient.id} href={`/patients/${patient.id}`}>
                <div className="card rounded-2xl p-5 hover:scale-[1.01] transition-all cursor-pointer"
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
                        {patient.first_name[0]}{patient.last_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {patient.first_name} {patient.last_name}
                        </div>
                        <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                          MRN: {patient.mrn}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: "var(--text-muted)" }} className="mt-1 flex-shrink-0" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <Calendar size={12} />
                      <span>DOB: {formatDate(patient.date_of_birth)}</span>
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-md capitalize"
                        style={{
                          background: patient.sex === "male" ? "rgba(59,130,246,0.1)" : "rgba(236,72,153,0.1)",
                          color: patient.sex === "male" ? "#60a5fa" : "#f472b6",
                        }}>
                        {patient.sex}
                      </span>
                    </div>
                    {patient.referring_physician && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <User size={12} /><span>{patient.referring_physician}</span>
                      </div>
                    )}
                    {patient.contact_phone && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <Phone size={12} /><span>{patient.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
