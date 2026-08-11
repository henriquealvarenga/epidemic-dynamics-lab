# Backend do modo competição

O modo competição usa um projeto Supabase por **instituição** — não por aula. Projeto sem uso
hiberna no plano free e é ameaçado de deleção em 90 dias; concentrar todas as disciplinas de uma
instituição no mesmo projeto mantém tráfego o ano todo.

| Instituição | Projeto | Ref | Região |
|---|---|---|---|
| Afya | `Afya` | `yfnilksnqehysxunujli` | us-east-2 |
| UFSJ | `UFSJ` | `mqalfrhndvnaqedsubkn` | us-east-1 |

O Epidemic Dynamics Lab usa o projeto **Afya**. O schema é multi-app: qualquer site educacional
futuro se registra com um `slug` e declara suas atividades, sem mudança de schema.

## Migrations aplicadas

Em 11/08/2026, no projeto Afya:

| Versão | Nome | O que faz |
|---|---|---|
| 20260811153409 | `aulas_schema_base` | schema `aulas`, 8 tabelas, índices |
| 20260811153452 | `aulas_scoring_triggers` | cálculo de pontos no servidor |
| 20260811153553 | `aulas_rls_e_grants` | policies, views, grants |
| 20260811153639 | `aulas_rpc` | `join_room`, `create_room`, `ensure_activity`, `new_code` |
| 20260811153720 | `aulas_fix_search_path` | correção apontada pelo linter |
| 20260811154033 | `aulas_teams_grant_por_coluna` | fecha escrita do placar pelo dono da sala |
| 20260811154724 | `aulas_faxina_automatica` | três jobs `pg_cron` |
| 20260811160312 | `fecha_enviar_resposta_publica` | revoga a RPC aberta herdada |

**Os arquivos `.sql` ainda não estão neste diretório.** A cópia canônica está no projeto, em
`supabase_migrations.schema_migrations`. Para trazê-los para cá de forma fiel — sem
transcrição manual, que introduziria divergência silenciosa entre arquivo e banco:

```bash
npx --yes supabase@latest login          # autenticação pelo navegador, uma vez
npx --yes supabase@latest link --project-ref yfnilksnqehysxunujli
npx --yes supabase@latest db pull
```

Até isso ser feito, **o banco é a única cópia do schema.** Vale resolver antes da primeira aula.

## Decisões que não são óbvias lendo o SQL

**Toda a aritmética de pontuação é do servidor.** O cliente afirma se acertou — o gabarito já
está no JS público, e travar isso exigiria duplicar as 45 questões no banco, criando uma segunda
fonte de verdade para sincronizar. Mas o cliente **não** decide quantos pontos vale: o trigger
`answers_before_insert` recalcula a partir de `secs_left` e do `scoring` congelado na sala. Um
teste enviando `secs_left = 9999` e `points = 999999` gravou 250, o teto.

**O bônus por velocidade sobrevive a isso**, e é requisito pedagógico: os alunos do projeto
irmão do Exame do Estado Mental sentiram falta dele quando não havia.

**`scoring` é um snapshot.** Congelado na criação da sala para que editar `js/core/config.js`
depois não reescreva retroativamente o placar de uma aula já jogada.

**`item_count` existe para normalizar.** Os módulos têm de 4 a 10 questões (1.000 a 2.500 pts).
A view `v_leaderboard` expõe `score_pct` justamente para que comparar módulos não premie quem
escolheu o mais longo.

**`room_id` é desnormalizado em `answers` de propósito.** O filtro de Realtime só aceita
`coluna=eq.valor` na própria tabela assinada; sem essa coluna, o painel do professor teria de
assinar todas as respostas de todas as salas do banco.

**Estar autenticado não autoriza nada.** Com sign-in anônimo ligado, qualquer visitante da
internet recebe a role `authenticated`. O portão real é a allowlist `aulas.instructors`, mais
policies `restrictive` checando o claim `is_anonymous` nas escritas de `rooms`.

**Escrita no placar é bloqueada por GRANT DE COLUNA, não por policy.** RLS controla quais
_linhas_, não quais _colunas_ — a policy que deixa o professor renomear e bloquear um grupo
deixava também reescrever `score`. Descoberto testando, não revisando.

**`join_room` é `SECURITY DEFINER`** para não precisar dar `SELECT` em `rooms` a desconhecidos,
o que permitiria enumerar salas abertas e entrar nelas.

## Resolvido em 11/08/2026

- **`public.enviar_resposta`** ✅ — função `SECURITY DEFINER` herdada do uso anterior deste
  projeto, executável por `anon`, que não validava nada: qualquer portador da chave publishable
  gravava ou sobrescrevia qualquer linha de `public.respostas`, em qualquer sessão, para
  qualquer grupo. Confirmada pelo linter (lints 0028 e 0029).

  `EXECUTE` revogado de `anon`, `authenticated` e `public`. Verificado: chamada com a chave
  pública devolve `401 permission denied for function enviar_resposta`. Função e tabela seguem
  intactas, com as mesmas 0 linhas. Para reverter:

  ```sql
  grant execute on function public.enviar_resposta(text,text,text,int,jsonb)
    to anon, authenticated;
  ```

- **Rate limit de sign-in anônimo** ✅ — subido de 30 para 200/hora por IP. O limite é por IP, e
  a turma inteira compartilha o NAT da faculdade: na prática é um teto por *sala*, não por
  aluno. Cada aparelho gasta uma entrada só na primeira vez (o token persiste em
  `localStorage`), então F5 e troca de aba não consomem cota.

## Pendências

- **Migrations não versionadas** — ver acima. Precisa de `supabase login`, que é interativo.
- **Leaked password protection** está desligada (Authentication → Passwords). Vale ligar,
  sobretudo se for definir uma senha nova para o painel do professor.

## Verificação

O teste de RLS que validou o desenho está descrito em
[docs-internos/](../docs-internos/). Resumo: anônimo não cria sala e não enxerga sala nem grupo
antes de entrar; apelido é normalizado; reentrada é idempotente; questão repetida e fora da
faixa são bloqueadas; `room_id` falsificado pelo cliente é sobrescrito.
