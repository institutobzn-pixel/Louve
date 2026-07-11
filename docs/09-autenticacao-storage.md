# 09 · Autenticação e Armazenamento de Arquivos

## Autenticação

**Supabase Auth** (JWT). Estratégia:

- **Métodos:** e-mail/senha + magic link; social (Google) opcional. Convite por e-mail para
  entrada de membros na organização.
- **Sessão:** cookies httpOnly gerenciados pelo helper SSR do Supabase (`@supabase/ssr`) no
  Next.js — sessão disponível em Server Components, Actions e middleware.
- **Claims customizados:** um **Auth Hook (custom access token)** injeta no JWT
  `organization_id` e `roles[]` a partir de `user_roles`. As políticas RLS e o RBAC leem esses
  claims — sem consultar o banco a cada request.
- **Onboarding/tenant:** ao criar organização, o criador vira `ADMIN_GERAL`; demais entram por
  convite já vinculados ao `organization_id`.
- **Vínculo músico↔login:** `Member.userId` liga o cadastro de músico a um usuário autenticável
  (um membro pode existir sem login e ser convidado depois).

### Fluxo de sessão (App Router)

```
Request → middleware.ts
  → lê/atualiza sessão Supabase (cookies)
  → resolve { userId, organizationId, roles }
  → bloqueia rota por papel; redireciona MUSICO → (musico)
  → segue para RSC/Action com contexto de tenant
```

### Guards

- `getSession()` / `requireUser()` em Server Components e Actions.
- `authorize(action, resource)` (deny-by-default) antes de qualquer mutação (ver
  [07-permissoes.md](07-permissoes.md)).
- `SUPABASE_SERVICE_ROLE_KEY` **somente** em código de servidor confiável (jobs/seed), nunca
  exposto ao cliente.

## Armazenamento de arquivos musicais

Arquivos são o ativo pesado do produto: **playback, partituras, multitracks, guias vocais, cifras,
letras**. Estratégia com **Supabase Storage**.

### Buckets

| Bucket | Visibilidade | Conteúdo |
|---|---|---|
| `song-files` | privado | playback, multitracks, partituras, guias (arquivos das versões) |
| `avatars` | privado | fotos de membros/usuários |
| `service-assets` | privado | referências de paleta, imagens de mapa de palco |
| `org-public` | público | logo temporário e estáticos da organização |

### Convenção de caminho (multi-tenant)

```
song-files/{organizationId}/{songId}/{versionId}/{fileKind}/{uuid}-{filename}
avatars/{organizationId}/{memberId}/{uuid}.jpg
service-assets/{organizationId}/{serviceId}/{uuid}-{filename}
```

O prefixo por `organizationId` habilita políticas de Storage por tenant e organiza o ciclo de vida.

### Upload (URLs assinadas)

1. Cliente pede `POST /api/storage/sign-upload` com `{ kind, songId, versionId, filename, size,
   mime }`.
2. Servidor valida permissão + tipo/tamanho e retorna **URL assinada** (curta duração) + caminho
   final.
3. Cliente envia o arquivo direto ao Storage (não passa pelo servidor de app → escala melhor).
4. Concluído o upload, `attachSongFile(versionId, {...})` grava o metadado em `song_files`.

### Download / streaming

- Acesso sempre por **URL assinada** de curta duração (`/api/storage/sign-download`), nunca por
  URL pública.
- Áudio (WaveSurfer) via **range requests** para streaming/seek eficientes.
- Cache de curta duração no cliente; revogação natural pela expiração da assinatura.

### Validação e limites

- Tipos permitidos por `FileKind` (áudio: mp3/wav/m4a; partitura: pdf; multitrack: zip/stems).
- Limite de tamanho por tipo (config em `src/config/storage.ts`); rejeição no `sign-upload`.
- Antivírus/verificação assíncrona opcional (Edge Function) antes de marcar arquivo como pronto.

### Políticas RLS de Storage

Políticas no `storage.objects` restringem por prefixo de tenant:

```sql
create policy "tenant_read_song_files"
on storage.objects for select
using (
  bucket_id = 'song-files'
  and (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')
);
```

Análogas para insert/update/delete e demais buckets. Segurança do arquivo vive no Storage, não
apenas na aplicação.

## Variáveis de ambiente (`.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # somente servidor
DATABASE_URL=                    # Postgres (pooled, p/ Prisma)
DIRECT_URL=                      # conexão direta (migrations)
NEXT_PUBLIC_APP_URL=
```
