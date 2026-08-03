-- ============================================================
--  LOUVE — Dados de demonstração (para apresentar o app)
--
--  SEGURO: só ACRESCENTA. Nada do que já existe é apagado —
--  ele remove apenas as próprias linhas de demonstração (ids
--  que começam com "demo_"), então pode rodar mais de uma vez.
--
--  Pré-requisito: já ter criado a conta da igreja em /signup.
-- ============================================================

do $$
declare
  org_id text;

  -- instrumentos (criados no cadastro da igreja)
  i_ministro text; i_lead text; i_soprano text; i_contralto text;
  i_tenor text; i_bateria text; i_percussao text; i_violao text;
  i_guitarra text; i_teclado text; i_baixo text;

  -- tipos de culto
  t_domingo text; t_oracao text;

  -- datas relativas a hoje, para a demonstração nunca "vencer"
  d_passado timestamp := date_trunc('day', now()) - interval '7 days' + interval '12 hours';
  d_proximo timestamp := date_trunc('day', now()) + interval '3 days' + interval '12 hours';
  d_futuro  timestamp := date_trunc('day', now()) + interval '10 days' + interval '12 hours';
begin
  select id into org_id from "organizations" order by "createdAt" limit 1;
  if org_id is null then
    raise exception 'Nenhuma igreja encontrada. Crie a conta em /signup antes de rodar este script.';
  end if;

  -- ---------- limpeza apenas do que este script cria ----------
  delete from "stage_positions" where id like 'demo_%';
  delete from "stage_maps" where id like 'demo_%';
  delete from "clothing_palettes" where id like 'demo_%';
  delete from "notices" where id like 'demo_%';
  delete from "checklist_items" where id like 'demo_%';
  delete from "checklists" where id like 'demo_%';
  delete from "assignments" where id like 'demo_%';
  delete from "setlist_items" where id like 'demo_%';
  delete from "setlists" where id like 'demo_%';
  delete from "song_executions" where id like 'demo_%';
  delete from "services" where id like 'demo_%';
  delete from "song_sections" where id like 'demo_%';
  delete from "song_videos" where id like 'demo_%';
  delete from "song_versions" where id like 'demo_%';
  delete from "songs" where id like 'demo_%';
  delete from "member_instruments" where "memberId" like 'demo_%';
  delete from "members" where id like 'demo_%';

  -- ---------- instrumentos e tipos de culto ----------
  select i.id into i_ministro from "instruments" i where i."organizationId" = org_id and i.name = 'Ministro de Louvor' limit 1;
  select i.id into i_lead     from "instruments" i where i."organizationId" = org_id and i.name = 'Lead Vocal' limit 1;
  select i.id into i_soprano  from "instruments" i where i."organizationId" = org_id and i.name = 'Soprano 1' limit 1;
  select i.id into i_contralto from "instruments" i where i."organizationId" = org_id and i.name = 'Contralto' limit 1;
  select i.id into i_tenor    from "instruments" i where i."organizationId" = org_id and i.name = 'Tenor 1' limit 1;
  select i.id into i_bateria  from "instruments" i where i."organizationId" = org_id and i.name = 'Bateria' limit 1;
  select i.id into i_percussao from "instruments" i where i."organizationId" = org_id and i.name = 'Percussão' limit 1;
  select i.id into i_violao   from "instruments" i where i."organizationId" = org_id and i.name = 'Violão' limit 1;
  select i.id into i_guitarra from "instruments" i where i."organizationId" = org_id and i.name = 'Guitarra' limit 1;
  select i.id into i_teclado  from "instruments" i where i."organizationId" = org_id and i.name = 'Teclado' limit 1;
  select i.id into i_baixo    from "instruments" i where i."organizationId" = org_id and i.name = 'Contrabaixo Elétrico' limit 1;

  select s.id into t_domingo from "service_types" s where s."organizationId" = org_id and s.name = 'Culto de Domingo' limit 1;
  select s.id into t_oracao  from "service_types" s where s."organizationId" = org_id and s.name = 'Culto de Oração' limit 1;

  -- ---------- 10 músicos ----------
  -- vocalLowNote/vocalHighNote em número MIDI (60 = Dó central).
  insert into "members"
    (id, "organizationId", name, phone, email, birthday, level, notes, "vocalLowNote", "vocalHighNote", "updatedAt")
  values
    ('demo_m01', org_id, 'Adriana Paz',      '(11) 98123-4501', 'adriana@exemplo.com',  '1989-03-12', 'PROFISSIONAL', 'Ministra de louvor; conduz o domingo à noite.', 57, 76, now()),
    ('demo_m02', org_id, 'Lucas Ferreira',   '(11) 98123-4502', 'lucas@exemplo.com',    '1995-07-25', 'AVANCADO',     'Baterista; toca com clique.',                    null, null, now()),
    ('demo_m03', org_id, 'Pedro Henrique',   '(11) 98123-4503', 'pedro@exemplo.com',    '1992-11-03', 'INTERMEDIARIO','Violão base; também canta backing.',              48, 64, now()),
    ('demo_m04', org_id, 'Rafael Souza',     '(11) 98123-4504', 'rafael@exemplo.com',   '1990-01-18', 'AVANCADO',     'Guitarra; cuida dos timbres e pedaleira.',        null, null, now()),
    ('demo_m05', org_id, 'Juliana Costa',    '(11) 98123-4505', 'juliana@exemplo.com',  '1997-05-09', 'AVANCADO',     'Teclado e piano; escreve os arranjos.',           53, 72, now()),
    ('demo_m06', org_id, 'Tiago Nunes',      '(11) 98123-4506', 'tiago@exemplo.com',    '1988-09-30', 'PROFISSIONAL', 'Contrabaixo; 5 cordas.',                          43, 62, now()),
    ('demo_m07', org_id, 'Marina Alves',     '(11) 98123-4507', 'marina@exemplo.com',   '2000-02-14', 'INTERMEDIARIO','Soprano; entrou este ano.',                       60, 79, now()),
    ('demo_m08', org_id, 'Bruno Carvalho',   '(11) 98123-4508', 'bruno@exemplo.com',    '1993-12-07', 'AVANCADO',     'Tenor; ajuda na condução.',                       48, 69, now()),
    ('demo_m09', org_id, 'Camila Rocha',     '(11) 98123-4509', 'camila@exemplo.com',   '1996-08-21', 'INTERMEDIARIO','Contralto; voz de apoio.',                        55, 74, now()),
    ('demo_m10', org_id, 'Daniel Moreira',   '(11) 98123-4510', 'daniel@exemplo.com',   '1991-04-05', 'INTERMEDIARIO','Percussão; cajon e pandeiro.',                    null, null, now());

  -- instrumentos de cada músico
  insert into "member_instruments" ("memberId", "instrumentId", "isPrimary", level)
  select v."memberId", v."instrumentId", v."isPrimary", v.level::"SkillLevel"
  from (values
    ('demo_m01', i_ministro,  true,  'PROFISSIONAL'),
    ('demo_m01', i_lead,      false, 'PROFISSIONAL'),
    ('demo_m02', i_bateria,   true,  'AVANCADO'),
    ('demo_m03', i_violao,    true,  'INTERMEDIARIO'),
    ('demo_m04', i_guitarra,  true,  'AVANCADO'),
    ('demo_m05', i_teclado,   true,  'AVANCADO'),
    ('demo_m06', i_baixo,     true,  'PROFISSIONAL'),
    ('demo_m07', i_soprano,   true,  'INTERMEDIARIO'),
    ('demo_m08', i_tenor,     true,  'AVANCADO'),
    ('demo_m09', i_contralto, true,  'INTERMEDIARIO'),
    ('demo_m10', i_percussao, true,  'INTERMEDIARIO')
  ) as v("memberId", "instrumentId", "isPrimary", level)
  where v."instrumentId" is not null;

  -- ---------- indisponibilidade (para a escala mostrar o aviso) ----------
  delete from "availability" where id like 'demo_%';
  insert into "availability" (id, "memberId", date, available, reason)
  values ('demo_av1', 'demo_m07', d_futuro::date, false, 'Viagem em família');

  -- ---------- repertório ----------
  insert into "songs"
    (id, "organizationId", name, artist, "originalKey", bpm, "durationSec", language, "updatedAt")
  values
    ('demo_s01', org_id, 'Santo, Santo, Santo',   'Hino tradicional', 'D', 72,  240, 'Português', now()),
    ('demo_s02', org_id, 'Maravilhosa Graça',     'Hino tradicional', 'G', 76,  260, 'Português', now()),
    ('demo_s03', org_id, 'Aleluia ao Cordeiro',   'Ministério Louve', 'A', 74,  300, 'Português', now()),
    ('demo_s04', org_id, 'Tua Presença',          'Ministério Louve', 'E', 68,  330, 'Português', now()),
    ('demo_s05', org_id, 'Ele Reina',             'Ministério Louve', 'G', 128, 290, 'Português', now()),
    ('demo_s06', org_id, 'Canta, Minha Alma',     'Ministério Louve', 'C', 120, 275, 'Português', now()),
    ('demo_s07', org_id, 'Firme Estarei',         'Ministério Louve', 'B', 70,  310, 'Português', now()),
    ('demo_s08', org_id, 'Digno de Louvor',       'Ministério Louve', 'D', 136, 265, 'Português', now());

  -- versões (com tom, BPM, extensão da melodia e cifra quando cabível)
  insert into "song_versions"
    (id, "songId", label, key, bpm, notes, "chordChartText", "melodyLowNote", "melodyHighNote")
  values
    -- Cifras de demonstração: acordes reais sobre texto de exemplo, só
    -- para mostrar o alinhamento e a transposição funcionando.
    ('demo_v01', 'demo_s01', 'Congregacional', 'D', 72, 'Introdução só com teclado.',
     E'Intro:  D   G   D   A\n\nD           G      D\nprimeira linha do verso\nD        A         D\nsegunda linha do verso\n\nRefrão:\nG        D       A       D\nlinha do refrão de exemplo\nG        D       A       D\nsegunda linha do refrão', 62, 74),
    ('demo_v02', 'demo_s02', 'Acústica', 'G', 76, 'Violão e voz; entra a banda no 2º verso.',
     E'Intro:  G   C   G   D\n\nG                C        G\nprimeira linha do verso\nG              D       G\nsegunda linha do verso\n\nRefrão:\nC        G        D       G\nlinha do refrão de exemplo', 55, 71),
    ('demo_v03', 'demo_s03', 'Estúdio',  'A', 74, null, null, 57, 73),
    ('demo_v04', 'demo_s04', 'Ao Vivo',  'E', 68, 'Dinâmica baixa na ponte.', null, 52, 68),
    ('demo_v05', 'demo_s05', 'Estúdio',  'G', 128, null, null, 55, 71),
    ('demo_v06', 'demo_s06', 'Ao Vivo',  'C', 120, null, null, 60, 76),
    ('demo_v07', 'demo_s07', 'Acústica', 'B', 70, null, null, 54, 70),
    ('demo_v08', 'demo_s08', 'Estúdio',  'D', 136, null, null, 57, 74);

  -- estrutura do arranjo (aparece na linha do tempo)
  insert into "song_sections" (id, "versionId", name, measures, notes, "sortOrder")
  values
    ('demo_sec01', 'demo_v01', 'Intro',        4,  'só teclado',   0),
    ('demo_sec02', 'demo_v01', 'Verso',        8,  null,           1),
    ('demo_sec03', 'demo_v01', 'Refrão',       8,  'entra banda',  2),
    ('demo_sec04', 'demo_v01', 'Verso',        8,  null,           3),
    ('demo_sec05', 'demo_v01', 'Refrão final', 16, '2x',           4),
    ('demo_sec06', 'demo_v01', 'Final',        4,  'ritardando',   5),

    ('demo_sec11', 'demo_v05', 'Intro',        8,  null,             0),
    ('demo_sec12', 'demo_v05', 'Verso',        8,  null,             1),
    ('demo_sec13', 'demo_v05', 'Pré-refrão',   4,  'sobe dinâmica',  2),
    ('demo_sec14', 'demo_v05', 'Refrão',       8,  null,             3),
    ('demo_sec15', 'demo_v05', 'Ponte',        8,  'só voz e pad',   4),
    ('demo_sec16', 'demo_v05', 'Refrão final', 16, '2x',             5);

  -- ---------- cultos ----------
  insert into "services"
    (id, "organizationId", "typeId", status, date, "startTime", "worshipLeaderId", notes, "updatedAt")
  values
    ('demo_c01', org_id, t_domingo, 'CONCLUIDO',    d_passado, '19:00', 'demo_m01', 'Culto de celebração.',              now()),
    ('demo_c02', org_id, t_domingo, 'CONFIRMADO',   d_proximo, '19:00', 'demo_m01', 'Ceia no final do culto.',           now()),
    ('demo_c03', org_id, t_oracao,  'PLANEJAMENTO', d_futuro,  '20:00', 'demo_m05', 'Culto de oração; formação reduzida.', now());

  insert into "setlists" (id, "serviceId") values
    ('demo_sl01', 'demo_c01'), ('demo_sl02', 'demo_c02'), ('demo_sl03', 'demo_c03');

  insert into "setlist_items" (id, "setlistId", "songId", "versionId", position, "keyOverride", "durationSec")
  values
    ('demo_si01', 'demo_sl01', 'demo_s05', 'demo_v05', 0, null, 290),
    ('demo_si02', 'demo_sl01', 'demo_s03', 'demo_v03', 1, null, 300),
    ('demo_si03', 'demo_sl01', 'demo_s01', 'demo_v01', 2, null, 240),
    ('demo_si04', 'demo_sl01', 'demo_s04', 'demo_v04', 3, null, 330),

    ('demo_si05', 'demo_sl02', 'demo_s08', 'demo_v08', 0, null, 265),
    ('demo_si06', 'demo_sl02', 'demo_s06', 'demo_v06', 1, 'D',  275),
    ('demo_si07', 'demo_sl02', 'demo_s01', 'demo_v01', 2, null, 240),
    ('demo_si08', 'demo_sl02', 'demo_s07', 'demo_v07', 3, null, 310),
    ('demo_si09', 'demo_sl02', 'demo_s02', 'demo_v02', 4, null, 260),

    ('demo_si10', 'demo_sl03', 'demo_s02', 'demo_v02', 0, null, 260),
    ('demo_si11', 'demo_sl03', 'demo_s04', 'demo_v04', 1, null, 330);

  -- escala: culto passado (todos já viram) e próximo (parte viu)
  insert into "assignments" (id, "serviceId", "memberId", "instrumentId", "isLeader", "seenAt")
  select v.id, v.sid, v.mid, v.iid, v.leader, v.seen
  from (values
    -- culto concluído
    ('demo_a01', 'demo_c01', 'demo_m01', i_ministro,  true,  d_passado - interval '2 days'),
    ('demo_a02', 'demo_c01', 'demo_m02', i_bateria,   false, d_passado - interval '2 days'),
    ('demo_a03', 'demo_c01', 'demo_m03', i_violao,    false, d_passado - interval '2 days'),
    ('demo_a04', 'demo_c01', 'demo_m04', i_guitarra,  false, d_passado - interval '1 day'),
    ('demo_a05', 'demo_c01', 'demo_m05', i_teclado,   false, d_passado - interval '2 days'),
    ('demo_a06', 'demo_c01', 'demo_m06', i_baixo,     false, d_passado - interval '1 day'),
    ('demo_a07', 'demo_c01', 'demo_m07', i_soprano,   false, d_passado - interval '1 day'),
    ('demo_a08', 'demo_c01', 'demo_m08', i_tenor,     false, d_passado - interval '1 day'),
    -- próximo culto: alguns ainda não viram (aparece o ✓✓ apagado)
    ('demo_a11', 'demo_c02', 'demo_m01', i_ministro,  true,  now() - interval '1 day'),
    ('demo_a12', 'demo_c02', 'demo_m02', i_bateria,   false, now() - interval '1 day'),
    ('demo_a13', 'demo_c02', 'demo_m03', i_violao,    false, null),
    ('demo_a14', 'demo_c02', 'demo_m04', i_guitarra,  false, now() - interval '6 hours'),
    ('demo_a15', 'demo_c02', 'demo_m05', i_teclado,   false, null),
    ('demo_a16', 'demo_c02', 'demo_m06', i_baixo,     false, null),
    ('demo_a17', 'demo_c02', 'demo_m07', i_soprano,   false, null),
    ('demo_a18', 'demo_c02', 'demo_m09', i_contralto, false, now() - interval '2 days'),
    ('demo_a19', 'demo_c02', 'demo_m10', i_percussao, false, null),
    -- culto de oração: formação reduzida
    ('demo_a21', 'demo_c03', 'demo_m05', i_teclado,   true,  null),
    ('demo_a22', 'demo_c03', 'demo_m03', i_violao,    false, null),
    ('demo_a23', 'demo_c03', 'demo_m09', i_contralto, false, null),
    ('demo_a24', 'demo_c03', 'demo_m07', i_soprano,   false, null)
  ) as v(id, sid, mid, iid, leader, seen)
  where v.iid is not null;

  -- ---------- facetas do culto ----------
  insert into "notices" (id, "serviceId", title, body) values
    ('demo_n01', 'demo_c02', 'Passagem de som', 'Chegar às 17h30 para a passagem de som completa.'),
    ('demo_n02', 'demo_c02', 'Ceia',            'O momento da ceia entra depois da terceira música.'),
    ('demo_n03', 'demo_c03', 'Formato',         'Culto de oração: formação reduzida, dinâmica baixa.');

  insert into "clothing_palettes" (id, "serviceId", colors, notes) values
    ('demo_p01', 'demo_c02', '["#1e1b4b","#4c1d95","#a78bfa","#e5e7eb"]'::jsonb,
     'Tons de violeta e azul escuro; calça preta ou jeans escuro. Evitar estampas.'),
    ('demo_p02', 'demo_c03', '["#111827","#374151","#9ca3af"]'::jsonb,
     'Tons neutros e sóbrios.');

  insert into "stage_maps" (id, "serviceId") values ('demo_sm01', 'demo_c02');
  insert into "stage_positions" (id, "stageMapId", "assignmentId", label, x, y) values
    ('demo_sp01', 'demo_sm01', 'demo_a11', null, 50, 72),
    ('demo_sp02', 'demo_sm01', 'demo_a12', null, 50, 22),
    ('demo_sp03', 'demo_sm01', 'demo_a13', null, 26, 52),
    ('demo_sp04', 'demo_sm01', 'demo_a14', null, 74, 52),
    ('demo_sp05', 'demo_sm01', 'demo_a15', null, 16, 30),
    ('demo_sp06', 'demo_sm01', 'demo_a16', null, 84, 30),
    ('demo_sp07', 'demo_sm01', 'demo_a18', null, 36, 80),
    ('demo_sp08', 'demo_sm01', 'demo_a19', null, 66, 24);

  -- checklist do próximo culto, parcialmente marcado
  insert into "checklists" (id, "serviceId") values ('demo_ck02', 'demo_c02');
  insert into "checklist_items" (id, "checklistId", label, "isDone") values
    ('demo_ci01', 'demo_ck02', 'Escala completa',   true),
    ('demo_ci02', 'demo_ck02', 'Setlist completo',  true),
    ('demo_ci03', 'demo_ck02', 'Material enviado',  true),
    ('demo_ci04', 'demo_ck02', 'Paleta definida',   true),
    ('demo_ci05', 'demo_ck02', 'Mapa definido',     true),
    ('demo_ci06', 'demo_ck02', 'Passagem de som',   false),
    ('demo_ci07', 'demo_ck02', 'Confirmações',      false);

  -- execuções do culto concluído (alimentam os relatórios)
  insert into "song_executions" (id, "organizationId", "songId", "serviceId", "playedAt")
  values
    ('demo_e01', org_id, 'demo_s05', 'demo_c01', d_passado),
    ('demo_e02', org_id, 'demo_s03', 'demo_c01', d_passado),
    ('demo_e03', org_id, 'demo_s01', 'demo_c01', d_passado),
    ('demo_e04', org_id, 'demo_s04', 'demo_c01', d_passado);

  raise notice 'Demonstração criada: 10 músicos, 8 músicas, 3 cultos.';
end $$;
