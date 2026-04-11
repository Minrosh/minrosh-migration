-- Run in Supabase SQL editor or via supabase db push.
-- Used by GET/POST /api/admin/integrations/supabase to verify connectivity.

create table if not exists public.minrosh_db_ping (
  id int primary key default 1,
  updated_at timestamptz not null default now()
);

comment on table public.minrosh_db_ping is 'MinRosh app connectivity probe; safe to keep empty aside from id=1.';

insert into public.minrosh_db_ping (id) values (1)
on conflict (id) do update set updated_at = now();
