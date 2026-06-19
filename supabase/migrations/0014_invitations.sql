-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Invitaciones por correo.
-- Una fila por VÍNCULO a materializar (no por email): un padre con 2 hijos =
-- 2 filas (mismo email) → 1 cuenta + 2 guardianships. Las invitaciones las
-- gestiona el admin; el invitado las "reclama" al poner su contraseña.
-- ════════════════════════════════════════════════════════════════════════
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  email citext not null,
  full_name text,
  role_key text not null,                 -- guardian | teacher | principal | ...
  scope_type text,                        -- level|grade|group|department|null
  scope_id uuid,
  student_id uuid references students on delete cascade,  -- solo guardian
  relationship text,                      -- madre|padre|tutor...
  can_pickup boolean default false,
  can_pay boolean default false,
  can_report_absence boolean default true,
  is_primary_contact boolean default false,
  receives_billing boolean default false,
  staff_group_id uuid references groups on delete set null,  -- staff: tutor/materia
  staff_assignment_role text,             -- tutor|subject_teacher
  staff_subject text,
  status text not null default 'pending', -- pending|accepted|revoked|expired
  invited_by uuid references memberships on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  expires_at timestamptz
);
create index if not exists invitations_lookup on invitations (community_id, email, status);

alter table invitations enable row level security;
drop policy if exists invitations_admin on invitations;
create policy invitations_admin on invitations
  for all to authenticated
  using (public.is_school_admin(community_id))
  with check (public.is_school_admin(community_id));

-- ===== Materialización (idempotente) — la llama el invitado al aceptar =====
create or replace function public.claim_invitations()
returns int language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  uemail citext;
  inv record;
  mid uuid;
  n int := 0;
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

    -- Rol (con scope), si no lo tiene ya
    insert into membership_roles (membership_id, role_id, scope_type, scope_id)
    select mid, r.id, inv.scope_type, inv.scope_id
    from roles r
    where r.community_id = inv.community_id and r.key = inv.role_key
      and not exists (
        select 1 from membership_roles mr
        where mr.membership_id = mid and mr.role_id = r.id
          and coalesce(mr.scope_id::text,'') = coalesce(inv.scope_id::text,'')
      );

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

    -- Staff → asignación a grupo
    if inv.staff_group_id is not null then
      insert into staff_group_assignments (membership_id, group_id, role, subject)
      select mid, inv.staff_group_id, coalesce(inv.staff_assignment_role,'subject_teacher'), inv.staff_subject
      where not exists (
        select 1 from staff_group_assignments x where x.membership_id = mid and x.group_id = inv.staff_group_id
      );
    end if;

    -- Completar nombre si faltaba
    update users set full_name = inv.full_name
    where id = uid and (full_name is null or full_name = '') and inv.full_name is not null;

    update invitations set status = 'accepted', accepted_at = now() where id = inv.id;
    n := n + 1;
  end loop;
  return n;
end $$;

grant execute on function public.claim_invitations() to authenticated;
