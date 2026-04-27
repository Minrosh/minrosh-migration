-- Phase 1 dual-write mirrors for CRM + billing (JSON remains source of truth until read switch).
-- Enable with SUPABASE_DUAL_WRITE_CUSTOMERS / SUPABASE_DUAL_WRITE_INVOICES (see .env.example).

create table if not exists public.customers_mirror (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists customers_mirror_updated_at_idx on public.customers_mirror (updated_at desc);

comment on table public.customers_mirror is 'MinRosh customers mirrored from data/customers.json when dual-write is enabled.';

create table if not exists public.invoices_mirror (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists invoices_mirror_updated_at_idx on public.invoices_mirror (updated_at desc);

comment on table public.invoices_mirror is 'MinRosh invoices mirrored from data/invoices.json when dual-write is enabled.';
