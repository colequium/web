-- ════════════════════════════════════════════════════════════════════════
-- Colequium — hilo de cada solicitud (inasistencia / salida):
--   • request_comments: comentarios del colegio y de la familia.
--   • can_access_request(): quién puede ver/comentar (mismo criterio que
--     requests_feed: el que la abrió, gestión/dirección, o el staff del grupo).
--   • request_comments_feed / add_request_comment / set_request_status.
-- El docente "marca como recibido" (status='received') y puede responder; la
-- familia ve la respuesta en el mismo hilo.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  membership_id uuid not null references public.memberships(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists request_comments_request_idx
  on public.request_comments (request_id, created_at);

alter table public.request_comments enable row level security;

-- ¿El usuario actual puede acceder a esta solicitud? (opener / gestión / staff del grupo)
create or replace function public.can_access_request(p_request uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  with me as (
    select id as mid, community_id as cid
    from memberships where user_id = auth.uid() and status = 'active' limit 1
  ),
  r as (select * from requests where id = p_request)
  select exists (
    select 1 from r, me
    where r.community_id = me.cid
      and (
        r.opener_membership_id = me.mid
        or exists (
          select 1 from membership_roles mr join roles ro on ro.id = mr.role_id
          where mr.membership_id = me.mid
            and ro.key in ('principal','coordinator','support_staff','board','manager','department_head')
        )
        or r.student_id in (
          select se.student_id from student_enrollments se
          where se.group_id in (select public.my_group_ids())
            and exists (
              select 1 from staff_group_assignments sga
              join memberships m on m.id = sga.membership_id
              where m.user_id = auth.uid() and sga.group_id = se.group_id
            )
        )
      )
  );
$$;

-- RLS: ver/comentar sólo si se puede acceder a la solicitud.
drop policy if exists request_comments_select on public.request_comments;
create policy request_comments_select on public.request_comments
  for select using (public.can_access_request(request_id));

drop policy if exists request_comments_insert on public.request_comments;
create policy request_comments_insert on public.request_comments
  for insert with check (
    public.can_access_request(request_id)
    and membership_id = (select id from memberships
                         where user_id = auth.uid() and status = 'active' limit 1)
  );

-- Hilo de comentarios de una solicitud (con nombre/rol del autor y si es mío).
drop function if exists public.request_comments_feed(uuid);
create function public.request_comments_feed(p_request uuid)
returns table(id uuid, author_name text, author_role text, body text, created_at timestamptz, mine boolean)
language sql stable security definer set search_path = public as $$
  with me as (
    select id as mid from memberships
    where user_id = auth.uid() and status = 'active' limit 1
  )
  select
    rc.id,
    u.full_name as author_name,
    (select ro.key from membership_roles mr join roles ro on ro.id = mr.role_id
       where mr.membership_id = rc.membership_id limit 1) as author_role,
    rc.body,
    rc.created_at,
    rc.membership_id = (select mid from me) as mine
  from request_comments rc
  left join memberships m on m.id = rc.membership_id
  left join users u on u.id = m.user_id
  where rc.request_id = p_request
    and public.can_access_request(p_request)
  order by rc.created_at asc;
$$;

-- Agregar un comentario (lo usa tanto el colegio como la familia).
create or replace function public.add_request_comment(p_request uuid, p_body text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_mid uuid;
  v_id uuid;
begin
  if coalesce(btrim(p_body), '') = '' then return null; end if;
  select id into v_mid from memberships
  where user_id = auth.uid() and status = 'active' limit 1;
  if v_mid is null or not public.can_access_request(p_request) then return null; end if;

  insert into request_comments (request_id, membership_id, body)
  values (p_request, v_mid, btrim(p_body))
  returning id into v_id;
  return v_id;
end;
$$;

-- Cambiar el estado de una solicitud (recibido / aprobado / rechazado / resuelto).
-- Sólo staff/gestión con acceso. Registra quién la gestionó.
create or replace function public.set_request_status(p_request uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_mid uuid;
  v_is_staff boolean;
begin
  if p_status not in ('submitted','received','approved','rejected','resolved') then
    return;
  end if;
  select id into v_mid from memberships
  where user_id = auth.uid() and status = 'active' limit 1;
  if v_mid is null or not public.can_access_request(p_request) then return; end if;

  select exists (
    select 1 from membership_roles mr join roles ro on ro.id = mr.role_id
    where mr.membership_id = v_mid and ro.key <> 'guardian'
  ) into v_is_staff;
  if not v_is_staff then return; end if;

  update requests
  set status = p_status,
      handled_by_membership_id = v_mid
  where id = p_request;
end;
$$;
