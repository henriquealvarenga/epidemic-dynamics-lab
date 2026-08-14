/* =========================================================================
 * EDL — compete/api.js
 *
 * Interface única do modo competição. As telas falam só com este arquivo e
 * não sabem se o jogo está rodando contra o Supabase ou entre abas do
 * próprio navegador.
 *
 *   modo() === 'sala'  → Supabase (compete/rest.js)
 *   modo() === 'local' → BroadcastChannel (compete/local.js)
 *
 * A escolha é automática: se a config estiver desligada, incompleta ou a
 * rede falhar na entrada, cai para local. A aula acontece de um jeito ou
 * de outro.
 *
 * O MODO GAME É UMA ATIVIDADE PRÓPRIA
 *   As questões da competição vêm de compete/banco-jogo.js, não dos
 *   quizzes dos módulos. A tela do jogo chama registrarResposta()
 *   explicitamente — nada aqui escuta o barramento global, para que abrir
 *   um módulo no meio da rodada não conte pontos na competição.
 *
 * Exporta: window.EDL.compete.api
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const compete = (EDL.compete = EDL.compete || {});
  const cfg = compete.config;

  let modoAtual = null;          // 'sala' | 'local' — resolvido na 1ª conexão

  function modo() {
    return modoAtual || (compete.rest.configValida() ? 'sala' : 'local');
  }

  function remoto() { return modo() === 'sala'; }

  /* -----------------------------------------------------------------------
   * Professor
   * --------------------------------------------------------------------- */

  async function criarSala(opcoes) {
    const o = opcoes || {};
    const scoring = EDL.quiz.scoringConfig();
    /* O servidor guarda o scoring em snake_case; o quiz-engine devolve em
     * camelCase. A tradução é aqui, num lugar só. */
    const scoringServidor = {
      seconds: scoring.seconds, base: scoring.base,
      bonus_per_sec: scoring.bonusPerSec, late: scoring.late
    };

    if (remoto()) {
      const r = await compete.rest.rpc('create_room', {
        p_app_slug: cfg.appSlug,
        p_external_id: o.activityRef,
        p_title: o.title || o.activityRef,
        p_item_count: o.itemCount,
        p_scoring: scoringServidor,
        p_label: o.label || null,
        p_max_teams: o.maxTeams || 40,
        p_hours: o.hours || 6
      }, compete.rest.professor);

      if (r.ok) {
        modoAtual = 'sala';
        return { ok: true, dados: normalizarSala(r.dados) };
      }
      return { ok: false, erro: r.erro };
    }

    modoAtual = 'local';
    const r = compete.local.criarSala({
      activityRef: o.activityRef, title: o.title,
      itemCount: o.itemCount, scoring: scoringServidor
    });
    return r.ok ? { ok: true, dados: normalizarSala(r.dados) } : r;
  }

  function normalizarSala(d) {
    if (!d) return null;
    return {
      roomId:      d.room_id || d.roomId,
      code:        d.code,
      status:      d.status,
      scoring:     d.scoring,
      activityRef: d.external_id || d.activityRef,
      itemCount:   d.item_count != null ? d.item_count : d.itemCount,
      epoca:       d.epoca || null
    };
  }

  /* -----------------------------------------------------------------------
   * Recuperar a sala aberta PELO SERVIDOR
   *
   * A sala aberta era lembrada só no `localStorage`, que é por origem e por
   * navegador. Consequência descoberta na verificação de 13/08: abrir o
   * console de outro lugar — outra porta, o endereço publicado, outro
   * computador, ou depois de limpar o navegador — oferecia CRIAR OUTRA
   * sala, sem caminho nenhum para retomar ou encerrar a que estava no ar.
   * Ela ficava viva até expirar (6h) e quem tinha o código continuava
   * respondendo numa rodada que o professor dava por encerrada.
   *
   * O servidor sempre soube a resposta; faltava perguntar. `rooms_select`
   * já permite ao dono ler as próprias salas, e `cat_read_activities`
   * permite ler a atividade embutida — uma consulta só resolve.
   * --------------------------------------------------------------------- */

  /** Traduz uma linha do PostgREST no formato que o console consome.
   *  Pura: é o pedaço que os testes alcançam sem rede. */
  function salaDoServidor(linha) {
    if (!linha) return null;
    const atv = linha.activities || {};
    const sala = normalizarSala({
      room_id:     linha.id,
      code:        linha.code,
      status:      linha.status,
      scoring:     linha.scoring,
      external_id: atv.external_id,
      /* DA SALA, não da atividade. O item_count da atividade é reescrito
       * a cada rodada nova (ver a migration de 14/08): retomar por ele
       * daria ao professor um sorteio diferente do que a turma está
       * respondendo. A atividade só serve de reserva para salas antigas,
       * criadas antes da coluna existir. */
      item_count:  linha.item_count != null ? linha.item_count : atv.item_count
    });
    sala.label     = linha.label || null;
    sala.criadaEm  = linha.created_at || null;
    sala.expiraEm  = linha.expires_at || null;
    return sala;
  }

  /**
   * Salas ainda abertas deste professor.
   *
   * Devolve { ok, salas } ou { ok:false, erro }: a diferença entre "não há
   * sala aberta" e "não consegui perguntar" muda o que a tela oferece.
   *
   * O filtro de expiração é feito aqui, e não no PostgREST, porque `now()`
   * não é literal aceito na query — e porque o cron que fecha salas
   * vencidas roda a cada 15 min, então uma sala expirada pode ainda constar
   * como `open` por alguns minutos. Ela não aceita mais resposta nenhuma
   * (o trigger e o `join_room` checam `expires_at` de forma síncrona), logo
   * oferecer "retomar" nela seria mentira.
   */
  /**
   * Situação da sala em que o GRUPO está, direto do servidor.
   *
   * A tela do aluno guardava só a identidade local, então uma rodada
   * encerrada continuava parecendo em andamento: a home seguia oferecendo
   * "Voltar para a sala XXXX" para sempre, e o grupo só descobria o fim ao
   * tentar responder e levar um 403. A policy `rooms_select` já deixa o
   * membro ler a própria sala — `is_member_of(id)`.
   *
   * Devolve { ok, status } ou { ok:false }.
   *
   * A distinção que importa, e que eu errei na primeira versão: **"não
   * consegui perguntar" não é a mesma coisa que "perguntei e a sala não
   * está lá"**. Rede caída tem de deixar a tela como está — concluir que a
   * aula acabou por causa de um timeout tiraria o grupo do jogo no meio da
   * rodada. Mas uma resposta VAZIA do servidor é uma resposta: a sala foi
   * apagada, expirou e saiu na faxina, ou o grupo não é mais membro dela.
   * Em nenhum desses casos faz sentido continuar oferecendo "voltar para a
   * sala" — foi exatamente o que apareceu na tela depois de a sala de teste
   * ser apagada.
   */
  async function situacaoDaSala(roomId) {
    if (!remoto()) return { ok: false };
    if (!roomId) return { ok: false };

    const r = await compete.rest.selecionarDetalhado('rooms',
      'select=status,expires_at&id=eq.' + encodeURIComponent(roomId),
      compete.rest.aluno);

    if (!r.ok) return { ok: false };                    // não deu para perguntar
    if (!r.dados.length) return { ok: true, status: 'sumiu' };  // respondeu: não existe

    const linha = r.dados[0];
    const vencida = linha.expires_at && Date.parse(linha.expires_at) <= Date.now();
    return { ok: true, status: vencida ? 'closed' : linha.status };
  }

  /** A sala ainda aceita o grupo? Só `open` e `running` valem; qualquer
   *  outra coisa — encerrada, vencida, apagada — é rodada terminada. */
  function salaAcabou(situacao) {
    if (!situacao || !situacao.ok) return false;        // na dúvida, não mexe
    return situacao.status !== 'open' && situacao.status !== 'running';
  }

  async function salasAbertas() {
    if (!remoto()) return { ok: true, salas: [] };

    const uid = compete.rest.professor.uid();
    if (!uid) return { ok: true, salas: [] };

    const r = await compete.rest.selecionarDetalhado('rooms',
      'select=id,code,status,scoring,label,item_count,created_at,expires_at,' +
      'activities(external_id,item_count)' +
      '&owner_uid=eq.' + encodeURIComponent(uid) +
      '&status=eq.open&order=created_at.desc',
      compete.rest.professor);

    if (!r.ok) return { ok: false, erro: r.erro };

    const agora = Date.now();
    const salas = r.dados
      .map(salaDoServidor)
      .filter(s => s && (!s.expiraEm || Date.parse(s.expiraEm) > agora));
    return { ok: true, salas: salas };
  }

  /* -----------------------------------------------------------------------
   * Grupo
   * --------------------------------------------------------------------- */

  async function entrar(codigo, apelido) {
    const code = String(codigo || '').trim().toUpperCase();

    if (compete.rest.configValida()) {
      const login = await compete.rest.entrarAnonimo();
      if (login.ok) {
        const r = await compete.rest.rpc('join_room',
          { p_code: code, p_nickname: apelido }, compete.rest.aluno);
        if (r.ok) {
          modoAtual = 'sala';
          return concluirEntrada(r.dados);
        }
        /* Erro de regra (sala inexistente, nome repetido, lotada) é do
         * usuário: reportar, NÃO cair para local — cair silenciosamente
         * separaria o grupo da turma sem ninguém perceber. */
        if (r.status && r.status !== 0) return { ok: false, erro: r.erro };
      }
      // Só falha de REDE chega aqui.
    }

    modoAtual = 'local';
    const r = compete.local.entrar(code, apelido);
    return r.ok ? concluirEntrada(r.dados) : r;
  }

  function concluirEntrada(d) {
    const info = {
      modo: modo(), code: d.code, roomId: d.room_id, teamId: d.team_id,
      nickname: d.nickname, activityRef: d.external_id,
      itemCount: d.item_count, scoring: d.scoring,
      epoca: d.epoca || null, resumeAt: d.resume_at || 0,
      score: d.score || 0
    };
    compete.estado.definir(info);
    return { ok: true, dados: info };
  }

  async function sair() {
    compete.estado.limpar();
    return { ok: true };
  }

  /* -----------------------------------------------------------------------
   * Ponte com o quiz
   * --------------------------------------------------------------------- */

  /**
   * Registra uma resposta da rodada. Chamado EXPLICITAMENTE pela tela do
   * jogo, via `onAnswer` do EDL.quiz.run.
   *
   * Por que explícito, e não assinando EDL.quizEvents: o modo game é uma
   * atividade PRÓPRIA, separada dos módulos. Se escutássemos o barramento
   * global, um grupo que abrisse um módulo para consultar a teoria no meio
   * da rodada teria aquelas respostas contadas na competição. Aqui, só o
   * que a tela do jogo emite conta.
   *
   * O barramento continua servindo ao histórico local (progress.js) e aos
   * sons (sfx.js), que valem em qualquer contexto.
   */
  function registrarResposta(ev) {
    if (!compete.estado.emSala()) return;
    const id = compete.estado.get();
    compete.estado.enfileirar({
      roomId: id.roomId, teamId: id.teamId,
      questionIdx: ev.index, chosenIdx: ev.pickedIndex,
      isCorrect: !!ev.correct, secsLeft: ev.secsLeft,
      elapsedMs: ev.elapsedMs
    });
  }

  /* Transporte da fila. Fica aqui porque estado.js não conhece backend. */
  compete.estado.definirTransporte(async function (item) {
    if (remoto()) {
      const r = await compete.rest.inserir('answers', {
        team_id: item.teamId, room_id: item.roomId,
        question_idx: item.questionIdx, chosen_idx: item.chosenIdx,
        is_correct: item.isCorrect, secs_left: item.secsLeft,
        elapsed_ms: item.elapsedMs
      }, compete.rest.aluno);
      if (r.ok) return { ok: true };
      /* 409 = duplicata (já chegou antes); 400 = fora da faixa. Repetir
       * não adianta: marca como permanente para a fila descartar. */
      const permanente = r.status === 409 || r.status === 400;
      return { ok: false, permanente: permanente, erro: r.erro };
    }
    return compete.local.registrarResposta(item);
  });

  /* -----------------------------------------------------------------------
   * Leitura para o painel
   * --------------------------------------------------------------------- */

  async function placar(roomId, sessao) {
    if (remoto()) {
      return await compete.rest.selecionar('v_leaderboard',
        'room_id=eq.' + encodeURIComponent(roomId) + '&order=position.asc',
        sessao || compete.rest.professor);
    }
    return compete.local.placar(roomId);
  }

  async function estatisticas(roomId, sessao) {
    if (remoto()) {
      return await compete.rest.selecionar('v_room_item_stats',
        'room_id=eq.' + encodeURIComponent(roomId) + '&order=question_idx.asc',
        sessao || compete.rest.professor);
    }
    return compete.local.estatisticasPorQuestao(roomId);
  }

  async function encerrarSala(roomId) {
    if (remoto()) {
      /* PATCH direto: a policy rooms_update já limita às salas do próprio
       * professor, então uma RPC só para isso seria cerimônia. */
      const r = await compete.rest.atualizar('rooms',
        'id=eq.' + encodeURIComponent(roomId),
        { status: 'closed', closed_at: new Date().toISOString() },
        compete.rest.professor);
      return r.ok ? { ok: true } : { ok: false, erro: r.erro };
    }
    return compete.local.atualizarSala(roomId, { status: 'closed' });
  }

  /**
   * Acompanha uma sala. `cb` é chamado quando algo muda.
   *
   * No modo sala isto é POLLING, de propósito: Realtime entra na fase
   * seguinte, e mesmo lá o poll continuará vivo como rede de segurança —
   * WebSocket que cai em silêncio congela o telão sem avisar ninguém.
   */
  function observar(roomId, cb) {
    if (!remoto()) return compete.local.observar(roomId, cb);
    const t = setInterval(() => cb({ tipo: 'poll', roomId: roomId }), cfg.pollMs);
    cb({ tipo: 'inicial', roomId: roomId });
    return function parar() { clearInterval(t); };
  }

  /* Restaura o modo se o aparelho já estava numa sala (F5). */
  if (compete.estado.emSala()) {
    modoAtual = compete.estado.get().modo || null;
  }

  compete.api = {
    modo, criarSala, entrar, sair, placar, estatisticas, encerrarSala, observar,
    registrarResposta, salasAbertas, situacaoDaSala, salaAcabou,
    _salaDoServidor: salaDoServidor   // exposto para os testes
  };
})();
