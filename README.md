# Plataforma de Gestão para Ministérios de Louvor

> Sistema completo de **planejamento ministerial** para igrejas — não é um app de escalas.
> O coração do sistema é o **PLANEJAMENTO**: o usuário nunca "cria uma escala", ele **planeja o culto**.

Produto premium, arquitetura profissional, código limpo e escalável, preparado para
comercialização mundial como SaaS multi-tenant.

---

## Status do projeto

🟣 **Fase 10 — SaaS / Autenticação (código pronto; ativar via runbook)** · Fases 0–9 aprovadas ✅

Autenticação real com **Supabase Auth** e multi-tenant: telas de **login** e **cadastro de
igreja** (onboarding cria a organização + o admin e provisiona o catálogo), **gate de
rotas** no middleware (sem sessão → `/login`; músico → app do músico), resolução de tenant
por sessão (`getCurrentOrganization`/`getCurrentMember` leem o usuário logado), botão de
**sair** e políticas **RLS** + **Auth Hook** de claims. Tudo isolado atrás de um _flag_: sem
as variáveis do Supabase, o app roda em **modo de desenvolvimento** (sem login).

**Para ativar:** siga o [Runbook do Supabase](docs/12-runbook-supabase.md) — definir as
variáveis, `prisma migrate deploy`, `SEED_DEMO=false npm run db:seed`, aplicar o SQL de
`supabase/policies/` e cadastrar a primeira conta em `/signup`.

Este é o **produto completo** do prompt-mestre: todos os módulos, o app do músico e a
camada SaaS. Billing e Realtime colaborativo ficam como evolução natural sobre esta base.

### Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Supabase
npm run db:migrate     # cria as tabelas
npm run db:seed        # papéis + categorias de instrumento
npm run dev            # http://localhost:3000
```

> Sem Supabase configurado o app também roda (`npm run dev`) — o shell e as telas
> funcionam; apenas login e dados reais dependem das credenciais.

## Documentação

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Visão de Produto](docs/01-visao-produto.md) | Conceito, personas, princípios, jobs-to-be-done |
| 02 | [Arquitetura](docs/02-arquitetura.md) | Stack, camadas, multi-tenant, decisões técnicas |
| 03 | [Design System](docs/03-design-system.md) | Identidade visual, tokens, componentes, temas |
| 04 | [Banco de Dados](docs/04-banco-de-dados.md) | Entidades, relacionamentos, schema Prisma, RLS |
| 05 | [Estrutura de Pastas](docs/05-estrutura-pastas.md) | Organização do monorepo e do app Next.js |
| 06 | [Navegação e Fluxos](docs/06-navegacao-fluxos.md) | Mapa de telas, rotas, fluxo do planejamento |
| 07 | [Permissões](docs/07-permissoes.md) | Papéis, matriz de permissões, RBAC |
| 08 | [APIs](docs/08-apis.md) | Contratos, Server Actions, Route Handlers, Realtime |
| 09 | [Autenticação e Storage](docs/09-autenticacao-storage.md) | Auth, sessão, upload e armazenamento de arquivos musicais |
| 10 | [Componentes Reutilizáveis](docs/10-componentes.md) | Catálogo do Design System e componentes de domínio |
| 11 | [Roadmap de Módulos](docs/11-roadmap.md) | Ordem de implementação e critérios de aceite |

## Stack

**Frontend:** Next.js · React · TypeScript · Tailwind CSS · shadcn/ui · Zustand · Recharts · FullCalendar · WaveSurfer · React Hook Form · Zod
**Backend:** Supabase (PostgreSQL · Auth · Storage · Realtime) · Prisma

## Princípios inegociáveis

- Reutilizar componentes — **nunca** duplicar código.
- Sempre escolher a solução mais escalável.
- Documentar tudo.
- Aparência premium (Linear · Notion · Figma · Spotify · Apple · Stripe Dashboard).
- Dark Mode + Light Mode, totalmente responsivo.
