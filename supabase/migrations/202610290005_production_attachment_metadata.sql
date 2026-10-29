-- Mantiene los metadatos de adjuntos junto con cada registro de Producción.
alter table production_projects add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table production_resources add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table production_materials add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table production_quality_records add column if not exists attachments jsonb not null default '[]'::jsonb;
