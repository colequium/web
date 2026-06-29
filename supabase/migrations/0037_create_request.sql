-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Las familias pueden CREAR solicitudes (inasistencia / salida).
--   • my_children(): hijos del usuario (para elegir en el formulario).
--   • create_request(): inserta la solicitud validando que sea su hijo.
-- La tabla requests solo tenía policy de lectura; usamos una RPC SECURITY
-- DEFINER en vez de abrir INSERT por RLS.
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.my_children()
returns table(student_id uuid, full_name text, group_name text)
language sql stable security definer set search_path = public as $$
  with me as (select id as mid from memberships where user_id = auth.uid() and status='active' limit 1)
  select distinct s.id, s.full_name,
    (select g.name from student_enrollments se join groups g on g.id = se.group_id
       where se.student_id = s.id limit 1)
  from guardianships gu
  join students s on s.id = gu.student_id
  where gu.guardian_membership_id = (select mid from me)
    and coalesce(gu.relationship,'') <> 'self'
  order by s.full_name;
$$;
grant execute on function public.my_children() to authenticated;

create or replace function public.create_request(
  p_type text, p_student_id uuid, p_payload jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_mid uuid; v_cid uuid; v_id uuid;
begin
  select id, community_id into v_mid, v_cid
  from memberships where user_id = auth.uid() and status = 'active' limit 1;
  if v_mid is null then raise exception 'sin membresía'; end if;
  if p_type not in ('absence','exit','payment') then raise exception 'tipo inválido'; end if;

  -- Debe ser tutor/a del alumno.
  if not exists (
    select 1 from guardianships g
    where g.guardian_membership_id = v_mid and g.student_id = p_student_id
  ) then
    raise exception 'no autorizado para este alumno';
  end if;

  insert into requests (community_id, type, opener_membership_id, student_id, status, payload, created_at)
  values (v_cid, p_type, v_mid, p_student_id, 'submitted', coalesce(p_payload, '{}'::jsonb), now())
  returning id into v_id;
  return v_id;
end;
$$;
grant execute on function public.create_request(text, uuid, jsonb) to authenticated;
