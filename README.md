# BuildGuard AI Pilot v2

This version adds a real Supabase-backed pilot workspace.

## Included

- Passwordless email login
- Persistent projects in Supabase Postgres
- Row Level Security
- Project creation
- Project portfolio dashboard
- Schedule and budget exception detection
- Private project document storage
- BOQ / schedule / budget / quote / PO / invoice document categories
- Per-user data isolation
- AI-style project analyst based on saved structured project data
- Demo portfolio shown until first real project is created

## Setup

### 1. Supabase SQL

Open Supabase > SQL Editor > New query.

Paste the complete contents of:

`supabase/migration.sql`

Click Run once.

### 2. Vercel environment variables

In Vercel project:

Settings > Environment Variables

Add:

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Use the values from your Supabase Connect screen.

Apply them to Production, Preview and Development.

### 3. Deploy

Replace the existing GitHub repository files with this project's files.

Vercel will redeploy automatically.

## Authentication setting

In Supabase:
Authentication > URL Configuration

Set Site URL to:
https://buildguard-ai.vercel.app

Add Redirect URL:
https://buildguard-ai.vercel.app/**

This ensures magic-login emails return users to the deployed app.

## Important

Do NOT expose:
- service_role key
- database password
- secret API keys

Only the publishable Supabase key belongs in `NEXT_PUBLIC_...`.
