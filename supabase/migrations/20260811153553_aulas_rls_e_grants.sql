-- =====================================================================
--  RLS
--
--  Premissa que molda tudo: com sign-in anônimo ligado, um usuário
--  anônimo recebe a role `authenticated`. Portanto "estar autenticado"
--  NUNCA pode ser, sozinho, a condição de uma policy. O portão real é a
--  allowlist aulas.instructors.
--
--  As funções auxiliares são SECURITY DEFINER por necessidade técnica,
--  não por estilo: uma policy em `teams` que consulte `teams` causa
--  recursão infinita de RLS (42P17). A função definer contorna o RLS e
--  quebra o ciclo.
-- =====================================================================

create or replace function aulas.is_instructor() returns boolean
language sql stable security definer set search_path = aulas, pg_temp as $$
  select exists (select 1 from aulas.instructors i where i.uid = auth.uid());
$$;

create or replace function aulas.owns_room(p_room uuid) returns boolean
language sql stable security definer set search_path = aulas, pg_temp as $$
  select exists (select 1 from aulas.rooms r
                  where r.id = p_room and r.owner_uid = auth.uid());
$$;

create or replace function aulas.is_member_of(p_room uuid) returns boolean
language sql stable security definer set search_path = aulas, pg_temp as $$
  select exists (select 1 from aulas.teams t
                  where t.room_id = p_room and t.owner_uid = auth.uid());
$$;

create or replace function aulas.owns_team(p_team uuid) returns boolean
language sql stable security definer set search_path = aulas, pg_temp as $$
  select exists (select 1 from aulas.teams t
                  where t.id = p_team and t.owner_uid = auth.uid()
                    and not t.blocked);
$$;

-- Claim que distingue sessão anônima de login real.
create or replace function aulas.is_anon_session() returns boolean
language sql stable as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

alter table aulas.institutions enable row level security;
alter table aulas.apps         enable row level security;
alter table aulas.courses      enable row level security;
alter table aulas.activities   enable row level security;
alter table aulas.instructors  enable row level security;
alter table aulas.rooms        enable row level security;
alter table aulas.teams        enable row level security;
alter table aulas.answers      enable row level security;

-- ---------------------------------------------------------------------
-- Catálogo: leitura livre do que é metadado sem valor (nome de módulo);
-- turmas e escrita, só professor.
-- ---------------------------------------------------------------------
create policy cat_read_institutions on aulas.institutions for select to authenticated using (true);
create policy cat_read_apps         on aulas.apps         for select to authenticated using (true);
create policy cat_read_activities   on aulas.activities   for select to authenticated using (true);

create policy cat_read_courses  on aulas.courses for select to authenticated
  using (aulas.is_instructor());
create policy cat_write_courses on aulas.courses for all to authenticated
  using (aulas.is_instructor()) with check (aulas.is_instructor());

create policy cat_write_institutions on aulas.institutions for all to authenticated
  using (aulas.is_instructor()) with check (aulas.is_instructor());
create policy cat_write_apps on aulas.apps for all to authenticated
  using (aulas.is_instructor()) with check (aulas.is_instructor());
create policy cat_write_activities on aulas.activities for all to authenticated
  using (aulas.is_instructor()) with check (aulas.is_instructor());

-- instructors: cada um enxerga só a própria linha. Ninguém escreve pelo cliente.
create policy instr_self on aulas.instructors for select to authenticated
  using (uid = auth.uid());

-- ---------------------------------------------------------------------
-- ROOMS
--   * anônimo não cria sala;
--   * professor vê e controla apenas as próprias;
--   * grupo vê APENAS a sala em que já entrou — nunca lista salas abertas.
-- ---------------------------------------------------------------------
create policy rooms_select on aulas.rooms for select to authenticated
  using ( (aulas.is_instructor() and owner_uid = auth.uid())
          or aulas.is_member_of(id) );

create policy rooms_insert on aulas.rooms for insert to authenticated
  with check ( aulas.is_instructor() and owner_uid = auth.uid() );

create policy rooms_update on aulas.rooms for update to authenticated
  using      ( aulas.is_instructor() and owner_uid = auth.uid() )
  with check ( aulas.is_instructor() and owner_uid = auth.uid() );

create policy rooms_delete on aulas.rooms for delete to authenticated
  using ( aulas.is_instructor() and owner_uid = auth.uid() );

-- Cinto e suspensório. Restritivas SÓ nas escritas: uma restritiva `for
-- all` também barraria o SELECT, e o grupo (anônimo) precisa ler a sala
-- em que entrou.
create policy rooms_no_anon_insert on aulas.rooms as restrictive for insert
  to authenticated with check ( not aulas.is_anon_session() );
create policy rooms_no_anon_update on aulas.rooms as restrictive for update
  to authenticated using ( not aulas.is_anon_session() );
create policy rooms_no_anon_delete on aulas.rooms as restrictive for delete
  to authenticated using ( not aulas.is_anon_session() );

-- ---------------------------------------------------------------------
-- TEAMS
--   * grupo LÊ todos os grupos DA SUA sala (é o placar) e de nenhuma outra;
--   * grupo NÃO escreve em teams — score é do trigger, entrada é via RPC;
--   * professor lê, edita e remove os grupos das salas dele.
-- ---------------------------------------------------------------------
create policy teams_select on aulas.teams for select to authenticated
  using ( aulas.is_member_of(room_id) or aulas.owns_room(room_id) );

create policy teams_update_owner on aulas.teams for update to authenticated
  using      ( aulas.owns_room(room_id) )
  with check ( aulas.owns_room(room_id) );

create policy teams_delete_owner on aulas.teams for delete to authenticated
  using ( aulas.owns_room(room_id) );
-- (sem policy de INSERT, e sem UPDATE para aluno: proposital)

-- ---------------------------------------------------------------------
-- ANSWERS
--   * grupo lê apenas as PRÓPRIAS respostas. Deixar um grupo ler as dos
--     outros entregaria o gabarito das questões que ele ainda não
--     alcançou — em corrida livre isso é colar, não é placar;
--   * grupo insere apenas para o próprio time; append-only;
--   * professor lê tudo da sala dele (mapa de calor).
-- ---------------------------------------------------------------------
create policy answers_select_own on aulas.answers for select to authenticated
  using ( aulas.owns_team(team_id) );

create policy answers_select_owner on aulas.answers for select to authenticated
  using ( aulas.owns_room(room_id) );

create policy answers_insert_own on aulas.answers for insert to authenticated
  with check ( aulas.owns_team(team_id) );
-- (sem UPDATE e sem DELETE, para ninguém — nem para o professor.
--  Correção pós-aula, se precisar, é no SQL editor.)

-- ---------------------------------------------------------------------
-- Views
--
-- security_invoker = true é OBRIGATÓRIO: sem isso a view roda com os
-- privilégios do dono e FURA toda a RLS acima. É o erro nº 1 de RLS.
-- ---------------------------------------------------------------------
create view aulas.v_leaderboard with (security_invoker = true) as
select t.room_id,
       t.id as team_id,
       t.nickname,
       t.score,
       t.answered_count,
       t.correct_count,
       t.finished_at,
       a.item_count,
       -- Nota normalizada 0-100: é o que permite comparar módulos com
       -- número de questões diferente sem premiar o mais longo.
       round(least(100.0, greatest(0.0,
         t.score::numeric
         / nullif(a.item_count * ((r.scoring->>'base')::int
                                  + (r.scoring->>'seconds')::int
                                  * (r.scoring->>'bonus_per_sec')::int), 0)
         * 100)), 1) as score_pct,
       rank() over (partition by t.room_id
                    order by t.score desc, t.last_answer_at asc nulls last) as position
from aulas.teams t
join aulas.rooms r      on r.id = t.room_id
join aulas.activities a on a.id = r.activity_id
where not t.blocked;

create view aulas.v_room_item_stats with (security_invoker = true) as
select ans.room_id,
       ans.question_idx,
       count(*)                                    as n,
       count(*) filter (where ans.is_correct)      as n_correct,
       round(100.0 * count(*) filter (where ans.is_correct) / count(*), 1) as pct_correct,
       mode() within group (order by ans.chosen_idx)
         filter (where not ans.is_correct)         as top_distractor,
       round(avg(ans.elapsed_ms) / 1000.0, 1)      as avg_secs
from aulas.answers ans
group by ans.room_id, ans.question_idx;

-- ---------------------------------------------------------------------
-- GRANTS — obrigatórios: em schema não-public nada é concedido
-- automaticamente, e sem grant a RLS nem chega a ser avaliada.
-- ---------------------------------------------------------------------
grant usage on schema aulas to authenticated;

grant select on aulas.institutions, aulas.apps, aulas.activities,
                aulas.courses, aulas.instructors,
                aulas.v_leaderboard, aulas.v_room_item_stats to authenticated;

grant select, insert, update, delete on aulas.rooms  to authenticated;
grant select, update, delete         on aulas.teams  to authenticated;
grant select, insert                 on aulas.answers to authenticated;
grant insert, update on aulas.institutions, aulas.apps, aulas.activities, aulas.courses to authenticated;

grant usage, select on all sequences in schema aulas to authenticated;

-- A role `anon` (sem sessão nenhuma) não recebe NADA neste schema.
revoke all on all tables in schema aulas from anon;
revoke all on schema aulas from anon;;
