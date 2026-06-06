/* =========================================================================
 * EDL — citations.js
 *
 * CitationManager — atribui números Vancouver às chaves bibtex conforme
 * elas aparecem no texto, mantém o mapa chave→número, e expõe a lista
 * ordenada para o renderizador da bibliografia.
 *
 * USO TÍPICO (dentro de um módulo):
 *
 *   const cm = EDL.citations.create({ idPrefix: 'm08-ref-' });
 *   const cite = (...keys) => cm.cite(...keys);
 *
 *   // no HTML do módulo:
 *   `<p>... mais de 70 mil mortes${cite('snow1855cholera')}.</p>`
 *   `<p>... origem nepalesa${cite('piarroux2011haiti', 'orata2014haiti')}.</p>`
 *
 *   // ao final do render(), na seção de referências do módulo:
 *   EDL.refs.renderCitedReferences(container, cm);
 *
 * SEMÂNTICA:
 *   - A primeira chamada de `cite('foo')` registra 'foo' como [1].
 *   - A segunda chamada de `cite('foo')` reusa [1].
 *   - `cite('a', 'c', 'b')` produz "[1–3]" se a/b/c já tiverem 1, 2, 3;
 *     ou "[1,3]" se forem 1 e 3.
 *
 * SAÍDA HTML:
 *   <sup class="cite"><a href="#m08-ref-foo"
 *        data-cite-refs="foo,bar"
 *        aria-label="Ver referência 1,3">[1,3]</a></sup>
 *
 * Exporta: window.EDL.citations.create(opts)
 *          window.EDL.citations.initTooltip()  ← chamado automaticamente
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * Acesso à bibliografia carregada
   *
   * A bibliografia é definida por references.js (window.EDL.data.references)
   * e/ou pode estar cacheada em EDL.state.references (preenchido por
   * references-view.js na primeira chamada de loadReferences).
   * ------------------------------------------------------------------- */
  function _allRefs() {
    if (EDL.state && EDL.state.references && EDL.state.references.items) {
      return EDL.state.references.items;
    }
    if (EDL.data && EDL.data.references && EDL.data.references.items) {
      return EDL.data.references.items;
    }
    return [];
  }

  /** Escapa atributos HTML. */
  function _escapeAttr(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[ch]));
  }

  /**
   * Comprime uma lista ordenada de inteiros em uma string Vancouver:
   *   [1]            → "1"
   *   [1, 2]         → "1,2"        (par adjacente não vira range)
   *   [1, 2, 3]      → "1–3"        (3+ consecutivos viram range com en-dash)
   *   [1, 3]         → "1,3"
   *   [1, 2, 3, 5]   → "1–3,5"
   *   [1, 3, 4, 5, 8] → "1,3–5,8"
   */
  function _compressRanges(nums) {
    if (nums.length === 0) return '';
    const out = [];
    let start = nums[0];
    let prev  = nums[0];
    function flush() {
      if (start === prev) {
        out.push(String(start));
      } else if (prev === start + 1) {
        // par adjacente — Vancouver tipicamente NÃO usa range para 2
        out.push(start + ',' + prev);
      } else {
        out.push(start + '–' + prev);  // en-dash
      }
    }
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === prev + 1) {
        prev = nums[i];
      } else {
        flush();
        start = prev = nums[i];
      }
    }
    flush();
    return out.join(',');
  }

  /* ---------------------------------------------------------------------
   * Factory — uma instância por módulo
   *
   * Por que factory em vez de singleton global:
   *   - Cada módulo tem seu próprio espaço de numeração (Vancouver é
   *     escopo de "documento"; aqui o "documento" é o módulo).
   *   - Os ids HTML carregam o prefixo do módulo (`m08-ref-foo`) para
   *     não colidirem com a página global de bibliografia, que pode
   *     coexistir no DOM.
   * ------------------------------------------------------------------- */
  function createCitationManager(opts) {
    opts = opts || {};
    const idPrefix = opts.idPrefix || 'ref-';

    const order = [];          // bibkeys em ordem de 1ª aparição
    const map   = new Map();   // bibkey -> número (1-indexado)
    const warnedMissing = new Set();

    function _register(bibkey) {
      if (!map.has(bibkey)) {
        order.push(bibkey);
        map.set(bibkey, order.length);

        // Warning: chave citada mas ausente do references.bib
        const exists = _allRefs().some(r => r.id === bibkey);
        if (!exists && !warnedMissing.has(bibkey)) {
          warnedMissing.add(bibkey);
          console.warn(
            `[EDL/cite] Chave bibtex "${bibkey}" usada em cite() mas ausente de references.bib. ` +
            `Adicione a referência ao .bib e regere references.js.`
          );
        }
      }
      return map.get(bibkey);
    }

    /**
     * Registra uma ou mais chaves e retorna o `<sup>` formatado.
     * Aceita chaves repetidas (deduplicadas), ordem arbitrária (ordenadas
     * crescentemente por número antes de comprimir em ranges).
     */
    function cite(/* ...bibkeys */) {
      const keys = [];
      for (let i = 0; i < arguments.length; i++) {
        if (arguments[i]) keys.push(arguments[i]);
      }
      if (keys.length === 0) return '';

      // Dedup mantendo ordem
      const seen = new Set();
      const unique = [];
      for (const k of keys) {
        if (!seen.has(k)) { seen.add(k); unique.push(k); }
      }

      const pairs = unique.map(k => ({ key: k, num: _register(k) }));
      pairs.sort((a, b) => a.num - b.num);

      const label    = _compressRanges(pairs.map(p => p.num));
      const dataRefs = pairs.map(p => p.key).join(',');
      const firstKey = pairs[0].key;

      // Espaço zero-width antes do <sup> evita que o <sup> seja considerado
      // "início de palavra" e ganhe espaçamento estranho com a pontuação.
      return (
        '<sup class="cite">' +
        '<a href="#' + _escapeAttr(idPrefix + firstKey) + '" ' +
        'data-cite-refs="' + _escapeAttr(dataRefs) + '" ' +
        'aria-label="Ver referência ' + _escapeAttr(label) + '">' +
        '[' + label + ']' +
        '</a>' +
        '</sup>'
      );
    }

    function getOrderedKeys() {
      return order.slice();
    }

    function getOrderedItems() {
      const all = _allRefs();
      const out = [];
      for (const k of order) {
        const it = all.find(r => r.id === k);
        if (it) out.push(it);
      }
      return out;
    }

    /** Chaves citadas que NÃO estão em references.bib (para diagnóstico). */
    function getMissingKeys() {
      const all = _allRefs();
      return order.filter(k => !all.some(r => r.id === k));
    }

    /** Chaves de references.bib associadas a um módulo mas NÃO citadas no
     *  texto (Vancouver clássico não as lista; útil pra avisar o autor). */
    function getUncitedForModule(moduleNumber) {
      const all = _allRefs();
      const citedSet = new Set(order);
      return all
        .filter(r => {
          const mods = (r.custom && r.custom.module) || [];
          return mods.includes(moduleNumber) && !citedSet.has(r.id);
        })
        .map(r => r.id);
    }

    function getIdPrefix() { return idPrefix; }

    function reset() {
      order.length = 0;
      map.clear();
      warnedMissing.clear();
    }

    return {
      cite,
      getOrderedKeys,
      getOrderedItems,
      getMissingKeys,
      getUncitedForModule,
      getIdPrefix,
      reset
    };
  }

  /* ---------------------------------------------------------------------
   * Tooltip / popover
   *
   * Um único elemento .cite-tooltip é adicionado ao <body> e reposicionado
   * a cada hover/focus em uma .cite a. O conteúdo é renderizado em
   * Vancouver (delegando para EDL.refs.format).
   *
   * Por que delegação no document em vez de listeners por elemento:
   *   - Os módulos re-renderizam o DOM frequentemente. Delegação sobrevive
   *     sem precisar re-attachar.
   *   - Para hover, usamos mouseover/mouseout (que bubblam), checando
   *     relatedTarget para evitar piscar quando o mouse anda DENTRO do <a>.
   * ------------------------------------------------------------------- */
  let tooltipEl = null;
  let tooltipCurrent = null;   // anchor atualmente sob hover/focus
  let tooltipInited = false;
  let scrollTimer = null;

  function _ensureTooltipEl() {
    if (tooltipEl) return tooltipEl;
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'cite-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.setAttribute('aria-hidden', 'true');
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.display = 'none';
    document.body.appendChild(tooltipEl);
    return tooltipEl;
  }

  function _renderTooltipContent(refsAttr) {
    const keys = String(refsAttr || '').split(',').map(s => s.trim()).filter(Boolean);
    const all = _allRefs();
    const formatItem = (EDL.refs && EDL.refs.format)
      ? EDL.refs.format
      : (it) => (it && it.title) || '(sem dados)';

    if (keys.length === 0) return '<div class="cite-tooltip-empty">Sem referência.</div>';

    return keys.map(k => {
      const item = all.find(r => r.id === k);
      if (!item) {
        return '<div class="cite-tooltip-item cite-tooltip-missing">' +
               'Referência não encontrada: <code>' + _escapeAttr(k) + '</code></div>';
      }
      return '<div class="cite-tooltip-item">' +
             formatItem(item, 'vancouver') +
             '</div>';
    }).join('');
  }

  function _positionTooltip(anchor) {
    const el = tooltipEl;
    if (!el) return;
    const rect = anchor.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const PAD = 12;

    // Tenta abaixo do <sup>; se estourar o bottom, vai pra cima.
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX - 8;

    if (left + elRect.width > vw - PAD) {
      left = Math.max(PAD, vw - elRect.width - PAD);
    }
    if (left < PAD) left = PAD;

    // Se estourar verticalmente, posiciona acima
    if (rect.bottom + elRect.height + 16 > vh) {
      top = rect.top + window.scrollY - elRect.height - 8;
    }

    el.style.left = left + 'px';
    el.style.top  = top + 'px';
  }

  function _showTooltip(anchor) {
    if (tooltipCurrent === anchor) return;
    tooltipCurrent = anchor;
    const refs = anchor.getAttribute('data-cite-refs');
    const el = _ensureTooltipEl();
    el.innerHTML = _renderTooltipContent(refs);
    el.style.display = 'block';
    el.setAttribute('aria-hidden', 'false');
    // Reflow antes de posicionar para ter dimensões reais
    requestAnimationFrame(() => _positionTooltip(anchor));
  }

  function _hideTooltip() {
    tooltipCurrent = null;
    if (scrollTimer) { cancelAnimationFrame(scrollTimer); scrollTimer = null; }
    if (tooltipEl) {
      tooltipEl.style.display = 'none';
      tooltipEl.setAttribute('aria-hidden', 'true');
    }
  }

  function _closestCite(el) {
    if (!el || !el.closest) return null;
    return el.closest('.cite a');
  }

  function initTooltip() {
    if (tooltipInited) return;
    tooltipInited = true;

    document.addEventListener('mouseover', (e) => {
      const t = _closestCite(e.target);
      if (!t) return;
      const r = _closestCite(e.relatedTarget);
      if (r !== t) _showTooltip(t);
    });

    document.addEventListener('mouseout', (e) => {
      const t = _closestCite(e.target);
      if (!t) return;
      const r = _closestCite(e.relatedTarget);
      if (r !== t) _hideTooltip();
    });

    // Acessibilidade: tooltip também em foco (Tab navegando)
    document.addEventListener('focusin', (e) => {
      const t = _closestCite(e.target);
      if (t) _showTooltip(t);
    });

    document.addEventListener('focusout', (e) => {
      const t = _closestCite(e.target);
      if (t) _hideTooltip();
    });

    // Hide ao rolar (evita ficar flutuando dessincronizado)
    window.addEventListener('scroll', () => {
      if (!tooltipCurrent) return;
      if (scrollTimer) cancelAnimationFrame(scrollTimer);
      scrollTimer = requestAnimationFrame(() => {
        if (tooltipCurrent) _positionTooltip(tooltipCurrent);
      });
    }, { passive: true });

    // Hide ao trocar de rota (módulo destruído)
    window.addEventListener('hashchange', _hideTooltip);
  }

  // Auto-init quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTooltip);
  } else {
    initTooltip();
  }

  EDL.citations = {
    create: createCitationManager,
    initTooltip: initTooltip,
    // Exposto p/ testes:
    _compressRanges: _compressRanges
  };
})();
