-- Isolamento multi-tenant (docs/04-banco-de-dados.md).
-- Todas as tabelas de negócio negam acesso por padrão e só liberam linhas
-- da organização presente no JWT (claim organization_id).
--
-- Tabelas com organization_id direto:
do $$
declare
  t text;
begin
  foreach t in array array[
    'campuses','users','members','instruments','service_types','services',
    'songs','tags','song_executions','announcements'
  ]
  loop
    execute format('alter table %I enable row level security', t);

    execute format($sql$
      create policy tenant_select on %I for select
        using (organization_id = (auth.jwt() ->> 'organization_id'))
    $sql$, t);

    execute format($sql$
      create policy tenant_mutation on %I for all
        using (organization_id = (auth.jwt() ->> 'organization_id'))
        with check (organization_id = (auth.jwt() ->> 'organization_id'))
    $sql$, t);
  end loop;
end $$;

-- A própria organização: o usuário só enxerga a sua.
alter table organizations enable row level security;
create policy org_select on organizations for select
  using (id = (auth.jwt() ->> 'organization_id'));

-- Tabelas filhas (herdam o tenant via FK — política via join):
-- setlists/setlist_items -> services; assignments -> services;
-- clothing_palettes/stage_maps/notices/checklists -> services;
-- song_versions/song_files -> songs; etc.
-- Exemplo (setlists):
alter table setlists enable row level security;
create policy tenant_setlists on setlists for all
  using (exists (
    select 1 from services s
    where s.id = setlists.service_id
      and s.organization_id = (auth.jwt() ->> 'organization_id')
  ));

-- Demais tabelas filhas seguem o mesmo padrão e serão adicionadas nos
-- arquivos das fases em que entram em uso (002-, 003-, ...).

-- Tabelas globais (roles, instrument_categories): somente leitura para
-- usuários autenticados.
alter table roles enable row level security;
create policy roles_read on roles for select to authenticated using (true);

alter table instrument_categories enable row level security;
create policy categories_read on instrument_categories for select to authenticated using (true);
