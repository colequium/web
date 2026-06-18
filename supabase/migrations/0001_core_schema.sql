-- ════════════════════════════════════════════════════════════════════════
-- Colequium — Esquema núcleo (Fase B / Sprint 2)
-- Multi-tenant por community_id + RLS. Ver docs/ARQUITECTURA.md §5–§7.
-- Identidad: public.users.id == auth.users.id (Supabase Auth).
-- ════════════════════════════════════════════════════════════════════════
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ===== Tenancy & identidad =====
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text,
  country char(2) not null,
  settings jsonb not null default '{}',         -- locale, features, currency (§6C)
  created_at timestamptz not null default now()
);

create table if not exists users (              -- identidad global, espejo de auth.users
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique not null,
  full_name text not null,
  avatar_url text,
  ui_locale text,                               -- preferencia personal de idioma
  text_scale text default 'normal',             -- accesibilidad (tamaño de texto)
  created_at timestamptz not null default now()
);

create table if not exists memberships (        -- user ↔ community
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  user_id uuid not null references users on delete cascade,
  status text not null default 'active',        -- active | invited | suspended
  created_at timestamptz not null default now(),
  unique (community_id, user_id)
);

-- ===== Roles con scope =====
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  key text not null,                            -- board, principal, teacher, guardian, driver, student...
  kind text not null,                           -- staff | family | service | driver | student
  unique (community_id, key)
);

create table if not exists membership_roles (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references memberships on delete cascade,
  role_id uuid not null references roles on delete cascade,
  scope_type text,                              -- null=comunidad | level | grade | group | department
  scope_id uuid
);

-- ===== Estructura académica =====
create table if not exists levels  ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, name text not null );
create table if not exists grades  ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, level_id uuid references levels on delete cascade, name text not null );
create table if not exists groups  ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, grade_id uuid references grades on delete cascade, name text not null, type text not null default 'class' ); -- class|club|committee|activity
create table if not exists academic_years ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, label text not null, starts_on date, ends_on date, is_current boolean default false );

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  full_name text not null
);

create table if not exists student_enrollments (
  student_id uuid references students on delete cascade,
  group_id uuid references groups on delete cascade,
  academic_year_id uuid references academic_years on delete cascade,
  primary key (student_id, academic_year_id)
);

create table if not exists guardianships (       -- adulto ↔ alumno con permisos finos (§3.2)
  id uuid primary key default gen_random_uuid(),
  guardian_membership_id uuid references memberships on delete cascade,
  student_id uuid references students on delete cascade,
  relationship text,                            -- madre | padre | tutor | abuela | chofer...
  can_pickup boolean default false,
  can_pay boolean default false,
  can_report_absence boolean default true,
  is_primary_contact boolean default false,
  receives_billing boolean default false
);

create table if not exists staff_group_assignments (  -- docente ↔ grupo (tutor o materia)
  membership_id uuid references memberships on delete cascade,
  group_id uuid references groups on delete cascade,
  role text,                                    -- tutor | subject_teacher
  subject text
);

-- ===== Motor de audiencias (reutilizable por todos los módulos, §4.2) =====
create table if not exists audiences (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  content_type text not null,                   -- post | event | task | document
  content_id uuid not null,
  target_type text not null,                    -- community | level | grade | group | role | user
  target_id uuid
);
create index if not exists audiences_content_idx on audiences (content_type, content_id);

-- ===== Muro / publicaciones =====
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  author_membership_id uuid references memberships on delete set null,
  title text, body text, cover_url text,
  type text not null default 'announcement',    -- announcement | poll | task_ref
  published_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists post_reads    ( post_id uuid references posts on delete cascade, membership_id uuid references memberships on delete cascade, read_at timestamptz default now(), primary key (post_id, membership_id) );
create table if not exists post_likes    ( post_id uuid references posts on delete cascade, membership_id uuid references memberships on delete cascade, primary key (post_id, membership_id) );
create table if not exists post_comments ( id uuid primary key default gen_random_uuid(), post_id uuid references posts on delete cascade, membership_id uuid references memberships on delete set null, body text, created_at timestamptz not null default now() );
create table if not exists bookmarks     ( membership_id uuid references memberships on delete cascade, content_type text, content_id uuid, created_at timestamptz default now(), primary key (membership_id, content_type, content_id) );

-- ===== Encuestas (polls) =====
create table if not exists poll_options ( id uuid primary key default gen_random_uuid(), post_id uuid references posts on delete cascade, label text not null, position int default 0 );
create table if not exists poll_votes   ( option_id uuid references poll_options on delete cascade, membership_id uuid references memberships on delete cascade, primary key (option_id, membership_id) );

-- ===== Calendario y tareas =====
create table if not exists calendars ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, name text not null, color text );
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  calendar_id uuid references calendars on delete set null,
  author_membership_id uuid references memberships on delete set null,
  title text, description text, cover_url text,
  starts_at timestamptz, ends_at timestamptz, all_day boolean default false
);
create table if not exists tasks ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, group_id uuid references groups on delete cascade, author_membership_id uuid, title text, due_at timestamptz );
create table if not exists task_completions ( task_id uuid references tasks on delete cascade, membership_id uuid references memberships on delete cascade, done_at timestamptz default now(), primary key (task_id, membership_id) );

-- ===== Conversaciones (hilos) =====
create table if not exists conversations ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, subject text, status text default 'open', scheduled_start_at timestamptz, created_at timestamptz default now() );
create table if not exists conversation_participants ( conversation_id uuid references conversations on delete cascade, membership_id uuid references memberships on delete cascade, primary key (conversation_id, membership_id) );
create table if not exists conversation_labels ( conversation_id uuid references conversations on delete cascade, label text );
create table if not exists messages ( id uuid primary key default gen_random_uuid(), conversation_id uuid references conversations on delete cascade, sender_membership_id uuid references memberships on delete set null, body text, created_at timestamptz not null default now() );
create table if not exists message_reads ( message_id uuid references messages on delete cascade, membership_id uuid references memberships on delete cascade, read_at timestamptz default now(), primary key (message_id, membership_id) );

-- ===== Mensajes a áreas (tickets) =====
create table if not exists service_inboxes ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, name text not null );
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  inbox_id uuid references service_inboxes on delete cascade,
  opener_membership_id uuid references memberships on delete set null,
  student_id uuid references students on delete set null,
  subject text, category text,
  status text not null default 'waiting',        -- waiting | resolved | dismissed
  resolved_by_membership_id uuid, resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists ticket_messages ( id uuid primary key default gen_random_uuid(), ticket_id uuid references tickets on delete cascade, sender_membership_id uuid, body text, created_at timestamptz not null default now() );

-- ===== Documentos =====
create table if not exists document_folders ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, name text not null, parent_id uuid references document_folders on delete cascade );
create table if not exists documents ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, folder_id uuid references document_folders on delete cascade, title text, file_url text, uploaded_by uuid, created_at timestamptz not null default now() );

-- ===== Trámites (requests) — un modelo, varios tipos =====
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  type text not null,                            -- absence | exit_authorization | payment_receipt
  opener_membership_id uuid references memberships on delete set null,
  student_id uuid references students on delete set null,
  status text not null default 'submitted',      -- submitted | approved | rejected | resolved
  payload jsonb not null default '{}',
  handled_by_membership_id uuid, created_at timestamptz not null default now()
);

-- ===== Adjuntos (polimórfico) y notificaciones =====
create table if not exists attachments ( id uuid primary key default gen_random_uuid(), community_id uuid not null references communities on delete cascade, content_type text, content_id uuid, file_url text, kind text );
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities on delete cascade,
  recipient_membership_id uuid references memberships on delete cascade,
  verb text, content_type text, content_id uuid,
  read_at timestamptz, created_at timestamptz not null default now()
);

-- Índices de tenancy más usados
create index if not exists posts_community_idx on posts (community_id, published_at desc);
create index if not exists events_community_idx on events (community_id, starts_at);
create index if not exists memberships_user_idx on memberships (user_id);
