-- Order lifecycle enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('draft','sent','approved','fulfilled','cancelled');
  end if;
end$$;

-- Payment lifecycle enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending','paid','failed','refunded');
  end if;
end$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  lp_id uuid not null references public.lps(id),
  client_id uuid not null references public.clients(id),
  amount numeric(12,2) not null,
  currency char(3) not null default 'BRL',
  status public.order_status not null default 'draft',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger orders_set_updated_at
before update on public.orders
for each row
execute procedure public.set_current_timestamp_updated_at();

alter table public.orders enable row level security;

create policy orders_members on public.orders
for all
using (auth.role() in ('admin','member'))
with check (auth.role() in ('admin','member'));

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_payment_id text not null,
  status public.payment_status not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_order_idx on public.payments (order_id);

alter table public.payments enable row level security;

create policy payments_members on public.payments
for all
using (auth.role() in ('admin','member'))
with check (auth.role() in ('admin','member'));
