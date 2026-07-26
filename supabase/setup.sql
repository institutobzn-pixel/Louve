-- ============================================================
--  LOUVE — Setup completo do banco (v2, re-executavel)
--  Limpa o schema public e recria tudo do zero. Seguro para
--  rodar mais de uma vez.
-- ============================================================

-- Reset limpo do schema public (banco novo — nada de valor a perder)
drop schema if exists public cascade;
create schema public;

-- Restaura as permissoes padrao que o Supabase espera no schema public
grant usage on schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('ADMIN_GERAL', 'ADMIN', 'LIDER_LOUVOR', 'COORD_MUSICAL', 'PASTOR', 'SECRETARIO', 'TECNICO_SOM', 'MUSICO');

-- CreateEnum
CREATE TYPE "InstrumentCategoryKey" AS ENUM ('LIDERANCA', 'VOZ', 'RITMO', 'HARMONIA', 'CORDAS', 'SOPROS_MADEIRA', 'SOPROS_METAIS', 'PERCUSSAO_ORQUESTRAL', 'PRODUCAO');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO', 'PROFISSIONAL');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ESCALADO', 'SUBSTITUIDO');

-- CreateEnum
CREATE TYPE "ImplementationStage" AS ENUM ('EM_ANALISE', 'APROVADA', 'EM_ESTUDO', 'ENSAIANDO', 'PRONTA', 'IMPLANTADA');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('RASCUNHO', 'PLANEJAMENTO', 'CONFIRMADO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FileKind" AS ENUM ('PLAYBACK', 'PARTITURA', 'MULTITRACK', 'GUIA_VOCAL', 'CIFRA', 'LETRA', 'CLIQUE', 'OUTRO');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campuses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "key" "RoleKey" NOT NULL,
    "label" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "instrument_categories" (
    "id" TEXT NOT NULL,
    "key" "InstrumentCategoryKey" NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "instrument_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instruments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isVocal" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "birthday" TIMESTAMP(3),
    "level" "SkillLevel" NOT NULL DEFAULT 'INTERMEDIARIO',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_instruments" (
    "memberId" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "level" "SkillLevel" NOT NULL DEFAULT 'INTERMEDIARIO',

    CONSTRAINT "member_instruments_pkey" PRIMARY KEY ("memberId","instrumentId")
);

-- CreateTable
CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "date" TIMESTAMP(3),
    "weekday" INTEGER,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_types" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT,
    "typeId" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'PLANEJAMENTO',
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "theme" TEXT,
    "pastor" TEXT,
    "worshipLeaderId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setlists" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "setlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setlist_items" (
    "id" TEXT NOT NULL,
    "setlistId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "versionId" TEXT,
    "position" INTEGER NOT NULL,
    "keyOverride" TEXT,
    "bpmOverride" INTEGER,
    "durationSec" INTEGER,
    "notes" TEXT,

    CONSTRAINT "setlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "memberId" TEXT,
    "instrumentId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ESCALADO',
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "substituteForId" TEXT,
    "notes" TEXT,
    "seenAt" TIMESTAMP(3),

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clothing_palettes" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "notes" TEXT,
    "referenceUrl" TEXT,

    CONSTRAINT "clothing_palettes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_maps" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "stage_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_positions" (
    "id" TEXT NOT NULL,
    "stageMapId" TEXT NOT NULL,
    "assignmentId" TEXT,
    "label" TEXT,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "stage_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklists" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "songs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT,
    "composer" TEXT,
    "ccli" TEXT,
    "originalKey" TEXT,
    "bpm" INTEGER,
    "durationSec" INTEGER,
    "language" TEXT,
    "isInLibrary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song_versions" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "key" TEXT,
    "bpm" INTEGER,
    "notes" TEXT,

    CONSTRAINT "song_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song_files" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "kind" "FileKind" NOT NULL,
    "storagePath" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "mimeType" TEXT,

    CONSTRAINT "song_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song_videos" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "song_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song_tags" (
    "songId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "song_tags_pkey" PRIMARY KEY ("songId","tagId")
);

-- CreateTable
CREATE TABLE "song_implementations" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "stage" "ImplementationStage" NOT NULL DEFAULT 'EM_ANALISE',
    "position" INTEGER NOT NULL DEFAULT 0,
    "assignedToId" TEXT,
    "notes" TEXT,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "song_implementations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song_executions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "serviceId" TEXT,
    "playedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "song_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "audience" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "campuses_organizationId_idx" ON "campuses"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "instrument_categories_key_key" ON "instrument_categories"("key");

-- CreateIndex
CREATE INDEX "instruments_organizationId_idx" ON "instruments"("organizationId");

-- CreateIndex
CREATE INDEX "instruments_categoryId_idx" ON "instruments"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "instruments_organizationId_categoryId_name_key" ON "instruments"("organizationId", "categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "members_userId_key" ON "members"("userId");

-- CreateIndex
CREATE INDEX "members_organizationId_idx" ON "members"("organizationId");

-- CreateIndex
CREATE INDEX "availability_memberId_idx" ON "availability"("memberId");

-- CreateIndex
CREATE INDEX "service_types_organizationId_idx" ON "service_types"("organizationId");

-- CreateIndex
CREATE INDEX "services_organizationId_date_idx" ON "services"("organizationId", "date");

-- CreateIndex
CREATE INDEX "services_campusId_idx" ON "services"("campusId");

-- CreateIndex
CREATE UNIQUE INDEX "setlists_serviceId_key" ON "setlists"("serviceId");

-- CreateIndex
CREATE INDEX "setlist_items_setlistId_position_idx" ON "setlist_items"("setlistId", "position");

-- CreateIndex
CREATE INDEX "assignments_serviceId_idx" ON "assignments"("serviceId");

-- CreateIndex
CREATE INDEX "assignments_memberId_idx" ON "assignments"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "clothing_palettes_serviceId_key" ON "clothing_palettes"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "stage_maps_serviceId_key" ON "stage_maps"("serviceId");

-- CreateIndex
CREATE INDEX "stage_positions_stageMapId_idx" ON "stage_positions"("stageMapId");

-- CreateIndex
CREATE INDEX "notices_serviceId_idx" ON "notices"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "checklists_serviceId_key" ON "checklists"("serviceId");

-- CreateIndex
CREATE INDEX "songs_organizationId_idx" ON "songs"("organizationId");

-- CreateIndex
CREATE INDEX "song_versions_songId_idx" ON "song_versions"("songId");

-- CreateIndex
CREATE INDEX "song_files_versionId_idx" ON "song_files"("versionId");

-- CreateIndex
CREATE INDEX "song_videos_versionId_idx" ON "song_videos"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_organizationId_name_key" ON "tags"("organizationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "song_implementations_songId_key" ON "song_implementations"("songId");

-- CreateIndex
CREATE INDEX "song_implementations_stage_idx" ON "song_implementations"("stage");

-- CreateIndex
CREATE INDEX "song_executions_organizationId_playedAt_idx" ON "song_executions"("organizationId", "playedAt");

-- CreateIndex
CREATE INDEX "song_executions_songId_idx" ON "song_executions"("songId");

-- CreateIndex
CREATE INDEX "announcements_organizationId_idx" ON "announcements"("organizationId");

-- AddForeignKey
ALTER TABLE "campuses" ADD CONSTRAINT "campuses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instruments" ADD CONSTRAINT "instruments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instruments" ADD CONSTRAINT "instruments_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "instrument_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_instruments" ADD CONSTRAINT "member_instruments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_instruments" ADD CONSTRAINT "member_instruments_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "instruments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_types" ADD CONSTRAINT "service_types_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "campuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "service_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_worshipLeaderId_fkey" FOREIGN KEY ("worshipLeaderId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setlists" ADD CONSTRAINT "setlists_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setlist_items" ADD CONSTRAINT "setlist_items_setlistId_fkey" FOREIGN KEY ("setlistId") REFERENCES "setlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setlist_items" ADD CONSTRAINT "setlist_items_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "setlist_items" ADD CONSTRAINT "setlist_items_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "song_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clothing_palettes" ADD CONSTRAINT "clothing_palettes_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_maps" ADD CONSTRAINT "stage_maps_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_positions" ADD CONSTRAINT "stage_positions_stageMapId_fkey" FOREIGN KEY ("stageMapId") REFERENCES "stage_maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklists" ADD CONSTRAINT "checklists_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_versions" ADD CONSTRAINT "song_versions_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_files" ADD CONSTRAINT "song_files_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "song_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_videos" ADD CONSTRAINT "song_videos_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "song_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_tags" ADD CONSTRAINT "song_tags_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_tags" ADD CONSTRAINT "song_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_implementations" ADD CONSTRAINT "song_implementations_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_executions" ADD CONSTRAINT "song_executions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_executions" ADD CONSTRAINT "song_executions_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_executions" ADD CONSTRAINT "song_executions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ============================================================
--  DADOS INICIAIS (papéis + categorias de instrumento)
-- ============================================================

insert into "roles" ("id","key","label","permissions") values
  ('role_admin_geral','ADMIN_GERAL','Administrador Geral','{}'),
  ('role_admin','ADMIN','Administrador','{}'),
  ('role_lider','LIDER_LOUVOR','Líder de Louvor','{}'),
  ('role_coord','COORD_MUSICAL','Coordenador Musical','{}'),
  ('role_pastor','PASTOR','Pastor','{}'),
  ('role_secretario','SECRETARIO','Secretário','{}'),
  ('role_tecnico','TECNICO_SOM','Técnico de Som','{}'),
  ('role_musico','MUSICO','Músico','{}')
on conflict ("key") do nothing;

insert into "instrument_categories" ("id","key","label","sortOrder") values
  ('cat_lideranca','LIDERANCA','Liderança',1),
  ('cat_voz','VOZ','Voz',2),
  ('cat_ritmo','RITMO','Ritmo',3),
  ('cat_harmonia','HARMONIA','Harmonia',4),
  ('cat_cordas','CORDAS','Cordas',5),
  ('cat_sopros_madeira','SOPROS_MADEIRA','Sopros Madeira',6),
  ('cat_sopros_metais','SOPROS_METAIS','Sopros Metais',7),
  ('cat_percussao','PERCUSSAO_ORQUESTRAL','Percussão Orquestral',8),
  ('cat_producao','PRODUCAO','Produção',9)
on conflict ("key") do nothing;

-- ============================================================
--  ROW LEVEL SECURITY (isolamento por igreja) — defesa extra
--  Colunas em camelCase (padrão do Prisma), idempotente.
-- ============================================================

-- Tabelas com "organizationId" direto:
do $$
declare t text;
begin
  foreach t in array array[
    'campuses','users','members','instruments','service_types','services',
    'songs','tags','song_executions','announcements'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_select on %I', t);
    execute format('drop policy if exists tenant_mutation on %I', t);
    execute format($p$create policy tenant_select on %I for select
      using ("organizationId" = (auth.jwt() ->> 'organization_id'))$p$, t);
    execute format($p$create policy tenant_mutation on %I for all
      using ("organizationId" = (auth.jwt() ->> 'organization_id'))
      with check ("organizationId" = (auth.jwt() ->> 'organization_id'))$p$, t);
  end loop;
end $$;

-- A própria organização:
alter table "organizations" enable row level security;
drop policy if exists org_select on "organizations";
create policy org_select on "organizations" for select
  using ("id" = (auth.jwt() ->> 'organization_id'));

-- Tabelas filhas de "services" (via serviceId):
do $$
declare t text;
begin
  foreach t in array array[
    'setlists','assignments','clothing_palettes','stage_maps','notices','checklists'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_child on %I', t);
    execute format($p$create policy tenant_child on %I for all using (exists (
      select 1 from "services" s where s.id = %I."serviceId"
      and s."organizationId" = (auth.jwt() ->> 'organization_id')))$p$, t, t);
  end loop;
end $$;

-- Netos (via a tabela-pai já protegida):
alter table "setlist_items" enable row level security;
drop policy if exists tenant_child on "setlist_items";
create policy tenant_child on "setlist_items" for all using (exists (
  select 1 from "setlists" s join "services" sv on sv.id = s."serviceId"
  where s.id = "setlist_items"."setlistId"
  and sv."organizationId" = (auth.jwt() ->> 'organization_id')));

alter table "stage_positions" enable row level security;
drop policy if exists tenant_child on "stage_positions";
create policy tenant_child on "stage_positions" for all using (exists (
  select 1 from "stage_maps" m join "services" sv on sv.id = m."serviceId"
  where m.id = "stage_positions"."stageMapId"
  and sv."organizationId" = (auth.jwt() ->> 'organization_id')));

alter table "checklist_items" enable row level security;
drop policy if exists tenant_child on "checklist_items";
create policy tenant_child on "checklist_items" for all using (exists (
  select 1 from "checklists" c join "services" sv on sv.id = c."serviceId"
  where c.id = "checklist_items"."checklistId"
  and sv."organizationId" = (auth.jwt() ->> 'organization_id')));

-- Tabelas filhas de "songs" (via songId):
do $$
declare t text;
begin
  foreach t in array array['song_versions','song_tags','song_implementations'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_child on %I', t);
    execute format($p$create policy tenant_child on %I for all using (exists (
      select 1 from "songs" s where s.id = %I."songId"
      and s."organizationId" = (auth.jwt() ->> 'organization_id')))$p$, t, t);
  end loop;
end $$;

alter table "song_files" enable row level security;
drop policy if exists tenant_child on "song_files";
create policy tenant_child on "song_files" for all using (exists (
  select 1 from "song_versions" v join "songs" s on s.id = v."songId"
  where v.id = "song_files"."versionId"
  and s."organizationId" = (auth.jwt() ->> 'organization_id')));

alter table "song_videos" enable row level security;
drop policy if exists tenant_child on "song_videos";
create policy tenant_child on "song_videos" for all using (exists (
  select 1 from "song_versions" v join "songs" s on s.id = v."songId"
  where v.id = "song_videos"."versionId"
  and s."organizationId" = (auth.jwt() ->> 'organization_id')));

-- Tabelas filhas de "members" (via memberId):
do $$
declare t text;
begin
  foreach t in array array['member_instruments','availability'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_child on %I', t);
    execute format($p$create policy tenant_child on %I for all using (exists (
      select 1 from "members" m where m.id = %I."memberId"
      and m."organizationId" = (auth.jwt() ->> 'organization_id')))$p$, t, t);
  end loop;
end $$;

-- user_roles (via userId → users):
alter table "user_roles" enable row level security;
drop policy if exists tenant_child on "user_roles";
create policy tenant_child on "user_roles" for all using (exists (
  select 1 from "users" u where u.id = "user_roles"."userId"
  and u."organizationId" = (auth.jwt() ->> 'organization_id')));

-- Tabelas globais (leitura para autenticados):
alter table "roles" enable row level security;
drop policy if exists roles_read on "roles";
create policy roles_read on "roles" for select to authenticated using (true);

alter table "instrument_categories" enable row level security;
drop policy if exists categories_read on "instrument_categories";
create policy categories_read on "instrument_categories" for select to authenticated using (true);

-- ============================================================
--  AUTH HOOK (claims organization_id/roles no JWT)
-- ============================================================
-- Custom Access Token Hook (docs/09): injeta organization_id e roles no JWT,
-- para que as políticas RLS (001) e leituras via supabase-js reconheçam o
-- tenant e o papel do usuário.
--
-- Após aplicar, habilite o hook em: Authentication → Hooks →
-- "Custom Access Token" → apontando para public.custom_access_token_hook.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  v_org text;
  v_roles text[];
begin
  select u."organizationId"
    into v_org
    from public.users u
   where u.id = (event ->> 'user_id');

  select coalesce(array_agg(r.key::text), array[]::text[])
    into v_roles
    from public.user_roles ur
    join public.roles r on r.id = ur."roleId"
   where ur."userId" = (event ->> 'user_id');

  claims := event -> 'claims';
  if v_org is not null then
    claims := jsonb_set(claims, '{organization_id}', to_jsonb(v_org));
  end if;
  claims := jsonb_set(claims, '{roles}', to_jsonb(coalesce(v_roles, array[]::text[])));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Permissões para o hook rodar no schema de auth.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant select on public.users, public.user_roles, public.roles to supabase_auth_admin;
