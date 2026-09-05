# BuildGuard AI V4 — Real Excel Intelligence Engine

This version upgrades BuildGuard from a visual demo to real workbook analysis.

## What works

Upload one `.xlsx` or `.xls` workbook containing these sheets:

- BOQ
- Schedule
- Budget
- Inventory
- Purchase Orders
- Vendor Quotes

BuildGuard will:

- compare BOQ requirements against inventory and purchase orders
- calculate uncovered material quantities
- compare planned progress vs actual progress
- detect budget overruns
- rank vendor quotes using price, lead time and payment terms
- generate risk cards and project-management answers from uploaded data

## Deploy

Replace the files in the existing GitHub repo with this version.

Important: delete old folders/files that are no longer part of this build, especially old `lib/supabase` files if still present.

Vercel will redeploy automatically.

## Test

Use the Horizon Heights workbook previously created:
`Horizon_Heights_BuildGuard_Test_Data.xlsx`

## Current limitation

This is deterministic analysis, not a live LLM integration yet.

Next phase:
- OpenAI API
- flexible column mapping
- PDF quote extraction
- saved multi-project workspaces
- source-linked AI answers
