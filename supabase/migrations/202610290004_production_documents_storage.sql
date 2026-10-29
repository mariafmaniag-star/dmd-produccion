-- DMD Producción: archivos privados para usuarios autenticados del portal.
insert into storage.buckets (id, name, public, file_size_limit)
values ('production-documents', 'production-documents', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = 52428800;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='production_documents_authenticated_read') then
    create policy production_documents_authenticated_read on storage.objects for select to authenticated using (bucket_id = 'production-documents');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='production_documents_authenticated_upload') then
    create policy production_documents_authenticated_upload on storage.objects for insert to authenticated with check (bucket_id = 'production-documents');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='production_documents_authenticated_update') then
    create policy production_documents_authenticated_update on storage.objects for update to authenticated using (bucket_id = 'production-documents') with check (bucket_id = 'production-documents');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='production_documents_authenticated_delete') then
    create policy production_documents_authenticated_delete on storage.objects for delete to authenticated using (bucket_id = 'production-documents');
  end if;
end $$;
