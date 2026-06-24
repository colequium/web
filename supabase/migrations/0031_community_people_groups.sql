-- ════════════════════════════════════════════════════════════════════════
-- Colequium — community_people() suma "groups" (cursos de cada persona) para
-- poder filtrar Docentes y Familias por salón en el directorio de Comunidad.
--   • staff  → sus salones asignados (staff_group_assignments)
--   • familia → los salones de sus hijos (guardianship → enrollment)
-- ════════════════════════════════════════════════════════════════════════
drop function if exists public.community_people();
create function public.community_people()
returns table(
  membership_id uuid, name text, role_key text, role_kind text,
  context text, groups text[]
)
language sql stable security definer set search_path = public as $$
  with me as (
    select id as mid, community_id as cid
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  mgr as (
    select exists (
      select 1 from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = (select mid from me)
        and r.key in ('principal','coordinator','support_staff','board','manager','department_head')
    ) as is_mgr
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
    -- Cursos para filtrar: staff = sus salones; familia = salones de sus hijos.
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
      coalesce(r.kind, '') in ('staff','service')
      or (select is_mgr from mgr)
      or exists (
        select 1
        from staff_group_assignments sga
        join student_enrollments se on se.group_id = sga.group_id
        join guardianships gg on gg.student_id = se.student_id
        where sga.membership_id = (select mid from me)
          and gg.guardian_membership_id = m.id
      )
    )
  order by u.full_name;
$$;
