-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Mensajes: iniciar conversaciones + responder.
-- Hasta ahora las conversaciones eran SOLO lectura (RLS sin INSERT). Esto:
--   1) Enriquece community_people() con membership_id + un "contexto" por
--      persona (de quién es el familiar / cargo y grupo del staff) para el
--      selector de destinatarios ("¿a quién le escribo?").
--   2) Permite responder: policy de INSERT en messages para participantes.
--   3) start_conversation(): crea el hilo, suma participantes y deja el 1er
--      mensaje, validando que el destinatario sea de mi comunidad.
-- ════════════════════════════════════════════════════════════════════════

-- ===== 1) Directorio enriquecido (cambia el tipo de retorno → drop antes) =====
drop function if exists public.community_people();
create or replace function public.community_people()
returns table(membership_id uuid, name text, role_key text, role_kind text, context text)
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
    -- "de quién es" (familias) o el alcance por grupo (staff/alumnos)
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
    ) as context
  from memberships m
  join users u on u.id = m.user_id
  left join lateral (
    select rr.key, rr.kind from membership_roles mr join roles rr on rr.id = mr.role_id
    where mr.membership_id = m.id limit 1
  ) r on true
  where m.community_id = (select cid from me) and m.status = 'active'
    and m.id <> (select mid from me)            -- no me incluyo a mí mismo
    and (
      coalesce(r.kind, '') in ('staff','service')   -- el equipo es visible para todos
      or (select is_mgr from mgr)                    -- gestión ve a todos
      -- staff de aula ve a las familias de los alumnos de SUS grupos (§3.3)
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

-- ===== 2) Responder: un participante puede insertar mensajes propios =====
-- Helper SECURITY DEFINER: evita la recursión de RLS sobre conversation_participants
-- (su policy de SELECT es auto-referencial, así que consultarla dentro de otra
--  policy dispara "infinite recursion"). Al ser definer, salta RLS.
create or replace function public.is_conversation_participant(p_conv uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from conversation_participants cp
    join memberships m on m.id = cp.membership_id
    where cp.conversation_id = p_conv and m.user_id = auth.uid()
  );
$$;

drop policy if exists messages_send on public.messages;
create policy messages_send on public.messages
  for insert to authenticated
  with check (
    sender_membership_id in (select id from memberships where user_id = auth.uid())
    and public.is_conversation_participant(conversation_id)
  );

-- ===== 3) Iniciar una conversación (valida comunidad; centraliza el alta) =====
create or replace function public.start_conversation(
  p_targets uuid[], p_subject text, p_label text, p_body text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_mid uuid;
  v_cid uuid;
  v_conv uuid;
  v_target uuid;
  v_valid uuid[];
begin
  select id, community_id into v_mid, v_cid
  from memberships where user_id = auth.uid() and status = 'active' limit 1;
  if v_mid is null then
    raise exception 'sin membresía activa';
  end if;

  -- Solo destinatarios de mi misma comunidad y activos (≠ yo).
  select array_agg(m.id) into v_valid
  from memberships m
  where m.id = any(p_targets) and m.community_id = v_cid
    and m.status = 'active' and m.id <> v_mid;
  if v_valid is null or array_length(v_valid, 1) = 0 then
    raise exception 'destinatario inválido';
  end if;

  insert into conversations (community_id, subject, status)
  values (v_cid, nullif(trim(p_subject), ''), 'open')
  returning id into v_conv;

  if coalesce(trim(p_label), '') <> '' then
    insert into conversation_labels (conversation_id, label) values (v_conv, trim(p_label));
  end if;

  insert into conversation_participants (conversation_id, membership_id)
  values (v_conv, v_mid) on conflict do nothing;
  foreach v_target in array v_valid loop
    insert into conversation_participants (conversation_id, membership_id)
    values (v_conv, v_target) on conflict do nothing;
  end loop;

  if coalesce(trim(p_body), '') <> '' then
    insert into messages (conversation_id, sender_membership_id, body)
    values (v_conv, v_mid, trim(p_body));
  end if;

  return v_conv;
end;
$$;

grant execute on function public.start_conversation(uuid[], text, text, text) to authenticated;
