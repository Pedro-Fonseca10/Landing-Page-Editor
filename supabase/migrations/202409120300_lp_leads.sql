-- Leads captured from landing pages
create table if not exists public.lp_leads (
  id uuid primary key default gen_random_uuid(),
  lp_id uuid not null references public.lps(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  status text not null default 'new'
    check (status in ('new','qualified','converted','discarded')),
  nome text,
  email text,
  email_normalized text,
  payload jsonb not null default '{}'::jsonb,
  utm jsonb,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger lp_leads_set_updated_at
before update on public.lp_leads
for each row
execute procedure public.set_current_timestamp_updated_at();

create index lp_leads_lp_status_idx on public.lp_leads (lp_id, status);
create unique index if not exists lp_leads_email_unique on public.lp_leads (email_normalized);

alter table public.lp_leads enable row level security;

create policy lp_leads_members on public.lp_leads
for all
using (auth.role() in ('admin','member'))
with check (auth.role() in ('admin','member'));
