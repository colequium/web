-- ════════════════════════════════════════════════════════════════════════
-- Colequium — demo: todos los eventos del calendario son avisos (posts), para
-- que cada uno tenga su detalle clickeable. Convierte los eventos/tareas
-- "sueltos" (tablas events/tasks) en posts y siembra los eventos de la semana.
-- Idempotente: no vuelve a convertir si ya no quedan filas en events/tasks.
-- Comunidad: Colegio Las Lomas. Autor: Beatriz Salas (Dirección).
-- ════════════════════════════════════════════════════════════════════════
begin;

-- 1) events → posts (type 'event'), preservando su audiencia.
insert into posts (id, community_id, author_membership_id, title, body, type,
                   published_at, created_at, comments_enabled, event_at)
select gen_random_uuid(), e.community_id,
       '7351cd0f-ffd1-4da8-abf7-4afd30460edf'::uuid,
       e.title, e.title, 'event', e.starts_at, e.starts_at, true, e.starts_at
from events e
where e.community_id = '11111111-1111-1111-1111-111111111111';

insert into audiences (community_id, content_type, content_id, target_type, target_id)
select e.community_id, 'post', p.id, a.target_type, a.target_id
from events e
join posts p
  on p.type = 'event' and p.community_id = e.community_id
 and p.title = e.title and p.event_at = e.starts_at
join audiences a on a.content_type = 'event' and a.content_id = e.id
where e.community_id = '11111111-1111-1111-1111-111111111111';

-- 2) tasks → posts (type 'task'), audiencia = su grupo.
insert into posts (id, community_id, author_membership_id, title, body, type,
                   published_at, created_at, comments_enabled, task_due, task_action)
select gen_random_uuid(), t.community_id,
       '7351cd0f-ffd1-4da8-abf7-4afd30460edf'::uuid,
       t.title, t.title, 'task', t.due_at, t.due_at, true, t.due_at, 'sign'
from tasks t
where t.community_id = '11111111-1111-1111-1111-111111111111';

insert into audiences (community_id, content_type, content_id, target_type, target_id)
select t.community_id, 'post', p.id, 'group', t.group_id
from tasks t
join posts p
  on p.type = 'task' and p.community_id = t.community_id
 and p.title = t.title and p.task_due = t.due_at
where t.community_id = '11111111-1111-1111-1111-111111111111';

-- 3) Borrar las filas originales (ya migradas) y sus audiencias.
delete from audiences
 where content_type = 'event'
   and community_id = '11111111-1111-1111-1111-111111111111';
delete from audiences
 where content_type = 'task'
   and community_id = '11111111-1111-1111-1111-111111111111';
delete from events where community_id = '11111111-1111-1111-1111-111111111111';
delete from tasks  where community_id = '11111111-1111-1111-1111-111111111111';

-- 4) Eventos de esta semana (Lun 29 jun – Vie 3 jul 2026). Todos avisos.
--    Hora en UTC = hora a mostrar (el feed usa to_char sin TZ).

-- Lunes 29/06 · Toda la comunidad
with i as (
  insert into posts (id, community_id, author_membership_id, title, body, type,
                     published_at, created_at, comments_enabled, event_at)
  values (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
          '7351cd0f-ffd1-4da8-abf7-4afd30460edf'::uuid,
          'Inicio de la semana de evaluaciones',
          'Esta semana arrancan las evaluaciones finales del trimestre. Pueden ver el cronograma por materia en Documentos. ¡Mucho éxito a todos!',
          'event', now(), now(), true, '2026-06-29 08:30:00+00')
  returning id, community_id)
insert into audiences (community_id, content_type, content_id, target_type, target_id)
select community_id, 'post', id, 'community', '11111111-1111-1111-1111-111111111111' from i;

-- Martes 30/06 · 6°B
with i as (
  insert into posts (id, community_id, author_membership_id, title, body, type,
                     published_at, created_at, comments_enabled, event_at, event_location)
  values (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
          '7351cd0f-ffd1-4da8-abf7-4afd30460edf'::uuid,
          'Muestra de proyectos de 6°B',
          'Los alumnos de 6°B presentan sus proyectos de fin de trimestre. Las familias están invitadas al aula a partir de las 17:30.',
          'event', now(), now(), true, '2026-06-30 17:30:00+00', 'Aula de 6°B')
  returning id, community_id)
insert into audiences (community_id, content_type, content_id, target_type, target_id)
select community_id, 'post', id, 'group', '22222222-0000-0000-0000-000000000003' from i;

-- Miércoles 01/07 · 6°B
with i as (
  insert into posts (id, community_id, author_membership_id, title, body, type,
                     published_at, created_at, comments_enabled, event_at, event_location)
  values (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
          '7351cd0f-ffd1-4da8-abf7-4afd30460edf'::uuid,
          'Reunión de padres de 6°B',
          'Reunión de cierre de trimestre con la maestra de 6°B. Repasaremos los avances del grupo y los detalles del acto de graduación.',
          'event', now(), now(), true, '2026-07-01 18:30:00+00', 'Aula de 6°B')
  returning id, community_id)
insert into audiences (community_id, content_type, content_id, target_type, target_id)
select community_id, 'post', id, 'group', '22222222-0000-0000-0000-000000000003' from i;

-- Jueves 02/07 · 6°B — Graduación (la de Mateo Ortiz)
with i as (
  insert into posts (id, community_id, author_membership_id, title, body, type,
                     published_at, created_at, comments_enabled, event_at, event_location)
  values (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
          '7351cd0f-ffd1-4da8-abf7-4afd30460edf'::uuid,
          'Acto de graduación de 6°B',
          'Acompañamos a los alumnos de 6°B en su acto de graduación. Los esperamos en el auditorio a las 10:00. ¡Felicitaciones a las familias!',
          'event', now(), now(), true, '2026-07-02 10:00:00+00', 'Auditorio')
  returning id, community_id)
insert into audiences (community_id, content_type, content_id, target_type, target_id)
select community_id, 'post', id, 'group', '22222222-0000-0000-0000-000000000003' from i;

commit;
