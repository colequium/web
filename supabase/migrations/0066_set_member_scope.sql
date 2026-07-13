-- Editar cargo + alcances de un miembro YA existente (aceptó la invitación).
-- Reemplaza los alcances de nivel de su rol y sus asignaciones a salones por los
-- nuevos. SECURITY DEFINER + chequeo de admin (evita depender de RLS fina sobre
-- membership_roles / staff_group_assignments desde el cliente).
create or replace function public.set_member_scope(
  p_membership uuid,
  p_title text,
  p_level_ids uuid[],
  p_group_ids uuid[]
) returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_comm uuid;
  v_role uuid;
begin
  select community_id into v_comm from memberships where id = p_membership;
  if v_comm is null then raise exception 'membresía inexistente'; end if;
  if not public.is_school_admin(v_comm) then raise exception 'sin permiso'; end if;

  -- Cargo a mostrar (rótulo interno).
  update memberships set title = nullif(btrim(coalesce(p_title, '')), '') where id = p_membership;

  -- Rol principal del miembro (asumimos uno).
  select role_id into v_role from membership_roles where membership_id = p_membership limit 1;

  if v_role is not null then
    -- Reemplaza los alcances de nivel de ese rol por los nuevos.
    delete from membership_roles where membership_id = p_membership and role_id = v_role;
    if array_length(p_level_ids, 1) is null then
      insert into membership_roles (membership_id, role_id, scope_type, scope_id)
      values (p_membership, v_role, null, null);
    else
      insert into membership_roles (membership_id, role_id, scope_type, scope_id)
      select p_membership, v_role, 'level', unnest(p_level_ids);
    end if;
  end if;

  -- Reemplaza las asignaciones a salones.
  delete from staff_group_assignments where membership_id = p_membership;
  if array_length(p_group_ids, 1) is not null then
    insert into staff_group_assignments (membership_id, group_id, role, subject)
    select p_membership, unnest(p_group_ids), 'subject_teacher', null;
  end if;
end
$function$;

grant execute on function public.set_member_scope(uuid, text, uuid[], uuid[]) to authenticated;

-- Miembros activos del colegio para el panel de administración: nombre, correo,
-- rol, cargo, y los IDs de alcance (niveles y salones) para poder editarlos.
-- Solo devuelve filas si el que llama es admin del colegio.
create or replace function public.members_admin()
returns table(
  membership_id uuid, name text, email text, role_key text,
  title text, level_ids uuid[], group_ids uuid[]
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  with me as (
    select community_id as cid from memberships
    where user_id = auth.uid() and status = 'active' limit 1
  )
  select
    m.id,
    u.full_name,
    u.email,
    (select r.key from membership_roles mr join roles r on r.id = mr.role_id
       where mr.membership_id = m.id limit 1),
    m.title,
    coalesce((select array_agg(distinct mr.scope_id)
       from membership_roles mr
       where mr.membership_id = m.id and mr.scope_type = 'level' and mr.scope_id is not null), '{}'),
    coalesce((select array_agg(distinct sga.group_id)
       from staff_group_assignments sga where sga.membership_id = m.id), '{}')
  from memberships m
  join users u on u.id = m.user_id
  where m.community_id = (select cid from me)
    and m.status = 'active'
    and public.is_school_admin((select cid from me))
  order by u.full_name;
$function$;

grant execute on function public.members_admin() to authenticated;
