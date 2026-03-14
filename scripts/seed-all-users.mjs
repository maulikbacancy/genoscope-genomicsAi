/**
 * GenoScope - Complete Seed Script
 * Creates all 6 user types + dummy data for end-to-end testing.
 *
 * Run:
 *   node scripts/seed-all-users.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadLocalEnvIfNeeded() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadLocalEnvIfNeeded();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Set them in your shell env or .env.local, then run again.");
  process.exit(1);
}

// Admin client bypasses RLS
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "Demo@123456";

// ── Users to create (all 6 roles) ──────────────────────────────────────────
const USERS = [
  // Role: super_admin
  {
    email: "superadmin@genoscope.ai",
    password: PASSWORD,
    full_name: "Dr. Aditya Kumar",
    role: "super_admin",
    org_slug: "aiims-delhi",
    specialty: "Platform Administration",
    license_number: "SA-GENO-2024-001",
  },
  // Role: org_admin
  {
    email: "admin.sharma@aiims.edu",
    password: PASSWORD,
    full_name: "Dr. Rajesh Sharma",
    role: "org_admin",
    org_slug: "aiims-delhi",
    specialty: "Medical Genetics",
    license_number: "MCI-DL-20010045",
    placeholder_uuid: "aaaaaaaa-0005-0005-0005-000000000005",
  },
  // Role: clinician
  {
    email: "priya.mehta@aiims.edu",
    password: PASSWORD,
    full_name: "Dr. Priya Mehta",
    role: "clinician",
    org_slug: "aiims-delhi",
    specialty: "Pediatric Neurology",
    license_number: "MCI-DL-20080123",
    placeholder_uuid: "aaaaaaaa-0001-0001-0001-000000000001",
  },
  // Role: geneticist
  {
    email: "sunil.rao@aiims.edu",
    password: PASSWORD,
    full_name: "Dr. Sunil Rao",
    role: "geneticist",
    org_slug: "aiims-delhi",
    specialty: "Clinical Genomics",
    license_number: "MCI-DL-20050077",
    placeholder_uuid: "aaaaaaaa-0002-0002-0002-000000000002",
  },
  // Role: lab_technician
  {
    email: "kavitha.nair@aiims.edu",
    password: PASSWORD,
    full_name: "Ms. Kavitha Nair",
    role: "lab_technician",
    org_slug: "aiims-delhi",
    specialty: "Molecular Biology",
    license_number: "LT-KA-20120456",
    placeholder_uuid: "aaaaaaaa-0003-0003-0003-000000000003",
  },
  // Role: genetic_counselor
  {
    email: "anita.desai@aiims.edu",
    password: PASSWORD,
    full_name: "Ms. Anita Desai",
    role: "genetic_counselor",
    org_slug: "aiims-delhi",
    specialty: "Genetic Counselling",
    license_number: "GC-DL-20150234",
    placeholder_uuid: "aaaaaaaa-0004-0004-0004-000000000004",
  },
  // Demo accounts (match login page buttons)
  {
    email: "clinician@demo.genoscope.ai",
    password: "demo123456",
    full_name: "Demo Clinician",
    role: "clinician",
    org_slug: "aiims-delhi",
    specialty: "Internal Medicine",
    license_number: "DEMO-CLI-001",
  },
  {
    email: "geneticist@demo.genoscope.ai",
    password: "demo123456",
    full_name: "Demo Geneticist",
    role: "geneticist",
    org_slug: "aiims-delhi",
    specialty: "Clinical Genetics",
    license_number: "DEMO-GEN-001",
  },
  {
    email: "lab@demo.genoscope.ai",
    password: "demo123456",
    full_name: "Demo Lab Tech",
    role: "lab_technician",
    org_slug: "aiims-delhi",
    specialty: "Genomics Lab",
    license_number: "DEMO-LAB-001",
  },
];

// ── Organization IDs ────────────────────────────────────────────────────────
const ORGS = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "All India Institute of Medical Sciences",
    slug: "aiims-delhi",
    type: "hospital",
    address: "Ansari Nagar, New Delhi - 110029",
    phone: "+91-11-26588500",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Tata Memorial Hospital",
    slug: "tata-memorial",
    type: "hospital",
    address: "Dr E Borges Road, Parel, Mumbai - 400012",
    phone: "+91-22-24177000",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "MedGenomics India Pvt Ltd",
    slug: "medgenomics",
    type: "lab",
    address: "3rd Floor, Prestige Tower, Bangalore",
    phone: "+91-80-40808080",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "NIMHANS Genomics Centre",
    slug: "nimhans",
    type: "research",
    address: "Hosur Road, Bangalore - 560029",
    phone: "+91-80-46110007",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Kokilaben Dhirubhai Ambani Hospital",
    slug: "kokilaben",
    type: "clinic",
    address: "Rao Saheb Achutrao Patwardhan Marg, Mumbai",
    phone: "+91-22-42696969",
  },
];

// ─────────────────────────────────────────────────────────────────────────────

async function step(label, fn) {
  process.stdout.write(`  ${label} ... `);
  try {
    const result = await fn();
    console.log("✓");
    return result;
  } catch (e) {
    console.log(`✗ ${e.message}`);
    throw e;
  }
}

async function upsertOrgs() {
  const { error } = await supabase
    .from("organizations")
    .upsert(ORGS, { onConflict: "slug" });
  if (error) throw error;
}

async function createAuthUser(user) {
  // Try to create; if exists, fetch the existing user
  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.full_name },
  });

  if (error) {
    if (error.message?.includes("already been registered") || error.code === "email_exists") {
      // Fetch existing user
      const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const existing = list?.users?.find((u) => u.email === user.email);
      if (existing) return existing.id;
      throw new Error(`User ${user.email} exists but cannot be fetched`);
    }
    throw error;
  }
  return data.user.id;
}

async function upsertProfile(userId, user, orgId) {
  const { error } = await supabase.from("user_profiles").upsert(
    {
      id: userId,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      organization_id: orgId,
      specialty: user.specialty,
      license_number: user.license_number,
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

// Map placeholder UUID → real UUID (for seed data references)
const uuidMap = {};

async function createAllUsers() {
  const orgMap = Object.fromEntries(ORGS.map((o) => [o.slug, o.id]));

  for (const user of USERS) {
    const label = `${user.role.padEnd(18)} ${user.email}`;
    await step(label, async () => {
      const uid = await createAuthUser(user);
      const orgId = orgMap[user.org_slug];
      await upsertProfile(uid, user, orgId);

      if (user.placeholder_uuid) {
        uuidMap[user.placeholder_uuid] = uid;
      }
      user._uid = uid;
    });
  }
}

// ── Build seed data using real UUIDs ────────────────────────────────────────

function resolveId(placeholder) {
  return uuidMap[placeholder] ?? placeholder;
}

async function seedPatients() {
  const patients = [
    { id: "10000000-0000-0000-0000-000000000001", mrn: "AIIMS-2026-001", first_name: "Arjun",   last_name: "Sharma",    date_of_birth: "1985-03-12", sex: "male",   ethnicity: "South Asian - North Indian",  referring_physician: "Dr. Priya Mehta",  contact_email: "arjun.sharma@gmail.com",    contact_phone: "+91-9811001001" },
    { id: "10000000-0000-0000-0000-000000000002", mrn: "AIIMS-2026-002", first_name: "Priya",    last_name: "Patel",     date_of_birth: "1992-07-24", sex: "female", ethnicity: "South Asian - Gujarati",      referring_physician: "Dr. Sunil Rao",    contact_email: "priya.patel@gmail.com",     contact_phone: "+91-9822002002" },
    { id: "10000000-0000-0000-0000-000000000003", mrn: "AIIMS-2026-003", first_name: "Vikram",   last_name: "Nair",      date_of_birth: "1978-11-05", sex: "male",   ethnicity: "South Asian - South Indian",  referring_physician: "Dr. Priya Mehta",  contact_email: "vikram.nair@gmail.com",     contact_phone: "+91-9833003003" },
    { id: "10000000-0000-0000-0000-000000000004", mrn: "AIIMS-2026-004", first_name: "Ananya",   last_name: "Krishnan",  date_of_birth: "2001-02-18", sex: "female", ethnicity: "South Asian - Tamil",         referring_physician: "Dr. Sunil Rao",    contact_email: "ananya.krishnan@gmail.com", contact_phone: "+91-9844004004" },
    { id: "10000000-0000-0000-0000-000000000005", mrn: "AIIMS-2026-005", first_name: "Rohan",    last_name: "Joshi",     date_of_birth: "1995-09-30", sex: "male",   ethnicity: "South Asian - Marathi",       referring_physician: "Dr. Priya Mehta",  contact_email: "rohan.joshi@gmail.com",     contact_phone: "+91-9855005005" },
    { id: "10000000-0000-0000-0000-000000000006", mrn: "AIIMS-2026-006", first_name: "Deepa",    last_name: "Iyer",      date_of_birth: "1988-05-14", sex: "female", ethnicity: "South Asian - Tamil Brahmin", referring_physician: "Dr. Sunil Rao",    contact_email: "deepa.iyer@gmail.com",      contact_phone: "+91-9866006006" },
    { id: "10000000-0000-0000-0000-000000000007", mrn: "AIIMS-2026-007", first_name: "Karthik",  last_name: "Reddy",     date_of_birth: "1972-12-01", sex: "male",   ethnicity: "South Asian - Telugu",        referring_physician: "Dr. Priya Mehta",  contact_email: "karthik.reddy@gmail.com",   contact_phone: "+91-9877007007" },
    { id: "10000000-0000-0000-0000-000000000008", mrn: "AIIMS-2026-008", first_name: "Meena",    last_name: "Singh",     date_of_birth: "2010-04-22", sex: "female", ethnicity: "South Asian - Rajasthani",    referring_physician: "Dr. Sunil Rao",    contact_email: "meena.singh@gmail.com",     contact_phone: "+91-9888008008" },
    { id: "10000000-0000-0000-0000-000000000009", mrn: "AIIMS-2026-009", first_name: "Suresh",   last_name: "Gupta",     date_of_birth: "1965-08-17", sex: "male",   ethnicity: "South Asian - Bengali",       referring_physician: "Dr. Priya Mehta",  contact_email: "suresh.gupta@gmail.com",    contact_phone: "+91-9899009009" },
    { id: "10000000-0000-0000-0000-000000000010", mrn: "AIIMS-2026-010", first_name: "Lakshmi",  last_name: "Venkatesh", date_of_birth: "1998-01-09", sex: "female", ethnicity: "South Asian - Kannada",       referring_physician: "Dr. Sunil Rao",    contact_email: "lakshmi.v@gmail.com",       contact_phone: "+91-9810010010" },
  ].map((p) => ({ ...p, organization_id: "00000000-0000-0000-0000-000000000001" }));

  const { error } = await supabase.from("patients").upsert(patients, { onConflict: "id" });
  if (error) throw error;
}

async function seedCases() {
  const clinician = resolveId("aaaaaaaa-0001-0001-0001-000000000001");
  const geneticist = resolveId("aaaaaaaa-0002-0002-0002-000000000002");
  const org = "00000000-0000-0000-0000-000000000001";

  const cases = [
    { id: "20000000-0000-0000-0000-000000000001", case_number: "GS-AIIMS-2026-001", patient_id: "10000000-0000-0000-0000-000000000001", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "analysis",    priority: "urgent",  clinical_notes: "Male, 41y. Progressive proximal muscle weakness since age 15. Serum CK elevated at 8,400 U/L. EMG shows myopathic changes. Gower sign positive. Cardiac MRI shows early dilated cardiomyopathy.", family_history: "Maternal uncle wheelchair-bound by age 25. No consanguinity.", inheritance_pattern: "x_linked",           diagnosis: "Duchenne Muscular Dystrophy (DMD)",                                   diagnosis_confidence: 87.50 },
    { id: "20000000-0000-0000-0000-000000000002", case_number: "GS-AIIMS-2026-002", patient_id: "10000000-0000-0000-0000-000000000002", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "sequencing",  priority: "routine", clinical_notes: "Female, 34y. Diagnosed with type 2 diabetes at 28y. Progressive sensorineural hearing loss confirmed on audiometry. Maternal inheritance pattern strongly suspected.", family_history: "Mother has type 2 diabetes. Two maternal aunts have hearing loss.", inheritance_pattern: "mitochondrial",       diagnosis: "Maternally Inherited Diabetes and Deafness (MIDD - MT-TL1)",          diagnosis_confidence: 73.00 },
    { id: "20000000-0000-0000-0000-000000000003", case_number: "GS-AIIMS-2026-003", patient_id: "10000000-0000-0000-0000-000000000003", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "review",      priority: "stat",    clinical_notes: "Male, 48y. Acute-onset hepatic failure, dysarthria, psychiatric symptoms. Kayser-Fleischer rings bilaterally. Serum ceruloplasmin critically low at 8 mg/dL.", family_history: "Parents are first cousins. One sibling died of hepatic failure at age 22.", inheritance_pattern: "autosomal_recessive", diagnosis: "Wilson Disease (ATP7B)",                                               diagnosis_confidence: 94.00 },
    { id: "20000000-0000-0000-0000-000000000004", case_number: "GS-AIIMS-2026-004", patient_id: "10000000-0000-0000-0000-000000000004", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "new",         priority: "routine", clinical_notes: "Female, 25y. Referred for hereditary breast/ovarian cancer risk assessment. Three first-degree relatives with breast cancer.", family_history: "Maternal grandmother: breast cancer at 42. Mother: ovarian cancer at 52.", inheritance_pattern: "autosomal_dominant",  diagnosis: null,                                                                  diagnosis_confidence: null },
    { id: "20000000-0000-0000-0000-000000000005", case_number: "GS-AIIMS-2026-005", patient_id: "10000000-0000-0000-0000-000000000005", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "closed",      priority: "routine", clinical_notes: "Male, 31y. Hypercholesterolaemia diagnosed at 18y. LDL-C 310 mg/dL on treatment. Tendon xanthomas present. Premature atherosclerosis confirmed.", family_history: "Father had first MI at 38y. Paternal grandfather died of cardiac arrest at 44y.", inheritance_pattern: "autosomal_dominant",  diagnosis: "Familial Hypercholesterolaemia (LDLR - pathogenic variant c.1285G>A)", diagnosis_confidence: 96.00 },
    { id: "20000000-0000-0000-0000-000000000006", case_number: "GS-AIIMS-2026-006", patient_id: "10000000-0000-0000-0000-000000000006", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "analysis",    priority: "urgent",  clinical_notes: "Female, 38y. Recurrent spontaneous abortions (4 in 5 years). Balanced chromosomal translocation confirmed. Partner karyotype normal.", family_history: "No known genetic disorders in family.", inheritance_pattern: "unknown",             diagnosis: "Balanced Reciprocal Translocation t(2;5)(q21;q31)",                   diagnosis_confidence: 82.00 },
    { id: "20000000-0000-0000-0000-000000000007", case_number: "GS-AIIMS-2026-007", patient_id: "10000000-0000-0000-0000-000000000007", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "reanalysis",  priority: "routine", clinical_notes: "Male, 54y. Hereditary spastic paraplegia with progressive lower limb spasticity and weakness over 10 years. Previous WES inconclusive.", family_history: "Two brothers with similar gait abnormalities.", inheritance_pattern: "autosomal_dominant",  diagnosis: "Hereditary Spastic Paraplegia - SPG4 (SPAST) — reanalysis pending",   diagnosis_confidence: 55.00 },
    { id: "20000000-0000-0000-0000-000000000008", case_number: "GS-AIIMS-2026-008", patient_id: "10000000-0000-0000-0000-000000000008", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "sequencing",  priority: "stat",    clinical_notes: "Female, 16y. Developmental regression at age 6 months. Stereotyped hand movements, seizures, absent speech. Rett syndrome suspected.", family_history: "Parents non-consanguineous. De novo mutation suspected.", inheritance_pattern: "x_linked",           diagnosis: "Rett Syndrome (MECP2) — sequencing in progress",                      diagnosis_confidence: 68.00 },
    { id: "20000000-0000-0000-0000-000000000009", case_number: "GS-AIIMS-2026-009", patient_id: "10000000-0000-0000-0000-000000000009", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "review",      priority: "urgent",  clinical_notes: "Male, 61y. Colorectal cancer at 58y. Family history strongly suggestive of Lynch syndrome. MSI-high confirmed on tumour testing.", family_history: "Son has colorectal cancer at 35y. Brother had endometrial cancer.", inheritance_pattern: "autosomal_dominant",  diagnosis: "Lynch Syndrome (MLH1 - pathogenic variant c.350C>T p.Pro117Leu)",     diagnosis_confidence: 91.00 },
    { id: "20000000-0000-0000-0000-000000000010", case_number: "GS-AIIMS-2026-010", patient_id: "10000000-0000-0000-0000-000000000010", organization_id: org, assigned_clinician_id: clinician, assigned_geneticist_id: geneticist, status: "new",         priority: "routine", clinical_notes: "Female, 28y. Chronic haemolytic anaemia, jaundice, splenomegaly. Peripheral smear shows target cells and sickle cells. Both parents from Andhra Pradesh.", family_history: "Both parents are carriers. One sibling has confirmed sickle cell disease.", inheritance_pattern: "autosomal_recessive", diagnosis: null,                                                                  diagnosis_confidence: null },
  ];

  const { error } = await supabase.from("cases").upsert(cases, { onConflict: "id" });
  if (error) throw error;
}

async function seedSamples() {
  const samples = [
    { id: "30000000-0000-0000-0000-000000000001", case_id: "20000000-0000-0000-0000-000000000001", barcode: "BC-AIIMS-20260101", sample_type: "whole_genome",  collection_date: "2026-01-10", received_date: "2026-01-11", file_name: "AIIMS2026001_WGS.vcf.gz",   file_size: 2147483648, status: "completed",  qc_status: "pass" },
    { id: "30000000-0000-0000-0000-000000000002", case_id: "20000000-0000-0000-0000-000000000002", barcode: "BC-AIIMS-20260102", sample_type: "whole_exome",   collection_date: "2026-01-15", received_date: "2026-01-16", file_name: "AIIMS2026002_WES.vcf.gz",   file_size: 536870912,  status: "processing", qc_status: "pending" },
    { id: "30000000-0000-0000-0000-000000000003", case_id: "20000000-0000-0000-0000-000000000003", barcode: "BC-AIIMS-20260103", sample_type: "panel",         collection_date: "2026-01-20", received_date: "2026-01-21", file_name: "AIIMS2026003_Panel.vcf.gz", file_size: 104857600,  status: "completed",  qc_status: "pass" },
    { id: "30000000-0000-0000-0000-000000000004", case_id: "20000000-0000-0000-0000-000000000004", barcode: "BC-AIIMS-20260104", sample_type: "panel",         collection_date: "2026-01-25", received_date: "2026-01-26", file_name: "AIIMS2026004_BRCA.vcf.gz",  file_size: 52428800,   status: "received",   qc_status: "pending" },
    { id: "30000000-0000-0000-0000-000000000005", case_id: "20000000-0000-0000-0000-000000000005", barcode: "BC-AIIMS-20260105", sample_type: "whole_exome",   collection_date: "2025-11-10", received_date: "2025-11-11", file_name: "AIIMS2026005_WES.vcf.gz",   file_size: 536870912,  status: "completed",  qc_status: "pass" },
    { id: "30000000-0000-0000-0000-000000000006", case_id: "20000000-0000-0000-0000-000000000006", barcode: "BC-AIIMS-20260106", sample_type: "whole_genome",  collection_date: "2026-02-01", received_date: "2026-02-02", file_name: "AIIMS2026006_WGS.vcf.gz",   file_size: 2147483648, status: "completed",  qc_status: "pass" },
    { id: "30000000-0000-0000-0000-000000000007", case_id: "20000000-0000-0000-0000-000000000007", barcode: "BC-AIIMS-20260107", sample_type: "whole_genome",  collection_date: "2026-02-10", received_date: "2026-02-11", file_name: "AIIMS2026007_WGS.vcf.gz",   file_size: 2147483648, status: "processing", qc_status: "pending" },
    { id: "30000000-0000-0000-0000-000000000008", case_id: "20000000-0000-0000-0000-000000000008", barcode: "BC-AIIMS-20260108", sample_type: "whole_exome",   collection_date: "2026-02-15", received_date: "2026-02-16", file_name: "AIIMS2026008_WES.vcf.gz",   file_size: 536870912,  status: "processing", qc_status: "pending" },
    { id: "30000000-0000-0000-0000-000000000009", case_id: "20000000-0000-0000-0000-000000000009", barcode: "BC-AIIMS-20260109", sample_type: "panel",         collection_date: "2026-02-20", received_date: "2026-02-21", file_name: "AIIMS2026009_Lynch.vcf.gz", file_size: 104857600,  status: "completed",  qc_status: "pass" },
    { id: "30000000-0000-0000-0000-000000000010", case_id: "20000000-0000-0000-0000-000000000010", barcode: "BC-AIIMS-20260110", sample_type: "panel",         collection_date: "2026-03-01", received_date: "2026-03-02", file_name: "AIIMS2026010_Hgb.vcf.gz",   file_size: 52428800,   status: "collected",  qc_status: "pending" },
  ];

  const { error } = await supabase.from("samples").upsert(samples, { onConflict: "id" });
  if (error) throw error;
}

async function seedVariants() {
  // Delete old variants for these cases first (no unique key to upsert on)
  const caseIds = Array.from({ length: 10 }, (_, i) => `20000000-0000-0000-0000-00000000000${i + 1}`);
  await supabase.from("variants").delete().in("case_id", caseIds);

  const variants = [
    // Case 1: DMD
    { case_id: "20000000-0000-0000-0000-000000000001", sample_id: "30000000-0000-0000-0000-000000000001", chromosome: "X",  position: 31094050, reference_allele: "G", alternate_allele: "A", gene_symbol: "DMD",    transcript_id: "NM_004006.3",  hgvs_c: "c.10108C>T", hgvs_p: "p.Arg3370Ter",  consequence: "stop_gained",       classification: "pathogenic",        acmg_criteria: ["PVS1","PS3","PM2","PP4"], gnomad_af: 0.0000012,  clinvar_id: "RCV000167443", clinvar_significance: "Pathogenic",           omim_id: "310200", review_status: "approved" },
    // Case 2: MT-TL1
    { case_id: "20000000-0000-0000-0000-000000000002", sample_id: "30000000-0000-0000-0000-000000000002", chromosome: "MT", position: 3243,      reference_allele: "A", alternate_allele: "G", gene_symbol: "MT-TL1", transcript_id: "NC_012920.1",  hgvs_c: "m.3243A>G",  hgvs_p: null,            consequence: "missense_variant",   classification: "pathogenic",        acmg_criteria: ["PVS1","PS1","PM6"],       gnomad_af: 0.000015,   clinvar_id: "RCV000008764", clinvar_significance: "Pathogenic",           omim_id: "520000", review_status: "reviewed" },
    // Case 3: Wilson - variant 1
    { case_id: "20000000-0000-0000-0000-000000000003", sample_id: "30000000-0000-0000-0000-000000000003", chromosome: "13", position: 51940609,  reference_allele: "C", alternate_allele: "T", gene_symbol: "ATP7B",  transcript_id: "NM_000053.4",  hgvs_c: "c.3207C>A",  hgvs_p: "p.His1069Gln", consequence: "missense_variant",   classification: "pathogenic",        acmg_criteria: ["PS1","PM1","PM2","PP3"],  gnomad_af: 0.0042,     clinvar_id: "RCV000000428", clinvar_significance: "Pathogenic",           omim_id: "277900", review_status: "approved" },
    // Case 3: Wilson - variant 2
    { case_id: "20000000-0000-0000-0000-000000000003", sample_id: "30000000-0000-0000-0000-000000000003", chromosome: "13", position: 51954835,  reference_allele: "G", alternate_allele: "A", gene_symbol: "ATP7B",  transcript_id: "NM_000053.4",  hgvs_c: "c.2755C>T",  hgvs_p: "p.Arg919Ter",  consequence: "stop_gained",       classification: "likely_pathogenic", acmg_criteria: ["PVS1","PM2","PP4"],       gnomad_af: 0.0000080,  clinvar_id: "RCV000185201", clinvar_significance: "Likely pathogenic",    omim_id: "277900", review_status: "reviewed" },
    // Case 4: BRCA1 VUS
    { case_id: "20000000-0000-0000-0000-000000000004", sample_id: "30000000-0000-0000-0000-000000000004", chromosome: "17", position: 43092919,  reference_allele: "A", alternate_allele: "G", gene_symbol: "BRCA1",  transcript_id: "NM_007294.4",  hgvs_c: "c.5251A>G",  hgvs_p: "p.Lys1751Glu", consequence: "missense_variant",   classification: "vus",               acmg_criteria: ["PM2","PP3"],              gnomad_af: 0.0000004,  clinvar_id: null,           clinvar_significance: "Uncertain significance", omim_id: "604370", review_status: "pending" },
    // Case 5: LDLR
    { case_id: "20000000-0000-0000-0000-000000000005", sample_id: "30000000-0000-0000-0000-000000000005", chromosome: "19", position: 11089463,  reference_allele: "G", alternate_allele: "A", gene_symbol: "LDLR",   transcript_id: "NM_000527.5",  hgvs_c: "c.1285G>A",  hgvs_p: "p.Asp429Asn",  consequence: "missense_variant",   classification: "pathogenic",        acmg_criteria: ["PS1","PM1","PM2","PP3","PP4"], gnomad_af: 0.000002, clinvar_id: "RCV000237780", clinvar_significance: "Pathogenic",          omim_id: "143890", review_status: "approved" },
    // Case 8: MECP2
    { case_id: "20000000-0000-0000-0000-000000000008", sample_id: "30000000-0000-0000-0000-000000000008", chromosome: "X",  position: 153296777, reference_allele: "C", alternate_allele: "T", gene_symbol: "MECP2",  transcript_id: "NM_004992.4",  hgvs_c: "c.763C>T",   hgvs_p: "p.Arg255Ter",  consequence: "stop_gained",       classification: "pathogenic",        acmg_criteria: ["PVS1","PS2","PM2"],       gnomad_af: 0.0000006,  clinvar_id: "RCV000009768", clinvar_significance: "Pathogenic",           omim_id: "312750", review_status: "reviewed" },
    // Case 9: MLH1 Lynch
    { case_id: "20000000-0000-0000-0000-000000000009", sample_id: "30000000-0000-0000-0000-000000000009", chromosome: "3",  position: 37006994,  reference_allele: "C", alternate_allele: "T", gene_symbol: "MLH1",   transcript_id: "NM_000249.4",  hgvs_c: "c.350C>T",   hgvs_p: "p.Pro117Leu",  consequence: "missense_variant",   classification: "pathogenic",        acmg_criteria: ["PS1","PM1","PM2","PP3","PP4"], gnomad_af: 0.0000001, clinvar_id: "RCV000077556", clinvar_significance: "Pathogenic",          omim_id: "609310", review_status: "approved" },
    // Case 10: HBB sickle cell
    { case_id: "20000000-0000-0000-0000-000000000010", sample_id: "30000000-0000-0000-0000-000000000010", chromosome: "11", position: 5246945,   reference_allele: "T", alternate_allele: "A", gene_symbol: "HBB",    transcript_id: "NM_000518.5",  hgvs_c: "c.20A>T",    hgvs_p: "p.Glu7Val",    consequence: "missense_variant",   classification: "pathogenic",        acmg_criteria: ["PVS1","PS1","PM2"],       gnomad_af: 0.0082,     clinvar_id: "RCV000015260", clinvar_significance: "Pathogenic",           omim_id: "603903", review_status: "pending" },
  ];

  const { error } = await supabase.from("variants").insert(variants);
  if (error) throw error;
}

async function seedPhenotypes() {
  const phenotypes = [
    { case_id: "20000000-0000-0000-0000-000000000001", hpo_id: "HP:0003326", name: "Myalgia",                         description: "Muscle pain with exertion" },
    { case_id: "20000000-0000-0000-0000-000000000001", hpo_id: "HP:0001290", name: "Hypotonia",                        description: "Decreased muscle tone" },
    { case_id: "20000000-0000-0000-0000-000000000001", hpo_id: "HP:0001629", name: "Ventricular septal defect",        description: "Structural cardiac finding" },
    { case_id: "20000000-0000-0000-0000-000000000002", hpo_id: "HP:0000407", name: "Sensorineural hearing impairment", description: "Progressive bilateral hearing loss" },
    { case_id: "20000000-0000-0000-0000-000000000002", hpo_id: "HP:0001513", name: "Obesity",                          description: "BMI 31 at presentation" },
    { case_id: "20000000-0000-0000-0000-000000000003", hpo_id: "HP:0001250", name: "Seizures",                         description: "Generalised tonic-clonic seizures" },
    { case_id: "20000000-0000-0000-0000-000000000003", hpo_id: "HP:0001903", name: "Anemia",                           description: "Haemolytic anaemia secondary to copper deposition" },
    { case_id: "20000000-0000-0000-0000-000000000004", hpo_id: "HP:0003002", name: "Breast carcinoma",                 description: "Strong family history of breast cancer" },
    { case_id: "20000000-0000-0000-0000-000000000006", hpo_id: "HP:0200070", name: "Recurrent miscarriages",           description: "Four pregnancy losses before 12 weeks gestation" },
    { case_id: "20000000-0000-0000-0000-000000000007", hpo_id: "HP:0001257", name: "Spasticity",                       description: "Progressive lower limb spasticity" },
    { case_id: "20000000-0000-0000-0000-000000000007", hpo_id: "HP:0002493", name: "Upper motor neuron dysfunction",   description: "Hyperreflexia and extensor plantar responses" },
    { case_id: "20000000-0000-0000-0000-000000000008", hpo_id: "HP:0001250", name: "Seizures",                         description: "Multiple seizure types" },
    { case_id: "20000000-0000-0000-0000-000000000008", hpo_id: "HP:0001263", name: "Global developmental delay",       description: "Regression after 6 months" },
    { case_id: "20000000-0000-0000-0000-000000000008", hpo_id: "HP:0000252", name: "Microcephaly",                     description: "Acquired microcephaly" },
    { case_id: "20000000-0000-0000-0000-000000000009", hpo_id: "HP:0100273", name: "Colon cancer",                     description: "Colorectal adenocarcinoma at 58y" },
    { case_id: "20000000-0000-0000-0000-000000000010", hpo_id: "HP:0001903", name: "Anemia",                           description: "Chronic haemolytic anaemia" },
    { case_id: "20000000-0000-0000-0000-000000000010", hpo_id: "HP:0001744", name: "Splenomegaly",                     description: "Massive splenomegaly on examination" },
  ];

  // Delete then insert (no unique constraint on hpo_id per case in standard schema)
  const caseIds = [...new Set(phenotypes.map((p) => p.case_id))];
  await supabase.from("case_phenotypes").delete().in("case_id", caseIds);
  const { error } = await supabase.from("case_phenotypes").insert(phenotypes);
  if (error) throw error;
}

async function seedQualityMetrics() {
  const metrics = [
    { sample_id: "30000000-0000-0000-0000-000000000001", mean_coverage: 42.30,  percent_20x: 97.80, ts_tv_ratio: 2.156, total_variants: 4850230, filtered_variants: 3210, dbsnp_percent: 98.72 },
    { sample_id: "30000000-0000-0000-0000-000000000002", mean_coverage: 88.50,  percent_20x: 98.90, ts_tv_ratio: 2.201, total_variants: 96420,   filtered_variants: 1840, dbsnp_percent: 97.65 },
    { sample_id: "30000000-0000-0000-0000-000000000003", mean_coverage: 350.00, percent_20x: 99.50, ts_tv_ratio: 2.089, total_variants: 4120,    filtered_variants: 185,  dbsnp_percent: 99.10 },
    { sample_id: "30000000-0000-0000-0000-000000000004", mean_coverage: 280.00, percent_20x: 99.10, ts_tv_ratio: 2.310, total_variants: 3240,    filtered_variants: 120,  dbsnp_percent: 99.30 },
    { sample_id: "30000000-0000-0000-0000-000000000005", mean_coverage: 75.20,  percent_20x: 96.40, ts_tv_ratio: 2.189, total_variants: 87650,   filtered_variants: 2105, dbsnp_percent: 96.88 },
    { sample_id: "30000000-0000-0000-0000-000000000006", mean_coverage: 38.60,  percent_20x: 95.20, ts_tv_ratio: 2.073, total_variants: 4720450, filtered_variants: 4820, dbsnp_percent: 97.45 },
    { sample_id: "30000000-0000-0000-0000-000000000009", mean_coverage: 320.00, percent_20x: 99.20, ts_tv_ratio: 2.445, total_variants: 3980,    filtered_variants: 210,  dbsnp_percent: 98.90 },
  ];

  const sampleIds = metrics.map((m) => m.sample_id);
  await supabase.from("quality_metrics").delete().in("sample_id", sampleIds);
  const { error } = await supabase.from("quality_metrics").insert(metrics);
  if (error) throw error;
}

async function seedAiDiagnoses() {
  const caseIds = ["20000000-0000-0000-0000-000000000001", "20000000-0000-0000-0000-000000000003", "20000000-0000-0000-0000-000000000005", "20000000-0000-0000-0000-000000000009"];
  await supabase.from("ai_diagnoses").delete().in("case_id", caseIds);

  const diagnoses = [
    { case_id: "20000000-0000-0000-0000-000000000001", rank: 1, disease_name: "Duchenne Muscular Dystrophy",  omim_id: "310200", confidence: 87.50, reasoning: "Pathogenic hemizygous stop-gain variant in DMD (c.10108C>T p.Arg3370Ter) combined with markedly elevated CK, Gower sign, and X-linked family history strongly supports DMD.", supporting_variants: ["c.10108C>T (DMD) - stop_gained"], inheritance_pattern: "x_linked",           next_steps: ["Confirm with dystrophin immunohistochemistry on muscle biopsy", "Cardiac MRI annually", "Refer for corticosteroid therapy initiation", "Genetic counselling for mother (carrier testing)"] },
    { case_id: "20000000-0000-0000-0000-000000000001", rank: 2, disease_name: "Becker Muscular Dystrophy",    omim_id: "300376", confidence: 10.00, reasoning: "Less likely given age of onset and severity, but Becker allelic to DMD should be considered if reading frame is preserved.", supporting_variants: ["c.10108C>T (DMD)"], inheritance_pattern: "x_linked", next_steps: ["Review reading frame prediction", "Western blot for dystrophin quantity"] },
    { case_id: "20000000-0000-0000-0000-000000000003", rank: 1, disease_name: "Wilson Disease",               omim_id: "277900", confidence: 94.00, reasoning: "Compound heterozygous pathogenic variants in ATP7B (p.His1069Gln + p.Arg919Ter), Kayser-Fleischer rings, low ceruloplasmin, and consanguineous family history provide near-definitive diagnosis.", supporting_variants: ["c.3207C>A (ATP7B) - p.His1069Gln", "c.2755C>T (ATP7B) - p.Arg919Ter"], inheritance_pattern: "autosomal_recessive", next_steps: ["Start copper chelation therapy (penicillamine or trientine)", "24-hour urine copper quantification", "Liver biopsy for copper quantitation if needed", "Screen siblings with serum ceruloplasmin and slit-lamp"] },
    { case_id: "20000000-0000-0000-0000-000000000005", rank: 1, disease_name: "Familial Hypercholesterolaemia", omim_id: "143890", confidence: 96.00, reasoning: "Pathogenic variant LDLR c.1285G>A (p.Asp429Asn) confirmed. Dutch Lipid Clinic Network score >8. Heterozygous FH explains severe premature hypercholesterolaemia.", supporting_variants: ["c.1285G>A (LDLR) - p.Asp429Asn"], inheritance_pattern: "autosomal_dominant", next_steps: ["Intensify statin + ezetimibe therapy", "Consider PCSK9 inhibitor referral", "Cascade testing for first-degree relatives", "Dietary counselling and lifestyle modification"] },
    { case_id: "20000000-0000-0000-0000-000000000009", rank: 1, disease_name: "Lynch Syndrome (MLH1)",        omim_id: "609310", confidence: 91.00, reasoning: "Pathogenic MLH1 variant c.350C>T (p.Pro117Leu) with MSI-high colorectal tumour and Amsterdam II criteria-positive family history establishes Lynch syndrome diagnosis.", supporting_variants: ["c.350C>T (MLH1) - p.Pro117Leu"], inheritance_pattern: "autosomal_dominant", next_steps: ["Annual colonoscopy surveillance", "Upper endoscopy every 2-3 years", "Gynaecological surveillance for endometrial/ovarian cancer", "Cascade genetic testing for all first-degree relatives", "Consider aspirin chemoprevention"] },
  ];

  const { error } = await supabase.from("ai_diagnoses").insert(diagnoses);
  if (error) throw error;
}

async function seedReports() {
  const geneticist = resolveId("aaaaaaaa-0002-0002-0002-000000000002");
  const orgAdmin   = resolveId("aaaaaaaa-0005-0005-0005-000000000005");

  const reports = [
    {
      id: "40000000-0000-0000-0000-000000000001",
      case_id: "20000000-0000-0000-0000-000000000005",
      report_number: "RPT-AIIMS-2026-005",
      status: "final",
      generated_by: geneticist,
      approved_by: orgAdmin,
      summary: "Pathogenic heterozygous LDLR variant identified confirming Familial Hypercholesterolaemia diagnosis.",
      interpretation: "Whole exome sequencing identified a pathogenic heterozygous missense variant in the LDLR gene (NM_000527.5): c.1285G>A (p.Asp429Asn). This variant has been previously reported in ClinVar (RCV000237780) as pathogenic and disrupts a conserved residue in the ligand-binding domain of the LDL receptor.",
      recommendations: "Initiate or intensify high-intensity statin therapy. Add ezetimibe 10 mg daily if LDL-C target not achieved. Refer to lipid clinic for consideration of PCSK9 inhibitor. Cascade testing strongly recommended for all first-degree relatives.",
    },
    {
      id: "40000000-0000-0000-0000-000000000002",
      case_id: "20000000-0000-0000-0000-000000000003",
      report_number: "RPT-AIIMS-2026-003",
      status: "review",
      generated_by: geneticist,
      approved_by: null,
      summary: "Compound heterozygous pathogenic ATP7B variants confirm Wilson Disease. Copper chelation therapy recommended urgently.",
      interpretation: "Panel sequencing of ATP7B identified two pathogenic variants in trans (compound heterozygous state). Variant 1: c.3207C>A (p.His1069Gln) — most common Wilson disease variant, classified pathogenic (ClinVar RCV000000428). Variant 2: c.2755C>T (p.Arg919Ter) — nonsense variant resulting in loss of function (PVS1).",
      recommendations: "Urgent initiation of copper chelation therapy (D-penicillamine or trientine). Zinc supplementation as maintenance. Low-copper diet counselling. Regular monitoring of liver function and 24-hour urinary copper.",
    },
    {
      id: "40000000-0000-0000-0000-000000000003",
      case_id: "20000000-0000-0000-0000-000000000009",
      report_number: "RPT-AIIMS-2026-009",
      status: "final",
      generated_by: geneticist,
      approved_by: orgAdmin,
      summary: "Pathogenic MLH1 variant confirms Lynch Syndrome. Intensified cancer surveillance programme initiated.",
      interpretation: "Gene panel sequencing identified a pathogenic heterozygous missense variant in MLH1 (NM_000249.4): c.350C>T (p.Pro117Leu). This variant disrupts a highly conserved residue in the ATPase domain of MLH1, abrogating mismatch repair function. MSI-high status confirmed. Variant classified as Pathogenic (ClinVar RCV000077556).",
      recommendations: "Colonoscopy surveillance annually. Upper GI endoscopy every 2–3 years. Cascade testing of all first-degree relatives. Consider prophylactic aspirin as per CAPP2 trial data.",
    },
  ];

  const { error } = await supabase.from("reports").upsert(reports, { onConflict: "id" });
  if (error) throw error;
}

async function seedComments() {
  const clinician  = resolveId("aaaaaaaa-0001-0001-0001-000000000001");
  const geneticist = resolveId("aaaaaaaa-0002-0002-0002-000000000002");
  const counselor  = resolveId("aaaaaaaa-0004-0004-0004-000000000004");

  const caseIds = ["20000000-0000-0000-0000-000000000001", "20000000-0000-0000-0000-000000000003", "20000000-0000-0000-0000-000000000009"];
  await supabase.from("case_comments").delete().in("case_id", caseIds);

  const comments = [
    { case_id: "20000000-0000-0000-0000-000000000001", user_id: clinician,  content: "Cardiology reviewed the patient today. Dilated cardiomyopathy confirmed. Starting ACE inhibitor. Please expedite DMD variant confirmation for initiating exon-skipping therapy assessment." },
    { case_id: "20000000-0000-0000-0000-000000000001", user_id: geneticist, content: "Variant confirmed pathogenic. DMD exon 70 stop-gain variant. Reading frame disrupted. Exon-skipping not applicable for this mutation. Coordinating with physiotherapy for rehabilitation plan." },
    { case_id: "20000000-0000-0000-0000-000000000003", user_id: clinician,  content: "Patient's psychiatric symptoms worsening. Neurology consultation requested. Ceruloplasmin repeat: 6 mg/dL. Initiating trientine pending hepatology clearance." },
    { case_id: "20000000-0000-0000-0000-000000000003", user_id: counselor,  content: "Genetic counselling session completed with family. Parents both confirmed as carriers. Sibling testing arranged. Patient and family understand the autosomal recessive inheritance." },
    { case_id: "20000000-0000-0000-0000-000000000009", user_id: clinician,  content: "Patient very anxious about implications for his son and grandchildren. Genetic counsellor referral made for the extended family. Son (35y) already has colorectal cancer — urgent cascade testing arranged." },
    { case_id: "20000000-0000-0000-0000-000000000009", user_id: geneticist, content: "Report finalised and sent to oncology team. Lynch syndrome registry enrolment initiated. Annual surveillance colonoscopy scheduled for next month." },
  ];

  const { error } = await supabase.from("case_comments").insert(comments);
  if (error) throw error;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║     GenoScope - Complete Seed & User Setup           ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  console.log("▶ Step 1: Organizations");
  await step("Upsert 5 organizations", upsertOrgs);

  console.log("\n▶ Step 2: Auth Users (all 6 roles + demo accounts)");
  await createAllUsers();

  console.log("\n▶ Step 3: Patients");
  await step("Upsert 10 Indian patients", seedPatients);

  console.log("\n▶ Step 4: Cases");
  await step("Upsert 10 clinical cases", seedCases);

  console.log("\n▶ Step 5: Samples");
  await step("Upsert 10 genomic samples", seedSamples);

  console.log("\n▶ Step 6: Variants");
  await step("Insert 9 genomic variants", seedVariants);

  console.log("\n▶ Step 7: Phenotypes (HPO terms)");
  await step("Insert 17 HPO phenotype entries", seedPhenotypes);

  console.log("\n▶ Step 8: Quality Metrics");
  await step("Insert 7 QC metric entries", seedQualityMetrics);

  console.log("\n▶ Step 9: AI Diagnoses");
  await step("Insert 5 AI diagnosis results", seedAiDiagnoses);

  console.log("\n▶ Step 10: Reports");
  await step("Upsert 3 clinical reports", seedReports);

  console.log("\n▶ Step 11: Case Comments");
  await step("Insert 6 discussion comments", seedComments);

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║                   SEED COMPLETE ✓                   ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║  All accounts use password: Demo@123456              ║");
  console.log("║  (Demo accounts use: demo123456)                     ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║  ROLE               EMAIL                            ║");
  console.log("║  ─────────────────  ──────────────────────────────── ║");
  console.log("║  super_admin        superadmin@genoscope.ai          ║");
  console.log("║  org_admin          admin.sharma@aiims.edu           ║");
  console.log("║  clinician          priya.mehta@aiims.edu            ║");
  console.log("║  geneticist         sunil.rao@aiims.edu              ║");
  console.log("║  lab_technician     kavitha.nair@aiims.edu           ║");
  console.log("║  genetic_counselor  anita.desai@aiims.edu            ║");
  console.log("║  ─────────────────  ──────────────────────────────── ║");
  console.log("║  [DEMO] clinician   clinician@demo.genoscope.ai      ║");
  console.log("║  [DEMO] geneticist  geneticist@demo.genoscope.ai     ║");
  console.log("║  [DEMO] lab_tech    lab@demo.genoscope.ai            ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");
}

main().catch((err) => {
  console.error("\n✗ FATAL:", err.message ?? err);
  process.exit(1);
});
