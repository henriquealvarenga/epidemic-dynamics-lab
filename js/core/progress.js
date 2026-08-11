/* =========================================================================
 * EDL — progress.js
 *
 * Histórico detalhado de desempenho do aluno, por PERGUNTA.
 *
 * Relação com state.js:
 *   state.js guarda o placar agregado por módulo (`edl.scores.v1`):
 *   melhor pontuação, último resultado, nº de conclusões. É o que alimenta
 *   a barra da home e os badges dos cards.
 *
 *   Este arquivo guarda a camada fina embaixo disso (`edl.progress.v1`):
 *   quais perguntas o aluno erra de forma recorrente, quanto tempo leva em
 *   cada uma, e como as tentativas evoluíram. É o que permite responder
 *   "o que eu ainda não sei?" em vez de só "quanto eu fiz?".
 *
 *   As duas chaves são INDEPENDENTES de propósito. `edl.scores.v1` não é
 *   tocado nem migrado — quem já usou o site não perde nada, e se este
 *   arquivo for removido amanhã o site volta ao comportamento anterior.
 *
 * Como coleta:
 *   Assina EDL.quizEvents ('answer' e 'complete'). Não exige nada dos
 *   módulos: eles seguem chamando `EDL.quiz.run(el, { bank: QUIZ })` sem
 *   saber que este arquivo existe.
 *
 * Privacidade:
 *   Nada sai do navegador. Sem rede, sem identificador, sem cookie.
 *
 * Exporta: window.EDL.progress
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  const STORAGE_KEY = 'edl.progress.v1';

  /* Teto de tentativas guardadas por módulo. localStorage costuma ter ~5 MB
   * por origem; sem teto, um aluno obsessivo acumularia histórico para
   * sempre. 20 é o suficiente para desenhar uma curva de evolução. */
  const MAX_ATTEMPTS = 20;

  /* Mínimo de exposições antes de uma pergunta poder ser chamada de
   * "difícil". Sem isso, errar uma vez na primeira tentativa colocaria a
   * pergunta no topo da lista para sempre. */
  const MIN_SEEN_FOR_RANKING = 2;

  /** Forma do dado persistido:
   *  {
   *    version: 1,
   *    modules: {
   *      '05-r0': {
   *        attempts: [ { at, score, correct, total } ],
   *        items: {
   *          '3': { seen, hits, totalMs, lastCorrect, lastAt, picks: { '1': 2 } }
   *        }
   *      }
   *    }
   *  }
   *  `picks` conta quantas vezes cada alternativa ERRADA foi escolhida —
   *  é o que revela qual distrator está enganando, não só que houve erro. */
  let data = { version: 1, modules: {} };

  (function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.modules) data = parsed;
    } catch (err) {
      console.warn('[EDL] Não foi possível carregar o histórico detalhado:', err);
    }
  })();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      // QuotaExceededError entra aqui. Degrada para "sessão atual apenas".
      console.warn('[EDL] Não foi possível salvar o histórico detalhado:', err);
    }
  }

  function moduleEntry(moduleId) {
    return (data.modules[moduleId] ||
           (data.modules[moduleId] = { attempts: [], items: {} }));
  }

  /* -----------------------------------------------------------------------
   * Coleta
   * --------------------------------------------------------------------- */

  function recordAnswer(ev) {
    if (!ev || !ev.moduleId) return;   // fora de um módulo: nada a atribuir
    const mod = moduleEntry(ev.moduleId);
    const key = String(ev.index);
    const item = (mod.items[key] || (mod.items[key] = {
      seen: 0, hits: 0, totalMs: 0, lastCorrect: null, lastAt: null, picks: {}
    }));

    item.seen++;
    if (ev.correct) item.hits++;
    else {
      const p = String(ev.pickedIndex);
      item.picks[p] = (item.picks[p] || 0) + 1;
    }
    item.totalMs    += (ev.elapsedMs || 0);
    item.lastCorrect = !!ev.correct;
    item.lastAt      = Date.now();

    persist();
  }

  function recordComplete(res) {
    if (!res || !res.moduleId) return;
    const mod = moduleEntry(res.moduleId);
    mod.attempts.push({
      at:      Date.now(),
      score:   res.score   || 0,
      correct: res.correct || 0,
      total:   res.total   || 0
    });
    if (mod.attempts.length > MAX_ATTEMPTS) {
      mod.attempts = mod.attempts.slice(-MAX_ATTEMPTS);
    }
    persist();
  }

  /* -----------------------------------------------------------------------
   * Consulta
   * --------------------------------------------------------------------- */

  /** Dados brutos de um módulo, ou null se nunca foi jogado. */
  function getModule(moduleId) {
    return data.modules[moduleId] || null;
  }

  /**
   * Perguntas que o aluno mais erra neste módulo, da pior para a melhor.
   *
   * Ordena por taxa de erro e, em empate, por quem foi visto mais vezes —
   * errar 2 de 2 é mais informativo do que errar 1 de 1. Só entram
   * perguntas vistas ao menos MIN_SEEN_FOR_RANKING vezes e que não estejam
   * 100% corretas.
   */
  function hardestItems(moduleId, limit = 5) {
    const mod = data.modules[moduleId];
    if (!mod) return [];

    return Object.keys(mod.items)
      .map(key => {
        const it = mod.items[key];
        return {
          index:     Number(key),
          seen:      it.seen,
          hits:      it.hits,
          errorRate: it.seen ? (it.seen - it.hits) / it.seen : 0,
          avgMs:     it.seen ? Math.round(it.totalMs / it.seen) : 0,
          lastCorrect: it.lastCorrect,
          topDistractor: topDistractor(it)
        };
      })
      .filter(r => r.seen >= MIN_SEEN_FOR_RANKING && r.errorRate > 0)
      .sort((a, b) => (b.errorRate - a.errorRate) || (b.seen - a.seen))
      .slice(0, limit);
  }

  /** Alternativa errada mais escolhida — qual distrator está pegando. */
  function topDistractor(item) {
    let best = null, bestN = 0;
    Object.keys(item.picks || {}).forEach(k => {
      if (item.picks[k] > bestN) { bestN = item.picks[k]; best = Number(k); }
    });
    return best;
  }

  /**
   * Resumo de um módulo para exibição.
   * `trend` é a diferença entre a última tentativa e a anterior — é o
   * número que responde "estou melhorando?", que o bestScore sozinho esconde.
   */
  function moduleSummary(moduleId) {
    const mod = data.modules[moduleId];
    if (!mod || !mod.attempts.length) return null;

    const attempts = mod.attempts;
    const last     = attempts[attempts.length - 1];
    const prev     = attempts.length > 1 ? attempts[attempts.length - 2] : null;

    return {
      attemptCount: attempts.length,
      last:         last,
      trend:        prev ? (last.score - prev.score) : null,
      bestScore:    attempts.reduce((m, a) => Math.max(m, a.score), 0),
      hardest:      hardestItems(moduleId, 3)
    };
  }

  /** Total de perguntas distintas já respondidas, em todos os módulos. */
  function answeredItemCount() {
    return Object.keys(data.modules)
      .reduce((sum, id) => sum + Object.keys(data.modules[id].items).length, 0);
  }

  function reset() {
    data = { version: 1, modules: {} };
    try { localStorage.removeItem(STORAGE_KEY); }
    catch (err) { /* silencioso, igual a state.js */ }
  }

  /* -----------------------------------------------------------------------
   * Ligações
   * --------------------------------------------------------------------- */

  if (EDL.quizEvents) {
    EDL.quizEvents.on('answer', recordAnswer);
    EDL.quizEvents.on('complete', recordComplete);
  } else {
    console.warn('[EDL] progress.js carregou sem EDL.quizEvents — ' +
                 'verifique a ordem dos <script> no index.html.');
  }

  /* Encadeia no EDL.resetScores em vez de exigir que cada chamador saiba
   * das duas chaves. O botão "Zerar progresso" da tela Sobre chama só
   * resetScores(); sem isto, o aluno zeraria o placar e o histórico
   * detalhado sobreviveria — o que pareceria um bug de dados fantasma. */
  const originalReset = EDL.resetScores;
  if (typeof originalReset === 'function') {
    EDL.resetScores = function () {
      originalReset.apply(this, arguments);
      reset();
    };
  }

  EDL.progress = {
    getModule,
    moduleSummary,
    hardestItems,
    answeredItemCount,
    reset,
    /** Acesso bruto — para depuração no console e para os testes. */
    _data: () => data
  };
})();
