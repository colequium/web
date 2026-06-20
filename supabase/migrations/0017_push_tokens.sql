-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Base de push notifications.
-- device_tokens: el token de Expo de cada dispositivo del usuario.
-- recipient_tokens(post): a qué tokens notificar cuando se publica un aviso.
-- v1: notifica a toda la comunidad (el reparto fino por audiencia se afina luego).
-- ════════════════════════════════════════════════════════════════════════
create table if not exists device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  token text not null unique,
  platform text,
  created_at timestamptz not null default now()
);

alter table device_tokens enable row level security;
drop policy if exists device_tokens_self on device_tokens;
create policy device_tokens_self on device_tokens
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Tokens a notificar por un aviso (toda la comunidad, menos el autor).
create or replace function public.recipient_tokens(p_post uuid)
returns table(token text)
language sql stable security definer set search_path = public as $$
  select dt.token
  from device_tokens dt
  join memberships m on m.user_id = dt.user_id and m.status = 'active'
  join posts p on p.id = p_post
  where m.community_id = p.community_id
    and dt.user_id not in (
      select user_id from memberships where id = p.author_membership_id
    );
$$;
