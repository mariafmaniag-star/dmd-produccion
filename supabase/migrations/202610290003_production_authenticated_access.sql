-- DMD Producción: acceso compartido para el equipo autenticado.
-- No concede acceso a visitantes sin iniciar sesión.
do $$
declare target_table text;
begin
  foreach target_table in array array[
    'production_projects',
    'production_resources',
    'production_materials',
    'production_quality_records',
    'production_documents'
  ]
  loop
    execute format('grant select, insert, update, delete on table public.%I to authenticated', target_table);
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = target_table
        and policyname = 'authenticated_team_access'
    ) then
      execute format(
        'create policy authenticated_team_access on public.%I for all to authenticated using (true) with check (true)',
        target_table
      );
    end if;
  end loop;
end $$;
