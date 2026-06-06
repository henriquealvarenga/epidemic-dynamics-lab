/* =========================================================================
 * EDL — screens.js
 * Controle de navegação entre telas (home, módulo, páginas estáticas).
 *
 * Hash routing simples:
 *   #/home                    → landing
 *   #/module/01-introducao    → módulo específico
 *   #/about                   → página "Sobre"
 *   #/how-to-use              → página "Como usar"
 *   #/credits                 → página "Créditos"
 *
 * Exporta: window.EDL.screens
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  const SCREEN_IDS = {
    home:          'screen-home',
    module:        'screen-module',
    about:         'screen-about',
    'how-to-use':  'screen-how-to-use',
    references:    'screen-references'
    // Nota: 'credits' foi mesclado em 'about' — link removido do footer e
    // entrada de rota removida aqui. Se um link velho ainda apontar para
    // '#/credits', o parseHash cairá no default 'home'.
  };

  /** Esconde todas as telas. */
  function hideAll() {
    Object.values(SCREEN_IDS).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.hidden = true;
        el.classList.remove('screen-active');
      }
    });
  }

  /** Ativa a tela indicada. */
  function showScreen(name) {
    hideAll();
    const el = document.getElementById(SCREEN_IDS[name]);
    if (el) {
      el.hidden = false;
      el.classList.add('screen-active');
      EDL.state.currentScreen = name;
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Focus management: move o foco para o container ativo para que
      // leitores de tela anunciem a nova tela e navegação por Tab
      // recomece a partir do topo.
      el.setAttribute('tabindex', '-1');
      try { el.focus({ preventScroll: true }); } catch (_) { /* ignora */ }
    }
  }

  /**
   * Parse da hash. Retorna { name, param? }.
   * Ex.: "#/module/01-introducao" → { name: 'module', param: '01-introducao' }.
   */
  function parseHash(hash) {
    if (!hash || hash === '#' || hash === '#/') return { name: 'home' };
    const parts = hash.replace(/^#\//, '').split('/');
    const name = parts[0];
    const param = parts[1];
    if (!(name in SCREEN_IDS)) return { name: 'home' };
    return { name, param };
  }

  function setHash(name, param) {
    const base = `#/${name}`;
    const target = param ? `${base}/${param}` : base;
    if (location.hash !== target) location.hash = target;
  }

  /**
   * Renderiza a tela do módulo pelo id.
   * Chama module.render(container) — o módulo é responsável por popular o
   * conteúdo interno.
   */
  function renderModule(moduleId) {
    const mod = EDL.getModule(moduleId);
    const title = document.getElementById('module-topbar-title');
    const container = document.getElementById('module-container');

    if (!mod || mod.status !== 'available') {
      // Módulo não existe ou ainda não está disponível — volta pra home
      setHash('home');
      return;
    }

    // Roda cleanups do módulo anterior (listeners, intervals)
    EDL.runModuleCleanups();

    // Limpa o container anterior
    container.innerHTML = '';
    title.textContent = `Módulo ${mod.number} · ${mod.title}`;
    EDL.state.currentModuleId = moduleId;

    // Atualiza botões de navegação prev/next na topbar
    updateModuleNav(moduleId);

    // Delega a renderização ao próprio módulo
    try {
      mod.render(container);
    } catch (err) {
      console.error('[EDL] Erro ao renderizar módulo', moduleId, err);
      // textContent (em vez de innerHTML) para garantir que mensagens de erro
      // eventualmente contendo texto não-confiável não virem XSS
      container.textContent = '';
      const p = document.createElement('p');
      p.style.color = '#ff6b6b';
      p.textContent = 'Erro ao carregar o módulo. Veja o console para detalhes.';
      container.appendChild(p);
    }
  }

  /**
   * Atualiza os botões de navegação prev/next da topbar de módulo com
   * base no módulo ativo. Módulos marcados como 'coming-soon' não entram
   * na sequência navegável.
   *
   * Regras:
   *   - Primeiro módulo navegável → prev fica desabilitado
   *   - Último módulo navegável   → next fica desabilitado
   *   - aria-label e title são atualizados dinamicamente para incluir o
   *     título do módulo de destino, melhorando UX (tooltip) e a11y.
   */
  function updateModuleNav(currentModuleId) {
    const prevBtn = document.getElementById('module-nav-prev');
    const nextBtn = document.getElementById('module-nav-next');
    if (!prevBtn || !nextBtn) return;

    const navigable = EDL.modules.filter(m => m.status === 'available');
    const idx = navigable.findIndex(m => m.id === currentModuleId);
    const prev = idx > 0 ? navigable[idx - 1] : null;
    const next = (idx >= 0 && idx < navigable.length - 1) ? navigable[idx + 1] : null;

    // Botão "anterior"
    if (prev) {
      prevBtn.disabled = false;
      const label = `Módulo anterior: ${prev.number} — ${prev.title}`;
      prevBtn.setAttribute('aria-label', label);
      prevBtn.title = label;
      prevBtn.onclick = () => setHash('module', prev.id);
    } else {
      prevBtn.disabled = true;
      prevBtn.setAttribute('aria-label', 'Sem módulo anterior — você está no primeiro');
      prevBtn.title = 'Você está no primeiro módulo';
      prevBtn.onclick = null;
    }

    // Botão "próximo"
    if (next) {
      nextBtn.disabled = false;
      const label = `Próximo módulo: ${next.number} — ${next.title}`;
      nextBtn.setAttribute('aria-label', label);
      nextBtn.title = label;
      nextBtn.onclick = () => setHash('module', next.id);
    } else {
      nextBtn.disabled = true;
      nextBtn.setAttribute('aria-label', 'Sem próximo módulo — você está no último');
      nextBtn.title = 'Você está no último módulo';
      nextBtn.onclick = null;
    }
  }

  /** Roteador: lê hash e ativa a tela correspondente. */
  function route() {
    const { name, param } = parseHash(location.hash);

    // Se estava num módulo e vai sair dele (para qualquer outra tela),
    // roda os cleanups registrados. renderModule() também chama cleanup
    // antes de renderizar — aqui cobrimos saídas para telas estáticas.
    const wasOnModule = EDL.state.currentScreen === 'module';
    const goingToModule = (name === 'module' && !!param);
    if (wasOnModule && !goingToModule) {
      EDL.runModuleCleanups();
      EDL.state.currentModuleId = null;
    }

    if (goingToModule) {
      showScreen('module');
      renderModule(param);
      return;
    }
    if (name === 'references') {
      showScreen('references');
      const container = document.getElementById('references-container');
      if (container && EDL.refs && container.childElementCount === 0) {
        EDL.refs.renderGlobalPage(container);
      }
      return;
    }
    if (name === 'about') {
      showScreen('about');
      injectStaticContent('about-content', EDL.content && EDL.content.about, 'Sobre');
      // Refresh sempre: scores podem ter mudado em outra tela
      const aboutC = document.getElementById('about-content');
      if (aboutC) refreshAboutProgress(aboutC);
      return;
    }
    if (name === 'home') {
      // Re-renderiza o grid ao voltar para home: scores podem ter mudado
      // durante uma tentativa de quiz, e os badges/progresso refletem isso.
      if (typeof EDL.renderModulesGrid === 'function') EDL.renderModulesGrid();
      showScreen('home');
      return;
    }
    showScreen(name);
  }

  /**
   * Injeta conteúdo HTML estático (de content/*.js) em um container da tela.
   * Preenche só uma vez (childElementCount === 0) para evitar trabalho
   * redundante em navegações repetidas.
   *
   * Liga listeners [data-go] do conteúdo recém-injetado ao sistema de
   * navegação, já que bindNavButtons() só roda no boot inicial.
   *
   * Se o conteúdo não estiver disponível (ex: script de content/ não carregou),
   * exibe mensagem de erro em vez de tela em branco.
   */
  function injectStaticContent(containerId, htmlContent, label) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (container.childElementCount > 0) return;  // já injetado antes

    if (!htmlContent) {
      console.error(`[EDL] Conteúdo de "${label}" não carregado (content/*.js ausente).`);
      container.innerHTML =
        '<article class="static-page">' +
        '<p style="color:var(--danger)">Não foi possível carregar o conteúdo desta página. ' +
        'Veja o console para detalhes.</p></article>';
      return;
    }

    container.innerHTML = htmlContent;
    // Religa [data-go] do conteúdo injetado (bindNavButtons inicial só pegou
    // elementos do HTML estático).
    container.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-go');
        setHash(target);
      });
    });

    // Hook especial: tela "Sobre" tem seção de Progresso com botão de reset.
    // Ligamos após a injeção e atualizamos o texto de resumo com o estado atual.
    if (containerId === 'about-content') {
      wireAboutProgressSection(container);
    }
  }

  /**
   * Atualiza o texto de resumo de progresso dentro da tela Sobre.
   * Deve ser chamada toda vez que o usuário entra na tela, pois o
   * score pode ter mudado em outra tela (ex: ao completar um quiz).
   */
  function refreshAboutProgress(container) {
    const summary = container.querySelector('#progress-summary');
    const resetBtn = container.querySelector('#progress-reset');
    if (!summary) return;

    const total = EDL.getSessionScore ? EDL.getSessionScore() : 0;
    const max = EDL.getMaxPossibleScore ? EDL.getMaxPossibleScore() : 0;
    const done = EDL.getCompletedModulesCount ? EDL.getCompletedModulesCount() : 0;
    const fmt = n => Math.round(n).toLocaleString('pt-BR');

    if (total <= 0) {
      summary.textContent = 'Você ainda não completou nenhum módulo nesta instalação.';
      if (resetBtn) resetBtn.disabled = true;
    } else {
      const pct = max > 0 ? ` (${Math.round(total / max * 100)}%)` : '';
      summary.textContent =
        `${fmt(total)} pontos em ${done} módulo(s) concluído(s)` +
        (max > 0 ? ` — máximo possível ${fmt(max)}${pct}` : '') + '.';
      if (resetBtn) resetBtn.disabled = false;
    }
  }

  /**
   * Liga uma única vez os event listeners da seção "Seu progresso" na
   * tela Sobre. Separado de refreshAboutProgress porque esta última
   * roda a cada visita, enquanto os listeners precisam ser anexados
   * apenas uma vez para não acumular.
   */
  function wireAboutProgressSection(container) {
    const resetBtn = container.querySelector('#progress-reset');
    if (!resetBtn) return;

    resetBtn.addEventListener('click', () => {
      const ok = window.confirm(
        'Zerar todo o progresso?\n\n' +
        'Isso apagará as pontuações de todos os módulos, salvas apenas neste navegador. ' +
        'A ação é irreversível.'
      );
      if (!ok) return;
      if (typeof EDL.resetScores === 'function') {
        EDL.resetScores();
        refreshAboutProgress(container);
        // Também re-renderiza o grid para limpar os badges de conclusão
        if (typeof EDL.renderModulesGrid === 'function') EDL.renderModulesGrid();
      }
    });
  }

  /** Liga os botões com atributo data-go="<screen>". */
  function bindNavButtons() {
    document.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-go');
        setHash(target);
      });
    });
  }

  EDL.screens = {
    init() {
      bindNavButtons();
      window.addEventListener('hashchange', route);
      route(); // rota inicial
    },
    goTo(name, param) { setHash(name, param); },
    openModule(id)    { setHash('module', id); }
  };
})();
