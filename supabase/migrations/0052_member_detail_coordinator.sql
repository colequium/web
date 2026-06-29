-- admin_member_detail: que también lo pueda leer un coordinador dentro de su
-- alcance (antes solo admin total → al editar, el modal se precargaba vacío y
-- el guardado borraba los salones de la persona).
create or replace function public.admin_member_detail(p_membership uuid)
returns table(role_key text, group_ids uuid[], subject text)
language sql stable security definer set search_path = public as $$
  select
    (select r.key from membership_roles mr join roles r on r.id = mr.role_id
       where mr.membership_id = p_membership limit 1),
    (select array_agg(distinct group_id) from staff_group_assignments
       where membership_id = p_membership),
    (select subject from staff_group_assignments
       where membership_id = p_membership and subject is not null limit 1)
  where public.can_admin_membership(p_membership);
$$;
