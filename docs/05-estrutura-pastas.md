# 05 · Estrutura de Pastas

Organização **feature-first**: cada domínio (culto, setlist, escala, biblioteca…) é uma pasta
autocontida em `src/features`, consumindo o Design System (`src/components/ui`) e a camada de
serviços de servidor (`src/server`). Isso força reuso e evita código duplicado.

```
.
├── prisma/
│   ├── schema.prisma              # fonte de verdade do schema (doc 04)
│   ├── migrations/
│   └── seed.ts                    # papéis, categorias e instrumentos padrão
├── supabase/
│   ├── config.toml
│   └── policies/                  # políticas RLS versionadas (SQL)
├── public/                        # logo temporário, ícones, estáticos
├── docs/                          # esta documentação
├── src/
│   ├── app/                       # Next.js App Router (ver doc 06)
│   │   ├── (marketing)/           # landing pública
│   │   ├── (auth)/                # login, callback, recuperação
│   │   ├── (dashboard)/           # app de GESTÃO (líder, coord, admin...)
│   │   │   ├── dashboard/
│   │   │   ├── planejamento/
│   │   │   │   ├── page.tsx        # lista/agenda de cultos
│   │   │   │   └── [serviceId]/    # página exclusiva do culto (abas)
│   │   │   ├── biblioteca/
│   │   │   ├── implantacao/
│   │   │   ├── equipe/
│   │   │   ├── relatorios/
│   │   │   ├── comunicacao/
│   │   │   └── configuracoes/
│   │   ├── (musico)/              # app do MÚSICO (visão restrita)
│   │   │   ├── agenda/
│   │   │   ├── meus-cultos/
│   │   │   ├── ensaio/
│   │   │   └── perfil/
│   │   ├── api/                   # Route Handlers (webhooks, uploads assinados)
│   │   ├── layout.tsx
│   │   └── globals.css            # tokens do Design System
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui customizado (Button, Card, Dialog…)
│   │   ├── layout/                # AppShell, Sidebar, Topbar, BottomNav
│   │   └── shared/                # EmptyState, PageHeader, DataTable, Semaforo…
│   │
│   ├── features/                  # DOMÍNIOS (feature-first)
│   │   ├── service/               # Culto (núcleo)
│   │   │   ├── components/         # ServiceHeader, ServiceTabs, InfoForm…
│   │   │   ├── hooks/
│   │   │   ├── actions.ts          # Server Actions do domínio
│   │   │   ├── queries.ts          # leituras (RSC)
│   │   │   └── schema.ts           # Zod
│   │   ├── setlist/               # SetlistBoard (drag-and-drop), SongPicker
│   │   ├── schedule/              # Escala: CategoryColumns, MemberPicker, sugestões
│   │   ├── library/              # Biblioteca Musical + versões/arquivos
│   │   ├── implementation/       # Pipeline kanban de implantação
│   │   ├── team/                 # Equipe/músicos
│   │   ├── rehearsal/            # Modo Ensaio Inteligente (por função)
│   │   ├── stage-map/           # Mapa de palco (dnd)
│   │   ├── palette/             # Paleta de roupas
│   │   ├── checklist/
│   │   ├── reports/            # Recharts + saturação
│   │   └── communication/
│   │
│   ├── server/
│   │   ├── db.ts                  # Prisma Client (singleton)
│   │   ├── supabase/              # clients server/client, auth helpers
│   │   ├── services/             # regras de negócio puras (por domínio)
│   │   ├── auth/                 # guards, RBAC, resolução de tenant
│   │   └── storage/              # URLs assinadas, uploads
│   │
│   ├── lib/                       # utils, formatadores (tom/BPM/duração), constantes
│   ├── stores/                    # Zustand (UI: drag state, modo ensaio, tema)
│   ├── hooks/                     # hooks genéricos (useMediaQuery, useRealtime…)
│   ├── types/                     # tipos compartilhados/derivados
│   └── config/                    # navegação, papéis, feature flags
│
├── tests/                         # e2e (Playwright) e helpers
├── .env.example
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Convenções

- **Feature-first:** UI, hooks, actions, queries e schema de um domínio ficam juntos em
  `src/features/<dominio>`. Nada de "utils gigante".
- **Barreira de servidor:** regra de negócio só em `src/server/services`; `actions.ts` orquestra
  (validação Zod → guard de permissão → serviço → revalidação).
- **UI burra, domínio esperto:** componentes recebem dados prontos; nenhuma query dentro de
  componente client.
- **Nomes:** componentes `PascalCase`, hooks `useX`, Server Actions `verboObjeto` (`createService`).
- **Import alias:** `@/` → `src/`.
- **Sem duplicação:** qualquer padrão repetido 2×+ vira componente/hook/serviço compartilhado.
