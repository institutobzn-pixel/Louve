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

## 2. Provisionar o banco — caminho fácil (recomendado)

Um único arquivo faz tudo (schema + papéis + categorias + RLS + auth hook),
sem terminal e sem conexão direta ao Postgres:

1. No painel do Supabase → **SQL Editor** → **New query**.
2. Cole todo o conteúdo de **`supabase/setup.sql`**.
3. Clique em **Run**.

É idempotente (pode rodar de novo sem quebrar). Depois, habilite o hook em
**Authentication → Hooks → Custom Access Token** apontando para
`public.custom_access_token_hook`.

> Testado contra Postgres: 29 tabelas, 8 papéis, 9 categorias, 39 políticas
> e o auth hook, sem erros.

### Alternativa via terminal (máquina com acesso direto ao banco)

```bash
npx prisma migrate deploy            # cria o schema
SEED_DEMO=false npm run db:seed      # papéis + categorias (sem org demo)
```
E aplique `supabase/policies/001-*.sql` e `002-*.sql` no SQL Editor.

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
