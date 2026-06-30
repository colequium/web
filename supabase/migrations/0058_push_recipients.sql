-- ════════════════════════════════════════════════════════════════════════
-- Resolución de destinatarios para push (inverso del motor de audiencias).
-- post_recipient_user_ids(post): usuarios que VEN un aviso (mismo criterio que
--   my_audience_scopes pero al revés), respetando audience_roles y excluyendo al
--   autor. conversation_recipient_user_ids(conv): los otros participantes de una
--   conversación (no el que envía).
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.post_recipient_user_ids(p_post uuid)
returns setof uuid
language sql stable security definer set search_path to 'public'
as $function$
  with pm as (
    select author_membership_id, audience_roles from posts where id = p_post
  ),
  aud as (
    select target_type, target_id
    from audiences
    where content_type = 'post' and content_id = p_post
  ),
  -- pertenencia usuario(membresía) ↔ grupo: staff asignado + familia/alumno por inscripción
  member_groups as (
    select m.id as membership_id, sga.group_id
    from memberships m
    join staff_group_assignments sga on sga.membership_id = m.id
    where m.status = 'active'
    union
    select m.id as membership_id, se.group_id
    from memberships m
    join guardianships g on g.guardian_membership_id = m.id
    join student_enrollments se on se.student_id = g.student_id
    where m.status = 'active'
  ),
  matched as (
    select m.id as membership_id from memberships m
      join aud a on a.target_type = 'community' and a.target_id = m.community_id
      where m.status = 'active'
    union
    select m.id from memberships m
      join membership_roles mr on mr.membership_id = m.id
      join aud a on a.target_type = 'role' and a.target_id = mr.role_id
      where m.status = 'active'
    union
    select m.id from memberships m
      join aud a on a.target_type = 'user' and a.target_id = m.id
      where m.status = 'active'
    union
    select mg.membership_id from member_groups mg
      join aud a on a.target_type = 'group' and a.target_id = mg.group_id
    union
    select mg.membership_id from member_groups mg
      join groups gr on gr.id = mg.group_id
      join aud a on a.target_type = 'grade' and a.target_id = gr.grade_id
    union
    select mg.membership_id from member_groups mg
      join groups gr on gr.id = mg.group_id
      join grades gd on gd.id = gr.grade_id
      join aud a on a.target_type = 'level' and a.target_id = gd.level_id
  )
  select distinct m.user_id
  from matched mm
  join memberships m on m.id = mm.membership_id
  where m.id <> (select author_membership_id from pm)
    and (
      (select audience_roles from pm) is null
      or exists (
        select 1 from membership_roles mr2
        join roles r on r.id = mr2.role_id
        where mr2.membership_id = m.id
          and r.key in (select unnest(audience_roles) from pm)
      )
    );
$function$;

grant execute on function public.post_recipient_user_ids(uuid) to authenticated, service_role;

create or replace function public.conversation_recipient_user_ids(p_conv uuid)
returns setof uuid
language sql stable security definer set search_path to 'public'
as $function$
  select distinct m.user_id
  from conversation_participants cp
  join memberships m on m.id = cp.membership_id
  where cp.conversation_id = p_conv
    and m.user_id <> auth.uid();
$function$;

grant execute on function public.conversation_recipient_user_ids(uuid) to authenticated, service_role;
