-- ════════════════════════════════════════════════════════════════════════
-- Colequium — RLS base (Fase B / Sprint 2)
-- Garantía núcleo: AISLAMIENTO MULTI-TENANT. Un usuario solo accede a filas
-- de las comunidades a las que pertenece. Las reglas FINAS de privacidad por
-- grupo/audiencia (ej. "la familia ve solo lo de sus hijos") se agregan por
-- módulo en los Sprints 4–7. Por defecto las tablas sin policy fallan CERRADAS.
-- ════════════════════════════════════════════════════════════════════════

-- ===== Helpers (SECURITY DEFINER para evitar recursión de RLS) =====
create or replace function public.my_community_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select community_id from memberships where user_id = auth.uid() and status = 'active'
$$;

create or replace function public.is_community_member(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships
    where user_id = auth.uid() and community_id = c and status = 'active'
  )
$$;

-- ===== Habilitar RLS en TODAS las tablas (fail-closed por defecto) =====
do $$
declare t text;
begin
  foreach t in array array[
    'communities','memberships','roles','membership_roles','levels','grades','groups',
    'academic_years','students','student_enrollments','guardianships','staff_group_assignments',
    'audiences','posts','post_reads','post_likes','post_comments','bookmarks','poll_options',
    'poll_votes','calendars','events','tasks','task_completions','conversations',
    'conversation_participants','conversation_labels','messages','message_reads',
    'service_inboxes','tickets','ticket_messages','document_folders','documents','requests',
    'attachments','notifications','users'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- ===== Aislamiento por comunidad en todas las tablas con community_id =====
do $$
declare t text;
begin
  -- Solo tablas que tienen columna community_id directa.
  -- Las de unión (post_comments, poll_options, conversation_labels, messages,
  -- membership_roles, *_reads, etc.) se filtran por su padre en los Sprints 4–7.
  foreach t in array array[
    'roles','levels','grades','groups','academic_years','students',
    'audiences','posts','calendars','events','tasks',
    'conversations','service_inboxes','tickets',
    'document_folders','documents','requests','attachments','notifications'
  ] loop
    execute format($f$
      drop policy if exists "%1$s_community" on public.%1$s;
      create policy "%1$s_community" on public.%1$s
        for all to authenticated
        using (public.is_community_member(community_id))
        with check (public.is_community_member(community_id));
    $f$, t);
  end loop;
end $$;

-- ===== communities: ver solo las propias =====
drop policy if exists communities_self on public.communities;
create policy communities_self on public.communities
  for select to authenticated
  using (id in (select public.my_community_ids()));

-- ===== memberships: ver las de mis comunidades (incluye la mía) =====
drop policy if exists memberships_community on public.memberships;
create policy memberships_community on public.memberships
  for select to authenticated
  using (community_id in (select public.my_community_ids()));

-- ===== users: mi propia fila + usuarios que comparten comunidad (directorio) =====
drop policy if exists users_self on public.users;
create policy users_self on public.users
  for select to authenticated
  using (
    id = auth.uid()
    or id in (
      select m.user_id from memberships m
      where m.community_id in (select public.my_community_ids())
    )
  );
drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- NOTA: tablas de unión (post_reads, post_likes, task_completions, guardianships,
-- conversation_participants, message_reads, etc.) quedan con RLS ON sin policy →
-- fallan cerradas (seguro). Sus policies se agregan al construir cada módulo
-- (Sprints 4–7), junto con la resolución de audiencias (privacidad por grupo).
