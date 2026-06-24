-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Ajuste: el docente solo publica a SUS salones asignados.
-- Antes derivábamos también el grado y el nivel del salón, lo que dejaba que un
-- docente de 6°B le escribiera a todo 6° (incluido 6°A) o a toda Primaria.
-- Ahora, para docentes, el alcance son EXCLUSIVAMENTE sus grupos.
-- La gestión (dirección/coordinación) mantiene el alcance completo.
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
  -- Docente: solo sus salones asignados (sin grado ni nivel).
  union all select 'group', gid from public.my_group_ids() gid;
$$;
