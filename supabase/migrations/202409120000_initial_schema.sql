-- Enable UUID generation helper
create extension if not exists "pgcrypto";

-- Timestamp trigger helper reused by multiple tables
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Clients catalog
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  setor text,
  created_at timestamptz not null default now()
);

-- Landing pages
create table if not exists public.lps (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clients(id) on delete set null,
  titulo text not null,
  slug text not null unique,
  template text not null default 'saas',
  content jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lps_set_updated_at
before update on public.lps
for each row
execute procedure public.set_current_timestamp_updated_at();

alter table public.lps enable row level security;

create policy lps_public_read on public.lps
for select
using (published = true);

create policy lps_member_full on public.lps
for all
using (auth.role() in ('admin', 'member'))
with check (auth.role() in ('admin', 'member'));
