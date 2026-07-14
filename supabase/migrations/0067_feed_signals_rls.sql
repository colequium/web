-- Seguridad: el linter de Supabase marcó feed_signals como "públicamente
-- accesible" (RLS deshabilitada). No tiene datos sensibles (solo community_id +
-- hora), pero sin RLS cualquiera con la anon key puede insertar/borrar pings.
--
-- Arreglo: habilitar RLS y dejar SOLO lectura a los miembros de la comunidad
-- (que es lo único que el muro necesita para el realtime). Las inserciones las
-- hace el trigger ping_feed_signal() y la limpieza prune_feed_signals(), ambos
-- SECURITY DEFINER → NO los afecta la RLS, así que el realtime sigue igual.
-- Además, un simple is_community_member() sí lo evalúa bien Realtime (el motivo
-- de 0049 era la RLS COMPLEJA de posts, no ésta).
alter table public.feed_signals enable row level security;

drop policy if exists feed_signals_select on public.feed_signals;
create policy feed_signals_select on public.feed_signals
  for select using (public.is_community_member(community_id));

-- Sin políticas de INSERT/UPDATE/DELETE → denegadas para la API (solo los
-- triggers SECURITY DEFINER escriben).
