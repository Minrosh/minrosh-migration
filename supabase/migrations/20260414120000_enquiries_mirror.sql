-- Phase 1 dual-write: mirror website enquiries (and quiz lead payloads) from the app into Postgres for backup.
-- Default: dual-write when Supabase URL + service role are configured. Set SUPABASE_DUAL_WRITE_ENQUIRIES=false to disable.

create table if not exists public.enquiries_mirror (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists enquiries_mirror_created_at_idx on public.enquiries_mirror (created_at desc);

comment on table public.enquiries_mirror is 'MinRosh website enquiries mirrored from disk JSON when dual-write is enabled.';
