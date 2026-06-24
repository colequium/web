-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Archivar conversaciones (un participante puede archivar/desarchivar).
-- status 'open' = en curso, 'closed' = archivado. RPC SECURITY DEFINER que valida
-- que el usuario sea participante (las conversaciones no tienen policy de UPDATE).
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.set_conversation_status(p_conv uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('open', 'closed') then
    raise exception 'estado inválido';
  end if;
  if not exists (
    select 1 from conversation_participants cp
    join memberships m on m.id = cp.membership_id
    where cp.conversation_id = p_conv and m.user_id = auth.uid()
  ) then
    raise exception 'no autorizado';
  end if;
  update conversations set status = p_status where id = p_conv;
end;
$$;

grant execute on function public.set_conversation_status(uuid, text) to authenticated;
