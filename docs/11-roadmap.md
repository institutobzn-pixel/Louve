# 11 · Roadmap de Módulos

Implementação **incremental e validada**. Conforme a metodologia do prompt: **cada etapa aguarda
validação** antes da próxima. Nenhum código de aplicação começa antes da aprovação desta
arquitetura.

## Fase 0 — Fundação (pré-requisito de tudo)

**Objetivo:** esqueleto executável e Design System vivo.
- Setup Next.js + TypeScript + Tailwind + shadcn/ui com os **tokens** do Design System.
- `AppShell`, `Sidebar`, `Topbar`, tema dark/light (`next-themes`), logo temporário.
- Prisma + Supabase conectados; `schema.prisma` inicial; primeira migration.
- **Seeds:** papéis (8), categorias de instrumento (9) e a **lista completa de instrumentos** do
  prompt.
- Auth Supabase (login, sessão SSR, middleware, claims de tenant/role).
- CI (lint + typecheck + testes) e Storybook opcional do Design System.

**Aceite:** logar, ver shell nos dois temas, RLS isolando tenant, seeds aplicados.

## Fase 1 — Módulo Culto (PRIMEIRO módulo a implementar)

> É o coração do produto — começa aqui.

**Objetivo:** planejar um culto com a aba **Informações** e a estrutura de abas.
- `/planejamento` (agenda FullCalendar + lista) e `/planejamento/[serviceId]`.
- CRUD de Culto; `ServiceTabs`; aba **Informações** (data, horário, tipo, pastor, ministro,
  tema, observações).
- `ServiceCard`, `ServiceStatusPill`, `duplicateService`.

**Aceite:** criar, editar, listar e abrir um culto; abas navegáveis (demais vazias com
`EmptyState`).

## Fase 2 — Setlist

- `SetlistBoard` drag-and-drop (dnd-kit); `SetlistItemRow` (versão/tom/BPM/duração/obs).
- `SongPicker` com tabs **Biblioteca Oficial** / **Músicas em Implantação**.
- Reordenação persistida (`reorderSetlist`); duração total.

**Aceite:** montar setlist arrastando, editar tom por item, escolher fonte da música.

## Fase 3 — Equipe & Biblioteca (bases de dados de domínio)

- **Equipe:** CRUD de membros, instrumentos principais/secundários, nível, disponibilidade,
  histórico, aniversário.
- **Biblioteca:** CRUD de músicas, versões e **arquivos** (upload por URL assinada, WaveSurfer).

**Aceite:** cadastrar músico com instrumentos; cadastrar música com versão e playback tocável.

## Fase 4 — Escala + Sugestão de Substituições

- `ScheduleBoard` por categoria; `MemberPicker` filtrado por função × disponibilidade.
- Status de confirmação; `suggestSubstitutes` (função × disponibilidade × histórico).

**Aceite:** fechar escala por categoria; receber sugestão de substituto para slot vago.

## Fase 5 — App do Músico + Modo Ensaio Inteligente

- App `(musico)`: Minha Agenda, Meus Cultos, Minha Escala, Perfil, Avisos.
- **Confirmar presença** e **atualizar disponibilidade** (refletem no checklist da gestão).
- **Modo Ensaio** por função (violinista/vocalista/baterista… conteúdo específico). Visão
  restrita reforçada por RLS.

**Aceite:** músico vê só o que lhe cabe, confirma presença e abre seu Modo Ensaio.

## Fase 6 — Facetas do Culto

- **Checklist** (itens semeados por culto). **Avisos**. **Paleta de Roupas**. **Mapa de Palco**
  (canvas dnd).

**Aceite:** checklist reflete o estado real; paleta e mapa editáveis; avisos publicados.

## Fase 7 — Implantação de Músicas

- Kanban `ImplementationBoard` (Em análise → Aprovada → Em estudo → Ensaiando → Pronta →
  Implantada).
- `promoteToLibrary` ao chegar em **Implantada** (migra para biblioteca preservando histórico).

**Aceite:** mover card pelo pipeline; ao implantar, música aparece na Biblioteca Oficial.

## Fase 8 — Execução & Relatórios

- Registro de execuções (`song_executions`) ao concluir culto.
- Relatórios: **Mais cantadas** (3/12 meses), **Índice de Saturação** (semáforo), **Ranking**,
  recortes por tipo/pastor/ministro/evento/campus (Recharts).

**Aceite:** relatórios refletem execuções reais; semáforo de saturação correto.

## Fase 9 — Comunicação, Realtime & Polimento

- Comunicação (avisos segmentados por papel).
- Realtime colaborativo (setlist/escala/kanban), microanimações finais, empty/skeleton/erros,
  responsividade completa, acessibilidade AA.

## Fase 10 — SaaS (comercialização)

- Billing (planos/assinaturas), onboarding multi-campus, limites por plano, página pública,
  métricas de produto.

---

## Dados-semente (referência do prompt)

**Categorias e instrumentos** a semear na Fase 0:

- **Liderança:** Ministro de Louvor
- **Voz:** Lead Vocal, Soprano 1, Soprano 2, Contralto, Tenor 1, Tenor 2, Baixo, Backing Vocal
- **Ritmo:** Bateria, Percussão, Cajon, Pandeiro, Tambor
- **Harmonia:** Violão, Guitarra, Teclado, Piano, Ukulele, Acordeon, Órgão
- **Cordas:** Violino, Viola, Violoncelo, Contrabaixo Acústico, Contrabaixo Elétrico, Harpa
- **Sopros Madeira:** Flauta, Clarinete, Oboé, Saxofone, Fagote
- **Sopros Metais:** Trompete, Trombone, Tuba, Trompa, Flugelhorn, Eufônio
- **Percussão Orquestral:** Xilofone, Marimba, Glockenspiel, Tímpanos
- **Produção:** Técnico de Som, Mídia, Transmissão, Iluminação, Fotografia, Vídeo

**Papéis:** Administrador Geral, Administrador, Líder de Louvor, Coordenador Musical, Pastor,
Secretário, Técnico de Som, Músico.

**Itens do checklist (por culto):** Escala completa · Setlist completo · Material enviado · Paleta
definida · Mapa definido · Passagem de som · Confirmações.
