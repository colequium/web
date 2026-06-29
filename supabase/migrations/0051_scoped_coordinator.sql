-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Coordinación = admin acotado a su sección (nivel/grado/salón).
-- Usa membership_roles.scope_type/scope_id (ya cargado). Primitivas:
--   • my_admin_group_ids(): salones que el usuario puede administrar.
--   • can_admin_membership(p): si puede gestionar a esa persona.
-- Se aplican a admin_update_member / admin_remove_member y a community_people
-- (un coordinador ve liderazgo + su sección, y solo gestiona su sección).
-- ════════════════════════════════════════════════════════════════════════

-- Salones que el usuario actual puede administrar.
create or replace function public.my_admin_group_ids()
returns setof uuid
language sql stable security definer set search_path = public as $$
  with me as (
    select id as mid, community_id as cid from memberships
    where user_id = auth.uid() and status = 'active' limit 1
  ),
  flags as (
    select
      coalesce(bool_or(r.key in ('principal','manager','board')), false) as full_admin,
      coalesce(bool_or(r.key = 'coordinator' and (mr.scope_type is null or mr.scope_type = 'community')), false) as coord_all
    from membership_roles mr join roles r on r.id = mr.role_id
    where mr.membership_id = (select mid from me)
  )
  -- Admin total o coordinador de toda la comunidad → todos los salones.
  select g.id
  from groups g, me, flags
  where g.community_id = me.cid and (flags.full_admin or flags.coord_all)
  union
  -- Coordinador con scope nivel/grado/salón → los salones de su subárbol.
  select g.id
  from groups g
  join me on g.community_id = me.cid
  left join grades gr on gr.id = g.grade_id
  join membership_roles mr on mr.membership_id = (select mid from me)
  join roles r on r.id = mr.role_id and r.key = 'coordinator'
  where (mr.scope_type = 'group' and g.id = mr.scope_id)
     or (mr.scope_type = 'grade' and g.grade_id = mr.scope_id)
     or (mr.scope_type = 'level' and gr.level_id = mr.scope_id);
$$;

-- Salones de una persona (staff por asignación, familia por hijos). Helper interno.
create or replace function public.membership_group_ids(p_membership uuid)
returns setof uuid
language sql stable security definer set search_path = public as $$
  select sga.group_id from staff_group_assignments sga where sga.membership_id = p_membership
  union
  select se.group_id
  from guardianships g
  join student_enrollments se on se.student_id = g.student_id
  where g.guardian_membership_id = p_membership;
$$;

-- ¿El usuario puede administrar a esta persona?
create or replace function public.can_admin_membership(p_membership uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  with me as (
    select community_id as cid from memberships
    where user_id = auth.uid() and status = 'active' limit 1
  ),
  tgt as (select community_id as cid from memberships where id = p_membership)
  select
    exists (select 1 from me, tgt where me.cid = tgt.cid)
    and (
      public.is_school_admin((select cid from me))
      or exists (
        select 1 from public.membership_group_ids(p_membership) gid
        where gid in (select public.my_admin_group_ids())
      )
    );
$$;

-- ── admin_update_member: ahora lo permite también un coordinador, dentro de su
--    alcance. No puede asignar roles de liderazgo ni salones fuera de su sección.
create or replace function public.admin_update_member(
  p_membership uuid,
  p_role_key text,
  p_group_ids uuid[] default null,
  p_subject text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_cid uuid;
  v_full boolean;
  v_role_id uuid;
begin
  select community_id into v_cid from memberships where id = p_membership;
  if v_cid is null or not public.can_admin_membership(p_membership) then return; end if;
  v_full := public.is_school_admin(v_cid);

  -- Rol. Un coordinador solo puede asignar roles no-administrativos.
  if p_role_key is not null and p_role_key <> '' then
    if v_full or p_role_key in ('teacher','guardian','student','driver') then
      select id into v_role_id from roles where key = p_role_key;
      if v_role_id is not null then
        delete from membership_roles where membership_id = p_membership;
        insert into membership_roles (membership_id, role_id) values (p_membership, v_role_id);
      end if;
    end if;
  end if;

  -- Salones: solo los que el que edita puede administrar.
  if p_group_ids is not null then
    delete from staff_group_assignments where membership_id = p_membership;
    insert into staff_group_assignments (membership_id, group_id, role, subject)
    select p_membership, gid, 'teacher', nullif(btrim(coalesce(p_subject,'')), '')
    from unnest(p_group_ids) as gid
    where exists (select 1 from groups g where g.id = gid and g.community_id = v_cid)
      and (v_full or gid in (select public.my_admin_group_ids()));
  end if;
end;
$$;

-- ── admin_remove_member: lo permite un coordinador dentro de su alcance.
create or replace function public.admin_remove_member(p_membership uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid;
begin
  select id into v_me from memberships where user_id = auth.uid() and status = 'active' limit 1;
  if not public.can_admin_membership(p_membership) then return; end if;
  if p_membership = v_me then return; end if;
  update memberships set status = 'removed' where id = p_membership;
end;
$$;

-- ── community_people: visibilidad por rol + can_manage por persona ──────────
drop function if exists public.community_people();
create function public.community_people()
returns table(membership_id uuid, name text, role_key text, role_kind text,
              context text, groups text[], subject text, can_manage boolean)
language sql stable security definer set search_path to 'public'
as $function$
  with me as (
    select id as mid, community_id as cid
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  my_role as (
    select
      coalesce(bool_or(r.kind = 'staff'), false)        as is_staff,
      coalesce(bool_or(r.kind = 'family'), false)       as is_family,
      coalesce(bool_or(r.key = 'coordinator'), false)   as is_coordinator
    from membership_roles mr join roles r on r.id = mr.role_id
    where mr.membership_id = (select mid from me)
  ),
  full_admin as (select public.is_school_admin((select cid from me)) as v),
  my_admin_groups as (select public.my_admin_group_ids() as gid),
  -- Salones de los hijos del usuario (para acotar lo que ve una familia).
  my_child_groups as (
    select distinct se.group_id as gid
    from guardianships g
    join student_enrollments se on se.student_id = g.student_id
    where g.guardian_membership_id = (select mid from me)
      and coalesce(g.relationship,'') <> 'self'
  ),
  my_child_levels as (
    select distinct gr.level_id as lid
    from my_child_groups mcg join groups gg on gg.id = mcg.gid join grades gr on gr.id = gg.grade_id
  )
  select
    m.id,
    u.full_name,
    r.key,
    r.kind,
    coalesce(
      (select string_agg(
         (case lower(coalesce(g.relationship,''))
            when 'madre' then 'Mamá de '
            when 'padre' then 'Papá de '
            when 'tutor' then 'Tutor/a de '
            else 'Familia de ' end) || s.full_name, ' · ')
       from guardianships g join students s on s.id = g.student_id
       where g.guardian_membership_id = m.id and coalesce(g.relationship,'') <> 'self'),
      (select string_agg(distinct gr.name, ' · ')
       from staff_group_assignments sga join groups gr on gr.id = sga.group_id
       where sga.membership_id = m.id)
    ) as context,
    coalesce(
      (select array_agg(distinct gr.name order by gr.name)
       from staff_group_assignments sga join groups gr on gr.id = sga.group_id
       where sga.membership_id = m.id),
      (select array_agg(distinct gr.name order by gr.name)
       from guardianships g
       join student_enrollments se on se.student_id = g.student_id
       join groups gr on gr.id = se.group_id
       where g.guardian_membership_id = m.id and coalesce(g.relationship,'') <> 'self')
    ) as groups,
    (select sga.subject from staff_group_assignments sga
       where sga.membership_id = m.id and sga.subject is not null limit 1) as subject,
    -- can_manage: admin total, o coordinador y la persona cae en su sección.
    (
      (select v from full_admin)
      or (
        (select is_coordinator from my_role)
        and exists (select 1 from public.membership_group_ids(m.id) gid
                    where gid in (select gid from my_admin_groups))
      )
    ) as can_manage
  from memberships m
  join users u on u.id = m.user_id
  left join lateral (
    select rr.key, rr.kind from membership_roles mr join roles rr on rr.id = mr.role_id
    where mr.membership_id = m.id limit 1
  ) r on true
  where m.community_id = (select cid from me) and m.status = 'active'
    and m.id <> (select mid from me)
    and (
      -- Admin total: ve a todos.
      (select v from full_admin)
      -- Coordinador: liderazgo/admin/servicio/transporte + las personas de su sección.
      or (
        (select is_coordinator from my_role)
        and (
          r.key in ('principal','coordinator','manager','board','department_head','support_staff','service_inbox','driver')
          or exists (select 1 from public.membership_group_ids(m.id) gid
                     where gid in (select gid from my_admin_groups))
        )
      )
      -- Staff (docente, no coordinador): todo el equipo + familias de sus salones.
      or (
        (select is_staff from my_role) and not (select is_coordinator from my_role)
        and (
          coalesce(r.kind, '') in ('staff','service','driver')
          or exists (
            select 1 from staff_group_assignments sga
            join student_enrollments se on se.group_id = sga.group_id
            join guardianships gg on gg.student_id = se.student_id
            where sga.membership_id = (select mid from me)
              and gg.guardian_membership_id = m.id
          )
        )
      )
      -- Familia: liderazgo/admin/servicio/transporte; docentes por salón o nivel
      -- de sus hijos; otras familias por salón compartido.
      or (
        (select is_family from my_role)
        and (
          r.key in ('principal','coordinator','manager','board','department_head','support_staff','service_inbox','driver')
          or (
            r.key = 'teacher' and exists (
              select 1 from staff_group_assignments sga
              left join groups gg on gg.id = sga.group_id
              left join grades gr on gr.id = gg.grade_id
              where sga.membership_id = m.id
                and (sga.group_id in (select gid from my_child_groups)
                     or gr.level_id in (select lid from my_child_levels)))
          )
          or (
            r.key = 'guardian' and exists (
              select 1 from guardianships gg
              join student_enrollments se on se.student_id = gg.student_id
              where gg.guardian_membership_id = m.id
                and se.group_id in (select gid from my_child_groups))
          )
        )
      )
    )
  order by u.full_name;
$function$;
