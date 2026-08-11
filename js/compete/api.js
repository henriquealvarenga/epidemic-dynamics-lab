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
 * AQUI TAMBÉM MORA A PONTE COM O QUIZ
 *   Ao entrar numa sala, este arquivo assina `EDL.quizEvents` e passa a
 *   enfileirar cada resposta. O motor de quiz não sabe que competição
 *   existe, e os 8 módulos não mudaram uma linha por causa disso.
 *
 * Exporta: window.EDL.compete.api
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const compete = (EDL.compete = EDL.compete || {});
  const cfg = compete.config;

  let modoAtual = null;          // 'sala' | 'local' — resolvido na 1ª conexão
  let desassinarQuiz = null;

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
    ligarPonteDoQuiz();
    return { ok: true, dados: info };
  }

  async function sair() {
    desligarPonteDoQuiz();
    compete.estado.limpar();
    return { ok: true };
  }

  /* -----------------------------------------------------------------------
   * Ponte com o quiz
   * --------------------------------------------------------------------- */

  function ligarPonteDoQuiz() {
    if (desassinarQuiz) return;                    // idempotente
    if (!EDL.quizEvents) {
      console.warn('[EDL/compete] EDL.quizEvents ausente — respostas não serão registradas.');
      return;
    }
    desassinarQuiz = EDL.quizEvents.on('answer', function (ev) {
      if (!compete.estado.emSala()) return;
      const id = compete.estado.get();
      /* Só registra respostas do módulo da sala. Se o grupo abrir outro
       * módulo por engano, aquilo é treino, não vale para a competição. */
      if (ev.moduleId !== id.activityRef) return;

      compete.estado.enfileirar({
        roomId: id.roomId, teamId: id.teamId,
        questionIdx: ev.index, chosenIdx: ev.pickedIndex,
        isCorrect: !!ev.correct, secsLeft: ev.secsLeft,
        elapsedMs: ev.elapsedMs
      });
    });
  }

  function desligarPonteDoQuiz() {
    if (desassinarQuiz) { desassinarQuiz(); desassinarQuiz = null; }
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

  /* Reconecta a ponte se o aparelho já estava numa sala (F5). */
  if (compete.estado.emSala()) {
    modoAtual = compete.estado.get().modo || null;
    ligarPonteDoQuiz();
  }

  compete.api = {
    modo, criarSala, entrar, sair, placar, estatisticas, encerrarSala, observar,
    ligarPonteDoQuiz, desligarPonteDoQuiz
  };
})();
