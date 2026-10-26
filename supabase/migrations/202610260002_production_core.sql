-- DMD Producción: datos maestros del panel independiente.
-- Esta migración no inserta proyectos ni información histórica.
create extension if not exists pgcrypto;

create table if not exists production_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project_type text not null default 'Pequeña remodelación',
  manager text,
  budget numeric(14,2) default 0,
  target_cost numeric(14,2) default 0,
  planned_progress numeric(5,2) default 0 check (planned_progress between 0 and 100),
  actual_progress numeric(5,2) default 0 check (actual_progress between 0 and 100),
  ppc numeric(5,2) default 0 check (ppc between 0 and 100),
  delay_days integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists production_resources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references production_projects(id) on delete cascade,
  resource_type text not null check (resource_type in ('Cuadrilla','Subcontratista')),
  name text not null,
  planned_capacity numeric(12,2) default 0,
  available_capacity numeric(12,2) default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists production_materials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references production_projects(id) on delete cascade,
  name text not null,
  stock numeric(14,2) default 0,
  minimum_stock numeric(14,2) default 0,
  unit text not null default 'unidades',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists production_quality_records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references production_projects(id) on delete cascade,
  record_type text not null check (record_type in ('Calidad','Seguridad','Postventa')),
  description text not null,
  status text not null default 'Pendiente' check (status in ('Pendiente','En proceso','Resuelto')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists production_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references production_projects(id) on delete cascade,
  resource_id uuid references production_resources(id) on delete cascade,
  material_id uuid references production_materials(id) on delete cascade,
  quality_record_id uuid references production_quality_records(id) on delete cascade,
  file_name text not null,
  file_type text,
  file_size bigint,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists production_resources_project_idx on production_resources(project_id);
create index if not exists production_materials_project_idx on production_materials(project_id);
create index if not exists production_quality_project_idx on production_quality_records(project_id);
create index if not exists production_documents_project_idx on production_documents(project_id);

alter table production_projects enable row level security;
alter table production_resources enable row level security;
alter table production_materials enable row level security;
alter table production_quality_records enable row level security;
alter table production_documents enable row level security;
