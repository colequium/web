-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Calendario real por rol. Reusa el motor de audiencias (0006).
-- calendar_feed() devuelve eventos (por audiencia) + tareas (por grupo) que
-- ve el usuario actual, ya con su calendario/color y etiqueta de audiencia.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.calendar_feed()
returns table(
  id uuid, calendar_key text, day int, all_day boolean,
  start_time text, end_time text, title text, audience_label text, kind text
) language sql stable security definer set search_path = public as $$
  with me as (
    select id as membership_id, community_id
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  )
  -- EVENTOS (filtrados por audiencia)
  select
    e.id,
    case c.name
      when 'Institucional' then 'inst' when 'Primaria' then 'primaria'
      when '6°B' then '6b' when 'Evaluaciones' then 'exams'
      when 'Transporte' then 'transport' else 'inst' end as calendar_key,
    extract(day from e.starts_at)::int as day,
    coalesce(e.all_day, false) as all_day,
    case when coalesce(e.all_day,false) then null else to_char(e.starts_at,'HH24:MI') end as start_time,
    case when coalesce(e.all_day,false) then null else to_char(e.ends_at,  'HH24:MI') end as end_time,
    e.title,
    case aud.target_type
      when 'community' then 'Toda la comunidad'
      when 'level' then (select name from levels where id = aud.target_id)
      when 'grade' then (select name from grades where id = aud.target_id)
      when 'group' then (select name from groups where id = aud.target_id)
      when 'role'  then 'Familias con transporte'
      else 'Comunidad' end as audience_label,
    'event' as kind
  from events e
  left join calendars c on c.id = e.calendar_id
  left join lateral (
    select a.target_type, a.target_id from audiences a
    where a.content_type = 'event' and a.content_id = e.id
    order by case a.target_type
      when 'group' then 1 when 'grade' then 2 when 'level' then 3
      when 'role' then 4 when 'community' then 5 else 6 end
    limit 1
  ) aud on true
  where e.community_id = (select community_id from me)
    and exists (
      select 1 from audiences a
      where a.content_type = 'event' and a.content_id = e.id
        and (a.target_type, a.target_id) in (select target_type, target_id from public.my_audience_scopes())
    )

  union all

  -- TAREAS (por grupo del usuario)
  select
    t.id, '6b'::text as calendar_key,
    extract(day from t.due_at)::int as day,
    true as all_day, null::text, null::text,
    t.title, g.name as audience_label, 'task' as kind
  from tasks t
  join groups g on g.id = t.group_id
  where t.community_id = (select community_id from me)
    and t.group_id in (select public.my_group_ids());
$$;

-- ===== Endurecer RLS de events/tasks (defensa en profundidad) =====
drop policy if exists "events_community" on public.events;
drop policy if exists events_visible on public.events;
create policy events_visible on public.events
  for select to authenticated
  using (
    author_membership_id in (select id from memberships where user_id = auth.uid())
    or exists (
      select 1 from audiences a
      where a.content_type = 'event' and a.content_id = events.id
        and (a.target_type, a.target_id) in (select target_type, target_id from public.my_audience_scopes())
    )
  );

drop policy if exists "tasks_community" on public.tasks;
drop policy if exists tasks_visible on public.tasks;
create policy tasks_visible on public.tasks
  for select to authenticated
  using (
    group_id in (select public.my_group_ids())
    or author_membership_id in (select id from memberships where user_id = auth.uid())
  );
