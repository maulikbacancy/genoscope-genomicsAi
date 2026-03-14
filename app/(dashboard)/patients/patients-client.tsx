"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Search, Filter, User, Calendar, Phone, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Patient } from "@/types";

interface Props { patients: Patient[]; }

export function PatientsClient({ patients }: Props) {
  const [search, setSearch] = useState("");
  const [sexFilter, setSexFilter] = useState("all");

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q);
    const matchSex = sexFilter === "all" || p.sex === sexFilter;
    return matchSearch && matchSex;
  });

  return (
    <div className="flex flex-col min-h-full">
      <Topbar title="Patients" subtitle={`${patients.length} patients registered`} action={{ label: "Add Patient", href: "/patients/new" }} />

      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or MRN..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "inherit" }} />
          </div>
          <div className="flex items-center gap-2">
            {["all", "male", "female", "other"].map((s) => (
              <button key={s} onClick={() => setSexFilter(s)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium transition-all capitalize"
                style={{
                  background: sexFilter === s ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                  border: sexFilter === s ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.07)",
                  color: sexFilter === s ? "#60a5fa" : "#94a3b8",
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(59,130,246,0.1)" }}>
              <Users size={28} className="text-blue-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">{search ? "No patients found" : "No patients yet"}</h4>
            <p className="text-slate-400 text-sm mb-4">
              {search ? "Try a different search term" : "Register your first patient to get started"}
            </p>
            {!search && (
              <Link href="/patients/new"
                className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>
                Add Patient
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((patient) => (
              <Link key={patient.id} href={`/patients/${patient.id}`}>
                <div className="rounded-2xl p-5 transition-all hover:scale-[1.01] cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                        {patient.first_name[0]}{patient.last_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{patient.first_name} {patient.last_name}</div>
                        <div className="text-xs text-slate-500 font-mono">MRN: {patient.mrn}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-500 mt-1" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar size={13} />
                      <span>DOB: {formatDate(patient.date_of_birth)}</span>
                      <span className="ml-auto capitalize px-2 py-0.5 rounded-md text-xs"
                        style={{
                          background: patient.sex === "male" ? "rgba(59,130,246,0.1)" : "rgba(236,72,153,0.1)",
                          color: patient.sex === "male" ? "#60a5fa" : "#f472b6",
                        }}>
                        {patient.sex}
                      </span>
                    </div>
                    {patient.referring_physician && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <User size={13} />
                        <span>{patient.referring_physician}</span>
                      </div>
                    )}
                    {patient.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone size={13} />
                        <span>{patient.contact_phone}</span>
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
