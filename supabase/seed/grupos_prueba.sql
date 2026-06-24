-- ════════════════════════════════════════════════════════════════════════
-- Estructura de prueba: Primaria 1°–6°, cada grado con salones A y B.
-- + una familia en 6°A (Sofía → Lucía) para probar segmentación de audiencia.
-- Idempotente (UUIDs fijos). Correr DESPUÉS de seed-demo-users.sh.
-- ════════════════════════════════════════════════════════════════════════
\set COMM '''11111111-1111-1111-1111-111111111111'''
\set PRIM '''22222222-0000-0000-0000-000000000001'''
\set G6   '''22222222-0000-0000-0000-000000000002'''
\set G6B  '''22222222-0000-0000-0000-000000000003'''
\set YEAR '''22222222-0000-0000-0000-000000000004'''

-- Posiciones de lo existente
update levels set position = 0 where id = :PRIM::uuid;
update grades set position = 5 where id = :G6::uuid;     -- 6° va último
update groups set position = 11 where id = :G6B::uuid;   -- 6°B último

-- Grados 1°–5° (6° ya existe)
insert into grades (id, community_id, level_id, name, position) values
  ('a0000000-0000-0000-0000-000000000001'::uuid, :COMM::uuid, :PRIM::uuid, '1°', 0),
  ('a0000000-0000-0000-0000-000000000002'::uuid, :COMM::uuid, :PRIM::uuid, '2°', 1),
  ('a0000000-0000-0000-0000-000000000003'::uuid, :COMM::uuid, :PRIM::uuid, '3°', 2),
  ('a0000000-0000-0000-0000-000000000004'::uuid, :COMM::uuid, :PRIM::uuid, '4°', 3),
  ('a0000000-0000-0000-0000-000000000005'::uuid, :COMM::uuid, :PRIM::uuid, '5°', 4)
on conflict (id) do update set name = excluded.name, position = excluded.position;

-- Salones A y B por grado (6°B ya existe; sumamos 6°A)
insert into groups (id, community_id, grade_id, name, type, position) values
  ('b0000000-0000-0000-0000-000000000001'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, '1°A', 'class', 0),
  ('b0000000-0000-0000-0000-000000000002'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000001'::uuid, '1°B', 'class', 1),
  ('b0000000-0000-0000-0000-000000000003'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, '2°A', 'class', 2),
  ('b0000000-0000-0000-0000-000000000004'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000002'::uuid, '2°B', 'class', 3),
  ('b0000000-0000-0000-0000-000000000005'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid, '3°A', 'class', 4),
  ('b0000000-0000-0000-0000-000000000006'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000003'::uuid, '3°B', 'class', 5),
  ('b0000000-0000-0000-0000-000000000007'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid, '4°A', 'class', 6),
  ('b0000000-0000-0000-0000-000000000008'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000004'::uuid, '4°B', 'class', 7),
  ('b0000000-0000-0000-0000-000000000009'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000005'::uuid, '5°A', 'class', 8),
  ('b0000000-0000-0000-0000-00000000000a'::uuid, :COMM::uuid, 'a0000000-0000-0000-0000-000000000005'::uuid, '5°B', 'class', 9),
  ('b0000000-0000-0000-0000-00000000000b'::uuid, :COMM::uuid, :G6::uuid, '6°A', 'class', 10)
on conflict (id) do update set name = excluded.name, position = excluded.position;

-- Alumna de 6°A + inscripción
insert into students (id, community_id, full_name)
values ('c0000000-0000-0000-0000-00000000000a'::uuid, :COMM::uuid, 'Lucía Fernández')
on conflict (id) do nothing;

insert into student_enrollments (student_id, group_id, academic_year_id)
values ('c0000000-0000-0000-0000-00000000000a'::uuid, 'b0000000-0000-0000-0000-00000000000b'::uuid, :YEAR::uuid)
on conflict (student_id, academic_year_id) do update set group_id = excluded.group_id;

-- Sofía (familia6a@laslomas.demo) es la madre de Lucía (6°A)
insert into guardianships (id, guardian_membership_id, student_id, relationship, can_pickup, can_pay, can_report_absence, is_primary_contact, receives_billing)
select 'd0000000-0000-0000-0000-00000000000a'::uuid, ms.id, 'c0000000-0000-0000-0000-00000000000a'::uuid, 'madre', true, true, true, true, true
from memberships ms join users u on u.id = ms.user_id
where u.email = 'familia6a@laslomas.demo' and ms.community_id = :COMM::uuid
on conflict (id) do nothing;
