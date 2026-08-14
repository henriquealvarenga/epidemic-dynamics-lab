-- =====================================================================
--  O número de questões passa a ser da SALA, não da atividade
--
--  O BUG
--    `aulas.activities.item_count` era a única fonte do tamanho da
--    rodada, e `ensure_activity()` reescreve esse valor a cada sala nova
--    (`on conflict do update set item_count = excluded.item_count`).
--
--    No modo game o professor ESCOLHE o tamanho por rodada — o console
--    oferece 10, 15, 20, 25 e 30. Abrir uma segunda rodada com tamanho
--    diferente reescrevia o tamanho da primeira, que ainda podia estar no
--    ar. O estrago não era cosmético:
--
--      1. o trigger recusa `question_idx >= item_count`. Caindo de 30
--         para 10, quem estivesse na questão 15 da sala antiga passava a
--         levar 22003 e parava de pontuar no meio da rodada;
--      2. `finished_at` era marcado no número errado;
--      3. `v_leaderboard.score_pct` normalizava pelo denominador errado —
--         uma rodada de 30 dividida por 10 dá mais de 100% para todos;
--      4. `join_room` devolvia o tamanho errado ao grupo, e o sorteio do
--         cliente é `sortear(code, item_count)`: a turma passaria a ver um
--         conjunto de questões diferente do que estava respondendo.
--
--    Descoberto em 14/08, conferindo o banco depois da primeira rodada
--    real: a sala das 30 questões aparecia com item_count 10, porque uma
--    sala de 10 foi aberta depois dela.
--
--  A CORREÇÃO
--    `rooms.item_count`, congelado na criação — como já era feito com
--    `rooms.scoring`, e pelo mesmo motivo: o que define a rodada não pode
--    mudar debaixo dela. `activities.item_count` continua existindo para
--    os quizzes dos módulos, onde o número de questões é de fato da
--    atividade.
--
--  BACKFILL
--    Evidência antes de configuração: para salas que já receberam
--    respostas, o tamanho mínimo verdadeiro é `max(question_idx) + 1`. É
--    o que recupera a sala de 30 questões cujo contador já tinha sido
--    sobrescrito para 10.
--
--  As funções abaixo são cópias fiéis das versões de 20260811153639 e
--  20260811153452; a ÚNICA mudança é de onde vem o item_count.
-- =====================================================================

alter table aulas.rooms
  add column if not exists item_count smallint;

update aulas.rooms r
   set item_count = greatest(
         coalesce((select a.item_count from aulas.activities a
                    where a.id = r.activity_id), 1),
         coalesce((select max(x.question_idx) + 1 from aulas.answers x
                    where x.room_id = r.id), 1))
 where r.item_count is null;

alter table aulas.rooms
  alter column item_count set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'rooms_item_count_check') then
    alter table aulas.rooms
      add constraint rooms_item_count_check check (item_count between 1 and 200);
  end if;
end $$;

comment on column aulas.rooms.item_count is
  'Número de questões DESTA rodada, congelado na criação. A atividade tem o '
  'próprio item_count, que serve aos quizzes dos módulos; no modo game o '
  'tamanho é escolhido por sala, e deixá-lo só na atividade fazia uma rodada '
  'nova reescrever o tamanho de outra ainda no ar.';

-- ---------------------------------------------------------------------
--  create_room: congela o tamanho na sala
-- ---------------------------------------------------------------------
create or replace function aulas.create_room(
  p_app_slug    text,
  p_external_id text,
  p_title       text,
  p_item_count  int,
  p_scoring     jsonb default null,
  p_label       text  default null,
  p_max_teams   int   default 40,
  p_hours       int   default 6)
returns jsonb
language plpgsql security definer set search_path = aulas, pg_temp as $$
declare
  v_activity int;
  v_room aulas.rooms%rowtype;
begin
  if not aulas.is_instructor() then
    raise exception 'apenas professores podem abrir salas' using errcode = '42501';
  end if;

  v_activity := aulas.ensure_activity(p_app_slug, p_external_id, p_title, p_item_count);

  insert into aulas.rooms (code, activity_id, owner_uid, label, scoring,
                           max_teams, expires_at, item_count)
  values (aulas.new_code(), v_activity, auth.uid(), p_label,
          coalesce(p_scoring, '{"seconds":30,"base":100,"bonus_per_sec":5,"late":50}'::jsonb),
          greatest(1, least(200, p_max_teams)),
          now() + (greatest(1, least(24, p_hours)) || ' hours')::interval,
          greatest(1, least(200, p_item_count)))
  returning * into v_room;

  return jsonb_build_object(
    'room_id', v_room.id, 'code', v_room.code, 'status', v_room.status,
    'scoring', v_room.scoring, 'expires_at', v_room.expires_at,
    'external_id', p_external_id, 'item_count', v_room.item_count);
end $$;

-- ---------------------------------------------------------------------
--  join_room: devolve o tamanho DA SALA
-- ---------------------------------------------------------------------
create or replace function aulas.join_room(p_code text, p_nickname text)
returns jsonb
language plpgsql security definer set search_path = aulas, pg_temp as $$
declare
  v_room aulas.rooms%rowtype;
  v_act  aulas.activities%rowtype;
  v_app  aulas.apps%rowtype;
  v_team aulas.teams%rowtype;
  v_nick text := btrim(regexp_replace(coalesce(p_nickname, ''), '\s+', ' ', 'g'));
  v_n    int;
begin
  if auth.uid() is null then
    raise exception 'sessão de autenticação ausente' using errcode = '42501';
  end if;
  if char_length(v_nick) < 2 or char_length(v_nick) > 24 then
    raise exception 'o nome do grupo precisa ter de 2 a 24 caracteres'
      using errcode = '22023';
  end if;

  select * into v_room from aulas.rooms
   where code = upper(btrim(p_code))
     and status in ('open', 'running')
     and expires_at > now();
  if not found then
    raise exception 'sala inexistente, encerrada ou expirada' using errcode = 'P0002';
  end if;

  -- Reentrada (F5, troca de aba, queda de rede): devolve o MESMO grupo.
  select * into v_team from aulas.teams
   where room_id = v_room.id and owner_uid = auth.uid();

  if not found then
    select count(*) into v_n from aulas.teams where room_id = v_room.id;
    if v_n >= v_room.max_teams then
      raise exception 'sala lotada' using errcode = '53100';
    end if;
    begin
      insert into aulas.teams (room_id, nickname, owner_uid)
      values (v_room.id, v_nick, auth.uid())
      returning * into v_team;
    exception when unique_violation then
      raise exception 'esse nome já está em uso nesta sala' using errcode = '23505';
    end;
  end if;

  select * into v_act from aulas.activities where id = v_room.activity_id;
  select * into v_app from aulas.apps       where id = v_act.app_id;

  return jsonb_build_object(
    'room_id',     v_room.id,
    'code',        v_room.code,
    'status',      v_room.status,
    'scoring',     v_room.scoring,
    'app_slug',    v_app.slug,
    'external_id', v_act.external_id,
    'item_count',  v_room.item_count,
    'team_id',     v_team.id,
    'nickname',    v_team.nickname,
    'score',       v_team.score,
    -- Retomada AUTORITATIVA do servidor. Confiar no localStorage aqui
    -- permitiria refazer questões já respondidas e somar pontos de novo.
    'resume_at',   (select coalesce(max(question_idx) + 1, 0)
                      from aulas.answers where team_id = v_team.id)
  );
end $$;

-- ---------------------------------------------------------------------
--  Triggers: validação e finished_at pelo tamanho da sala
-- ---------------------------------------------------------------------
create or replace function aulas.answers_before_insert()
returns trigger
language plpgsql
security definer
set search_path = aulas, pg_temp
as $$
declare
  v_room    aulas.rooms%rowtype;
  v_blocked boolean;
begin
  select r.* into v_room
    from aulas.teams t
    join aulas.rooms r on r.id = t.room_id
   where t.id = new.team_id;
  if not found then
    raise exception 'grupo % inexistente', new.team_id using errcode = '23503';
  end if;

  select t.blocked into v_blocked from aulas.teams t where t.id = new.team_id;
  if v_blocked then
    raise exception 'grupo bloqueado pelo professor' using errcode = '42501';
  end if;

  if v_room.status not in ('open', 'running') or v_room.expires_at <= now() then
    raise exception 'sala não aceita respostas' using errcode = '42501';
  end if;

  -- ANTES: o tamanho vinha de aulas.activities, que uma sala nova
  -- reescreve. Uma rodada de 10 aberta depois derrubava para 10 o limite
  -- de uma rodada de 30 ainda no ar, e a turma parava de pontuar da
  -- questão 11 em diante.
  if new.question_idx >= v_room.item_count then
    raise exception 'question_idx fora da atividade' using errcode = '22003';
  end if;

  new.room_id := v_room.id;

  -- Teto explícito: não adianta o cliente mandar secs_left = 9999 para
  -- inflar o bônus de velocidade.
  new.secs_left := least(new.secs_left, (v_room.scoring->>'seconds')::int);

  -- Mesma fórmula do quiz-engine (js/core/quiz-engine.js):
  --   acerto no tempo   → base + segundos restantes × bônus
  --   acerto fora do tempo → meio-crédito fixo
  --   erro              → 0
  new.points := case
    when not new.is_correct then 0
    when new.secs_left <= 0 then (v_room.scoring->>'late')::int
    else (v_room.scoring->>'base')::int
         + new.secs_left * (v_room.scoring->>'bonus_per_sec')::int
  end;

  return new;
end $$;

create or replace function aulas.answers_after_insert()
returns trigger
language plpgsql
security definer
set search_path = aulas, pg_temp
as $$
declare v_items smallint;
begin
  update aulas.teams t
     set score          = t.score + new.points,
         answered_count = t.answered_count + 1,
         correct_count  = t.correct_count + new.is_correct::int,
         last_answer_at = new.created_at
   where t.id = new.team_id;

  select r.item_count into v_items
    from aulas.rooms r
   where r.id = new.room_id;

  update aulas.teams t
     set finished_at = now()
   where t.id = new.team_id
     and t.finished_at is null
     and t.answered_count >= v_items;

  return null;
end $$;

-- ---------------------------------------------------------------------
--  Placar: normaliza pelo tamanho da sala
-- ---------------------------------------------------------------------
create or replace view aulas.v_leaderboard with (security_invoker = true) as
select t.room_id,
       t.id as team_id,
       t.nickname,
       t.score,
       t.answered_count,
       t.correct_count,
       t.finished_at,
       r.item_count,
       -- Nota normalizada 0-100: é o que permite comparar rodadas com
       -- número de questões diferente sem premiar a mais longa.
       round(least(100.0, greatest(0.0,
         t.score::numeric
         / nullif(r.item_count * ((r.scoring->>'base')::int
                                  + (r.scoring->>'seconds')::int
                                  * (r.scoring->>'bonus_per_sec')::int), 0)
         * 100)), 1) as score_pct,
       rank() over (partition by t.room_id
                    order by t.score desc, t.last_answer_at asc nulls last) as position
from aulas.teams t
join aulas.rooms r on r.id = t.room_id
where not t.blocked;
