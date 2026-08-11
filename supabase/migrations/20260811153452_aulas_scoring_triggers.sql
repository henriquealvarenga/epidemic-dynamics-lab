-- =====================================================================
--  Pontuação: toda a aritmética é do SERVIDOR.
--
--  Modelo de confiança, explícito: o cliente AFIRMA se acertou (o
--  gabarito já está no JS público; travar isso exigiria duplicar as 45
--  questões no banco e manter duas fontes de verdade sincronizadas — não
--  se justifica numa atividade formativa). Mas o cliente NÃO decide
--  quantos pontos vale. No pior caso um engraçadinho gabarita
--  instantaneamente; não consegue 10^9 pontos, não apaga o placar e não
--  toca em outro grupo.
-- =====================================================================

-- Deriva room_id do time e RECALCULA points. Qualquer valor de room_id
-- ou points enviado pelo cliente é descartado.
create or replace function aulas.answers_before_insert()
returns trigger
language plpgsql
security definer
set search_path = aulas, pg_temp
as $$
declare
  v_room    aulas.rooms%rowtype;
  v_items   smallint;
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

  select a.item_count into v_items
    from aulas.activities a where a.id = v_room.activity_id;
  if new.question_idx >= v_items then
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

create trigger answers_before_insert
  before insert on aulas.answers
  for each row execute function aulas.answers_before_insert();

-- Atualiza os agregados do grupo. SECURITY DEFINER porque teams NÃO tem
-- policy de UPDATE para aluno — é justamente isso que impede
-- "update teams set score = 999999".
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

  select a.item_count into v_items
    from aulas.rooms r
    join aulas.activities a on a.id = r.activity_id
   where r.id = new.room_id;

  update aulas.teams t
     set finished_at = now()
   where t.id = new.team_id
     and t.finished_at is null
     and t.answered_count >= v_items;

  return null;
end $$;

create trigger answers_after_insert
  after insert on aulas.answers
  for each row execute function aulas.answers_after_insert();;
