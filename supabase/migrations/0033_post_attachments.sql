-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Adjuntos en las novedades (PDFs, imágenes, documentos).
-- Bucket privado `attachments`; los archivos se suben y se firman (URL temporal)
-- desde el servidor con el admin client. La tabla guarda los metadatos.
-- Ruta de cada archivo: {community_id}/{post_id}/{idx}-{nombre}.
-- ════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create table if not exists public.post_attachments (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.posts(id) on delete cascade,
  community_id uuid not null references public.communities(id),
  name         text not null,
  path         text not null,
  mime         text,
  size         integer,
  created_at   timestamptz not null default now()
);

create index if not exists post_attachments_post_idx on public.post_attachments(post_id);

alter table public.post_attachments enable row level security;

-- Los miembros de la comunidad pueden leer los metadatos de adjuntos.
drop policy if exists attach_meta_select on public.post_attachments;
create policy attach_meta_select on public.post_attachments
  for select to authenticated
  using (public.is_community_member(community_id));

-- Lectura de los objetos del bucket por miembros de la comunidad (la ruta
-- empieza por el community_id). La subida/firma se hace con service role.
drop policy if exists attachments_read on storage.objects;
create policy attachments_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'attachments'
    and public.is_community_member(nullif((storage.foldername(name))[1], '')::uuid)
  );
