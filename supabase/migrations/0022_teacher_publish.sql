-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Los docentes también pueden publicar avisos.
-- Antes solo roles de gestión; sumamos 'teacher' (la audiencia fina decide a
-- quién llega: el docente puede segmentar por su grupo/grado).
-- ════════════════════════════════════════════════════════════════════════
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts
  for insert to authenticated
  with check (
    author_membership_id in (select id from memberships where user_id = auth.uid())
    and public.is_community_member(community_id)
    and exists (
      select 1 from membership_roles mr
      join roles r on r.id = mr.role_id
      join memberships m on m.id = mr.membership_id
      where m.user_id = auth.uid()
        and r.key in ('principal','coordinator','support_staff','board','manager','department_head','teacher')
    )
  );
