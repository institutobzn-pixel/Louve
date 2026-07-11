# 10 · Componentes Reutilizáveis

Regra de ouro: **nunca duplicar**. Todo padrão visual/comportamental vira componente
compartilhado. Três níveis:

1. **UI (Design System)** — `src/components/ui` — primitivos shadcn/ui customizados aos tokens.
2. **Compartilhados** — `src/components/shared` e `src/components/layout` — padrões de app.
3. **Domínio** — `src/features/<dominio>/components` — específicos de negócio, compostos a partir
   dos níveis 1 e 2.

## Nível 1 — UI (shadcn/ui customizado)

`Button` · `IconButton` · `Card` · `Dialog` · `Sheet` · `Drawer` · `DropdownMenu` · `Popover` ·
`Tooltip` · `Tabs` · `Input` · `Textarea` · `Select` · `Combobox` · `Checkbox` · `Switch` ·
`RadioGroup` · `Slider` · `Badge` · `Avatar` · `AvatarGroup` · `Separator` · `ScrollArea` ·
`Skeleton` · `Toast/Sonner` · `Progress` · `Calendar` · `DatePicker` · `TimePicker` ·
`ColorSwatch` · `Kbd` · `ThemeToggle`.

Todos estilizados pelos tokens do [Design System](03-design-system.md); testados em dark/light.

## Nível 2 — Compartilhados

| Componente | Uso |
|---|---|
| `AppShell` | Layout raiz (sidebar/topbar/conteúdo) da gestão |
| `Sidebar` / `Topbar` / `BottomNav` | Navegação (bottom-nav no app do músico) |
| `PageHeader` | Título + descrição + ações + breadcrumbs |
| `SectionCard` | Cartão elegante padrão (borda + sombra discreta) |
| `DataTable` | Tabela com busca, ordenação, paginação por cursor, densidade |
| `EmptyState` | Estado vazio orientado à ação |
| `StatCard` / `KpiRow` | Métricas do dashboard |
| `Semaforo` | Selo verde/amarelo/vermelho (Índice de Saturação) |
| `FilterBar` | Filtros combináveis (biblioteca, relatórios) |
| `CommandPalette` | ⌘K — saltar entre cultos/músicas/músicos |
| `SortableList` | Lista drag-and-drop acessível (dnd-kit) — base de setlist/escala |
| `ConfirmDialog` | Confirmação de ações destrutivas |
| `FormField` | Wrapper RHF + Zod + mensagem de erro |
| `FileDropzone` / `UploadButton` | Upload com URL assinada + progresso |
| `AudioPlayer` | WaveSurfer: waveform, play, loop, seek, multitrack |
| `TagInput` | Entrada de tags |
| `Money`/`KeyBadge`/`BpmBadge`/`Duration` | Formatadores visuais (tom, BPM, duração) |

## Nível 3 — Domínio (por feature)

### service (Culto)
`ServiceHeader` · `ServiceTabs` · `ServiceInfoForm` · `ServiceStatusPill` · `ServiceCard` ·
`ServiceCalendar` (FullCalendar) · `DuplicateServiceButton`

### setlist
`SetlistBoard` (SortableList) · `SetlistItemRow` (versão/tom/BPM/duração/obs) · `SongPicker`
(tabs Biblioteca / Implantação) · `KeySelector` · `SetlistSummary` (duração total)

### schedule (Escala)
`ScheduleBoard` · `CategoryColumn` (Liderança, Voz, Ritmo, Harmonia, Cordas, Sopros Madeira,
Sopros Metais, Percussão Orquestral, Produção) · `SlotCard` · `MemberPicker` ·
`SubstituteSuggestions` · `AssignmentStatusBadge`

### library
`SongCard` · `SongDetail` · `VersionList` · `VersionEditor` · `FileList` · `SongFilters`

### implementation
`ImplementationBoard` (kanban dnd) · `StageColumn` · `SongImplCard` · `PromoteToLibraryAction`

### team
`MemberCard` · `MemberProfile` · `InstrumentPicker` · `AvailabilityEditor` · `MemberHistory`

### rehearsal (Modo Ensaio Inteligente)
`RehearsalView` — renderiza **apenas** o conteúdo da função:
- `RehearsalPanel.Violin` (partitura/playback/multitrack/clique/loop/obs)
- `RehearsalPanel.Vocal` (letra/guia/playback/tom/harmonias)
- `RehearsalPanel.Drums` (clique/estrutura/playback sem bateria)
- Genérico `RehearsalPanel` resolve o painel por categoria de instrumento.

### stage-map
`StageCanvas` (dnd) · `StagePin` · `StageLegend`

### palette
`PaletteEditor` (ColorSwatch) · `PalettePreview`

### checklist
`ChecklistPanel` · `ChecklistItemRow` (Escala/Setlist/Material/Paleta/Mapa/Passagem/Confirmações)

### reports
`MostPlayedChart` · `SaturationChart` (semáforo) · `RankingTable` · `ReportFilters` (Recharts;
seguir guia de dataviz do projeto para cores/temas)

### communication
`AnnouncementComposer` · `AnnouncementList` · `AudienceSelector`

## Diretrizes de composição

- Componentes de domínio **não** fazem fetch: recebem dados via props/RSC; mutam via Server
  Actions do próprio feature.
- Drag-and-drop sempre sobre `SortableList`/`dnd-kit` (setlist, escala, kanban, mapa) — uma base,
  vários usos.
- Toda lista tem `EmptyState`, `Skeleton` e estados de erro.
- Microanimações via Framer Motion, respeitando `prefers-reduced-motion`.
- Acessibilidade e temas (dark/light) são critério de "pronto" de cada componente.
