-- =====================================================================
--  Faxina automática (pg_cron)
--
--  Três jobs, cada um resolvendo um vazamento diferente:
-- =====================================================================
create extension if not exists pg_cron with schema pg_catalog;

-- 1) Sala esquecida aberta fecha sozinha. `expires_at` já é checado de
--    forma SÍNCRONA pelo trigger de answers e pelo join_room — mesmo que
--    este cron falhe, sala expirada não aceita resposta. O cron só faz a
--    parte cosmética de refletir isso no status.
select cron.unschedule('aulas_fecha_salas_expiradas')
  where exists (select 1 from cron.job where jobname = 'aulas_fecha_salas_expiradas');
select cron.schedule('aulas_fecha_salas_expiradas', '*/15 * * * *', $cmd$
  update aulas.rooms set status = 'closed', closed_at = now()
   where status in ('open','running') and expires_at < now();
$cmd$);

-- 2) Retenção. Atividade formativa, dados não-pessoais: 120 dias cobrem
--    o semestre inteiro com folga.
select cron.unschedule('aulas_purga_salas_antigas')
  where exists (select 1 from cron.job where jobname = 'aulas_purga_salas_antigas');
select cron.schedule('aulas_purga_salas_antigas', '17 4 * * *', $cmd$
  delete from aulas.rooms where closed_at < now() - interval '120 days';
$cmd$);

-- 3) Usuários anônimos. A documentação do Supabase diz textualmente que
--    não há limpeza automática: cada aparelho que entra numa sala cria
--    uma linha permanente em auth.users. Sem isto, o banco cresce a cada
--    aula para sempre.
--
--    7 dias é seguro porque nenhuma sala vive mais que 24h (max de
--    p_hours em create_room), então nenhum grupo em atividade é atingido.
--    teams.owner_uid é ON DELETE SET NULL: apagar o usuário não apaga o
--    histórico do placar.
select cron.unschedule('aulas_purga_anonimos')
  where exists (select 1 from cron.job where jobname = 'aulas_purga_anonimos');
select cron.schedule('aulas_purga_anonimos', '23 4 * * *', $cmd$
  delete from auth.users
   where is_anonymous is true and created_at < now() - interval '7 days';
$cmd$);;
