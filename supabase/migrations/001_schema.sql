-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles enum
CREATE TYPE user_role AS ENUM ('super_admin', 'org_admin', 'clinician', 'geneticist', 'lab_technician', 'genetic_counselor');
CREATE TYPE case_status AS ENUM ('new', 'sequencing', 'analysis', 'review', 'closed', 'reanalysis');
CREATE TYPE pathogenicity_class AS ENUM ('pathogenic', 'likely_pathogenic', 'vus', 'likely_benign', 'benign');
CREATE TYPE sample_type AS ENUM ('whole_genome', 'whole_exome', 'panel', 'rna');
CREATE TYPE inheritance_pattern AS ENUM ('autosomal_dominant', 'autosomal_recessive', 'x_linked', 'y_linked', 'mitochondrial', 'unknown');
CREATE TYPE org_type AS ENUM ('hospital', 'lab', 'research', 'clinic');
CREATE TYPE case_priority AS ENUM ('routine', 'urgent', 'stat');
CREATE TYPE sample_status AS ENUM ('collected', 'received', 'processing', 'completed', 'failed');
CREATE TYPE report_status AS ENUM ('draft', 'review', 'final', 'amended');

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type org_type NOT NULL DEFAULT 'hospital',
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'clinician',
  organization_id UUID REFERENCES organizations(id),
  avatar_url TEXT,
  specialty TEXT,
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  mrn TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  ethnicity TEXT,
  referring_physician TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, mrn)
);

-- Cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number TEXT NOT NULL UNIQUE,
  patient_id UUID NOT NULL REFERENCES patients(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  assigned_clinician_id UUID REFERENCES user_profiles(id),
  assigned_geneticist_id UUID REFERENCES user_profiles(id),
  status case_status NOT NULL DEFAULT 'new',
  priority case_priority NOT NULL DEFAULT 'routine',
  clinical_notes TEXT,
  family_history TEXT,
  inheritance_pattern inheritance_pattern,
  diagnosis TEXT,
  diagnosis_confidence NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case phenotypes (HPO terms)
CREATE TABLE case_phenotypes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  hpo_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Samples
CREATE TABLE samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id),
  barcode TEXT NOT NULL UNIQUE,
  sample_type sample_type NOT NULL DEFAULT 'whole_genome',
  collection_date DATE,
  received_date DATE,
  file_path TEXT,
  file_name TEXT,
  file_size BIGINT,
  status sample_status NOT NULL DEFAULT 'collected',
  qc_status TEXT CHECK (qc_status IN ('pass', 'fail', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variants
CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id),
  sample_id UUID NOT NULL REFERENCES samples(id),
  chromosome TEXT NOT NULL,
  position BIGINT NOT NULL,
  reference_allele TEXT NOT NULL,
  alternate_allele TEXT NOT NULL,
  gene_symbol TEXT,
  transcript_id TEXT,
  hgvs_c TEXT,
  hgvs_p TEXT,
  consequence TEXT,
  classification pathogenicity_class NOT NULL DEFAULT 'vus',
  acmg_criteria TEXT[],
  gnomad_af NUMERIC(10,8),
  clinvar_id TEXT,
  clinvar_significance TEXT,
  omim_id TEXT,
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'reviewed', 'approved')),
  reviewed_by UUID REFERENCES user_profiles(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Diagnoses
CREATE TABLE ai_diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  disease_name TEXT NOT NULL,
  omim_id TEXT,
  confidence NUMERIC(5,2) NOT NULL,
  reasoning TEXT,
  supporting_variants TEXT[],
  inheritance_pattern inheritance_pattern,
  next_steps TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id),
  report_number TEXT NOT NULL UNIQUE,
  status report_status NOT NULL DEFAULT 'draft',
  generated_by UUID NOT NULL REFERENCES user_profiles(id),
  approved_by UUID REFERENCES user_profiles(id),
  summary TEXT,
  interpretation TEXT,
  recommendations TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quality Metrics
CREATE TABLE quality_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sample_id UUID NOT NULL REFERENCES samples(id),
  mean_coverage NUMERIC(10,2),
  percent_20x NUMERIC(5,2),
  ts_tv_ratio NUMERIC(5,3),
  total_variants INTEGER,
  filtered_variants INTEGER,
  dbsnp_percent NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case Comments
CREATE TABLE case_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_cases_org ON cases(organization_id);
CREATE INDEX idx_cases_patient ON cases(patient_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_variants_case ON variants(case_id);
CREATE INDEX idx_variants_gene ON variants(gene_symbol);
CREATE INDEX idx_variants_classification ON variants(classification);
CREATE INDEX idx_samples_case ON samples(case_id);
CREATE INDEX idx_patients_org ON patients(organization_id);

-- Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_phenotypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can see data from their organization
CREATE POLICY "org_isolation_patients" ON patients
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "org_isolation_cases" ON cases
  FOR ALL USING (
    organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (id = auth.uid() OR
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('super_admin', 'org_admin'));

CREATE POLICY "org_isolation_samples" ON samples
  FOR ALL USING (
    case_id IN (SELECT id FROM cases WHERE organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  );

CREATE POLICY "org_isolation_variants" ON variants
  FOR ALL USING (
    case_id IN (SELECT id FROM cases WHERE organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  );

CREATE POLICY "org_isolation_reports" ON reports
  FOR ALL USING (
    case_id IN (SELECT id FROM cases WHERE organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  );

CREATE POLICY "org_isolation_comments" ON case_comments
  FOR ALL USING (
    case_id IN (SELECT id FROM cases WHERE organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  );

CREATE POLICY "org_isolation_ai_diagnoses" ON ai_diagnoses
  FOR ALL USING (
    case_id IN (SELECT id FROM cases WHERE organization_id = (SELECT organization_id FROM user_profiles WHERE id = auth.uid()))
  );

-- Auto-update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_samples_updated_at BEFORE UPDATE ON samples FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();
