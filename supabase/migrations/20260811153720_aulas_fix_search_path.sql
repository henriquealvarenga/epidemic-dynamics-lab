-- is_anon_session ficou sem `set search_path`, apontado pelo linter
-- (0011_function_search_path_mutable). Sem isso, um search_path malicioso
-- na sessão pode mudar o que a função resolve. As demais já tinham.
create or replace function aulas.is_anon_session() returns boolean
language sql stable
set search_path = aulas, pg_temp
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;;
