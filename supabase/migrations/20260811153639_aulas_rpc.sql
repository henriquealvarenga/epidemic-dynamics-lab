-- =====================================================================
--  RPCs
-- =====================================================================

-- Código de 6 caracteres sem os ambíguos (0/O, 1/I/L): 32^6 ≈ 1,07e9.
-- SECURITY DEFINER porque precisa enxergar TODOS os códigos para garantir
-- unicidade — com RLS, o professor só vê as próprias salas e acharia
-- livre um código já em uso.
create or replace function aulas.new_code() returns text
language plpgsql security definer set search_path = aulas, pg_temp as $$
declare
  alfa constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  c text;
  tentativas int := 0;
begin
  loop
    c := '';
    for i in 1..6 loop
      c := c || substr(alfa, 1 + floor(random() * 32)::int, 1);
    end loop;
    exit when not exists (select 1 from aulas.rooms where code = c);
    tentativas := tentativas + 1;
    if tentativas > 50 then
      raise exception 'não foi possível gerar código único';
    end if;
  end loop;
  return c;
end $$;

-- O app se auto-registra: o professor escolhe o módulo na tela dele e o
-- front manda id/título/nº de questões vindos de EDL.modules.
create or replace function aulas.ensure_activity(
  p_app_slug text, p_external_id text, p_title text, p_item_count int)
returns integer
language plpgsql security definer set search_path = aulas, pg_temp as $$
declare v_app_id smallint; v_id integer;
begin
  if not aulas.is_instructor() then
    raise exception 'apenas professores' using errcode = '42501';
  end if;

  insert into aulas.apps (slug, name) values (p_app_slug, p_app_slug)
    on conflict (slug) do update set name = aulas.apps.name
    returning id into v_app_id;

  insert into aulas.activities (app_id, external_id, title, item_count)
  values (v_app_id, p_external_id, p_title, p_item_count)
  on conflict (app_id, external_id)
    do update set title = excluded.title,
                  item_count = excluded.item_count,
                  updated_at = now()
  returning id into v_id;

  return v_id;
end $$;

-- Cria a sala e devolve código + id. SECURITY DEFINER com checagem
-- explícita de professor logo na primeira linha.
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
                           max_teams, expires_at)
  values (aulas.new_code(), v_activity, auth.uid(), p_label,
          coalesce(p_scoring, '{"seconds":30,"base":100,"bonus_per_sec":5,"late":50}'::jsonb),
          greatest(1, least(200, p_max_teams)),
          now() + (greatest(1, least(24, p_hours)) || ' hours')::interval)
  returning * into v_room;

  return jsonb_build_object(
    'room_id', v_room.id, 'code', v_room.code, 'status', v_room.status,
    'scoring', v_room.scoring, 'expires_at', v_room.expires_at,
    'external_id', p_external_id, 'item_count', p_item_count);
end $$;

-- Entrada do grupo. SECURITY DEFINER para NÃO precisar dar SELECT em
-- rooms a desconhecidos — o que permitiria enumerar todas as salas
-- abertas e entrar nelas.
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
    'item_count',  v_act.item_count,
    'team_id',     v_team.id,
    'nickname',    v_team.nickname,
    'score',       v_team.score,
    -- Retomada AUTORITATIVA do servidor. Confiar no localStorage aqui
    -- permitiria refazer questões já respondidas e somar pontos de novo.
    'resume_at',   (select coalesce(max(question_idx) + 1, 0)
                      from aulas.answers where team_id = v_team.id)
  );
end $$;

revoke execute on function aulas.new_code()                          from public, anon;
revoke execute on function aulas.ensure_activity(text,text,text,int)  from public, anon;
revoke execute on function aulas.create_room(text,text,text,int,jsonb,text,int,int) from public, anon;
revoke execute on function aulas.join_room(text,text)                 from public, anon;

grant execute on function aulas.ensure_activity(text,text,text,int) to authenticated;
grant execute on function aulas.create_room(text,text,text,int,jsonb,text,int,int) to authenticated;
grant execute on function aulas.join_room(text,text) to authenticated;
-- new_code() não é exposta: só é chamada de dentro de create_room().;
