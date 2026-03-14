import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getPathogenicityColor(classification: string): string {
  const map: Record<string, string> = {
    pathogenic: "text-rose-400",
    likely_pathogenic: "text-orange-400",
    vus: "text-amber-400",
    likely_benign: "text-emerald-300",
    benign: "text-emerald-400",
  };
  return map[classification?.toLowerCase()] ?? "text-slate-400";
}

export function getPathogenicityBadgeClass(classification: string): string {
  const map: Record<string, string> = {
    pathogenic: "pathogenic-badge",
    likely_pathogenic: "likely-pathogenic-badge",
    vus: "vus-badge",
    likely_benign: "likely-benign-badge",
    benign: "benign-badge",
  };
  return map[classification?.toLowerCase()] ?? "text-slate-400 bg-slate-400/10 border border-slate-400/20";
}

export function getCaseStatusColor(status: string): string {
  const map: Record<string, string> = {
    new: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    sequencing: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    analysis: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    review: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    closed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    reanalysis: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  };
  return map[status?.toLowerCase()] ?? "text-slate-400 bg-slate-400/10 border-slate-400/20";
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + "..." : str;
}
