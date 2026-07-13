-- Personas: "cargo a mostrar" editable + alcances MÚLTIPLES por persona.
-- Antes una invitación tenía un solo scope (un grupo o un nivel). Ahora:
--  - Coordinación/Dirección → una o más SECCIONES (niveles).
--  - Docente → uno o más SALONES (o una sección entera = sus salones).
--  - "Cargo a mostrar" libre (ej. "Coordinador de Inglés"), invisible para el
--    invitado; es solo un rótulo interno del colegio.

-- 1) Cargo a mostrar por membresía (editable después del alta).
alter table public.memberships add column if not exists title text;

-- 2) Alcances múltiples + cargo en la invitación.
--    scopes = jsonb array de { "type": "level" | "group", "id": "<uuid>" }.
alter table public.invitations add column if not exists scopes jsonb;
alter table public.invitations add column if not exists title text;

-- 3) claim_invitations: aplica cargo + N alcances. Mantiene compatibilidad con
--    las invitaciones viejas (scope_type/scope_id/staff_group_id de una sola).
create or replace function public.claim_invitations()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  uid uuid := auth.uid();
  uemail citext;
  inv record;
  mid uuid;
  rid uuid;
  n int := 0;
  level_ids uuid[];
  group_ids uuid[];
  lid uuid;
  gid uuid;
begin
  if uid is null then return 0; end if;
  select email into uemail from users where id = uid;
  if uemail is null then return 0; end if;

  for inv in select * from invitations where email = uemail and status = 'pending' loop
    -- Membresía (1 por comunidad, idempotente)
    insert into memberships (community_id, user_id, status)
    values (inv.community_id, uid, 'active')
    on conflict (community_id, user_id) do update set status = 'active'
    returning id into mid;
    if mid is null then
      select id into mid from memberships where community_id = inv.community_id and user_id = uid;
    end if;

    select id into rid from roles where community_id = inv.community_id and key = inv.role_key limit 1;

    -- Alcances desde el jsonb `scopes`…
    select
      coalesce(array_agg((e->>'id')::uuid) filter (where e->>'type' = 'level'), '{}'),
      coalesce(array_agg((e->>'id')::uuid) filter (where e->>'type' = 'group'), '{}')
    into level_ids, group_ids
    from jsonb_array_elements(coalesce(inv.scopes, '[]'::jsonb)) e;

    -- …más los campos legacy (invitaciones anteriores a este cambio).
    if inv.scope_type = 'level' and inv.scope_id is not null then level_ids := level_ids || inv.scope_id; end if;
    if inv.scope_type = 'group' and inv.scope_id is not null then group_ids := group_ids || inv.scope_id; end if;
    if inv.staff_group_id is not null then group_ids := group_ids || inv.staff_group_id; end if;

    -- Rol: una fila por cada nivel; si no hay niveles, una fila sin scope.
    if rid is not null then
      if array_length(level_ids, 1) is null then
        insert into membership_roles (membership_id, role_id, scope_type, scope_id)
        select mid, rid, null, null
        where not exists (
          select 1 from membership_roles mr
          where mr.membership_id = mid and mr.role_id = rid and mr.scope_id is null);
      else
        foreach lid in array level_ids loop
          insert into membership_roles (membership_id, role_id, scope_type, scope_id)
          select mid, rid, 'level', lid
          where not exists (
            select 1 from membership_roles mr
            where mr.membership_id = mid and mr.role_id = rid and mr.scope_id = lid);
        end loop;
      end if;
    end if;

    -- Familia → guardianship
    if inv.role_key = 'guardian' and inv.student_id is not null then
      insert into guardianships (guardian_membership_id, student_id, relationship,
        can_pickup, can_pay, can_report_absence, is_primary_contact, receives_billing)
      select mid, inv.student_id, inv.relationship,
        inv.can_pickup, inv.can_pay, inv.can_report_absence, inv.is_primary_contact, inv.receives_billing
      where not exists (
        select 1 from guardianships g where g.guardian_membership_id = mid and g.student_id = inv.student_id
      );
    end if;

    -- Staff → asignaciones a grupos (múltiples)
    if array_length(group_ids, 1) is not null then
      foreach gid in array group_ids loop
        insert into staff_group_assignments (membership_id, group_id, role, subject)
        select mid, gid, coalesce(inv.staff_assignment_role, 'subject_teacher'), inv.staff_subject
        where not exists (
          select 1 from staff_group_assignments x where x.membership_id = mid and x.group_id = gid
        );
      end loop;
    end if;

    -- Cargo a mostrar (rótulo interno)
    if inv.title is not null and inv.title <> '' then
      update memberships set title = inv.title where id = mid;
    end if;

    -- Completar nombre si faltaba
    update users set full_name = inv.full_name
    where id = uid and (full_name is null or full_name = '') and inv.full_name is not null;

    update invitations set status = 'accepted', accepted_at = now() where id = inv.id;
    n := n + 1;
  end loop;
  return n;
end
$function$;
