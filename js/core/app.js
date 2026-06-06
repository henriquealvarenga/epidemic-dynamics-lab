/* =========================================================================
 * EDL — app.js
 * Ponto de entrada. Chamado no DOMContentLoaded.
 *
 * Responsabilidades:
 *   1. Preencher a grid de módulos na landing, a partir de EDL.modules
 *   2. Inicializar o roteador de telas
 *   3. (Futuramente) carregar references.json
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /**
   * Registra um card placeholder para módulos que ainda não têm arquivo
   * próprio. Isso garante que a grid sempre mostre os 8 módulos planejados,
   * mesmo antes de todos estarem implementados.
   */
  const PLANNED_MODULES = [
    { id: '01-introducao',           number: 1, icon: '🧭', title: 'Introdução à Epidemiologia',
      subtitle: 'Definição, etimologia, tipos de prevenção e marcos históricos.' },
    { id: '02-conceitos',            number: 2, icon: '📚', title: 'Conceitos Básicos',
      subtitle: 'Endemia, surto, epidemia, pandemia. Reservatórios, risco, caso notificado.' },
    { id: '03-cadeia',               number: 3, icon: '🔗', title: 'Cadeia Epidemiológica',
      subtitle: 'Fonte → via → contágio → porta → hospedeiro suscetível.' },
    { id: '04-dinamica-individuo',   number: 4, icon: '🧬', title: 'Dinâmica da Doença no Indivíduo',
      subtitle: 'Período latente × incubação × sintomático × convalescença × reativação.' },
    { id: '05-r0',                   number: 5, icon: '📈', title: 'R₀ e Crescimento Exponencial',
      subtitle: 'Número básico de reprodução, tempo de duplicação, comparador A×B.' },
    { id: '06-imunidade-rebanho',    number: 6, icon: '🛡️', title: 'Imunidade de Rebanho',
      subtitle: 'Limiar 1 − 1/R₀, vacinação, simulação de rede de contatos.' },
    { id: '07-sir-seir',             number: 7, icon: '🔄', title: 'Modelos Compartimentais (SIR/SEIR)',
      subtitle: 'Simulador livre A×B, desafios de intervenção, modelos realistas.' },
    { id: '08-colera-soho-haiti',    number: 8, icon: '🗺️', title: 'Caso Histórico: Cólera',
      subtitle: 'Soho 1854 com John Snow e reflexo moderno no Haiti 2010.' }
  ];

  /** Combina módulos planejados com os efetivamente registrados. */
  function buildModuleList() {
    const registered = new Map(EDL.modules.map(m => [m.id, m]));
    return PLANNED_MODULES.map(p => {
      const reg = registered.get(p.id);
      if (reg) {
        return { ...p, ...reg, status: reg.status || 'available' };
      }
      return { ...p, status: 'coming-soon' };
    });
  }

  /** Formata número grande no padrão PT-BR (12.345). */
  function fmtPt(n) {
    return Math.round(n).toLocaleString('pt-BR');
  }

  /**
   * Renderiza a barra de progresso global acima do grid (se houver
   * qualquer pontuação salva). Se o usuário nunca jogou nenhum quiz,
   * a barra fica oculta.
   */
  function renderProgressBar() {
    const section = document.getElementById('modulos');
    if (!section) return;

    // Remove barra anterior (caso esta função seja chamada de novo)
    const prev = document.getElementById('session-progress-bar');
    if (prev) prev.remove();

    if (typeof EDL.getSessionScore !== 'function') return;
    const total = EDL.getSessionScore();
    if (total <= 0) return;

    const max = EDL.getMaxPossibleScore ? EDL.getMaxPossibleScore() : 0;
    const done = EDL.getCompletedModulesCount ? EDL.getCompletedModulesCount() : 0;
    const totalModules = EDL.modules.filter(m => m.status === 'available').length;
    const pct = max > 0 ? Math.min(100, (total / max) * 100) : 0;

    const bar = document.createElement('div');
    bar.id = 'session-progress-bar';
    bar.className = 'session-progress';
    bar.innerHTML = `
      <div class="session-progress-top">
        <span class="session-progress-label">Seu progresso</span>
        <span class="session-progress-value">
          ${fmtPt(total)}${max > 0 ? ` <span class="muted">/ ${fmtPt(max)} pts</span>` : ' pts'}
          · ${done} de ${totalModules} módulos
        </span>
      </div>
      <div class="session-progress-track">
        <div class="session-progress-fill" style="width:${pct}%"></div>
      </div>
    `;

    // Insere ANTES do grid, dentro da seção de módulos
    const grid = document.getElementById('modules-grid');
    section.insertBefore(bar, grid);
  }

  /** Cria um botão-card para cada módulo. */
  function renderModulesGrid() {
    const grid = document.getElementById('modules-grid');
    if (!grid) return;
    const list = buildModuleList();
    const scores = (EDL.state && EDL.state.scores) || {};

    grid.innerHTML = '';
    list.forEach(mod => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'module-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('data-status', mod.status);
      card.disabled = (mod.status === 'coming-soon');

      const saved = scores[mod.id];
      const isCompleted = !!saved && saved.bestScore > 0;
      if (isCompleted) card.classList.add('module-card-completed');

      const ariaExtra = mod.status === 'coming-soon' ? ' (em breve)'
                      : isCompleted ? ` (concluído com ${fmtPt(saved.bestScore)} pontos)`
                      : '';
      card.setAttribute('aria-label', `Módulo ${mod.number}: ${mod.title}${ariaExtra}`);

      const topBadge = isCompleted
        ? `<span class="module-card-badge module-card-badge-done" title="Melhor pontuação">✓ ${fmtPt(saved.bestScore)} pts</span>`
        : `<span class="module-card-badge" data-status="${mod.status}">
             ${mod.status === 'available' ? 'Disponível' : 'Em breve'}
           </span>`;

      card.innerHTML = `
        ${topBadge}
        <span class="module-card-number">${String(mod.number).padStart(2, '0')}</span>
        <span class="module-card-icon" aria-hidden="true">${mod.icon}</span>
        <h3 class="module-card-title">${mod.title}</h3>
        <p class="module-card-subtitle">${mod.subtitle}</p>
      `;

      if (mod.status === 'available') {
        card.addEventListener('click', () => EDL.screens.openModule(mod.id));
      }

      grid.appendChild(card);
    });

    renderProgressBar();
  }

  // Expõe para que screens.js possa re-renderizar após conclusões de quiz
  EDL.renderModulesGrid = renderModulesGrid;

  /**
   * Checa as dependências externas carregadas por <script> no index.html.
   * Se algo estiver faltando, mostra uma tela de erro ao usuário
   * (em vez de deixar o app travado com TypeError silencioso).
   */
  function checkDependencies() {
    const missing = [];
    if (!window.d3) missing.push('D3.js (via CDN jsdelivr)');
    if (!EDL.models)       missing.push('js/core/models.js');
    if (!EDL.math)         missing.push('js/core/math.js');
    if (!EDL.screens)      missing.push('js/core/screens.js');
    if (!EDL.quiz)         missing.push('js/core/quiz-engine.js');
    if (!EDL.refs)         missing.push('js/core/references-view.js');
    return missing;
  }

  function showDependencyError(missing) {
    const el = document.getElementById('screen-home');
    if (!el) return;
    el.innerHTML = `
      <div style="max-width:640px;margin:5rem auto;padding:2rem;
                  background:var(--bg-2);border:1px solid var(--danger);border-radius:var(--r-lg);
                  color:var(--text-primary);font-family:Inter,sans-serif">
        <h2 style="color:var(--danger);margin-top:0">Falha ao carregar o app</h2>
        <p>Uma ou mais dependências não estão disponíveis:</p>
        <ul style="font-family:'JetBrains Mono',monospace;font-size:.88rem;line-height:1.8">
          ${missing.map(m => `<li>${m}</li>`).join('')}
        </ul>
        <p style="color:var(--text-secondary);font-size:.92rem;line-height:1.6">
          Verifique sua conexão com a internet (o D3.js é carregado de um CDN
          externo) e se todos os arquivos JavaScript do projeto estão acessíveis.
          Recarregue a página após checar.
        </p>
      </div>
    `;
  }

  function boot() {
    const missing = checkDependencies();
    if (missing.length > 0) {
      console.error('[EDL] Dependências faltando:', missing);
      showDependencyError(missing);
      return;
    }
    renderModulesGrid();
    EDL.screens.init();
    console.info('[EDL] Epidemic Dynamics Lab — booted.',
                 'Módulos registrados:', EDL.modules.map(m => m.id));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
