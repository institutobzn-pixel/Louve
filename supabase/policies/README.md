# Políticas RLS

SQL das políticas de Row Level Security, versionado junto do código
(ver docs/04-banco-de-dados.md e docs/07-permissoes.md).

- `001-tenant-isolation.sql` — isolamento por organização em todas as tabelas de negócio.

Aplicação: via SQL Editor do Supabase ou `supabase db push` no pipeline.
As políticas por papel (ex.: músico lê apenas os próprios assignments) entram
junto com as fases que as utilizam.
