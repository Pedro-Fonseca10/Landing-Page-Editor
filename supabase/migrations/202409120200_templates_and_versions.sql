-- Templates repository for landing pages
create table if not exists public.templates (
  id text primary key,
  name text not null,
  slug text not null unique,
  category text not null,
  description text,
  default_content jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger templates_set_updated_at
before update on public.templates
for each row
execute procedure public.set_current_timestamp_updated_at();

alter table public.templates enable row level security;

create policy templates_members_all on public.templates
for all
using (auth.role() in ('admin','member'))
with check (auth.role() in ('admin','member'));

insert into public.templates (id, name, slug, category, description, default_content)
values
  ('saas', 'Template SaaS', 'template-saas', 'SaaS', 'Landing page para SaaS', '{}'::jsonb),
  ('evento', 'Template Evento', 'template-evento', 'Evento/Curso', 'Landing page para eventos', '{}'::jsonb),
  ('d2c', 'Template Produto', 'template-d2c', 'Produto D2C', 'Landing page para produtos físicos', '{}'::jsonb),
  ('waitlist', 'Template Lista de Espera', 'template-waitlist', 'Lista de Espera', 'Lista de espera para lançamentos', '{}'::jsonb)
on conflict (id) do nothing;

-- Versioning of landing page iterations
create table if not exists public.lp_versions (
  id bigserial primary key,
  lp_id uuid not null references public.lps(id) on delete cascade,
  template_id text not null references public.templates(id),
  content jsonb not null,
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index lp_versions_lp_id_idx on public.lp_versions (lp_id, created_at desc);

alter table public.lp_versions enable row level security;

create policy lp_versions_members on public.lp_versions
for all
using (auth.role() in ('admin','member'))
with check (auth.role() in ('admin','member'));

alter table if exists public.lps
  add constraint lps_template_fk
  foreign key (template)
  references public.templates(id);
