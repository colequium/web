-- ════════════════════════════════════════════════════════════════════════
-- Moderación de publicaciones. Puede borrar un post:
--   • su autor,
--   • un admin del colegio (dirección/manager/board),
--   • staff (docente/coordinación) cuyo salón asignado —o su grado/nivel— esté
--     en la audiencia del post (modera su propia sección).
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.can_moderate_post(p_post uuid)
returns boolean
language sql stable security definer set search_path to 'public'
as $function$
  with me as (
    select id as mid from memberships
    where user_id = auth.uid() and status = 'active' limit 1
  ),
  p as (select community_id, author_membership_id from posts where id = p_post)
  select coalesce(
    -- autor
    ((select author_membership_id from p) = (select mid from me))
    -- admin del colegio
    or is_school_admin((select community_id from p))
    -- staff con asignación que intersecta la audiencia del post
    or exists (
      select 1
      from staff_group_assignments sga
      join groups g on g.id = sga.group_id
      where sga.membership_id = (select mid from me)
        and exists (
          select 1 from audiences a
          where a.content_type = 'post' and a.content_id = p_post
            and (
              (a.target_type = 'group' and a.target_id = g.id)
              or (a.target_type = 'grade' and a.target_id = g.grade_id)
              or (a.target_type = 'level'
                  and a.target_id = (select gr.level_id from grades gr where gr.id = g.grade_id))
            )
        )
    ),
    false
  );
$function$;

grant execute on function public.can_moderate_post(uuid) to authenticated, service_role;

-- Subconjunto de ids que el usuario actual puede moderar (para marcar el feed).
create or replace function public.my_moderatable_posts(p_ids uuid[])
returns setof uuid
language sql stable security definer set search_path to 'public'
as $function$
  select pid from unnest(p_ids) as pid where public.can_moderate_post(pid);
$function$;

grant execute on function public.my_moderatable_posts(uuid[]) to authenticated, service_role;

drop policy if exists posts_moderate_delete on public.posts;
create policy posts_moderate_delete on public.posts
  for delete using (public.can_moderate_post(id));
