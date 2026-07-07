-- 0064: Documentos generales vs privados por familia.
-- Hoy TODOS los documentos son visibles para toda la comunidad (RLS =
-- is_community_member). Este cambio le da a Documentos el mismo motor de
-- audiencias que ya usa el muro, con un destino nuevo: un ALUMNO puntual, para
-- que un boletín lo vea únicamente la familia de ese alumno.

-- 1) Nuevo alcance 'student' en my_audience_scopes(): un tutor "alcanza" a sus
--    hijos. Así un contenido dirigido a ('student', <id>) lo ven solo los
--    tutores de ese alumno (no todo el salón). Es aditivo: hoy ningún aviso
--    usa 'student', así que el muro no cambia.
create or replace function public.my_audience_scopes()
returns table(target_type text, target_id uuid)
language sql stable security definer set search_path to 'public'
as $function$
  select 'community', m.community_id
  from memberships m where m.user_id = auth.uid() and m.status = 'active'
  union
  select 'role', mr.role_id
  from memberships m join membership_roles mr on mr.membership_id = m.id
  where m.user_id = auth.uid() and m.status = 'active'
  union
  select 'user', m.id
  from memberships m where m.user_id = auth.uid() and m.status = 'active'
  union
  select 'group', gid from public.my_group_ids() gid
  union
  select 'grade', gr.grade_id from groups gr
  where gr.id in (select public.my_group_ids()) and gr.grade_id is not null
  union
  select 'level', gd.level_id from grades gd
  where gd.id in (
    select gr.grade_id from groups gr where gr.id in (select public.my_group_ids())
  ) and gd.level_id is not null
  union
  -- NUEVO: alumno (los tutores alcanzan a sus hijos)
  select 'student', g.student_id
  from memberships m
  join guardianships g on g.guardian_membership_id = m.id
  where m.user_id = auth.uid() and m.status = 'active'
$function$;

-- 2) ¿Quién puede subir/gestionar documentos? Staff (no familia/alumno).
create or replace function public.can_upload_documents(c uuid)
returns boolean language sql stable security definer set search_path to 'public'
as $function$
  select exists (
    select 1 from memberships m
    join membership_roles mr on mr.membership_id = m.id
    join roles r on r.id = mr.role_id
    where m.user_id = auth.uid() and m.status = 'active' and m.community_id = c
      and r.key not in ('guardian', 'student')
  );
$function$;

-- 3) Visibilidad de un documento (mismo criterio que el muro).
create or replace function public.can_see_document(p_doc uuid)
returns boolean language sql stable security definer set search_path to 'public'
as $function$
  with d as (select id, community_id, uploaded_by from public.documents where id = p_doc),
  me as (select id from memberships where user_id = auth.uid() and status = 'active' limit 1)
  select exists(select 1 from d)
    and (select is_community_member(community_id) from d)
    and (
      (select uploaded_by from d) = (select id from me)                 -- lo subí yo
      or public.is_school_admin((select community_id from d))           -- soy admin del colegio
      or not exists (                                                   -- sin audiencia = general (compat)
        select 1 from audiences a where a.content_type = 'document' and a.content_id = p_doc)
      or exists (                                                       -- audiencia comunidad = general
        select 1 from audiences a where a.content_type = 'document' and a.content_id = p_doc
          and a.target_type = 'community')
      or exists (                                                       -- audiencia dirigida que me alcanza
        select 1 from audiences a where a.content_type = 'document' and a.content_id = p_doc
          and (a.target_type, a.target_id) in (select target_type, target_id from public.my_audience_scopes()))
    );
$function$;

grant execute on function public.can_upload_documents(uuid) to authenticated;
grant execute on function public.can_see_document(uuid) to authenticated;

-- 4) RLS de documents: lectura por visibilidad, escritura solo staff, editar/
--    borrar solo el autor o un admin. (Antes: una sola policy 'ALL' comunitaria.)
drop policy if exists documents_community on public.documents;
create policy documents_select on public.documents
  for select using (public.can_see_document(id));
create policy documents_insert on public.documents
  for insert with check (public.can_upload_documents(community_id));
create policy documents_update on public.documents
  for update using (
    uploaded_by = (select id from memberships where user_id = auth.uid() and status = 'active' limit 1)
    or public.is_school_admin(community_id));
create policy documents_delete on public.documents
  for delete using (
    uploaded_by = (select id from memberships where user_id = auth.uid() and status = 'active' limit 1)
    or public.is_school_admin(community_id));

-- Carpetas: lectura comunidad, escritura staff.
drop policy if exists document_folders_community on public.document_folders;
create policy document_folders_select on public.document_folders
  for select using (is_community_member(community_id));
create policy document_folders_write on public.document_folders
  for all using (public.can_upload_documents(community_id))
  with check (public.can_upload_documents(community_id));

-- 5) Carpeta idempotente (crea si no existe, dentro de mi comunidad).
create or replace function public.get_or_create_document_folder(p_name text)
returns uuid language plpgsql security definer set search_path to 'public'
as $function$
declare v_comm uuid; v_id uuid;
begin
  select community_id into v_comm from memberships
  where user_id = auth.uid() and status = 'active' limit 1;
  if v_comm is null or not public.can_upload_documents(v_comm) then
    raise exception 'sin permiso para gestionar documentos';
  end if;
  select id into v_id from public.document_folders
  where community_id = v_comm and name = p_name limit 1;
  if v_id is null then
    insert into public.document_folders (community_id, name)
    values (v_comm, p_name) returning id into v_id;
  end if;
  return v_id;
end;
$function$;

-- 6) Publicar un documento (fila + audiencia) validando el destino.
--    p_scope_type: 'community' (general) | 'group'|'grade'|'level'|'role' (alcance
--    de publicación del staff) | 'student' (privado: solo la familia de ese alumno).
--    Para 'student' se exige que el alumno esté en un grupo que el staff atiende.
create or replace function public.publish_document(
  p_folder_id uuid,
  p_title text,
  p_file_url text,
  p_scope_type text,
  p_scope_id uuid
) returns uuid
language plpgsql security definer set search_path to 'public'
as $function$
declare v_me uuid; v_comm uuid; v_doc uuid;
begin
  select id, community_id into v_me, v_comm from memberships
  where user_id = auth.uid() and status = 'active' limit 1;
  if v_me is null then raise exception 'sin sesión'; end if;
  if not public.can_upload_documents(v_comm) then
    raise exception 'sin permiso para subir documentos';
  end if;
  if p_folder_id is not null and not exists (
    select 1 from document_folders where id = p_folder_id and community_id = v_comm
  ) then raise exception 'carpeta inválida'; end if;

  if p_scope_type = 'community' then
    null;
  elsif p_scope_type = 'student' then
    if not exists (
      select 1 from student_enrollments se
      where se.student_id = p_scope_id and se.group_id in (select public.my_group_ids())
    ) then raise exception 'ese alumno no está en tus grupos'; end if;
  elsif p_scope_type in ('group', 'grade', 'level', 'role') then
    if (p_scope_type, p_scope_id) not in (
      select target_type, target_id from public.my_publish_scopes()
    ) then raise exception 'destino fuera de tu alcance'; end if;
  else
    raise exception 'tipo de destino inválido: %', p_scope_type;
  end if;

  insert into public.documents (community_id, folder_id, title, file_url, uploaded_by)
  values (v_comm, p_folder_id, p_title, p_file_url, v_me)
  returning id into v_doc;

  insert into public.audiences (content_type, content_id, target_type, target_id, community_id)
  values ('document', v_doc, p_scope_type, coalesce(p_scope_id, v_comm), v_comm);

  return v_doc;
end;
$function$;

-- 7) Roster para el match del batch: alumnos que el staff puede targetear
--    (los de sus grupos) con nombre y salón.
create or replace function public.my_document_roster()
returns table(student_id uuid, full_name text, group_id uuid, group_name text)
language sql stable security definer set search_path to 'public'
as $function$
  select distinct s.id, s.full_name, g.id, g.name
  from student_enrollments se
  join students s on s.id = se.student_id
  join groups g on g.id = se.group_id
  where se.group_id in (select public.my_group_ids())
  order by s.full_name;
$function$;

grant execute on function public.get_or_create_document_folder(text) to authenticated;
grant execute on function public.publish_document(uuid, text, text, text, uuid) to authenticated;
grant execute on function public.my_document_roster() to authenticated;
