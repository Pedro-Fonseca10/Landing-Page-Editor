-- Profiles extend auth.users with application metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','member')),
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_current_timestamp_updated_at();

alter table public.profiles enable row level security;

create policy profiles_self_read on public.profiles
for select
using (auth.uid() = id);

create policy profiles_self_update on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy profiles_admin_full on public.profiles
for all
using (auth.role() = 'admin')
with check (auth.role() = 'admin');
