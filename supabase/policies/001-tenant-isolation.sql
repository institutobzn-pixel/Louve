-- Isolamento multi-tenant (docs/04-banco-de-dados.md).
-- Colunas em camelCase (padrão do Prisma, ex.: "organizationId"), idempotente.
-- Observação: para provisionar o banco inteiro de uma vez, use
-- `supabase/setup.sql` (schema + dados + este RLS + auth hook).

-- Tabelas com "organizationId" direto:
do $$
declare t text;
begin
  foreach t in array array[
    'campuses','users','members','instruments','service_types','services',
    'songs','tags','song_executions','announcements'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_select on %I', t);
    execute format('drop policy if exists tenant_mutation on %I', t);
    execute format($p$create policy tenant_select on %I for select
      using ("organizationId" = (auth.jwt() ->> 'organization_id'))$p$, t);
    execute format($p$create policy tenant_mutation on %I for all
      using ("organizationId" = (auth.jwt() ->> 'organization_id'))
      with check ("organizationId" = (auth.jwt() ->> 'organization_id'))$p$, t);
  end loop;
end $$;

-- A própria organização:
alter table "organizations" enable row level security;
drop policy if exists org_select on "organizations";
create policy org_select on "organizations" for select
  using ("id" = (auth.jwt() ->> 'organization_id'));

-- Tabelas filhas de "services" (via "serviceId"):
do $$
declare t text;
begin
  foreach t in array array[
    'setlists','assignments','clothing_palettes','stage_maps','notices','checklists'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_child on %I', t);
    execute format($p$create policy tenant_child on %I for all using (exists (
      select 1 from "services" s where s.id = %I."serviceId"
      and s."organizationId" = (auth.jwt() ->> 'organization_id')))$p$, t, t);
  end loop;
end $$;

-- Netos (via a tabela-pai):
alter table "setlist_items" enable row level security;
drop policy if exists tenant_child on "setlist_items";
create policy tenant_child on "setlist_items" for all using (exists (
  select 1 from "setlists" s join "services" sv on sv.id = s."serviceId"
  where s.id = "setlist_items"."setlistId"
  and sv."organizationId" = (auth.jwt() ->> 'organization_id')));

alter table "stage_positions" enable row level security;
drop policy if exists tenant_child on "stage_positions";
create policy tenant_child on "stage_positions" for all using (exists (
  select 1 from "stage_maps" m join "services" sv on sv.id = m."serviceId"
  where m.id = "stage_positions"."stageMapId"
  and sv."organizationId" = (auth.jwt() ->> 'organization_id')));

alter table "checklist_items" enable row level security;
drop policy if exists tenant_child on "checklist_items";
create policy tenant_child on "checklist_items" for all using (exists (
  select 1 from "checklists" c join "services" sv on sv.id = c."serviceId"
  where c.id = "checklist_items"."checklistId"
  and sv."organizationId" = (auth.jwt() ->> 'organization_id')));

-- Tabelas filhas de "songs" (via "songId"):
do $$
declare t text;
begin
  foreach t in array array['song_versions','song_tags','song_implementations'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_child on %I', t);
    execute format($p$create policy tenant_child on %I for all using (exists (
      select 1 from "songs" s where s.id = %I."songId"
      and s."organizationId" = (auth.jwt() ->> 'organization_id')))$p$, t, t);
  end loop;
end $$;

alter table "song_files" enable row level security;
drop policy if exists tenant_child on "song_files";
create policy tenant_child on "song_files" for all using (exists (
  select 1 from "song_versions" v join "songs" s on s.id = v."songId"
  where v.id = "song_files"."versionId"
  and s."organizationId" = (auth.jwt() ->> 'organization_id')));

-- Tabelas filhas de "members" (via "memberId"):
do $$
declare t text;
begin
  foreach t in array array['member_instruments','availability'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_child on %I', t);
    execute format($p$create policy tenant_child on %I for all using (exists (
      select 1 from "members" m where m.id = %I."memberId"
      and m."organizationId" = (auth.jwt() ->> 'organization_id')))$p$, t, t);
  end loop;
end $$;

-- user_roles (via "userId"):
alter table "user_roles" enable row level security;
drop policy if exists tenant_child on "user_roles";
create policy tenant_child on "user_roles" for all using (exists (
  select 1 from "users" u where u.id = "user_roles"."userId"
  and u."organizationId" = (auth.jwt() ->> 'organization_id')));

-- Tabelas globais (leitura para autenticados):
alter table "roles" enable row level security;
drop policy if exists roles_read on "roles";
create policy roles_read on "roles" for select to authenticated using (true);

alter table "instrument_categories" enable row level security;
drop policy if exists categories_read on "instrument_categories";
create policy categories_read on "instrument_categories" for select to authenticated using (true);
