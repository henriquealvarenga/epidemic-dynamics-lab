-- A policy teams_update_owner existe para o professor renomear ou
-- bloquear um grupo em sala. Mas RLS controla QUAIS LINHAS, não quais
-- colunas: com UPDATE na tabela inteira, o dono da sala conseguia
-- reescrever score, answered_count e correct_count — os agregados que
-- deveriam nascer só do trigger.
--
-- Descoberto testando, não revisando: o teste de RLS gravou score =
-- 999999 e o leaderboard aceitou.
--
-- Não era explorável por aluno (ele não é dono de sala nenhuma), mas
-- deixava o placar divergir das respostas por acidente ou por conta
-- comprometida. Grant por coluna é o mecanismo certo: o trigger é
-- SECURITY DEFINER e continua escrevendo os agregados normalmente.
revoke update on aulas.teams from authenticated;
grant update (nickname, blocked) on aulas.teams to authenticated;;
