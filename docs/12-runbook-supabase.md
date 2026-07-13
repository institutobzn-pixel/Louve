# 12 · Runbook — Ativar o Supabase (autenticação + multi-tenant)

Passos para plugar um projeto Supabase real e ligar login, cadastro e
isolamento por igreja (Fase 10). O código já está pronto; aqui é a operação.

## 1. Variáveis de ambiente

Defina (no ambiente de execução ou em `.env`):

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
SUPABASE_SERVICE_ROLE_KEY=<service_role/secret key>   # só servidor
DATABASE_URL=postgresql://postgres.<ref>:<senha>@<host>.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<ref>:<senha>@<host>.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_APP_URL=https://<seu-dominio>
```

> Na senha da string de conexão, caracteres especiais precisam ser
> URL-encoded (ex.: `@` → `%40`).

## 2. Criar o schema no Supabase

Aplica todas as tabelas (usa `DIRECT_URL`):

```bash
npx prisma migrate deploy
```

## 3. Semear papéis e categorias (sem organização demo)

```bash
SEED_DEMO=false npm run db:seed
```

Cria os 8 papéis, as 9 categorias e a lista de instrumentos padrão —
a organização real é criada no cadastro.

## 4. Row Level Security (defesa em profundidade)

O app já isola por tenant na camada de serviço (todas as queries Prisma
filtram por `organizationId`). As políticas RLS são a segunda camada.
Aplique os arquivos de `supabase/policies/` no **SQL Editor** do Supabase
(ou por pipeline):

- `001-tenant-isolation.sql`
- `002-auth-hook.sql` (claims de JWT — opcional, para leituras via supabase-js)

## 5. Criar a primeira conta

Acesse `/signup` no app: informe o nome da igreja, seu nome, e-mail e senha.
Isso cria a organização, o usuário **Administrador Geral**, e provisiona o
catálogo de instrumentos e tipos de culto. Você já entra logado.

## 6. Storage (arquivos musicais)

Com `SUPABASE_SERVICE_ROLE_KEY` definido, os uploads passam a usar o
**Supabase Storage** automaticamente (bucket `song-files`). Crie o bucket
`song-files` (privado) no painel do Supabase. Sem as credenciais, o driver
local (`.uploads/`) continua sendo usado em desenvolvimento.

## Notas

- Enquanto as variáveis do Supabase não estiverem definidas, o app roda em
  **modo de desenvolvimento**: sem exigir login, usando a organização do seed
  e o seletor "visualizar como" no App do Músico.
- Para desabilitar a confirmação de e-mail (cadastro direto), o onboarding já
  usa a API admin com `email_confirm: true`; nenhum passo extra é necessário.
