-- ════════════════════════════════════════════════════════════════════════
-- Colequium — El docente solo publica a SUS grupos (no a toda la comunidad).
-- my_publish_scopes(): a qué puede dirigir un aviso cada usuario.
--   • Gestión: comunidad + todos los niveles/grados/grupos/roles.
--   • Docente: solo sus grupos + sus grados + sus niveles (sin comunidad ni rol).
-- La policy de inserción de audiencias exige que el destino esté en ese alcance.
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.my_publish_scopes()
returns table(target_type text, target_id uuid)
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
    ) as ok
  )
  -- Gestión: todo en su comunidad
  select 'community', (select cid from me) where (select ok from mgr)
  union all select 'level', id from levels where community_id = (select cid from me) and (select ok from mgr)
  union all select 'grade', id from grades where community_id = (select cid from me) and (select ok from mgr)
  union all select 'group', id from groups where community_id = (select cid from me) and (select ok from mgr)
  union all select 'role',  id from roles  where community_id = (select cid from me) and (select ok from mgr)
  -- Docente: solo sus grupos + grados + niveles
  union all select 'group', gid from public.my_group_ids() gid
  union all select 'grade', gr.grade_id from groups gr
    where gr.id in (select public.my_group_ids()) and gr.grade_id is not null
  union all select 'level', gd.level_id from grades gd
    where gd.id in (select gr.grade_id from groups gr where gr.id in (select public.my_group_ids()))
      and gd.level_id is not null;
$$;

drop policy if exists audiences_insert on public.audiences;
create policy audiences_insert on public.audiences
  for insert to authenticated
  with check (
    public.is_community_member(community_id)
    and (target_type, target_id) in (select target_type, target_id from public.my_publish_scopes())
  );
