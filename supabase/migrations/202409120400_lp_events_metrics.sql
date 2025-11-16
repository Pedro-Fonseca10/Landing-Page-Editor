-- Enumerates the interaction types tracked on landing pages
do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_type') then
    create type public.event_type as enum ('page_view','cta_click','form_submit','conversion');
  end if;
end$$;

-- Raw events storage
create table if not exists public.lp_events (
  id bigserial primary key,
  lp_id uuid not null references public.lps(id) on delete cascade,
  event_type public.event_type not null,
  visitor_id uuid,
  session_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index lp_events_lp_type_idx on public.lp_events (lp_id, event_type, occurred_at);

alter table public.lp_events enable row level security;

create policy lp_events_members on public.lp_events
for all
using (auth.role() in ('admin','member'))
with check (auth.role() in ('admin','member'));

-- Aggregated metrics for dashboards
create table if not exists public.daily_lp_metrics (
  lp_id uuid not null references public.lps(id) on delete cascade,
  metric_date date not null,
  page_views integer not null default 0,
  conversions integer not null default 0,
  ctr numeric(5,2),
  bounce_rate numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (lp_id, metric_date)
);

create trigger daily_lp_metrics_set_updated_at
before update on public.daily_lp_metrics
for each row
execute procedure public.set_current_timestamp_updated_at();

alter table public.daily_lp_metrics enable row level security;

create policy daily_lp_metrics_members on public.daily_lp_metrics
for all
using (auth.role() in ('admin','member'))
with check (auth.role() in ('admin','member'));

-- Public-safe RPC to log events without granting direct table access
create or replace function public.log_lp_event(
  p_lp_slug text,
  p_event_type public.event_type,
  p_metadata jsonb default '{}'::jsonb,
  p_visitor_id uuid default null,
  p_session_id uuid default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lp_id uuid;
  v_event_id bigint;
begin
  select id into v_lp_id
  from public.lps
  where slug = p_lp_slug
    and published = true
  limit 1;

  if v_lp_id is null then
    raise exception 'Landing page "%" not found or unpublished', p_lp_slug
      using errcode = '22023';
  end if;

  insert into public.lp_events (lp_id, event_type, visitor_id, session_id, metadata, occurred_at)
  values (
    v_lp_id,
    p_event_type,
    coalesce(p_visitor_id, auth.uid()),
    p_session_id,
    coalesce(p_metadata, '{}'::jsonb),
    now()
  )
  returning id into v_event_id;

  return v_event_id;
end;
$$;

grant execute on function public.log_lp_event(text, public.event_type, jsonb, uuid, uuid) to anon, authenticated;
