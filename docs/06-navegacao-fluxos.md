# 06 · Navegação e Fluxos de Tela

## Dois aplicativos, uma base

O produto tem **duas experiências** sobre o mesmo backend:

1. **App de Gestão** (`(dashboard)`) — líder, coordenador, pastor, secretário, técnico, admin.
2. **App do Músico** (`(musico)`) — visão restrita, focada em execução (ver [07-permissoes.md](07-permissoes.md)).

## Menu principal (Gestão)

```
Dashboard · Planejamento · Biblioteca Musical · Implantação de Músicas ·
Equipe · Relatórios · Comunicação · Configurações
```

Sidebar fixa no desktop (ícones Lucide + rótulo), colapsável; no mobile vira menu/off-canvas.

## Mapa de rotas

| Rota | Tela | Papéis |
|---|---|---|
| `/dashboard` | Visão geral: próximos cultos, pendências, atalhos | Gestão |
| `/planejamento` | Agenda/lista de cultos (FullCalendar + lista) | Gestão |
| `/planejamento/[serviceId]` | **Página exclusiva do culto** (abas) | Gestão |
| `/biblioteca` | Biblioteca musical (busca, filtros, tags) | Gestão |
| `/biblioteca/[songId]` | Detalhe da música (versões, arquivos, histórico) | Gestão |
| `/implantacao` | Pipeline kanban de implantação | Coord/Líder |
| `/equipe` | Lista de músicos e perfis | Gestão |
| `/equipe/[memberId]` | Perfil do músico (instrumentos, disponibilidade, histórico) | Gestão |
| `/relatorios` | Mais cantadas · Saturação · Ranking | Gestão |
| `/comunicacao` | Avisos/mensagens | Gestão |
| `/configuracoes` | Organização, campi, papéis, tipos de culto | Admin |
| `/agenda` | (Músico) Minha Agenda | Músico |
| `/meus-cultos` | (Músico) Meus Cultos / Minha Escala | Músico |
| `/ensaio/[serviceId]` | (Músico) Modo Ensaio da sua função | Músico |
| `/perfil` | (Músico) Perfil, disponibilidade | Músico |

## Fluxo central — "Planejar o culto"

O conceito do produto materializado. Fluxo linear do sistema:

```
Dashboard → Planejamento → Culto → Setlist → Escala → Modo Ensaio → Execução → Relatórios
```

### Página exclusiva do Culto — abas

Cada culto abre em `/planejamento/[serviceId]` com **abas** (uma superfície, contexto único):

1. **Informações** — data, horário, tipo, pastor, ministro de louvor, tema, observações.
2. **Setlist** — lista drag-and-drop; cada item com versão, tom, BPM, duração, observações.
   Ao adicionar música, escolher entre **Biblioteca Oficial** ou **Músicas em Implantação**.
3. **Escala** — colunas por categoria (Liderança, Voz, Ritmo, Harmonia, Cordas, Sopros Madeira,
   Sopros Metais, Percussão Orquestral, Produção); atribuição de músicos com status de
   confirmação e **sugestão automática de substituições**.
4. **Modo Ensaio** — prévia do conteúdo por função (o músico verá a versão focada dele).
5. **Paleta de Roupas** — cores, observações, referência visual.
6. **Mapa de Palco** — posicionamento gráfico (drag-and-drop) dos músicos.
7. **Avisos** — mensagens específicas daquele culto.
8. **Checklist** — Escala completa · Setlist completo · Material enviado · Paleta definida ·
   Mapa definido · Passagem de som · Confirmações.

### Micro-fluxos

- **Adicionar música ao setlist:** botão → `SongPicker` (tabs Biblioteca / Implantação) → escolhe
  versão e tom → item entra na lista → reordenável por arraste.
- **Fechar escala (modelo sem convite):** por categoria, escolher músico — as sugestões mostram
  a **indisponibilidade** registrada pelo próprio músico, mas **não impedem** a escalação (o
  integrante aparece com selo "Indisponível"). Escalar já efetiva: o músico recebe a
  **notificação "Nova escala"** ao abrir o app, e a gestão vê o ✓✓ de visualizado. O sistema
  sugere substitutos quando o líder precisar trocar alguém.
- **Implantar música:** no kanban, arrastar card até **Implantada** → música migra para a
  Biblioteca (mantendo histórico) e passa a aparecer na aba "Biblioteca Oficial" do SongPicker.

## Fluxo do Músico

```
Login → Minha Agenda → Meus Cultos → Minha Escala → Modo Ensaio (só a minha função)
        ↳ Notificação de nova escala · Atualizar disponibilidade · Avisos · Perfil · Biblioteca
```

O músico vê **apenas** o conteúdo da sua função no Modo Ensaio (ex.: violinista vê partitura /
playback / multitrack / clique / loop / observações; vocalista vê letra / guia vocal / playback /
tom / harmonias; baterista vê clique / estrutura / playback sem bateria). **Nada além disso.**

## Padrões de navegação e estado

- **Breadcrumbs** contextuais em telas de detalhe.
- **Command palette** (⌘K) para saltar entre cultos, músicas e músicos (sensação Linear/Notion).
- Estado de abas e drag na URL/`stores` (Zustand) — recarregar preserva contexto.
- **Otimista + Realtime:** edições aparecem na hora; colaboração sincroniza via Supabase Realtime.
- **Empty states** elegantes e orientados à ação em toda lista vazia.
