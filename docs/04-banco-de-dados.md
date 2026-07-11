# 04 · Banco de Dados

PostgreSQL (Supabase) modelado com Prisma. Multi-tenant com **RLS**. Todos os nomes de tabela em
`snake_case`; modelos Prisma em `PascalCase` com `@@map`.

## Entidades e relacionamentos (visão geral)

```
Organization 1─* Campus
Organization 1─* User *─* Role (via UserRole)              (RBAC)
Organization 1─* Member 1─1 User (opcional)
Organization 1─* Instrument  *─1 InstrumentCategory
Member *─* Instrument (via MemberInstrument: principal/secundário, nível)
Member 1─* Availability

Organization 1─* Service (CULTO)  ── entidade central
Service 1─1 Setlist 1─* SetlistItem *─1 Song ─? SongVersion
Service 1─* Assignment (ESCALA)  *─1 Member  *─1 InstrumentRole
Service 1─1 ClothingPalette
Service 1─1 StageMap 1─* StagePosition *─? Assignment
Service 1─* Notice
Service 1─1 Checklist 1─* ChecklistItem

Organization 1─* Song 1─* SongVersion 1─* SongFile
Song *─* Tag (via SongTag)
Song 1─* SongExecution *─1 Service        (histórico p/ relatórios)
Song 1─1? SongImplementation (pipeline)   (quando "Implantada" → vira Song da biblioteca)

Organization 1─* Announcement (Comunicação)
```

O **Service (Culto)** é o hub: setlist, escala, figurino, palco, avisos e checklist são todos
filhos de um culto.

## Enums

```prisma
enum RoleKey {
  ADMIN_GERAL
  ADMIN
  LIDER_LOUVOR
  COORD_MUSICAL
  PASTOR
  SECRETARIO
  TECNICO_SOM
  MUSICO
}

enum InstrumentCategoryKey {
  LIDERANCA
  VOZ
  RITMO
  HARMONIA
  CORDAS
  SOPROS_MADEIRA
  SOPROS_METAIS
  PERCUSSAO_ORQUESTRAL
  PRODUCAO
}

enum SkillLevel { INICIANTE INTERMEDIARIO AVANCADO PROFISSIONAL }

enum AssignmentStatus { CONVIDADO CONFIRMADO RECUSADO SUBSTITUIDO }

enum ImplementationStage {
  EM_ANALISE
  APROVADA
  EM_ESTUDO
  ENSAIANDO
  PRONTA
  IMPLANTADA
}

enum ServiceStatus { RASCUNHO PLANEJAMENTO CONFIRMADO CONCLUIDO CANCELADO }

enum FileKind { PLAYBACK PARTITURA MULTITRACK GUIA_VOCAL CIFRA LETRA CLIQUE OUTRO }

enum SaturationLevel { VERDE AMARELO VERMELHO }
```

## Schema Prisma (essencial)

> Trecho de referência — a versão canônica viverá em `prisma/schema.prisma`. Campos de auditoria
> (`createdAt`, `updatedAt`, `createdById`) presentes em todas as entidades de negócio.

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  logoUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  campuses     Campus[]
  users        User[]
  members      Member[]
  instruments  Instrument[]
  services     Service[]
  songs        Song[]
  tags         Tag[]
  announcements Announcement[]
  @@map("organizations")
}

model Campus {
  id             String @id @default(cuid())
  organizationId String
  name           String
  address        String?
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  services       Service[]
  @@index([organizationId])
  @@map("campuses")
}

/* ---------- Identidade & RBAC ---------- */

model User {
  id             String  @id            // = Supabase auth.uid
  organizationId String
  email          String  @unique
  name           String
  avatarUrl      String?
  isActive       Boolean @default(true)

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  roles        UserRole[]
  member       Member?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([organizationId])
  @@map("users")
}

model Role {
  id          String  @id @default(cuid())
  key         RoleKey
  label       String
  permissions Json    // matriz de permissões (ver doc 07)
  users       UserRole[]
  @@unique([key])
  @@map("roles")
}

model UserRole {
  userId String
  roleId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@id([userId, roleId])
  @@map("user_roles")
}

/* ---------- Equipe & Instrumentos ---------- */

model InstrumentCategory {
  id          String @id @default(cuid())
  key         InstrumentCategoryKey
  label       String
  sortOrder   Int
  instruments Instrument[]
  @@unique([key])
  @@map("instrument_categories")
}

model Instrument {
  id         String @id @default(cuid())
  organizationId String
  categoryId String
  name       String                 // Ex.: "Violino", "Lead Vocal", "Bateria"
  isVocal    Boolean @default(false)
  sortOrder  Int     @default(0)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  category   InstrumentCategory @relation(fields: [categoryId], references: [id])
  members    MemberInstrument[]
  assignments Assignment[]
  @@index([organizationId])
  @@index([categoryId])
  @@map("instruments")
}

model Member {
  id             String  @id @default(cuid())
  organizationId String
  userId         String? @unique          // vínculo opcional com login
  name           String
  photoUrl       String?
  phone          String?
  email          String?
  birthday       DateTime?
  level          SkillLevel @default(INTERMEDIARIO)
  notes          String?
  isActive       Boolean @default(true)

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User?   @relation(fields: [userId], references: [id])
  instruments  MemberInstrument[]
  availability Availability[]
  assignments  Assignment[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([organizationId])
  @@map("members")
}

model MemberInstrument {
  memberId     String
  instrumentId String
  isPrimary    Boolean @default(false)     // principal x secundário
  level        SkillLevel @default(INTERMEDIARIO)
  member       Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
  instrument   Instrument @relation(fields: [instrumentId], references: [id], onDelete: Cascade)
  @@id([memberId, instrumentId])
  @@map("member_instruments")
}

model Availability {
  id        String  @id @default(cuid())
  memberId  String
  date      DateTime?     // indisponibilidade pontual
  weekday   Int?          // ou recorrente (0-6)
  available Boolean @default(true)
  reason    String?
  member    Member @relation(fields: [memberId], references: [id], onDelete: Cascade)
  @@index([memberId])
  @@map("availability")
}

/* ---------- CULTO (núcleo) ---------- */

model ServiceType {
  id             String @id @default(cuid())
  organizationId String
  name           String        // "Culto de Domingo", "Ceia", "Vigília"...
  services       Service[]
  @@index([organizationId])
  @@map("service_types")
}

model Service {
  id             String   @id @default(cuid())
  organizationId String
  campusId       String?
  typeId         String?
  status         ServiceStatus @default(PLANEJAMENTO)
  date           DateTime
  startTime      String?       // "HH:mm"
  theme          String?
  pastor         String?       // texto livre ou FK futura
  worshipLeaderId String?      // Member (Ministro de Louvor)
  notes          String?

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  campus       Campus?      @relation(fields: [campusId], references: [id])
  type         ServiceType? @relation(fields: [typeId], references: [id])

  setlist      Setlist?
  assignments  Assignment[]
  palette      ClothingPalette?
  stageMap     StageMap?
  notices      Notice[]
  checklist    Checklist?
  executions   SongExecution[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([organizationId, date])
  @@index([campusId])
  @@map("services")
}

/* ---------- Setlist ---------- */

model Setlist {
  id        String @id @default(cuid())
  serviceId String @unique            // UM setlist por culto
  items     SetlistItem[]
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  @@map("setlists")
}

model SetlistItem {
  id            String @id @default(cuid())
  setlistId     String
  songId        String
  versionId     String?
  position      Int                   // ordem (drag-and-drop)
  keyOverride   String?               // tom escolhido p/ este culto
  bpmOverride   Int?
  durationSec   Int?
  notes         String?
  setlist       Setlist @relation(fields: [setlistId], references: [id], onDelete: Cascade)
  song          Song    @relation(fields: [songId], references: [id])
  version       SongVersion? @relation(fields: [versionId], references: [id])
  @@index([setlistId, position])
  @@map("setlist_items")
}

/* ---------- Escala ---------- */

model Assignment {
  id           String @id @default(cuid())
  serviceId    String
  memberId     String?
  instrumentId String                 // função/instrumento (categoria via Instrument)
  status       AssignmentStatus @default(CONVIDADO)
  isLeader     Boolean @default(false)
  substituteForId String?             // sugestão/substituição
  notes        String?
  respondedAt  DateTime?
  service      Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  member       Member? @relation(fields: [memberId], references: [id])
  instrument   Instrument @relation(fields: [instrumentId], references: [id])
  @@index([serviceId])
  @@index([memberId])
  @@map("assignments")
}

/* ---------- Figurino / Palco / Avisos / Checklist ---------- */

model ClothingPalette {
  id        String @id @default(cuid())
  serviceId String @unique
  colors    Json                       // ["#..","#.."]
  notes     String?
  referenceUrl String?
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  @@map("clothing_palettes")
}

model StageMap {
  id        String @id @default(cuid())
  serviceId String @unique
  positions StagePosition[]
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  @@map("stage_maps")
}

model StagePosition {
  id           String @id @default(cuid())
  stageMapId   String
  assignmentId String?
  label        String?
  x            Float                    // coordenadas no palco
  y            Float
  stageMap     StageMap @relation(fields: [stageMapId], references: [id], onDelete: Cascade)
  @@index([stageMapId])
  @@map("stage_positions")
}

model Notice {
  id        String @id @default(cuid())
  serviceId String
  title     String
  body      String?
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  @@index([serviceId])
  @@map("notices")
}

model Checklist {
  id        String @id @default(cuid())
  serviceId String @unique
  items     ChecklistItem[]
  service   Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  @@map("checklists")
}

model ChecklistItem {
  id          String @id @default(cuid())
  checklistId String
  label       String        // Escala, Setlist, Material, Paleta, Mapa, Passagem, Confirmações
  isDone      Boolean @default(false)
  checklist   Checklist @relation(fields: [checklistId], references: [id], onDelete: Cascade)
  @@map("checklist_items")
}

/* ---------- Biblioteca Musical ---------- */

model Song {
  id            String @id @default(cuid())
  organizationId String
  name          String
  artist        String?
  composer      String?
  ccli          String?
  originalKey   String?
  bpm           Int?
  durationSec   Int?
  language      String?
  isInLibrary   Boolean @default(true)   // false enquanto em implantação
  organization  Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  versions      SongVersion[]
  tags          SongTag[]
  setlistItems  SetlistItem[]
  executions    SongExecution[]
  implementation SongImplementation?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([organizationId])
  @@map("songs")
}

model SongVersion {
  id        String @id @default(cuid())
  songId    String
  label     String                       // "Estúdio", "Ao Vivo", "Acústico"
  key       String?
  bpm       Int?
  notes     String?
  song      Song @relation(fields: [songId], references: [id], onDelete: Cascade)
  files     SongFile[]
  setlistItems SetlistItem[]
  @@index([songId])
  @@map("song_versions")
}

model SongFile {
  id         String @id @default(cuid())
  versionId  String
  kind       FileKind
  storagePath String                      // caminho no bucket
  name       String
  sizeBytes  Int?
  mimeType   String?
  version    SongVersion @relation(fields: [versionId], references: [id], onDelete: Cascade)
  @@index([versionId])
  @@map("song_files")
}

model Tag {
  id             String @id @default(cuid())
  organizationId String
  name           String
  songs          SongTag[]
  @@unique([organizationId, name])
  @@map("tags")
}

model SongTag {
  songId String
  tagId  String
  song   Song @relation(fields: [songId], references: [id], onDelete: Cascade)
  tag    Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([songId, tagId])
  @@map("song_tags")
}

/* ---------- Implantação (pipeline) ---------- */

model SongImplementation {
  id        String @id @default(cuid())
  songId    String @unique
  stage     ImplementationStage @default(EM_ANALISE)
  position  Int @default(0)               // ordem no board kanban
  assignedToId String?
  notes     String?
  movedAt   DateTime @default(now())
  song      Song @relation(fields: [songId], references: [id], onDelete: Cascade)
  @@index([stage])
  @@map("song_implementations")
}

/* ---------- Execuções (relatórios) ---------- */

model SongExecution {
  id        String @id @default(cuid())
  organizationId String
  songId    String
  serviceId String?
  playedAt  DateTime
  song      Song @relation(fields: [songId], references: [id], onDelete: Cascade)
  service   Service? @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  @@index([organizationId, playedAt])
  @@index([songId])
  @@map("song_executions")
}

/* ---------- Comunicação ---------- */

model Announcement {
  id             String @id @default(cuid())
  organizationId String
  title          String
  body           String?
  audience       Json                     // papéis/segmentos-alvo
  publishedAt    DateTime?
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  @@index([organizationId])
  @@map("announcements")
}
```

## Regras de negócio no schema

- **Um Setlist por culto:** `Setlist.serviceId @unique`.
- **Implantação → Biblioteca:** ao mover `SongImplementation.stage` para `IMPLANTADA`, uma
  transação seta `Song.isInLibrary = true` **preservando todo o histórico** (versões, arquivos,
  execuções permanecem ligados ao mesmo `Song`).
- **Tom por culto:** o tom real cantado fica em `SetlistItem.keyOverride` (não muta a música).
- **Substituição sugerida:** `Assignment.substituteForId` + serviço de sugestão que cruza
  `MemberInstrument` (função) × `Availability` (disponibilidade) × histórico.

## Índices & performance de relatórios

- `song_executions(organization_id, played_at)` e `(song_id)` → "mais cantadas", "última
  execução", janelas de 3/12 meses.
- **Índice de Saturação** calculado a partir de `song_executions` por janela; resultado mapeado
  no semáforo (`VERDE/AMARELO/VERMELHO`) — pode ser **materialized view** (`mv_song_saturation`)
  atualizada por job, para dashboards rápidos.
- `services(organization_id, date)` para agenda/calendário.

## RLS (padrão aplicado a todas as tabelas de negócio)

```sql
alter table services enable row level security;

create policy "tenant_isolation_select" on services for select
  using (organization_id = (auth.jwt() ->> 'organization_id'));

create policy "tenant_isolation_mutation" on services for all
  using (organization_id = (auth.jwt() ->> 'organization_id'))
  with check (organization_id = (auth.jwt() ->> 'organization_id'));
```

Políticas adicionais por papel (ex.: músico só lê os próprios `assignments`) detalhadas em
[07-permissoes.md](07-permissoes.md). Seeds iniciais: papéis, categorias de instrumento e a
lista completa de instrumentos do prompt (ver [11-roadmap.md](11-roadmap.md)).
