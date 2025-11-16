-- Adds optional sector information to clients table
alter table if exists public.clients
  add column if not exists setor text;
