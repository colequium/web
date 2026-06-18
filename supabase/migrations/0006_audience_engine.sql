-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Motor de audiencias (§4.2) + Muro real por rol.
-- Resuelve QUÉ ve cada usuario según sus grupos/grado/nivel/rol/comunidad.
-- El feed se sirve por una función SECURITY DEFINER que aplica el filtro de
-- audiencia del que consulta (auth.uid()).
-- ════════════════════════════════════════════════════════════════════════

-- ===== Grupos del usuario actual (staff por asignación; familia/alumno por tutoría) =====
create or replace function public.my_group_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  -- Staff (docente tutor / de materia)
  select sga.group_id
  from memberships m
  join staff_group_assignments sga on sga.membership_id = m.id
  where m.user_id = auth.uid() and m.status = 'active'
  union
  -- Familia y alumno (vía guardianship → alumno → inscripción)
  select se.group_id
  from memberships m
  join guardianships g on g.guardian_membership_id = m.id
  join student_enrollments se on se.student_id = g.student_id
  where m.user_id = auth.uid() and m.status = 'active'
$$;

-- ===== Conjunto de "alcances" de audiencia que matchea el usuario actual =====
create or replace function public.my_audience_scopes()
returns table(target_type text, target_id uuid)
language sql stable security definer set search_path = public as $$
  -- comunidad
  select 'community', m.community_id
  from memberships m where m.user_id = auth.uid() and m.status = 'active'
  union
  -- rol
  select 'role', mr.role_id
  from memberships m join membership_roles mr on mr.membership_id = m.id
  where m.user_id = auth.uid() and m.status = 'active'
  union
  -- usuario (membresía directa)
  select 'user', m.id
  from memberships m where m.user_id = auth.uid() and m.status = 'active'
  union
  -- grupo
  select 'group', gid from public.my_group_ids() gid
  union
  -- grado (derivado de mis grupos)
  select 'grade', gr.grade_id from groups gr
  where gr.id in (select public.my_group_ids()) and gr.grade_id is not null
  union
  -- nivel (derivado de mis grados)
  select 'level', gd.level_id from grades gd
  where gd.id in (
    select gr.grade_id from groups gr where gr.id in (select public.my_group_ids())
  ) and gd.level_id is not null
$$;

-- ===== Muro: posts visibles para el usuario, con autor, audiencia y contadores =====
create or replace function public.feed()
returns table(
  id uuid, title text, body text, type text, published_at timestamptz,
  author_name text, author_role text,
  audience_target text, audience_label text,
  likes int, comments int, liked boolean, unread boolean
) language sql stable security definer set search_path = public as $$
  with me as (
    select id as membership_id, community_id
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  visible as (
    select p.*
    from posts p
    where p.community_id = (select community_id from me)
      and exists (
        select 1 from audiences a
        where a.content_type = 'post' and a.content_id = p.id
          and (a.target_type, a.target_id) in (
            select target_type, target_id from public.my_audience_scopes()
          )
      )
  )
  select
    v.id, v.title, v.body, v.type, v.published_at,
    au.full_name as author_name,
    (select r.key from membership_roles mr join roles r on r.id = mr.role_id
      where mr.membership_id = v.author_membership_id limit 1) as author_role,
    aud.target_type as audience_target,
    case aud.target_type
      when 'community' then 'Toda la comunidad'
      when 'level'     then (select name from levels where id = aud.target_id)
      when 'grade'     then (select name from grades where id = aud.target_id)
      when 'group'     then (select name from groups where id = aud.target_id)
      when 'role'      then (select key  from roles  where id = aud.target_id)
      else 'Mensaje directo'
    end as audience_label,
    (select count(*) from post_likes    pl where pl.post_id = v.id)::int as likes,
    (select count(*) from post_comments pc where pc.post_id = v.id)::int as comments,
    exists(select 1 from post_likes pl where pl.post_id = v.id
           and pl.membership_id = (select membership_id from me)) as liked,
    not exists(select 1 from post_reads pr where pr.post_id = v.id
           and pr.membership_id = (select membership_id from me)) as unread
  from visible v
  left join memberships am on am.id = v.author_membership_id
  left join users au on au.id = am.user_id
  left join lateral (
    select a.target_type, a.target_id
    from audiences a
    where a.content_type = 'post' and a.content_id = v.id
    order by case a.target_type
      when 'user' then 0 when 'group' then 1 when 'grade' then 2
      when 'level' then 3 when 'role' then 4 else 5 end
    limit 1
  ) aud on true
  order by v.published_at desc nulls last, v.created_at desc;
$$;

-- ===== Endurecer RLS de posts: SELECT sólo por audiencia (defensa en profundidad) =====
drop policy if exists "posts_community" on public.posts;
drop policy if exists posts_visible on public.posts;
create policy posts_visible on public.posts
  for select to authenticated
  using (
    author_membership_id in (select id from memberships where user_id = auth.uid())
    or exists (
      select 1 from audiences a
      where a.content_type = 'post' and a.content_id = posts.id
        and (a.target_type, a.target_id) in (
          select target_type, target_id from public.my_audience_scopes()
        )
    )
  );

-- Lectura de estado propio (para marcar leído / likes en el futuro)
drop policy if exists post_reads_self on public.post_reads;
create policy post_reads_self on public.post_reads
  for all to authenticated
  using (membership_id in (select id from memberships where user_id = auth.uid()))
  with check (membership_id in (select id from memberships where user_id = auth.uid()));

drop policy if exists post_likes_self on public.post_likes;
create policy post_likes_self on public.post_likes
  for all to authenticated
  using (membership_id in (select id from memberships where user_id = auth.uid()))
  with check (membership_id in (select id from memberships where user_id = auth.uid()));
