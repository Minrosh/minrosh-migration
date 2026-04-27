-- Phase 1 dual-write: mirror website enquiries from JSON into Postgres for backup / future read switch.
-- Enable with SUPABASE_DUAL_WRITE_ENQUIRIES=true after applying this migration.

create table if not exists public.enquiries_mirror (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists enquiries_mirror_created_at_idx on public.enquiries_mirror (created_at desc);

comment on table public.enquiries_mirror is 'MinRosh website enquiries mirrored from disk JSON when dual-write is enabled.';
