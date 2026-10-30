alter table public.production_calidda_services
  add column if not exists work_description text,
  add column if not exists scheduled_for date;

alter table public.production_calidda_services
  alter column stage set default 4;
