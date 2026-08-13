# Handoff — Modo Competição

Documento de continuidade para retomar em outra sessão. Última atualização:
**13/08/2026**. Atualize ao fim de cada bloco de trabalho.

**Onde paramos:** a **verificação ponta a ponta contra o Supabase real está
feita** (§7) — console logado, sala aberta, três grupos jogando, placar e mapa de
calor ao vivo, pódio e encerramento, com as duas tentativas de fraude recusadas
pelo servidor. O bug do §7 anterior (tela do aluno em vez do console) foi
reproduzido e corrigido. A pendência prioritária agora é outra, descoberta na
própria verificação: **uma sala aberta só é alcançável do navegador e da origem
que a criaram** — de qualquer outro lugar não há como retomá-la nem encerrá-la.

---

## 1. Estado do repositório

Branch **`modo-competicao`**, 16 commits à frente da `main`, **não publicado**.
A `main` está publicada e contém a Fase 0 (histórico de progresso, sons, CI).

```bash
git checkout modo-competicao          # onde o trabalho está
node tests/run.js                     # 54 testes
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

## 4. Bugs encontrados, e o que cada um ensina

Todos apareceram **testando**, não revisando. Vale repetir o método.

**O retorno do magic link só sabia dar certo (13/08).** A captura lia
`access_token` do fragmento e ignorava a outra coisa que o GoTrue devolve pelo
mesmo caminho: `#error=access_denied&error_code=otp_expired`. Sem reconhecer o
erro, o roteador não achava rota nenhuma, caía na home **em silêncio** — e o que
mais salta aos olhos ali é o card "Entrar numa competição". Daí o professor
terminar na tela do aluno. Ensina que **o caminho de erro de um login também é
uma tela**, e que um link de uso único falha por motivo banal: alguns filtros
antivírus de e-mail abrem os links da mensagem antes do destinatário, gastando o
link antes do primeiro clique humano.

**`location.reload()` não interrompe os outros ouvintes (13/08).** Descoberto ao
testar a correção acima: o `reload()` só agenda a recarga, então o roteador ainda
rodava, pintava a tela do professor e nisso **consumia** o aviso de link
inválido — que é entregue uma vez só — numa pintura que a recarga jogava fora.
O sintoma era idêntico ao bug original: tela muda, sem explicação. Resolvido com
`stopImmediatePropagation()`: quando a captura assume a navegação, ela é dela.

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

**O "testar conexão" mentia (13/08).** Ele pingava a raiz do PostgREST
(`/rest/v1/`), e o Supabase passou a exigir **chave secreta** ali: com a
publishable — a única que este site tem, e corretamente — o teste dava
`401 Secret API key required` **sempre**. Um diagnóstico que acusa falha com tudo
no ar é pior do que não ter botão: na frente da turma manda o professor procurar
problema de rede inexistente. Hoje testa `/auth/v1/health` e, havendo sessão, uma
leitura real no schema `aulas`.

**O link do professor existia e mesmo assim não existia (13/08).** O rodapé
ganhou "Console do professor" em 12/08, e medindo a home ele está a **2602px numa
página de 2704px** — três telas abaixo do card do aluno, que fica a 386px. Na
verificação ponta a ponta o próprio professor perguntou por onde entrava. É a
mesma lição do bug do §7: quem cai na home sem rumo encontra só a tela do ALUNO.
Agora há um link discreto logo abaixo do card da competição, acima da dobra.

## 5. Configuração do Supabase — estado atual

| Item | Estado |
|---|---|
| Projeto | **Afya** (`yfnilksnqehysxunujli`), `ACTIVE_HEALTHY`, Postgres 17.6, us-east-2 |
| Migrations aplicadas | ✅ 8 — as mesmas 8 de `supabase/migrations/`, nada pendente |
| Schema `aulas` exposto na Data API | ✅ |
| Sign-in anônimo | ✅ ligado |
| Rate limit anônimo | ✅ 200/hora por IP |
| Professor na allowlist `aulas.instructors` | ✅ |
| Login por senha do professor | ✅ testado contra o GoTrue real em 13/08 |
| SMTP customizado (Gmail) | ✅ **desligado** em 12/08 |
| **Site URL** | ⚠️ **`http://localhost:3000`** — padrão de fábrica, ver abaixo |
| Redirect URLs | ⬜ conferir se cobrem 8010 e 8120 |
| `public.enviar_resposta` | ✅ `EXECUTE` revogado |
| Leaked password protection | ⬜ desligada (opcional) |

**A Site URL está no padrão de fábrica**, e isso já custou duas mensagens da
cota. Links gerados pelo PAINEL (reset de senha, convite) ignoram qualquer
`redirect_to` e vão sempre para a Site URL — então caem em `localhost:3000`, onde
não há nada servindo, e a tela abre em branco. O link do próprio console é outra
história: ele manda `redirect_to` com a origem atual, que precisa estar nas
Redirect URLs. Arrume os dois em Auth → URL Configuration antes da aula.

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
vezes, e é o item marcado como "(recorrente)" no projeto do EEM.

**E o cache da ABA já aberta, mesmo com o servidor certo.** O `devserver.py`
manda `no-store` e mesmo assim uma aba que já estava aberta continuou executando
o JS anterior — recarregar, inclusive forçado, não bastou; a correção só apareceu
em **aba nova**. Custou uma rodada de diagnóstico atrás de um bug que já estava
corrigido no disco. Antes de acreditar num teste de front, confirme que a página
tem o código novo (algo como `typeof EDL.compete.rest._lerRetornoDoLink`).

**`document.hidden` é `true` no painel automatizado do navegador.** O poll não
roda. Para testar, sobrescreva com `Object.defineProperty`.

**Trocar só o fragmento não recarrega a página.** Vale para o magic link e para
qualquer teste que navegue por hash.

**O rate limit de e-mail é 2/hora.** Não gaste tentativas em teste. Em 13/08 a
cota acabou no meio da verificação, e o desbloqueio foi definir a senha por SQL
(`update auth.users set encrypted_password = extensions.crypt(...)`), que não
depende de e-mail nenhum. A senha do console vive no gerenciador de senhas do
professor — **nunca** no repositório, que é publicado.

**Sessão e sala aberta são por ORIGEM.** `localStorage` não atravessa portas nem
navegadores: rodar o site em 8010 e 3000 ao mesmo tempo cria dois mundos
independentes. Em 13/08 isso produziu uma tela pedindo login e outra oferecendo
"Nova rodada" enquanto a sala corria — e a sala real ficou alcançável só do
navegador que a criou. Ensaie sempre numa origem só.

## 7. Pendências

**RESOLVIDA (13/08) — tela do aluno em vez do console.** As duas hipóteses
estavam certas, e a segunda explicava a primeira: o retorno do link **não**
pousava em `#/jogar`, mas quando o link vinha com **erro** em vez de token
(`#error=access_denied&error_code=otp_expired`, que é o que o GoTrue devolve
para link já usado), a captura não reconhecia nada, o roteador caía na **home**
sem avisar, e o card mais visível de lá leva à tela do aluno. O professor não
"clicou no lugar errado": foi despejado num lugar onde aquele era o caminho
óbvio.

Reproduzido no navegador nos dois caminhos — carga direta e clique com o site já
aberto. Hoje qualquer retorno do link vai para `#/sala`, o endereço é limpo
(fragmento e query), e o motivo aparece escrito na tela de login: *"Este link de
acesso não vale mais: cada um funciona uma vez só, e alguns filtros de e-mail o
abrem antes de você. Peça outro — ou entre com senha."*

Oito testes novos em `tests/run.js` cobrem a leitura do retorno (54 no total);
`rest.js` passou a ser carregado pelo runner, o que antes não acontecia.

**Consequência prática para o dia da aula:** um link de uso único pode chegar
gasto, porque filtros de e-mail o abrem antes do destinatário. O **login por
senha** não depende disso e continua sendo o caminho confiável com a turma
esperando.

**Revisão das 30 questões** em `js/compete/banco-jogo.js`. Conteúdo médico
gerado, com aviso no cabeçalho do arquivo. Confira sobretudo os números de R₀,
coberturas vacinais e os dados históricos.

**FEITA (13/08) — verificação ponta a ponta contra o Supabase real.** Sala
`74J4DH`, 10 questões: console logado por senha → sala aberta → três grupos
entrando (um pela interface real, dois por sessões anônimas próprias, simulando
aparelhos separados) → placar e mapa de calor ao vivo no console → pódio →
encerramento. O que ficou provado, e que só o servidor real poderia provar:

- **A aritmética é do servidor.** Dez respostas gravadas, dez pontuações batendo
  com a fórmula (210 com 22s restantes, 250 no teto, 50 fora do tempo, 0 no erro).
- **A trapaça de pontos morre no trigger.** `secs_left: 9999` + `points: 999999`
  entraram como `secs_left` 30 e **250 pontos**.
- **A trapaça de placar morre no grant por coluna.** `PATCH` do grupo no próprio
  `score` → `403 / 42501 permission denied for table teams`. É a confirmação, em
  produção, do bug de RLS corrigido em 12/08.
- **Resposta repetida → 409** (`answers_team_id_question_idx_key`), exatamente o
  status que a fila do `api.js` trata como permanente e descarta.
- **Sala encerrada não aceita mais nada:** quem já estava dentro leva
  `403 sala não aceita respostas`; quem tenta entrar depois, `P0002 sala
  inexistente, encerrada ou expirada`. Nada cai para o modo local nesse caminho.
- **O mapa de calor entrega o dado pedagógico:** a questão com 0% mostrou o
  distrator que a "turma" escolheu em peso ("Erro mais comum: Pandemia").

**ABERTA E PRIORITÁRIA — sala aberta só é alcançável de onde foi criada.** O
console guarda a sala em `localStorage`, que é por origem e por navegador. Se o
professor abrir o console de outro lugar — outra porta, o endereço publicado,
outro computador, ou depois de limpar o navegador — a tela oferece **criar outra
sala**, e não há caminho nenhum para retomar ou encerrar a que está no ar. Ela
fica viva até `expires_at` (6h), e quem tiver o código continua respondendo numa
rodada que o professor considera terminada. Aconteceu em 13/08: o encerramento só
foi possível pelo navegador que abriu a sala.

**A correção é pequena:** ao entrar no console, consultar
`rooms?owner_uid=eq.<uid>&status=eq.open` e oferecer "você tem a sala XXXX aberta
— retomar ou encerrar". A policy de leitura do professor já existe; é uma
consulta a mais na entrada da tela. Resolve também o caso do F5 que a persistência
em `localStorage` só cobriu pela metade.

**Duas referências do módulo 8** aguardando conferência na Crossref: ver
[docs-internos/README.md](README.md).

**Realtime** (Fase 2), pódio animado no telão, QR code, export CSV.

## 8. Como retomar

1. Ler este documento e o [supabase/README.md](../supabase/README.md).
2. `git checkout modo-competicao` e `node tests/run.js` (esperado: 54/54).
3. Recuperar a sala aberta pelo servidor (§7) — é o que separa o modo competição
   de aguentar um imprevisto no meio da aula.
4. Arrumar Site URL e Redirect URLs no painel (§5), que já custaram cota de e-mail.
5. Revisar as 30 questões do banco do modo game.
6. SMTP transacional, e com ele o retorno do código de 6 dígitos (§5).
7. Só então decidir sobre publicar e sobre Realtime.

**O método que funcionou, e vale manter:** testar contra o sistema real em vez de
confiar no desenho. Os doze bugs acima vieram daí — nenhum apareceu em revisão de
código. O do magic link é o caso exemplar: o desenho estava certo para o caminho
feliz, e o caminho de erro simplesmente não existia. A verificação de 13/08
reforça: o backend passou em tudo, e o que quebrou foi o **operacional em volta**
— um botão de diagnóstico mentindo, um link que ninguém acha, uma sala que só
existe no navegador que a abriu.
