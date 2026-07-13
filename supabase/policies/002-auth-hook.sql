-- Custom Access Token Hook (docs/09): injeta organization_id e roles no JWT,
-- para que as políticas RLS (001) e leituras via supabase-js reconheçam o
-- tenant e o papel do usuário.
--
-- Após aplicar, habilite o hook em: Authentication → Hooks →
-- "Custom Access Token" → apontando para public.custom_access_token_hook.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  v_org text;
  v_roles text[];
begin
  select u."organizationId"
    into v_org
    from public.users u
   where u.id = (event ->> 'user_id');

  select coalesce(array_agg(r.key::text), array[]::text[])
    into v_roles
    from public.user_roles ur
    join public.roles r on r.id = ur."roleId"
   where ur."userId" = (event ->> 'user_id');

  claims := event -> 'claims';
  if v_org is not null then
    claims := jsonb_set(claims, '{organization_id}', to_jsonb(v_org));
  end if;
  claims := jsonb_set(claims, '{roles}', to_jsonb(coalesce(v_roles, array[]::text[])));

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Permissões para o hook rodar no schema de auth.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant select on public.users, public.user_roles, public.roles to supabase_auth_admin;
