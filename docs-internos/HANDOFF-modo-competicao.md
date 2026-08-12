# Handoff — Modo Competição

Documento de continuidade para retomar em outra sessão. Última atualização:
**12/08/2026**. Atualize ao fim de cada bloco de trabalho.

**Onde paramos:** o backend está no ar e testado, as duas telas funcionam, e o
professor conseguiu entrar no console pelo magic link. A única pendência aberta
é um relato de que, ao voltar do e-mail, a tela do **aluno** apareceu em vez da
do professor — não confirmado, ver §7.

---

## 1. Estado do repositório

Branch **`modo-competicao`**, 14 commits à frente da `main`, **não publicado**.
A `main` está publicada e contém a Fase 0 (histórico de progresso, sons, CI).

```bash
git checkout modo-competicao          # onde o trabalho está
node tests/run.js                     # 46 testes
python3 scripts/devserver.py 8120     # servidor SEM cache (importante — ver §6)
```

Nada foi mesclado nem publicado. Publicar exige decidir se o modo competição
vai ao ar para o público antes da primeira aula real.

## 2. O que existe

**Fase 0 — já na `main` e publicada.** Barramento `EDL.quizEvents`, histórico
por questão em `js/core/progress.js`, sons sintetizados em `js/core/sfx.js`,
testes rodando no CI, `scripts/devserver.py`.

**Backend.** Schema `aulas` no projeto Supabase **Afya**
(`yfnilksnqehysxunujli`), 9 migrations versionadas em `supabase/migrations/`.
Multi-instituição e multi-app: um projeto por INSTITUIÇÃO, nunca por aula. Ver
[supabase/README.md](../supabase/README.md) para as decisões de schema.

**Front-end.** `js/compete/`, oito arquivos, sem SDK e sem CDN:

| Arquivo | Papel |
|---|---|
| `config.js` | URL, chave publishable, chaves de localStorage |
| `rest.js` | `fetch` direto no PostgREST e GoTrue; captura do magic link |
| `estado.js` | identidade do grupo, época, fila offline |
| `local.js` | backend `BroadcastChannel`, sem rede |
| `api.js` | interface única; escolhe o backend |
| `banco-jogo.js` | 30 questões do modo game + sorteio |
| `tela-jogar.js` | tela do grupo (`#/jogar`) |
| `tela-sala.js` | console do professor (`#/sala`) |

## 3. As decisões que não se deduzem lendo o código

**O modo game é separado dos módulos.** As questões da competição vêm de
`banco-jogo.js`, não dos quizzes dos módulos. Três motivos, o primeiro sendo o
que decide: reusar os quizzes criaria **spoiler** — quem estudou o módulo já viu
exatamente aquelas questões, e o `progress.js` ainda lista para ele quais errou.
Somam-se o ritmo (módulos têm de 4 a 10 questões) e o atrito de mandar a turma
rolar até o fim de uma página longa.

**O sorteio é derivado do código da sala.** `bancoJogo.sortear(code, n)` usa o
RNG semeado de `math.js`. Mesmo código, mesmo sorteio, em qualquer aparelho —
todos os grupos recebem as mesmas questões sem precisar guardar a seleção no
banco. E ninguém sabe quais N das 30 vão cair.

**Toda a aritmética de pontuação é do servidor.** O cliente afirma se acertou (o
gabarito está no JS público de qualquer forma), mas **não** decide quantos
pontos vale: o trigger `answers_before_insert` recalcula a partir de `secs_left`
e do `scoring` congelado na sala. Um teste enviando `secs_left = 9999` e
`points = 999999` gravou 250, o teto.

**O bônus por velocidade é requisito pedagógico, não enfeite.** Os alunos do
projeto irmão do Exame do Estado Mental sentiram falta dele quando não havia.
Ele sobrevive à correção no servidor — foi desenhado para isso.

**O modo local não é mock.** É fallback de produção, para Supabase pausado ou
rede caída, e é como se ensaia a aula em abas do notebook. Ele reimplementa a
fórmula de pontos do trigger, e seis testes garantem a paridade: se divergirem,
o ensaio dá um número e a aula real dá outro.

**Sem `supabase-js`.** Não é para evitar um domínio novo (o site já carrega o D3
do jsdelivr). São 211 KB a menos no celular do aluno, e **um ponto de falha a
menos**: para jogar já é preciso alcançar o Supabase; com o SDK seria preciso
alcançar também o CDN. O custo é real e está registrado: renovação de token,
tratamento de erro e o futuro cliente de Realtime são nossos para manter.

**Polling, não Realtime.** O console consulta a cada 3 s. Realtime fica para
depois — e mesmo lá o poll continuará vivo como rede de segurança, porque um
WebSocket que cai em silêncio congela o telão sem avisar ninguém.

## 4. Bugs encontrados hoje, e o que cada um ensina

Todos apareceram **testando**, não revisando. Vale repetir o método.

**RLS controla linhas, não colunas.** A policy que deixa o professor renomear e
bloquear um grupo deixava também reescrever o `score` agregado. O teste gravou
999999 e o placar aceitou. Corrigido com grant por coluna.

**`document.hidden` bloqueava a primeira pintura**, não só o poll. O professor
que abrisse o console numa aba de fundo e a levasse à projeção encontraria o
painel vazio.

**O console não guardava a sala aberta.** Um F5 no meio da aula e ele esqueceria
qual sala está no ar, oferecendo criar outra — enquanto a turma inteira continua
na antiga, com o placar vazio e sem explicação.

**O modo de ensaio não atravessava abas.** O "Ensaiar sem internet" valia só na
aba do professor. Ele abria sala local e o aluno ia procurá-la no Supabase.
Fatal justamente para o caso de uso que o modo local existe para servir.

**O magic link não recarrega a página se o site já estiver aberto.** O endereço
difere apenas no fragmento, então só dispara `hashchange` — e a captura do token
não rodaria. O login se perderia em silêncio.

**O console não tinha como ser alcançado.** A rota `#/sala` existia sem link
nenhum para ela. Hoje há um no rodapé.

**Gabarito enviesado.** 16 das 30 respostas certas caíam na posição B; quem
percebesse acertaria metade chutando. Rebalanceado para 7/7/9/7.

**Uma questão com a conta errada.** 3¹⁰ ÷ 1,5¹⁰ = 2¹⁰ = 1.024, não 400 como
estava na versão herdada dos módulos.

## 5. Configuração do Supabase — estado atual

| Item | Estado |
|---|---|
| Projeto | **Afya** (`yfnilksnqehysxunujli`), us-east-2 |
| Schema `aulas` exposto na Data API | ✅ |
| Sign-in anônimo | ✅ ligado |
| Rate limit anônimo | ✅ 200/hora por IP |
| Professor na allowlist `aulas.instructors` | ✅ |
| SMTP customizado (Gmail) | ✅ **desligado** em 12/08 |
| Redirect URLs | ✅ configuradas |
| `public.enviar_resposta` | ✅ `EXECUTE` revogado |
| Leaked password protection | ⬜ desligada (opcional) |

**Limite de e-mail: 2 por hora.** É o serviço interno do Supabase, e o log
registra a troca: `updating Email limiter from 30 to 2/1h`. Apertado demais para
produção — se o link cair no spam e for preciso reenviar duas vezes, acaba a
cota no meio da aula.

**O caminho para resolver isso**, sem pressa: apontar o SMTP para um serviço
transacional (Resend ou Brevo, camada gratuita). Isso devolve também o **template
editável**, e com ele o código de 6 dígitos — que era o desenho preferido. O
Gmail não serve: exige App Password e o próprio painel avisa que a
entregabilidade sofre.

**Restrição descoberta hoje:** o Supabase **só permite editar templates de
e-mail quando há SMTP customizado**. Com o serviço interno vale o template
padrão, que manda link e não código. Foi isso que inverteu a decisão de OTP para
magic link.

## 6. Armadilhas que já custaram tempo

**Cache do servidor de dev.** `python -m http.server` serve JS antigo e o
sintoma parece bug de lógica. Use `python3 scripts/devserver.py`. Já mordeu duas
vezes hoje, e é o item marcado como "(recorrente)" no projeto do EEM.

**`document.hidden` é `true` no painel automatizado do navegador.** O poll não
roda. Para testar, sobrescreva com `Object.defineProperty`.

**Trocar só o fragmento não recarrega a página.** Vale para o magic link e para
qualquer teste que navegue por hash.

**O rate limit de e-mail é 2/hora.** Não gaste tentativas em teste.

## 7. Pendências

**ABERTA E PRIORITÁRIA — tela do aluno em vez do console.** O professor relatou
que, ao voltar do magic link, apareceu a tela do aluno. Não confirmado: minutos
antes ele havia relatado que a tela de criar sala apareceu corretamente. Duas
hipóteses:

- recarregou a página, caiu na home e clicou no card "Entrar numa competição"
  (sem bug, só dois caminhos parecidos);
- o retorno do link pousou em `#/jogar` (bug na captura, que meus testes não
  pegaram).

**Para diagnosticar:** peça o que está depois do `#` no endereço e o título na
tela — "Entrar na sala" é do aluno, "Nova rodada" é do professor. Se a sessão
do professor tiver sobrevivido (`localStorage['edl.compete.auth.prof.v1']`), é a
primeira hipótese.

**Revisão das 30 questões** em `js/compete/banco-jogo.js`. Conteúdo médico
gerado, com aviso no cabeçalho do arquivo. Confira sobretudo os números de R₀,
coberturas vacinais e os dados históricos.

**Verificação final contra o Supabase real**, nunca feita ponta a ponta com o
console logado: abrir sala → grupos entrando → placar e mapa de calor ao vivo.
Tudo foi testado, mas em partes — o backend com SQL e o front em modo local.

**Duas referências do módulo 8** aguardando conferência na Crossref: ver
[docs-internos/README.md](README.md).

**Realtime** (Fase 2), pódio animado no telão, QR code, export CSV.

## 8. Como retomar

1. Ler este documento e o [supabase/README.md](../supabase/README.md).
2. `git checkout modo-competicao` e `node tests/run.js` (esperado: 46/46).
3. Resolver a pendência de §7 antes de qualquer coisa nova.
4. Fazer a verificação ponta a ponta contra o Supabase real.
5. Só então decidir sobre publicar e sobre Realtime.

**O método que funcionou hoje, e vale manter:** testar contra o sistema real em
vez de confiar no desenho. Todos os oito bugs acima vieram daí — nenhum
apareceu em revisão de código.
