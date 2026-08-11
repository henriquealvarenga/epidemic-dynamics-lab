-- =====================================================================
--  aulas — motor de competição em sala de aula
--
--  Multi-instituição e multi-app: hospeda qualquer site educacional da
--  Afya, não só o Epidemic Dynamics Lab. Um projeto Supabase por
--  INSTITUIÇÃO (não por aula), porque projeto sem uso hiberna no plano
--  free e é ameaçado de deleção.
--
--  Sem PII: grupos são identificados por um apelido escolhido em aula.
-- =====================================================================

create schema if not exists aulas;

comment on schema aulas is
  'Modo competição em sala. Multi-app e multi-instituição. Sem dados '
  'pessoais: grupos são identificados apenas por apelido escolhido em aula.';

-- ---------------------------------------------------------------------
-- Catálogo estável
-- ---------------------------------------------------------------------
create table aulas.institutions (
  id          smallint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9-]{2,32}$'),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Um app = um site educacional. É o pivô multi-curso: qualquer site
-- futuro se registra com um slug e declara suas atividades, sem
-- mudança de schema.
create table aulas.apps (
  id          smallint generated always as identity primary key,
  slug        text not null unique check (slug ~ '^[a-z0-9-]{2,64}$'),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table aulas.courses (
  id             integer generated always as identity primary key,
  institution_id smallint not null references aulas.institutions(id) on delete restrict,
  code           text not null,
  name           text not null,
  created_at     timestamptz not null default now(),
  unique (institution_id, code)
);

-- Uma atividade jogável = o quiz de um módulo de um app.
create table aulas.activities (
  id           integer generated always as identity primary key,
  app_id       smallint not null references aulas.apps(id) on delete cascade,
  external_id  text not null,
  title        text not null,
  item_count   smallint not null check (item_count between 1 and 200),
  updated_at   timestamptz not null default now(),
  unique (app_id, external_id)
);

comment on column aulas.activities.external_id is
  'ID do módulo no app cliente (EDL.modules[].id, ex.: 05-r0). O app se '
  'auto-registra via aulas.ensure_activity(); nada é semeado à mão.';

comment on column aulas.activities.item_count is
  'Número de questões. Base da NORMALIZAÇÃO do placar: os módulos têm de '
  '4 a 10 questões, então somar pontos brutos premiaria quem pegou o '
  'módulo mais longo em vez de quem sabe mais.';

-- ---------------------------------------------------------------------
-- Professores — allowlist
-- ---------------------------------------------------------------------
create table aulas.instructors (
  uid            uuid primary key references auth.users(id) on delete cascade,
  email          text not null,
  display_name   text,
  institution_id smallint references aulas.institutions(id) on delete set null,
  created_at     timestamptz not null default now()
);

comment on table aulas.instructors is
  'Allowlist de quem pode criar salas. Populada por SQL, NUNCA pelo '
  'cliente. Estar autenticado não basta: com sign-in anônimo ligado, '
  'qualquer visitante da internet recebe a role `authenticated`.';

-- ---------------------------------------------------------------------
-- Sala
-- ---------------------------------------------------------------------
create type aulas.room_status as enum ('draft', 'open', 'running', 'closed');

create table aulas.rooms (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique
                 check (code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$'),
  activity_id  integer not null references aulas.activities(id) on delete restrict,
  course_id    integer references aulas.courses(id) on delete set null,
  owner_uid    uuid not null references auth.users(id) on delete cascade,
  label        text,
  status       aulas.room_status not null default 'open',

  -- Snapshot da regra de pontuação NO MOMENTO da criação da sala.
  -- Congelado de propósito: mexer em js/core/config.js depois não pode
  -- reescrever retroativamente o placar de uma aula já jogada.
  scoring      jsonb not null default
                 '{"seconds":30,"base":100,"bonus_per_sec":5,"late":50}'::jsonb,

  max_teams    smallint not null default 40 check (max_teams between 1 and 200),
  created_at   timestamptz not null default now(),
  started_at   timestamptz,
  closed_at    timestamptz,
  expires_at   timestamptz not null default now() + interval '6 hours',

  constraint scoring_shape check (
    (scoring ? 'seconds') and (scoring ? 'base')
    and (scoring ? 'bonus_per_sec') and (scoring ? 'late')
    and (scoring->>'seconds')::int between 5 and 600
    and (scoring->>'base')::int between 0 and 10000
    and (scoring->>'bonus_per_sec')::int between 0 and 1000
    and (scoring->>'late')::int between 0 and 10000
  )
);

comment on column aulas.rooms.scoring is
  'Congela base, segundos, bônus por segundo e meio-crédito. O bônus por '
  'VELOCIDADE é requisito pedagógico: os alunos do projeto irmão sentiram '
  'falta dele. O trigger de answers recalcula os pontos a partir daqui, '
  'preservando o bônus sem deixar o cliente escrever a pontuação.';

create index rooms_owner_idx    on aulas.rooms (owner_uid, created_at desc);
create index rooms_active_idx   on aulas.rooms (status, expires_at)
                                  where status in ('open', 'running');
create index rooms_activity_idx on aulas.rooms (activity_id, created_at desc);

-- ---------------------------------------------------------------------
-- Grupos
-- ---------------------------------------------------------------------
create table aulas.teams (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references aulas.rooms(id) on delete cascade,
  nickname       text not null check (char_length(btrim(nickname)) between 2 and 24),

  -- ON DELETE SET NULL, jamais CASCADE: a limpeza de usuários anônimos
  -- não pode apagar o histórico do placar.
  owner_uid      uuid references auth.users(id) on delete set null,

  -- Agregados desnormalizados, mantidos SÓ por trigger. Existem para que
  -- o painel do professor receba uma linha por grupo, sem N queries.
  score          integer  not null default 0 check (score >= 0),
  answered_count smallint not null default 0 check (answered_count >= 0),
  correct_count  smallint not null default 0 check (correct_count >= 0),

  blocked        boolean not null default false,
  joined_at      timestamptz not null default now(),
  last_answer_at timestamptz,
  finished_at    timestamptz
);

-- Apelido único por sala, insensível a caixa e a espaço extra: sem o
-- btrim, "Os  Kochs" e "Os Kochs" viram grupos diferentes na projeção e
-- ninguém entende.
create unique index teams_nickname_uidx
  on aulas.teams (room_id, lower(btrim(nickname)));

-- Um aparelho = no máximo um grupo por sala. Evita que F5 crie duplicata.
create unique index teams_owner_uidx
  on aulas.teams (room_id, owner_uid) where owner_uid is not null;

create index teams_board_idx
  on aulas.teams (room_id, score desc, last_answer_at asc);

-- ---------------------------------------------------------------------
-- Respostas — append-only
-- ---------------------------------------------------------------------
create table aulas.answers (
  id            bigint generated always as identity primary key,
  team_id       uuid not null references aulas.teams(id) on delete cascade,

  -- Desnormalizado DE PROPÓSITO: o filtro de Realtime só aceita
  -- `coluna=eq.valor` na própria tabela assinada. Sem isto o professor
  -- não consegue assinar as respostas de UMA sala. Preenchido por trigger.
  room_id       uuid not null references aulas.rooms(id) on delete cascade,

  question_idx  smallint not null check (question_idx between 0 and 199),
  chosen_idx    smallint not null check (chosen_idx between -1 and 25),
  is_correct    boolean not null,

  -- Entradas do cliente, ambas com teto. secs_left é a base do cálculo
  -- (reproduz exatamente a fórmula do quiz-engine); elapsed_ms é telemetria.
  secs_left     smallint not null check (secs_left between 0 and 600),
  elapsed_ms    integer  not null default 0 check (elapsed_ms between 0 and 3600000),

  -- NUNCA aceito do cliente: recalculado por trigger.
  points        integer not null default 0 check (points between 0 and 100000),

  created_at    timestamptz not null default now(),

  -- Uma resposta por questão. É o que impede farmar pontos repetindo.
  unique (team_id, question_idx)
);

comment on column aulas.answers.chosen_idx is
  '-1 = não respondeu. Guardar a alternativa escolhida (e não só '
  'certo/errado) é o que permite o mapa de calor mostrar QUAL distrator '
  'atraiu a turma — o dado pedagogicamente útil.';

create index answers_room_question_idx on aulas.answers (room_id, question_idx);
create index answers_team_idx          on aulas.answers (team_id, question_idx);;
