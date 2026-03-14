export type UserRole = "super_admin" | "org_admin" | "clinician" | "geneticist" | "lab_technician" | "genetic_counselor";

export type CaseStatus = "new" | "sequencing" | "analysis" | "review" | "closed" | "reanalysis";

export type PathogenicityClass = "pathogenic" | "likely_pathogenic" | "vus" | "likely_benign" | "benign";

export type SampleType = "whole_genome" | "whole_exome" | "panel" | "rna";

export type InheritancePattern = "autosomal_dominant" | "autosomal_recessive" | "x_linked" | "y_linked" | "mitochondrial" | "unknown";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: "hospital" | "lab" | "research" | "clinic";
  created_at: string;
  logo_url?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string;
  organization?: Organization;
  avatar_url?: string;
  specialty?: string;
  license_number?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  organization_id: string;
  mrn: string; // Medical Record Number
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: "male" | "female" | "other";
  ethnicity?: string;
  referring_physician?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Phenotype {
  id: string;
  hpo_id: string;
  name: string;
  description?: string;
}

export interface Case {
  id: string;
  case_number: string;
  patient_id: string;
  patient?: Patient;
  organization_id: string;
  assigned_clinician_id?: string;
  assigned_geneticist_id?: string;
  status: CaseStatus;
  priority: "routine" | "urgent" | "stat";
  phenotypes: Phenotype[];
  clinical_notes?: string;
  family_history?: string;
  inheritance_pattern?: InheritancePattern;
  diagnosis?: string;
  diagnosis_confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface Sample {
  id: string;
  case_id: string;
  barcode: string;
  sample_type: SampleType;
  collection_date: string;
  received_date?: string;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  status: "collected" | "received" | "processing" | "completed" | "failed";
  qc_status?: "pass" | "fail" | "pending";
  created_at: string;
}

export interface Variant {
  id: string;
  case_id: string;
  sample_id: string;
  chromosome: string;
  position: number;
  reference_allele: string;
  alternate_allele: string;
  gene_symbol?: string;
  transcript_id?: string;
  hgvs_c?: string; // coding DNA sequence notation
  hgvs_p?: string; // protein notation
  consequence?: string;
  classification: PathogenicityClass;
  acmg_criteria?: string[];
  gnomad_af?: number; // allele frequency in gnomAD
  clinvar_id?: string;
  clinvar_significance?: string;
  omim_id?: string;
  review_status?: "pending" | "reviewed" | "approved";
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
}

export interface AIDiagnosis {
  id: string;
  case_id: string;
  rank: number;
  disease_name: string;
  omim_id?: string;
  confidence: number; // 0-100
  reasoning: string;
  supporting_variants: string[];
  inheritance_pattern?: InheritancePattern;
  next_steps?: string[];
  created_at: string;
}

export interface Report {
  id: string;
  case_id: string;
  case?: Case;
  report_number: string;
  status: "draft" | "review" | "final" | "amended";
  generated_by: string;
  approved_by?: string;
  summary?: string;
  interpretation?: string;
  recommendations?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export interface QualityMetric {
  id: string;
  sample_id: string;
  mean_coverage?: number;
  percent_20x?: number;
  ts_tv_ratio?: number;
  total_variants?: number;
  filtered_variants?: number;
  dbsnp_percent?: number;
  created_at: string;
}

export interface CaseComment {
  id: string;
  case_id: string;
  user_id: string;
  user?: UserProfile;
  content: string;
  created_at: string;
}

export interface DashboardStats {
  total_cases: number;
  active_cases: number;
  diagnostic_yield: number;
  avg_turnaround_days: number;
  total_variants: number;
  pathogenic_variants: number;
  cases_this_month: number;
  cases_change_percent: number;
}
