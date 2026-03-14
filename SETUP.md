# GenoScope Setup Guide

## 1. Create .env.local

Copy the example file:
```bash
cp .env.local.example .env.local
```

Then fill in the values:

### Supabase
1. Go to https://supabase.com → Create free account → New Project
2. Name it `genoscope`, set a DB password
3. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI
1. Go to https://platform.openai.com → API Keys → Create new
2. Copy key → `OPENAI_API_KEY`

## 2. Run Database Migration

1. In Supabase dashboard → **SQL Editor**
2. Paste the contents of `supabase/migrations/001_schema.sql`
3. Click **Run**

## 3. Enable Supabase Auth

1. Supabase → **Authentication → Settings**
2. Enable Email provider
3. Set Site URL to `http://localhost:3000`

## 4. Run the App

```bash
# Use Node 20+
nvm use 20

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

Open http://localhost:3000 → redirects to login → create account → done!

## Architecture

```
/app
  /(auth)/login       → Login page
  /(auth)/signup      → Signup + org creation
  /(dashboard)        → Protected dashboard routes
    /dashboard        → Home with stats & charts
    /patients         → Patient management
    /cases            → Kanban case board + detail
    /samples          → Sample upload (VCF files)
    /variants         → Variant review table
    /reports          → Clinical report generation
    /quality          → QC metrics dashboard
    /literature       → PubMed literature search
    /admin            → User & org management

/app/api
  /analysis/ai-diagnose   → GPT-4o diagnosis engine
  /samples/upload         → VCF parsing + annotation
  /reports/generate       → AI report generation
  /reports/finalize       → Approve report
  /variants/classify      → Manual variant classification

/lib
  /supabase/client.ts     → Browser Supabase client
  /supabase/server.ts     → Server Supabase client
  /ai/openai.ts           → OpenAI client
  /ai/prompts.ts          → GPT-4o prompts
  /genomics/vcf-parser.ts → VCF file parser
  /genomics/annotation-pipeline.ts → Variant annotation

/supabase/migrations/001_schema.sql → Full DB schema
```
