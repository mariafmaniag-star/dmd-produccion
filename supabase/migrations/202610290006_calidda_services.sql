create table if not exists public.production_calidda_services (
  id uuid primary key,
  code text not null default 'Sin OS',
  site text not null default 'Sin sede',
  service_type text not null,
  received_at date,
  stage integer not null default 1 check (stage between 1 and 10),
  owner text not null default 'Sin asignar',
  budget numeric not null default 0,
  collection text not null default 'Pendiente de facturación',
  notes text not null default '',
  events jsonb not null default '[]'::jsonb,
  costs jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  payments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.production_calidda_services enable row level security;
grant select, insert, update, delete on public.production_calidda_services to authenticated;
create policy "authenticated_team_access" on public.production_calidda_services for all to authenticated using (true) with check (true);
