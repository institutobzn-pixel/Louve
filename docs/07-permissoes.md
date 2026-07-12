# 07 · Permissões (RBAC)

Modelo **RBAC** com dupla camada de segurança:

1. **RLS no PostgreSQL** — isolamento de tenant e regras de linha (fonte de verdade de segurança).
2. **RBAC de aplicação** — guards em Server Actions/Route Handlers + gating de UI.

Cada perfil possui **permissões independentes** (requisito do prompt).

## Papéis

| Chave | Papel | Escopo |
|---|---|---|
| `ADMIN_GERAL` | Administrador Geral | Governança total do tenant (billing, papéis, campi) |
| `ADMIN` | Administrador | Administração operacional |
| `LIDER_LOUVOR` | Líder de Louvor | Planejar cultos ponta a ponta |
| `COORD_MUSICAL` | Coordenador Musical | Biblioteca, implantação, ensaios |
| `PASTOR` | Pastor | Visão do culto, tema, direção |
| `SECRETARIO` | Secretário | Cadastros, comunicação, relatórios |
| `TECNICO_SOM` | Técnico de Som | Produção, mapa de palco, materiais técnicos |
| `MUSICO` | Músico | Visão restrita de execução |

## Matriz de permissões (resumo)

Legenda: **C** criar · **R** ler · **U** editar · **D** excluir · **—** sem acesso · **R*** leitura
restrita (apenas próprio).

| Recurso | Adm.Geral | Admin | Líder | Coord | Pastor | Secret. | Técnico | Músico |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Organização/Campus | CRUD | RU | R | R | R | R | R | — |
| Papéis/Usuários | CRUD | CRU | R | R | — | R | — | — |
| Culto (planejamento) | CRUD | CRUD | CRUD | RU | R | R | R | R* |
| Setlist | CRUD | CRUD | CRUD | CRUD | R | R | R | R* |
| Escala | CRUD | CRUD | CRUD | CRU | R | R | R | R* |
| Biblioteca Musical | CRUD | CRUD | CRU | CRUD | R | R | R | R |
| Implantação | CRUD | CRUD | CRU | CRUD | R | — | R | — |
| Equipe | CRUD | CRUD | CRU | CRU | R | CRU | R | R* |
| Mapa de Palco | CRUD | CRUD | CRU | RU | R | — | CRU | R* |
| Paleta de Roupas | CRUD | CRUD | CRU | RU | R | RU | R | R* |
| Avisos/Comunicação | CRUD | CRUD | CRU | CRU | R | CRU | R | R |
| Checklist | CRUD | CRUD | CRU | CRU | R | RU | RU | R* |
| Relatórios | R | R | R | R | R | R | — | — |
| Modo Ensaio | R | R | R | R | R | — | R | R* |
| Disponibilidade/Presença | RU | RU | RU | RU | — | RU | — | **CRU (própria)** |

> A matriz canônica vive em código (`src/config/permissions.ts`) e é persistida em `Role.permissions`
> (JSON), permitindo ajuste fino por organização sem deploy.

## App do Músico — visão restrita

O `MUSICO` acessa **somente** o app `(musico)`:

- Minha Agenda · Meus Cultos · Minha Escala · Modo Ensaio · Biblioteca Musical · Avisos · Perfil
- Ações: **visualizar a escala** (notificação "Nova escala" ao abrir o app) e **atualizar a
  própria disponibilidade** — a indisponibilidade aparece para quem monta a escala, sem
  bloquear a escalação.
- **Nada além disso** — regra reforçada por RLS (só lê `assignments` onde `member.userId = auth.uid`)
  e por roteamento (middleware redireciona `MUSICO` para `(musico)`).

## Aplicação técnica

- **JWT claims:** `organization_id` e `roles[]` populados via Supabase Auth Hook (custom access
  token) a partir de `user_roles`.
- **Middleware** (`src/middleware.ts`): resolve sessão, injeta contexto de tenant, bloqueia rotas
  por papel, redireciona músico.
- **Guard de servidor:** helper `authorize(action, resource)` chamado no início de toda Server
  Action; nega por padrão (deny-by-default).
- **RLS:** políticas por tabela combinam isolamento de tenant + regra de papel (ex.: músico só vê
  o próprio; líder vê tudo do tenant).
- **UI gating:** `can(user, 'update', 'setlist')` esconde/desabilita controles — mas a segurança
  real está no servidor/RLS, nunca só na UI.
