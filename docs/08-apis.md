# 08 · APIs

Estratégia **server-first**: leitura por RSC/queries; escrita por **Server Actions** tipadas.
Route Handlers (`/api/*`) apenas para o que exige HTTP explícito (webhooks, uploads assinados,
callbacks). Realtime via canais Supabase.

## Camadas de uma mutação

```
Client (form RHF+Zod)
  → Server Action (Zod parse → authorize() → service → prisma tx → revalidate)
    → src/server/services/<dominio> (regra de negócio pura)
      → Prisma / Supabase
```

Todo contrato tem **um** schema Zod (em `features/<dominio>/schema.ts`), reutilizado no cliente
(validação de formulário) e no servidor (parse da action). Sem contrato duplicado.

## Convenções

- Server Actions retornam `{ ok: true, data }` ou `{ ok: false, error }` (nunca lançam para a UI
  sem tratamento).
- Nomeação: `createService`, `updateSetlistOrder`, `assignMember`, `moveImplementationStage`.
- Idempotência em ações sensíveis (confirmar presença) por chave natural.
- Paginação por **cursor** (`{ cursor, take }`) nas listagens grandes.

## Catálogo de operações por domínio

### Culto (Service)
- `createService(input)` · `updateServiceInfo(id, input)` · `updateServiceStatus(id, status)`
  · `deleteService(id)` · `duplicateService(id)` (clonar planejamento)
- Query: `getServices({ range, campusId, cursor })` · `getServiceById(id)` (com abas agregadas)

### Setlist
- `addSongToSetlist(serviceId, { songId, versionId, source })` — `source: 'library' | 'implementation'`
- `updateSetlistItem(itemId, { keyOverride, bpmOverride, durationSec, notes })`
- `reorderSetlist(setlistId, orderedItemIds[])` — persiste `position` após drag-and-drop
- `removeSetlistItem(itemId)`

### Escala (Assignment)
- `assignMember(serviceId, { instrumentId, memberId, isLeader })`
- `updateAssignmentStatus(assignmentId, status)`
- `suggestSubstitutes(serviceId, instrumentId)` → lista ordenada por função × disponibilidade ×
  histórico (serviço `scheduleSuggestion`)
- `removeAssignment(assignmentId)`

### Confirmação (Músico)
- `confirmAttendance(assignmentId, decision)` — `CONFIRMADO | RECUSADO`
- `updateAvailability(memberId, input)`

### Biblioteca (Song)
- `createSong(input)` · `updateSong(id, input)` · `archiveSong(id)`
- `addSongVersion(songId, input)` · `updateSongVersion(id, input)`
- `attachSongFile(versionId, { kind, storagePath, name })` (após upload) · `removeSongFile(id)`
- `addTag / removeTag`
- Query: `searchSongs({ q, tags, key, language, cursor })`

### Implantação
- `createImplementation(songInput)` — cria Song `isInLibrary=false` + registro de pipeline
- `moveImplementationStage(id, stage, position)` — drag no kanban
- Ao chegar em `IMPLANTADA`: transação `promoteToLibrary(songId)` → `isInLibrary=true`, mantém
  versões/arquivos/execuções (histórico preservado)

### Equipe (Member)
- `createMember` · `updateMember` · `setMemberInstruments(memberId, items[])` · `deactivateMember`
- Query: `getMembers({ q, instrumentId, cursor })` · `getMemberProfile(id)`

### Culto — facetas
- Palette: `upsertClothingPalette(serviceId, { colors, notes, referenceUrl })`
- StageMap: `upsertStagePositions(serviceId, positions[])`
- Notices: `createNotice` · `updateNotice` · `deleteNotice`
- Checklist: `toggleChecklistItem(itemId, isDone)` (itens semeados por culto)

### Relatórios
- `getMostPlayed({ window: '3m' | '12m', type, pastor, campusId })`
- `getSaturationIndex({ window })` → `{ songId, count, level: VERDE|AMARELO|VERMELHO }`
- `getSongRanking(...)` · `getServiceStats(...)`
- Fonte: `song_executions` + (opcional) materialized view `mv_song_saturation`.

### Comunicação
- `createAnnouncement` · `publishAnnouncement` · `getAnnouncements({ audience })`

## Route Handlers (`/api`)

| Rota | Método | Uso |
|---|---|---|
| `/api/storage/sign-upload` | POST | Gera URL assinada para upload de arquivo musical |
| `/api/storage/sign-download` | POST | URL assinada de download (curta duração) |
| `/api/webhooks/supabase` | POST | Auth hooks / eventos de storage |
| `/api/health` | GET | Healthcheck |

## Realtime (Supabase)

Canais por recurso para colaboração e status ao vivo:

- `service:{id}:setlist` — reordenação/edição colaborativa do setlist.
- `service:{id}:schedule` — status de confirmação da escala em tempo real.
- `implementation:board` — movimentação do kanban.
- `org:{id}:notices` — avisos empurrados ao app do músico.

Cliente assina via `supabase-js`; atualizações reconciliam com o estado otimista (Zustand/SWR de
RSC). Autorização dos canais herda a **RLS** (o usuário só recebe o que pode ler).

## Erros e validação

- Zod na borda; mensagens amigáveis mapeadas por campo no formulário.
- Códigos padronizados (`UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION`, `CONFLICT`).
- Toda action registra auditoria mínima (quem, o quê, quando) em log estruturado.
