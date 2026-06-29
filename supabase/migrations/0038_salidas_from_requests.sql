-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Salidas refleja las solicitudes REALES de hoy (no un overlay fijo):
--   • absent_today: hay una solicitud de inasistencia para hoy.
--   • temporary: autorizaciones de salida (exit) para hoy → quién retira hoy.
-- "Hoy" = current_date; las solicitudes guardan payload->>'date' = 'YYYY-MM-DD'.
-- ════════════════════════════════════════════════════════════════════════
drop function if exists public.salidas_feed();
create function public.salidas_feed()
returns table(
  student_id uuid, student_name text, group_name text,
  pickups json, absent_today boolean, temporary json
)
language sql stable security definer set search_path = public as $$
  with me as (
    select id as mid, community_id as cid
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  is_mgr as (
    select exists (
      select 1 from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = (select mid from me)
        and r.key in ('principal','manager','board','coordinator','department_head','support_staff')
    ) as ok
  )
  select s.id, s.full_name, gr.name,
    (select json_agg(json_build_object('name', gu.full_name, 'relationship', g.relationship)
                     order by g.is_primary_contact desc nulls last)
       from guardianships g
       left join memberships gm on gm.id = g.guardian_membership_id
       left join users gu on gu.id = gm.user_id
       where g.student_id = s.id and g.can_pickup = true
         and coalesce(g.relationship, '') <> 'self') as pickups,
    exists (
      select 1 from requests rq
      where rq.student_id = s.id and rq.type = 'absence'
        and rq.status <> 'rejected' and rq.payload->>'date' = current_date::text
    ) as absent_today,
    (select json_agg(json_build_object(
              'name', rq.payload->>'pickup_name',
              'relationship', coalesce(rq.payload->>'relationship','')))
       from requests rq
       where rq.student_id = s.id and rq.type = 'exit'
         and rq.status <> 'rejected' and rq.payload->>'date' = current_date::text
         and coalesce(rq.payload->>'pickup_name','') <> '') as temporary
  from student_enrollments se
  join students s on s.id = se.student_id
  join groups gr on gr.id = se.group_id
  join academic_years ay on ay.id = se.academic_year_id and ay.is_current
  where s.community_id = (select cid from me)
    and ((select ok from is_mgr) or gr.id in (select public.my_group_ids()))
  order by gr.name, s.full_name;
$$;
