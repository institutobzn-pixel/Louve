-- ============================================================
--  LOUVE — Atualização do banco (colunas e tabelas novas)
--
--  SEGURO: só ACRESCENTA. Não apaga nada e pode rodar quantas
--  vezes quiser — o que já existe é ignorado.
--
--  Reúne todas as mudanças de schema das últimas funcionalidades:
--  link e texto da cifra, estrutura do arranjo e extensão vocal.
-- ============================================================

-- Cifra: link externo e texto (para transposição no app)
alter table "song_versions" add column if not exists "chordChartUrl" text;
alter table "song_versions" add column if not exists "chordChartText" text;

-- Extensão da melodia, para sugerir o tom por cantor (número MIDI)
alter table "song_versions" add column if not exists "melodyLowNote" integer;
alter table "song_versions" add column if not exists "melodyHighNote" integer;

-- Extensão vocal confortável do músico (número MIDI)
alter table "members" add column if not exists "vocalLowNote" integer;
alter table "members" add column if not exists "vocalHighNote" integer;

-- Trechos do arranjo (Intro, Verso, Refrão…)
create table if not exists "song_sections" (
    "id" text not null,
    "versionId" text not null,
    "name" text not null,
    "measures" integer,
    "notes" text,
    "sortOrder" integer not null default 0,

    constraint "song_sections_pkey" primary key ("id"),
    constraint "song_sections_versionId_fkey" foreign key ("versionId")
      references "song_versions"("id") on delete cascade on update cascade
);

create index if not exists "song_sections_versionId_idx"
  on "song_sections"("versionId");

-- Isolamento por igreja (mesmo padrão de song_files e song_videos)
alter table "song_sections" enable row level security;
drop policy if exists tenant_child on "song_sections";
create policy tenant_child on "song_sections" for all using (exists (
  select 1 from "song_versions" v join "songs" s on s.id = v."songId"
  where v.id = "song_sections"."versionId"
  and s."organizationId" = (auth.jwt() ->> 'organization_id')));

do $$ begin raise notice 'Banco atualizado com sucesso.'; end $$;
