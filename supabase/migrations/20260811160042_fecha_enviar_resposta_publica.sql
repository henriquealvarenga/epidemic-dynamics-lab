-- public.enviar_resposta é herdada do uso anterior deste projeto (o
-- "Intencionalidade"). É SECURITY DEFINER, estava executável por `anon`
-- e por `authenticated`, e NÃO VALIDA NADA: qualquer portador da chave
-- publishable — que é pública por design — podia gravar ou sobrescrever
-- qualquer linha de public.respostas, em qualquer sessão, para qualquer
-- grupo.
--
-- Apontada por mim ao inspecionar o projeto e confirmada pelo linter de
-- segurança do Supabase (lints 0028 e 0029).
--
-- Revogar o EXECUTE fecha a porta sem destruir nada: função e tabela
-- continuam onde estavam, e as 0 linhas de public.respostas seguem
-- intactas. Para reverter, basta:
--   grant execute on function public.enviar_resposta(text,text,text,int,jsonb)
--     to anon, authenticated;
revoke execute on function public.enviar_resposta(text, text, text, int, jsonb)
  from anon, authenticated, public;;
