# 02 · Arquitetura

## Visão em camadas

```
┌──────────────────────────────────────────────────────────────────────┐
│  CLIENTE (Browser / PWA)                                               │
│  React Server + Client Components · Zustand (estado de UI)             │
│  Design System (shadcn/ui + tokens) · WaveSurfer · FullCalendar        │
└───────────────▲───────────────────────────────────┬───────────────────┘
                │ RSC payload / Server Actions        │ Realtime (WS)
┌───────────────┴───────────────────────────────────▼───────────────────┐
│  APLICAÇÃO (Next.js App Router — Vercel Edge/Node)                     │
│  Route Handlers · Server Actions · Middleware (authz)                  │
│  Camada de Serviços (domínio) · Validação Zod · Mapeadores DTO         │
└───────────────▲───────────────────────────────────┬───────────────────┘
                │ Prisma Client (pooled)              │ supabase-js (RLS)
┌───────────────┴───────────────────────────────────▼───────────────────┐
│  DADOS & PLATAFORMA (Supabase)                                         │
│  PostgreSQL + RLS · Auth (JWT) · Storage (arquivos) · Realtime         │
└────────────────────────────────────────────────────────────────────────┘
```

## Princípios arquiteturais

1. **Domínio no centro.** Regras de negócio vivem em uma **camada de serviços** independente de
   framework (`src/server/services/*`), consumida por Server Actions e Route Handlers. Nunca
   colocar regra de negócio dentro de componente de UI.
2. **Server-first.** Leitura de dados por **React Server Components**; mutações por **Server
   Actions** tipadas e validadas com Zod. Menos JS no cliente, mais velocidade.
3. **Multi-tenant desde a fundação.** Todo dado pertence a uma `organization` (igreja). Isolamento
   garantido por **RLS no PostgreSQL** — segurança não depende do código de aplicação.
4. **Uma fonte de verdade de tipos.** `schema.prisma` → tipos Prisma → schemas Zod derivados →
   contratos de API. Sem tipos duplicados.
5. **Reuso obrigatório.** Componentes e hooks compartilhados no Design System e em
   `src/features/*/components`. Duplicação é tratada como bug.
6. **Otimista e realtime.** Mutações aplicam atualização otimista; canais Realtime do Supabase
   sincronizam colaboração (ex.: dois líderes editando a mesma escala).

## Decisões técnicas (ADRs resumidos)

| Decisão | Escolha | Por quê |
|---|---|---|
| Renderização | Next.js App Router (RSC) | Velocidade, SEO da landing, streaming, menos JS no cliente |
| Acesso a dados (escrita/migrations) | **Prisma** | Schema tipado, migrations versionadas, DX |
| Acesso a dados (leitura com RLS/Realtime) | **supabase-js** | Respeita RLS por sessão, Realtime nativo |
| Isolamento de tenant | **RLS no Postgres** | Segurança na borda do dado, não na aplicação |
| Estado de servidor | RSC + revalidação | Cache e invalidação nativos do Next |
| Estado de UI (efêmero) | **Zustand** | Leve, para drag-and-drop, modais, Modo Ensaio |
| Formulários | **React Hook Form + Zod** | Performático, validação isomórfica (client+server) |
| Gráficos | **Recharts** | Relatórios (ranking, saturação) |
| Calendário | **FullCalendar** | Agenda de cultos e disponibilidade |
| Player de áudio | **WaveSurfer** | Playback, multitrack, loop, waveform do Modo Ensaio |
| Uploads | Supabase Storage + URLs assinadas | Arquivos musicais grandes, acesso controlado |

### Prisma **e** supabase-js — como coexistem

- **Prisma** é a fonte de verdade do **schema** e roda **migrations**. Usado em Server Actions
  para escritas complexas e transações, sempre **após** o guard de autorização da aplicação
  injetar o `organizationId`.
- **supabase-js** é usado para leituras sujeitas a **RLS** por sessão do usuário e para
  **Realtime/Storage**. O JWT do Supabase Auth carrega os claims (`organization_id`, `role`) que
  as políticas RLS avaliam.
- Regra prática: *mutação transacional de domínio → Prisma; leitura reativa/colaborativa e
  arquivos → supabase-js.* Ambos apontam para o mesmo Postgres.

## Multi-tenancy

- Entidade raiz **`Organization`** (igreja). Opcional **`Campus`** para igrejas com múltiplas
  sedes (o campo "Campus" aparece nos relatórios).
- Toda tabela de negócio carrega `organization_id` (FK) e é protegida por política RLS
  `organization_id = auth.jwt() ->> 'organization_id'`.
- Claims de JWT populados no login (via Supabase Auth Hooks / `app_metadata`).

## Segurança

- **RLS** em todas as tabelas (deny-by-default; políticas por papel).
- **RBAC** de aplicação como segunda camada (ver [07-permissoes.md](07-permissoes.md)).
- Validação **Zod** em toda fronteira (Server Action / Route Handler).
- **Storage** privado; download por **URL assinada** de curta duração.
- Segredos só no servidor; `SUPABASE_SERVICE_ROLE_KEY` nunca no cliente.

## Performance & escala

- RSC + cache de dados do Next; `revalidateTag`/`revalidatePath` em mutações.
- **Connection pooling** do Supabase (PgBouncer) para o Prisma em serverless.
- Índices em todas as FKs e colunas de filtro de relatório (ver
  [04-banco-de-dados.md](04-banco-de-dados.md)).
- Paginação por cursor em listas longas (biblioteca, histórico de execuções).
- Imagens via `next/image`; áudio com streaming por range requests.

## Observabilidade & qualidade

- Erros: Sentry (client + server). Logs estruturados nas Server Actions.
- Testes: Vitest (unidade/serviços), Testing Library (componentes), Playwright (e2e dos fluxos
  críticos: planejar culto, montar setlist, fechar escala).
- CI: lint (ESLint) + typecheck + testes + `prisma validate` a cada PR.
- Convenções: Prettier, ESLint estrito, Conventional Commits, Husky + lint-staged.

## Ambientes

`local` (Supabase local/CLI) → `preview` (branch → deploy Vercel + projeto Supabase de staging)
→ `production`. Migrations aplicadas por pipeline; nunca manualmente em produção.
