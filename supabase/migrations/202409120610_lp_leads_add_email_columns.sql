alter table if exists public.lp_leads
  add column if not exists nome text,
  add column if not exists email text,
  add column if not exists email_normalized text;

update public.lp_leads
set
  nome = coalesce(nome, payload->>'nome'),
  email = coalesce(email, payload->>'email'),
  email_normalized = lower(coalesce(email, payload->>'email'))
where nome is null
   or email is null
   or email_normalized is null;

create unique index if not exists lp_leads_email_unique
  on public.lp_leads (email_normalized);
