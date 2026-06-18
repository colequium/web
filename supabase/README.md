# Supabase — Colequium

Backend: Postgres + Auth + Storage + Realtime (multi-tenant `community_id` + RLS).

## Migraciones
- `migrations/0001_core_schema.sql` — esquema núcleo (tenancy, roles, estructura académica, audiencias y módulos).
- `migrations/0002_rls_foundation.sql` — RLS base (aislamiento por comunidad). Las reglas finas por grupo/audiencia se agregan por módulo (Sprints 4–7).

## Cómo correrlas
Requiere red que permita el puerto de Postgres (la red corporativa con puertos restringidos puede bloquearlo).

Con `psql` (la connection string está en `colequium.secrets.env.local`, fuera del repo):
```bash
# desde la raíz del workspace:
set -a; . ./colequium.secrets.env.local; set +a
psql "$SUPABASE_DB_URL" -f Colequium/supabase/migrations/0001_core_schema.sql
psql "$SUPABASE_DB_URL" -f Colequium/supabase/migrations/0002_rls_foundation.sql
```
O pegando el SQL en el **SQL Editor** del panel de Supabase (no necesita puertos especiales).

## Variables de entorno
- App (cliente): `Colequium/.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable).
- Admin/migraciones: `colequium.secrets.env.local` (raíz) → `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`.
- En **Vercel** cargar las dos `NEXT_PUBLIC_*` en Project Settings → Environment Variables.

## Próximo (Sprint 3 — auth)
- Server Action de login (`signInWithPassword`), recuperación, aceptar invitación, middleware de sesión (`@supabase/ssr`), guardas de ruta. Clientes ya creados en `lib/supabase/`.
