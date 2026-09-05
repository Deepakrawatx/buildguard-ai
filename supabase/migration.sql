-- BuildGuard AI Pilot v2
-- Run once in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  city text,
  project_type text default 'Residential',
  value_cr numeric not null default 0,
  progress numeric not null default 0 check (progress >= 0 and progress <= 100),
  planned_progress numeric not null default 0 check (planned_progress >= 0 and planned_progress <= 100),
  budget_planned_l numeric not null default 0,
  budget_actual_l numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  category text not null default 'Other',
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.project_documents enable row level security;

drop policy if exists "users read own projects" on public.projects;
create policy "users read own projects"
on public.projects for select
using (auth.uid() = user_id);

drop policy if exists "users insert own projects" on public.projects;
create policy "users insert own projects"
on public.projects for insert
with check (auth.uid() = user_id);

drop policy if exists "users update own projects" on public.projects;
create policy "users update own projects"
on public.projects for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users delete own projects" on public.projects;
create policy "users delete own projects"
on public.projects for delete
using (auth.uid() = user_id);

drop policy if exists "users read own documents" on public.project_documents;
create policy "users read own documents"
on public.project_documents for select
using (auth.uid() = user_id);

drop policy if exists "users insert own documents" on public.project_documents;
create policy "users insert own documents"
on public.project_documents for insert
with check (auth.uid() = user_id);

drop policy if exists "users delete own documents" on public.project_documents;
create policy "users delete own documents"
on public.project_documents for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('project-documents', 'project-documents', false)
on conflict (id) do nothing;

drop policy if exists "users upload own project files" on storage.objects;
create policy "users upload own project files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'project-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users read own project files" on storage.objects;
create policy "users read own project files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'project-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users delete own project files" on storage.objects;
create policy "users delete own project files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
