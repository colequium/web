-- ════════════════════════════════════════════════════════════════════════
-- Colequium — directorio de Comunidad: los padres ven SOLO
--   • liderazgo / administración / coordinación / servicio / transporte (todos),
--   • docentes asignados al salón o nivel de sus hijos,
--   • otros padres que comparten salón con sus hijos.
-- Staff y dirección mantienen su visibilidad amplia (sin cambios).
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.community_people()
returns table(membership_id uuid, name text, role_key text, role_kind text, context text, groups text[])
language sql stable security definer set search_path to 'public'
as $function$
  with me as (
    select id as mid, community_id as cid
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  my_role as (
    select
      coalesce(bool_or(r.kind = 'staff'), false)  as is_staff,
      coalesce(bool_or(r.kind = 'family'), false) as is_family
    from membership_roles mr join roles r on r.id = mr.role_id
    where mr.membership_id = (select mid from me)
  ),
  mgr as (
    select exists (
      select 1 from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = (select mid from me)
        and r.key in ('principal','coordinator','support_staff','board','manager','department_head')
    ) as is_mgr
  ),
  -- Salones y niveles de los hijos del usuario (para acotar lo que ve un padre).
  my_child_groups as (
    select distinct se.group_id as gid
    from guardianships g
    join student_enrollments se on se.student_id = g.student_id
    where g.guardian_membership_id = (select mid from me)
      and coalesce(g.relationship,'') <> 'self'
  ),
  my_child_levels as (
    select distinct gr.level_id as lid
    from my_child_groups mcg
    join groups gg on gg.id = mcg.gid
    join grades gr on gr.id = gg.grade_id
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
    ) as groups
  from memberships m
  join users u on u.id = m.user_id
  left join lateral (
    select rr.key, rr.kind from membership_roles mr join roles rr on rr.id = mr.role_id
    where mr.membership_id = m.id limit 1
  ) r on true
  where m.community_id = (select cid from me) and m.status = 'active'
    and m.id <> (select mid from me)
    and (
      -- Dirección / gestión: ve a todos.
      (select is_mgr from mgr)
      -- Staff (docente, etc.): todo el equipo + las familias de sus salones.
      or (
        (select is_staff from my_role)
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
      -- Familia: liderazgo/admin/servicio/transporte siempre; docentes por
      -- salón o nivel de sus hijos; otras familias por salón compartido.
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
                and (
                  sga.group_id in (select gid from my_child_groups)
                  or gr.level_id in (select lid from my_child_levels)
                )
            )
          )
          or (
            r.key = 'guardian' and exists (
              select 1 from guardianships gg
              join student_enrollments se on se.student_id = gg.student_id
              where gg.guardian_membership_id = m.id
                and se.group_id in (select gid from my_child_groups)
            )
          )
        )
      )
    )
  order by u.full_name;
$function$;
