/* =========================================================================
 * EDL — quiz-engine.js
 *
 * Motor de quiz reutilizável por todos os módulos. Opera em modo único
 * de desafio cronometrado, com pontuação gamificada salva globalmente.
 *
 * REGRAS DE PONTUAÇÃO:
 *   Os valores vigentes vivem em js/core/config.js — os números citados
 *   abaixo refletem a configuração padrão (30s, 100, 5, 50). Se você
 *   editar config.js, use EDL.quiz.scoringConfig() em vez de reproduzir
 *   estes números à mão em outro lugar.
 *
 *   Tempo padrão por pergunta: 30 segundos.
 *
 *   Acerto dentro do tempo:
 *       100 pts base + (segundosRestantes × 5) de bônus de velocidade
 *       → mínimo 105 pts (respondendo no último segundo)
 *       → máximo 250 pts (respondendo no primeiro segundo)
 *
 *   Acerto após o tempo expirar (tempo esgotado mas opções ainda ativas):
 *       50 pts fixos — meio-crédito. Pressão do relógio diminuída, mas
 *       quem responde fora do tempo ganha menos do que quem responde
 *       sob pressão.
 *
 *   Erro (com ou sem tempo): 0 pts.
 *
 *   Ao concluir o quiz, a pontuação total da rodada é salva via
 *   EDL.saveModuleScore(moduleId, result). O estado persiste em
 *   localStorage (gerenciado em state.js) para continuidade entre sessões.
 *
 * Formato esperado do banco (cada pergunta):
 *   {
 *     q: 'enunciado em HTML ou texto',
 *     opts: ['opção A', 'opção B', 'opção C', 'opção D'],
 *     answer: 1,                        // índice 0-based
 *     feedback: 'explicação em HTML',
 *     scenario?: {                      // mini-cenário opcional
 *       title: 'Escola pública em Juiz de Fora',
 *       body: 'Em março, 18 alunos apresentam...',
 *       meta?: [{label:'Local', value:'JF'}, {label:'Casos', value:'18'}]
 *     }
 *   }
 *
 * MODELO DE CONFIANÇA (trust model):
 *   Os campos `q`, `feedback` e `opts[i]` são interpolados diretamente em
 *   innerHTML porque carregam HTML intencional do autor (<strong>, <em>,
 *   <code>) para destaque pedagógico. O banco NÃO deve conter conteúdo
 *   de fonte externa não-verificada.
 *
 *   Os campos do `scenario` passam por escapeHtml() para permitir uso
 *   futuro com dados externos.
 *
 * API pública:
 *   EDL.quiz.run(container, {
 *     bank,                       // array de perguntas (obrigatório)
 *     secondsPerQ = 30,
 *     bonusPerSec = 5,
 *     lateAnswerPoints = 50,
 *     basePoints = 100,
 *     onAnswer?:   (event)  => {} // uma vez por pergunta respondida
 *     onComplete?: (result) => {} // { correct, total, score }
 *   })
 *
 *   EDL.quiz.maxPointsPerQuestion() → int
 *   EDL.quiz.scoringConfig()        → { seconds, base, bonusPerSec, late }
 *
 * HOOK onAnswer — payload:
 *   {
 *     index,          // 0-based, qual pergunta do banco
 *     total,          // tamanho do banco
 *     pickedIndex,    // alternativa marcada
 *     correctIndex,   // gabarito
 *     correct,        // boolean
 *     awarded,        // pontos desta pergunta
 *     secsLeft,       // 0..secondsPerQ — a entrada do cálculo de pontos
 *     expired,        // respondeu depois do cronômetro?
 *     elapsedMs,      // tempo real até responder
 *     runningScore, runningCorrect
 *   }
 *
 *   `secsLeft` é a grandeza autoritativa da pontuação (não `elapsedMs`):
 *   quem recalcular pontos em outro lugar precisa reproduzir exatamente a
 *   fórmula daqui, senão o número no feedback ("+250 pts") diverge do
 *   número exibido em qualquer placar externo — e o aluno percebe.
 *
 *   O hook é fire-and-forget e roda dentro de try/catch: uma falha do
 *   consumidor (ex.: rede caída no modo competição) nunca trava o quiz.
 *
 * Exporta: window.EDL.quiz
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /**
   * Parâmetros do quiz — lidos de window.EDL.config quando disponível,
   * com fallback para valores padrão hardcoded. Isso permite que o usuário
   * ajuste tempos e pontuação editando apenas `js/core/config.js`, sem
   * precisar abrir este arquivo; e garante que o quiz continue funcional
   * mesmo se config.js tiver sido editado incorretamente.
   */
  const CFG = (window.EDL && window.EDL.config) || {};
  const DEFAULTS = {
    secondsPerQ:      CFG.quizSecondsPerQ      || 30,
    bonusPerSec:      CFG.quizBonusPerSec      || 5,
    basePoints:       CFG.quizBasePoints       || 100,
    lateAnswerPoints: CFG.quizLateAnswerPoints || 50
  };

  /* -----------------------------------------------------------------------
   * Barramento de eventos do quiz — EDL.quizEvents
   *
   * Existe ao lado dos callbacks `onAnswer`/`onComplete` das opts, e não no
   * lugar deles, porque os dois resolvem problemas diferentes:
   *
   *   - opts.onAnswer   → para QUEM CHAMA run() e já controla a chamada.
   *   - EDL.quizEvents  → para consumidores PASSIVOS que não controlam a
   *                       chamada. Os 8 módulos invocam
   *                       `EDL.quiz.run(el, { bank: QUIZ })` cada um por si;
   *                       sem o barramento, todo recurso transversal novo
   *                       (histórico local, modo competição, telemetria)
   *                       obrigaria a editar os 8 arquivos de novo.
   *
   * Eventos: 'answer' e 'complete'. Ambos carregam `moduleId`.
   * Assinantes falhos são isolados em try/catch — nada aqui pode travar
   * o quiz do aluno.
   * --------------------------------------------------------------------- */
  const listeners = Object.create(null);

  EDL.quizEvents = {
    on(name, fn) {
      if (typeof fn !== 'function') return () => {};
      (listeners[name] || (listeners[name] = [])).push(fn);
      return () => EDL.quizEvents.off(name, fn);   // devolve o "unsubscribe"
    },
    off(name, fn) {
      const arr = listeners[name];
      if (!arr) return;
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    },
    emit(name, payload) {
      const arr = listeners[name];
      if (!arr || !arr.length) return;
      arr.slice().forEach(fn => {
        try { fn(payload); }
        catch (err) { console.error(`[EDL quiz] assinante de '${name}' falhou:`, err); }
      });
    }
  };

  function run(container, userOpts = {}) {
    const opts = { ...DEFAULTS, ...userOpts };
    const bank = opts.bank;
    if (!Array.isArray(bank) || bank.length === 0) {
      container.innerHTML = '<p style="color:#ff6b6b">Banco de perguntas vazio.</p>';
      return;
    }

    // Estado local da tentativa atual
    const state = {
      idx: 0,
      correct: 0,
      score: 0,
      answered: false,
      expired: false,        // flag: true quando o cronômetro chegou a 0 sem resposta
      timerId: null,
      secsLeft: 0,
      qStartedAt: 0          // performance.now() no início da pergunta (para elapsedMs)
    };

    // Shell do quiz — sem seletor de modo
    container.innerHTML = `
      <div class="quiz-shell">
        <div class="quiz-body" id="quiz-body"></div>
      </div>
    `;
    const body = container.querySelector('#quiz-body');

    /* ------------------------------------------------------------------
     * Tela de intro — gatilho explícito antes do cronômetro começar
     *
     * Sem isso, o timer arrancaria no momento em que o módulo é montado
     * (possivelmente enquanto o usuário ainda lê a teoria lá em cima).
     * Com o botão "Iniciar", o usuário controla quando a pressão começa.
     * ---------------------------------------------------------------- */
    function renderIntro() {
      stopTimer();
      state.answered = false;
      state.expired = false;

      body.innerHTML = `
        <div class="quiz-intro" role="region" aria-labelledby="quiz-intro-title">
          <h3 id="quiz-intro-title" class="quiz-intro-title">Pronto para começar?</h3>
          <p class="quiz-intro-meta">
            <strong>${bank.length} perguntas</strong> · <strong>${opts.secondsPerQ} segundos cada</strong>
          </p>
          <p class="quiz-intro-hint">
            Acerto rápido vale mais pontos. Resposta após o tempo vale meio-crédito.
          </p>
          <button type="button" class="btn btn-primary quiz-intro-btn" id="quiz-start-btn">
            Iniciar quiz →
          </button>
        </div>
      `;
      body.classList.remove('quiz-body-enter');
      void body.offsetWidth;
      body.classList.add('quiz-body-enter');

      const startBtn = body.querySelector('#quiz-start-btn');
      startBtn.addEventListener('click', () => {
        renderQuestion();
      });
      // Foco no botão para que teclado/leitor de tela estejam prontos
      try { startBtn.focus({ preventScroll: true }); } catch (_) { /* ignora */ }
    }

    /* ------------------------------------------------------------------
     * Renderização por pergunta
     * ---------------------------------------------------------------- */
    function renderQuestion() {
      if (state.idx >= bank.length) return renderDone();

      stopTimer();
      state.answered = false;
      state.expired = false;

      const q = bank[state.idx];
      const scenarioHtml = q.scenario ? renderScenario(q.scenario) : '';

      body.innerHTML = `
        ${scenarioHtml}
        <div class="activity-header">
          <div class="activity-counter">Pergunta ${state.idx + 1} de ${bank.length}</div>
          <div class="activity-score">${fmtNum(state.score)} pts · ${state.correct} acertos</div>
        </div>
        <div class="quiz-timer" id="quiz-timer">
          <div class="quiz-timer-bar" id="quiz-timer-bar"></div>
          <span class="quiz-timer-text" id="quiz-timer-text">${opts.secondsPerQ}s</span>
        </div>
        <div class="activity-question">${q.q}</div>
        <div class="activity-options" role="radiogroup">
          ${q.opts.map((op, i) => `
            <button type="button" class="activity-option" data-i="${i}">${op}</button>
          `).join('')}
        </div>
        <div class="activity-feedback" id="q-feedback" hidden></div>
        <div class="activity-nav">
          <button type="button" class="btn btn-primary" id="q-next" hidden>Próxima →</button>
        </div>
      `;

      body.classList.remove('quiz-body-enter');
      void body.offsetWidth;
      body.classList.add('quiz-body-enter');

      const feedback = body.querySelector('#q-feedback');
      const nextBtn  = body.querySelector('#q-next');
      const optionBtns = body.querySelectorAll('.activity-option');

      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (state.answered) return;
          const picked = Number(btn.dataset.i);
          answer(picked, optionBtns, feedback, nextBtn, q);
        });
      });

      nextBtn.addEventListener('click', () => {
        state.idx++;
        renderQuestion();
      });

      startTimer();
    }

    /**
     * Lida com uma resposta. Três cenários:
     *   (a) dentro do tempo + acerto → 100 + bonus de velocidade
     *   (b) fora do tempo + acerto   → 50 pts fixos (meio-crédito)
     *   (c) qualquer erro             → 0 pts
     */
    function answer(pickedIdx, optionBtns, feedback, nextBtn, q) {
      state.answered = true;
      stopTimer();

      const correct = (pickedIdx === q.answer);
      const wasExpired = state.expired;
      const secsLeft = state.secsLeft;

      let awarded = 0;
      if (correct) {
        state.correct++;
        awarded = wasExpired
          ? opts.lateAnswerPoints                       // caso (b)
          : opts.basePoints + secsLeft * opts.bonusPerSec;  // caso (a)
        state.score += awarded;
      } // caso (c): awarded fica 0

      // Visual das opções
      optionBtns.forEach((b, j) => {
        b.disabled = true;
        if (j === q.answer)                    b.classList.add('correct');
        else if (j === pickedIdx)              b.classList.add('wrong');
      });

      // Feedback com prefixo apropriado + detalhe de pontuação
      let prefix;
      if (correct && !wasExpired)      prefix = '<strong>Correto.</strong>';
      else if (correct && wasExpired)  prefix = '<strong>Correto, mas fora do tempo.</strong>';
      else if (!correct && wasExpired) prefix = '<strong>Tempo esgotado e resposta incorreta.</strong>';
      else                              prefix = '<strong>Resposta incorreta.</strong>';

      let pointsLine = '';
      if (correct && !wasExpired) {
        pointsLine = `<div class="quiz-points">+${awarded} pts (base ${opts.basePoints} + bônus ${secsLeft}s × ${opts.bonusPerSec})</div>`;
      } else if (correct && wasExpired) {
        pointsLine = `<div class="quiz-points quiz-points-late">+${awarded} pts (meio-crédito: resposta após o tempo)</div>`;
      } else {
        pointsLine = `<div class="quiz-points quiz-points-zero">+0 pts</div>`;
      }

      feedback.hidden = false;
      feedback.innerHTML = `${prefix} ${q.feedback}${pointsLine}`;

      // Atualiza o placar no header
      const hdrScore = body.querySelector('.activity-score');
      if (hdrScore) hdrScore.textContent = `${fmtNum(state.score)} pts · ${state.correct} acertos`;

      nextBtn.hidden = false;
      nextBtn.textContent = (state.idx === bank.length - 1) ? 'Ver resultado →' : 'Próxima →';

      /* Notifica consumidores externos (histórico local, modo competição).
       * Fire-and-forget: emitido DEPOIS que a UI já está pronta, dentro de
       * try/catch, para que nenhum consumidor consiga travar o quiz. */
      const event = {
        moduleId:       (EDL.state && EDL.state.currentModuleId) || null,
        index:          state.idx,
        total:          bank.length,
        pickedIndex:    pickedIdx,
        correctIndex:   q.answer,
        correct:        correct,
        awarded:        awarded,
        secsLeft:       wasExpired ? 0 : secsLeft,
        expired:        wasExpired,
        elapsedMs:      Math.max(0, Math.round(now() - state.qStartedAt)),
        runningScore:   state.score,
        runningCorrect: state.correct
      };

      if (typeof opts.onAnswer === 'function') {
        try { opts.onAnswer(event); }
        catch (err) { console.error('[EDL quiz] onAnswer lançou erro:', err); }
      }
      EDL.quizEvents.emit('answer', event);
    }

    /* ------------------------------------------------------------------
     * Cronômetro
     *
     * Ao atingir 0, NÃO desabilita as opções — apenas marca `expired`.
     * O usuário continua podendo responder (com pontuação reduzida) ou
     * passar direto. O indicador visual muda para "tempo esgotado".
     * ---------------------------------------------------------------- */
    function startTimer() {
      state.secsLeft = opts.secondsPerQ;
      state.qStartedAt = now();
      const bar = body.querySelector('#quiz-timer-bar');
      const txt = body.querySelector('#quiz-timer-text');
      updateTimerVisual(bar, txt);

      state.timerId = setInterval(() => {
        if (state.answered) { stopTimer(); return; }
        state.secsLeft--;
        updateTimerVisual(bar, txt);
        if (state.secsLeft <= 0) {
          stopTimer();
          state.expired = true;
          // Muda visual pra indicar expiração mas opções seguem ativas
          const wrap = body.querySelector('#quiz-timer');
          if (wrap) wrap.classList.add('expired');
          if (txt)  txt.textContent = 'Tempo esgotado — responda por meio-crédito';
        }
      }, 1000);
    }

    function stopTimer() {
      if (state.timerId) clearInterval(state.timerId);
      state.timerId = null;
    }

    function updateTimerVisual(bar, txt) {
      if (!bar || !txt) return;
      const pct = Math.max(0, Math.min(100, (state.secsLeft / opts.secondsPerQ) * 100));
      bar.style.width = pct + '%';
      txt.textContent = state.secsLeft + 's';
      bar.classList.toggle('low', state.secsLeft <= 5 && state.secsLeft > 0);
    }

    /* ------------------------------------------------------------------
     * Tela final — resumo da rodada + total da sessão
     * ---------------------------------------------------------------- */
    function renderDone() {
      stopTimer();
      const total = bank.length;
      const maxPossible = total * (opts.basePoints + opts.secondsPerQ * opts.bonusPerSec);

      // Persiste o resultado antes de montar a UI
      const moduleId = EDL.state && EDL.state.currentModuleId;
      if (moduleId && typeof EDL.saveModuleScore === 'function') {
        EDL.saveModuleScore(moduleId, {
          score: state.score,
          correct: state.correct,
          total: total
        });
      }

      let msg;
      const pct = state.correct / total;
      if      (pct === 1)     msg = 'Gabaritou — revisão sólida.';
      else if (pct >= 0.8)    msg = 'Muito bom. Volte aos pontos errados se quiser consolidar.';
      else if (pct >= 0.6)    msg = 'Aceitável. Vale reler os tópicos que você errou antes de avançar.';
      else                    msg = 'Sugiro reler este módulo antes de seguir. Sem pressa.';

      // Total acumulado da sessão (inclui a rodada que acabou de ser salva)
      const sessionTotal = (typeof EDL.getSessionScore === 'function') ? EDL.getSessionScore() : state.score;
      const sessionMax   = (typeof EDL.getMaxPossibleScore === 'function') ? EDL.getMaxPossibleScore() : null;
      const completedN   = (typeof EDL.getCompletedModulesCount === 'function') ? EDL.getCompletedModulesCount() : 1;
      const totalModules = EDL.modules ? EDL.modules.filter(m => m.status === 'available').length : 0;

      body.innerHTML = `
        <div class="activity-done">
          <div class="activity-counter">Atividade concluída</div>
          <div class="big-score">${fmtNum(state.score)} <span class="quiz-score-unit">pts</span></div>
          <p class="muted" style="margin:.25rem 0">
            ${state.correct}/${total} acertos · máximo ${fmtNum(maxPossible)} pts possíveis neste módulo
          </p>
          <p class="muted" style="margin:.5rem 0 1.5rem 0">${msg}</p>

          <div class="quiz-session-summary" role="status">
            <div class="quiz-session-label">Total da sessão</div>
            <div class="quiz-session-score">${fmtNum(sessionTotal)}${sessionMax ? ` <span class="quiz-session-max">/ ${fmtNum(sessionMax)} pts</span>` : ' pts'}</div>
            <div class="quiz-session-sub">${completedN} de ${totalModules} módulo(s) concluído(s)</div>
          </div>

          <div style="display:flex; gap:.75rem; justify-content:center; flex-wrap:wrap; margin-top:1.25rem">
            <button type="button" class="btn btn-ghost" id="q-redo">Refazer este módulo</button>
            <button type="button" class="btn btn-primary" id="q-home">Voltar aos módulos</button>
          </div>
        </div>
      `;
      body.classList.remove('quiz-body-enter');
      void body.offsetWidth;
      body.classList.add('quiz-body-enter');

      body.querySelector('#q-redo').addEventListener('click', () => {
        // Reset de estado e volta para a intro — dá um respiro entre rodadas
        state.idx = 0; state.correct = 0; state.score = 0;
        state.answered = false; state.expired = false;
        renderIntro();
      });
      body.querySelector('#q-home').addEventListener('click', () => EDL.screens.goTo('home'));

      const result = {
        moduleId: moduleId || null,
        correct:  state.correct,
        total:    total,
        score:    state.score,
        maxPossible: maxPossible
      };

      if (typeof opts.onComplete === 'function') {
        try { opts.onComplete(result); }
        catch (err) { console.error('[EDL quiz] onComplete lançou erro:', err); }
      }
      EDL.quizEvents.emit('complete', result);
    }

    /* ------------------------------------------------------------------
     * Mini-cenário clínico (card antes da pergunta)
     * ---------------------------------------------------------------- */
    function renderScenario(sc) {
      const meta = (sc.meta && sc.meta.length)
        ? `<div class="scenario-meta">${sc.meta.map(m =>
            `<span class="scenario-meta-item"><span class="scenario-meta-label">${escapeHtml(m.label)}:</span> ${escapeHtml(m.value)}</span>`
          ).join('')}</div>`
        : '';

      return `
        <div class="scenario-card">
          <div class="scenario-tag">Cenário clínico</div>
          ${sc.title ? `<h3 class="scenario-title">${escapeHtml(sc.title)}</h3>` : ''}
          <p class="scenario-body">${sc.body}</p>
          ${meta}
        </div>
      `;
    }

    /* ------------------------------------------------------------------
     * Utilitários locais
     * ---------------------------------------------------------------- */
    function fmtNum(n) {
      return Math.round(n).toLocaleString('pt-BR');
    }

    /** Relógio monotônico, com fallback para navegadores sem performance.now. */
    function now() {
      return (window.performance && typeof performance.now === 'function')
        ? performance.now()
        : Date.now();
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"]/g, ch => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]
      ));
    }

    // Cleanup ao sair do módulo — o timer não pode continuar rodando em background
    if (typeof EDL.onModuleDestroy === 'function') {
      EDL.onModuleDestroy(stopTimer);
    } else {
      console.warn('[EDL/quiz] EDL.onModuleDestroy não disponível — timer pode vazar ao sair do módulo');
    }

    // Kick off — começa na tela de intro, não diretamente nas perguntas.
    // Usuário clica "Iniciar quiz" para começar o cronômetro.
    renderIntro();
  }

  /* -----------------------------------------------------------------------
   * Fonte única da regra de pontuação.
   *
   * Existe porque a fórmula precisava ser reproduzida em outros lugares
   * (barra de progresso da home, "máximo possível" da tela Sobre) e estava
   * sendo copiada à mão — o que já tinha divergido do config.js na prática.
   * Qualquer consumidor novo deve chamar estas funções em vez de recalcular.
   * --------------------------------------------------------------------- */
  function maxPointsPerQuestion() {
    return DEFAULTS.basePoints + DEFAULTS.secondsPerQ * DEFAULTS.bonusPerSec;
  }

  function scoringConfig() {
    return {
      seconds:     DEFAULTS.secondsPerQ,
      base:        DEFAULTS.basePoints,
      bonusPerSec: DEFAULTS.bonusPerSec,
      late:        DEFAULTS.lateAnswerPoints
    };
  }

  EDL.quiz = { run, maxPointsPerQuestion, scoringConfig };
})();
