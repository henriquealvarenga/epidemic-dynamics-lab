/* =========================================================================
 * EDL — state.js
 * Estado global compartilhado entre módulos.
 *
 * Evite criar variáveis globais de estado fora deste objeto. Se precisar
 * adicionar um novo campo, coloque aqui com comentário explicativo.
 *
 * Exporta: window.EDL.state + window.EDL.modules (registro de módulos)
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  EDL.state = {
    // Rota atual: 'home' | 'module' | 'about' | 'how-to-use' | 'credits'
    currentScreen: 'home',

    // ID do módulo atual, se houver
    currentModuleId: null,

    // Referências (carregadas em app.js a partir de references.json)
    references: null,

    // Pontuação por módulo: moduleId → { bestScore, lastScore, completions, total, correct }
    // Persistido em localStorage sob a chave STORAGE_KEY. Carregado no boot.
    scores: {}
  };

  /* ---------------------------------------------------------------------
   * Persistência da pontuação em localStorage
   *
   * Decisão de design:
   *   - Chave versionada (`edl.scores.v1`) para permitir migrações futuras
   *     sem quebrar dados de usuários existentes.
   *   - Falha silenciosa (try/catch + warn) — localStorage pode estar
   *     desativado em modo privativo ou por política do navegador. Nesse
   *     caso o app continua funcional, só não persiste entre sessões.
   * ------------------------------------------------------------------- */
  const STORAGE_KEY = 'edl.scores.v1';

  (function loadStoredScores() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') EDL.state.scores = parsed;
      }
    } catch (err) {
      console.warn('[EDL] Não foi possível carregar progresso de localStorage:', err);
    }
  })();

  function persistScores() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(EDL.state.scores));
    } catch (err) {
      console.warn('[EDL] Não foi possível salvar progresso em localStorage:', err);
    }
  }

  /** Atualiza o score de um módulo após conclusão do quiz.
   *  Mantém o melhor score se houve tentativa anterior (best-of). */
  EDL.saveModuleScore = function (moduleId, result) {
    if (!moduleId || !result) return;
    const prev = EDL.state.scores[moduleId] || {};
    const best = Math.max(prev.bestScore || 0, result.score || 0);
    EDL.state.scores[moduleId] = {
      bestScore:   best,
      lastScore:   result.score || 0,
      correct:     result.correct || 0,
      total:       result.total || 0,
      completions: (prev.completions || 0) + 1,
      lastPlayedAt: Date.now()
    };
    persistScores();
  };

  /** Zera todo o progresso (para o botão "Zerar progresso" na tela Sobre). */
  EDL.resetScores = function () {
    EDL.state.scores = {};
    try { localStorage.removeItem(STORAGE_KEY); }
    catch (err) { /* silencioso */ }
  };

  /** Soma das melhores pontuações de todos os módulos jogados. */
  EDL.getSessionScore = function () {
    return Object.values(EDL.state.scores)
      .reduce((sum, s) => sum + (s.bestScore || 0), 0);
  };

  /** Quantidade de módulos que o usuário já concluiu pelo menos uma vez. */
  EDL.getCompletedModulesCount = function () {
    return Object.keys(EDL.state.scores).length;
  };

  /** Pontuação máxima possível somando todos os módulos registrados como
   *  'available'. Cada pergunta vale até 200 pts (100 base + 100 bônus). */
  EDL.getMaxPossibleScore = function () {
    const MAX_PER_Q = 200;
    return EDL.modules
      .filter(m => m.status === 'available')
      .reduce((sum, m) => sum + (m.quizCount || 0) * MAX_PER_Q, 0);
  };

  /**
   * Registro de módulos. Cada módulo auto-se-registra chamando
   *    EDL.registerModule({...}).
   *
   * Shape esperado:
   *   {
   *     id: string           // único, ex: '01-introducao'
   *     number: int          // 1..8
   *     icon: string         // emoji ou texto curto
   *     title: string
   *     subtitle: string     // frase curta no card
   *     status: 'available' | 'coming-soon'
   *     quizCount: int       // OBRIGATÓRIO — número de perguntas do quiz (0 se não houver)
   *     render: function(container) { ... }   // popula o container com o módulo
   *     destroy?: function()                   // opcional — limpeza ao sair
   *   }
   *
   * A ordem de registro é preservada (usada na landing).
   */
  EDL.modules = [];

  EDL.registerModule = function (mod) {
    if (!mod || !mod.id) {
      console.error('[EDL] registerModule: módulo precisa de um id', mod);
      return;
    }
    if (EDL.modules.some(m => m.id === mod.id)) {
      console.warn('[EDL] Módulo já registrado, sobrescrevendo:', mod.id);
      EDL.modules = EDL.modules.filter(m => m.id !== mod.id);
    }
    EDL.modules.push(mod);
  };

  EDL.getModule = function (id) {
    return EDL.modules.find(m => m.id === id) || null;
  };

  /* ---------------------------------------------------------------------
   * Registry de cleanup do módulo ativo.
   *
   * Cada módulo pode chamar EDL.onModuleDestroy(fn) durante seu render()
   * para registrar uma função que deve ser executada quando o usuário
   * sair da tela do módulo. Ideal para desmontar listeners globais
   * (window.resize), intervals (cronômetros) e qualquer outro recurso
   * que não seria coletado pelo GC só com o DOM sumindo.
   *
   * O roteador (screens.js) chama EDL.runModuleCleanups() antes de
   * re-renderizar uma nova tela.
   * ------------------------------------------------------------------- */
  EDL._moduleCleanups = [];

  EDL.onModuleDestroy = function (fn) {
    if (typeof fn === 'function') EDL._moduleCleanups.push(fn);
  };

  EDL.runModuleCleanups = function () {
    const list = EDL._moduleCleanups;
    EDL._moduleCleanups = [];
    while (list.length) {
      try { list.pop()(); }
      catch (err) { console.warn('[EDL] cleanup falhou:', err); }
    }
  };
})();
