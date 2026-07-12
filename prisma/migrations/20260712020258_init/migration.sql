-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('ADMIN_GERAL', 'ADMIN', 'LIDER_LOUVOR', 'COORD_MUSICAL', 'PASTOR', 'SECRETARIO', 'TECNICO_SOM', 'MUSICO');

-- CreateEnum
CREATE TYPE "InstrumentCategoryKey" AS ENUM ('LIDERANCA', 'VOZ', 'RITMO', 'HARMONIA', 'CORDAS', 'SOPROS_MADEIRA', 'SOPROS_METAIS', 'PERCUSSAO_ORQUESTRAL', 'PRODUCAO');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('INICIANTE', 'INTERMEDIARIO', 'AVANCADO', 'PROFISSIONAL');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('CONVIDADO', 'CONFIRMADO', 'RECUSADO', 'SUBSTITUIDO');

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
    "status" "AssignmentStatus" NOT NULL DEFAULT 'CONVIDADO',
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "substituteForId" TEXT,
    "notes" TEXT,
    "respondedAt" TIMESTAMP(3),

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
