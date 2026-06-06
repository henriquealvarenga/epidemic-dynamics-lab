/* =========================================================================
 * EDL — references-view.js
 *
 * Formatadores de citação (Vancouver, ABNT, APA) + renderização da tela
 * de Bibliografia (global) e da seção "Referências deste módulo" (local).
 *
 * Consome CSL-JSON (formato em `references.json`). O arquivo é carregado
 * assincronamente na primeira renderização e cacheado em EDL.state.references.
 *
 * Exporta: window.EDL.refs — { loadReferences, renderGlobalPage,
 *                              renderModuleSection, format, formatItem }
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /**
   * HTML de um indicador de carregamento: spinner CSS + texto, ambos dentro
   * de um container com role="status" e aria-live="polite" — o leitor de
   * tela anuncia a mensagem quando ela aparece, e anuncia o conteúdo novo
   * quando ela é substituída. Usado enquanto references.json está sendo
   * buscado.
   */
  function loadingIndicator(text) {
    return `<div class="loading-spinner" role="status" aria-live="polite">${escapeHtml(text)}</div>`;
  }

  /* ---------------------------------------------------------------------
   * Carregamento da bibliografia
   *
   * Estratégia em duas camadas:
   *   1. Fonte primária: window.EDL.data.references, definido por
   *      references.js (gerado por scripts/bib2json.py). Carregado via
   *      <script> no index.html, funciona em qualquer protocolo incluindo
   *      file:// — fundamental porque o Safari bloqueia fetch() local.
   *   2. Fallback: fetch('references.json'), usado apenas se o global não
   *      estiver disponível (ex: alguém editou index.html e removeu o
   *      <script> sem saber).
   *
   * Política de erro do fallback:
   *   - Log e limpa a promise cacheada para permitir retry futuro.
   *   - Re-joga o erro para callers (renderGlobalPage, renderModuleSection),
   *     que exibem mensagem amigável ao usuário.
   * ------------------------------------------------------------------- */
  let _loadPromise = null;

  function loadReferences() {
    // Cache já populada
    if (EDL.state && EDL.state.references) {
      return Promise.resolve(EDL.state.references);
    }

    // Fonte primária: global definido por references.js
    if (window.EDL && window.EDL.data && window.EDL.data.references) {
      const data = window.EDL.data.references;
      if (EDL.state) EDL.state.references = data;
      return Promise.resolve(data);
    }

    // Fallback: fetch (só funciona em http(s):// — bloqueado em file:// no Safari)
    if (_loadPromise) return _loadPromise;
    console.warn('[EDL] window.EDL.data.references não definido; caindo no fetch de references/references.json. Verifique se <script src="references/references.js"> está incluído em index.html.');
    _loadPromise = fetch('references/references.json')
      .then(r => {
        if (!r.ok) throw new Error('Falha ao carregar references/references.json: HTTP ' + r.status);
        return r.json();
      })
      .then(data => {
        if (EDL.state) EDL.state.references = data;
        return data;
      })
      .catch(err => {
        console.error('[EDL] Falha ao carregar bibliografia:', err);
        _loadPromise = null;
        throw err;
      });
    return _loadPromise;
  }

  /* ---------------------------------------------------------------------
   * Utilitários de autor
   * ------------------------------------------------------------------- */

  /** Extrai as iniciais de um nome. "John David" → "JD". "Mary-Ann" → "MA". */
  function initials(given) {
    if (!given) return '';
    return given.replace(/[.\-]/g, ' ').split(/\s+/).filter(Boolean)
      .map(p => p[0].toUpperCase()).join('');
  }

  /** Remove o marcador "others" (vem do 'and others' em BibTeX) e retorna
   *  { cleanAuthors, hasOthers } para sinalizar que devemos usar "et al.". */
  function cleanAuthors(authors) {
    if (!authors) return { list: [], hasOthers: false };
    const isOthers = a => (a.family || '').toLowerCase() === 'others' ||
                          (a.literal || '').toLowerCase() === 'others';
    const list = authors.filter(a => !isOthers(a));
    return { list, hasOthers: list.length !== authors.length };
  }

  /** Lista de autores para Vancouver: "Smith JD, Doe AB, Li Q" (até 6, senão "... et al."). */
  function vancouverAuthors(authors, maxVisible = 6) {
    const { list, hasOthers } = cleanAuthors(authors);
    if (list.length === 0) return '';
    const fmt = a => a.literal ? a.literal
      : (a.family + (a.given ? ' ' + initials(a.given) : ''));
    if (!hasOthers && list.length <= maxVisible) return list.map(fmt).join(', ');
    const take = Math.min(list.length, maxVisible);
    return list.slice(0, take).map(fmt).join(', ') + ', et al';
  }

  /** Lista de autores para ABNT: "SILVA, H. A.; DOE, J. M." */
  function abntAuthors(authors, maxVisible = 3) {
    const { list, hasOthers } = cleanAuthors(authors);
    if (list.length === 0) return '';
    const fmt = a => {
      if (a.literal) return a.literal.toUpperCase();
      const fam = (a.family || '').toUpperCase();
      const giv = a.given ? initials(a.given).split('').join('. ') + '.' : '';
      return fam + (giv ? ', ' + giv : '');
    };
    if (!hasOthers && list.length <= maxVisible) return list.map(fmt).join('; ');
    return fmt(list[0]) + ' <em>et al.</em>';
  }

  /** Lista de autores para APA: "Smith, J. D., Doe, A. B., & Li, Q." */
  function apaAuthors(authors, maxVisible = 20) {
    const { list, hasOthers } = cleanAuthors(authors);
    if (list.length === 0) return '';
    const fmt = a => {
      if (a.literal) return a.literal;
      const fam = a.family || '';
      const giv = a.given ? initials(a.given).split('').join('. ') + '.' : '';
      return fam + (giv ? ', ' + giv : '');
    };
    if (list.length === 1 && !hasOthers) return fmt(list[0]);
    if (hasOthers) {
      // Formato APA com "et al." quando há "and others" no .bib
      return list.map(fmt).join(', ') + ', et al.';
    }
    if (list.length <= maxVisible) {
      const first = list.slice(0, -1).map(fmt).join(', ');
      return first + ', & ' + fmt(list[list.length - 1]);
    }
    // > maxVisible: primeiros 19, "...", último
    const first = list.slice(0, 19).map(fmt).join(', ');
    return first + ', ... ' + fmt(list[list.length - 1]);
  }

  /** Checa se uma string terminou com um ponto, ignorando tags HTML ao final. */
  function endsInPeriod(s) {
    if (!s) return false;
    const text = String(s).replace(/<[^>]+>/g, '').trimEnd();
    return /[.!?]$/.test(text);
  }

  /* ---------------------------------------------------------------------
   * Demais utilitários
   * ------------------------------------------------------------------- */
  function yearOf(item) {
    const i = item.issued;
    if (!i) return '';
    if (i['date-parts'] && i['date-parts'][0]) return String(i['date-parts'][0][0]);
    if (i.raw) return i.raw;
    return '';
  }

  /** Escapa HTML em strings vindas do usuário/dados (para segurança). */
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"]/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'
    }[ch]));
  }

  /** Link clicável para DOI. */
  function doiLink(doi) {
    if (!doi) return '';
    const safe = escapeHtml(doi);
    return ` <a href="https://doi.org/${safe}" target="_blank" rel="noopener">doi:${safe}</a>`;
  }

  /* ---------------------------------------------------------------------
   * Formatadores por estilo
   * ------------------------------------------------------------------- */

  function vancouver(item) {
    const authors = vancouverAuthors(item.author);
    const title   = escapeHtml(item.title || '(sem título)');
    const year    = yearOf(item);
    const parts   = [];
    if (authors) parts.push(endsInPeriod(authors) ? authors : authors + '.');
    parts.push(title + '.');

    if (item.type === 'article-journal') {
      // Author. Title. Journal. Year;Volume(Issue):Pages. doi:...
      const journal = escapeHtml(item['container-title'] || '');
      let tail = journal ? journal + '. ' : '';
      tail += year ? year : '';
      if (item.volume) tail += ';' + escapeHtml(item.volume);
      if (item.issue)  tail += '(' + escapeHtml(item.issue) + ')';
      if (item.page)   tail += ':' + escapeHtml(item.page);
      tail += '.';
      if (item.DOI) tail += doiLink(item.DOI);
      parts.push(tail);
    } else if (item.type === 'book' || item.type === 'chapter') {
      // Author. Title. Edition. Place: Publisher; Year.
      let tail = '';
      if (item.edition) tail += escapeHtml(item.edition) + ' ed. ';
      if (item['publisher-place']) tail += escapeHtml(item['publisher-place']) + ': ';
      if (item.publisher) tail += escapeHtml(item.publisher) + '; ';
      if (year) tail += year;
      tail += '.';
      if (item.DOI) tail += doiLink(item.DOI);
      parts.push(tail);
    } else {
      // type genérico
      let tail = '';
      if (item['container-title']) tail += escapeHtml(item['container-title']) + '. ';
      if (item.publisher) tail += escapeHtml(item.publisher) + '. ';
      if (year) tail += year;
      tail += '.';
      if (item.DOI) tail += doiLink(item.DOI);
      else if (item.URL) tail += ' <a href="' + escapeHtml(item.URL) + '" target="_blank" rel="noopener">' + escapeHtml(item.URL) + '</a>';
      parts.push(tail);
    }
    return parts.join(' ');
  }

  function abnt(item) {
    const authors = abntAuthors(item.author);
    const title   = escapeHtml(item.title || '(sem título)');
    const year    = yearOf(item);
    const parts   = [];

    if (authors) parts.push(endsInPeriod(authors) ? authors : authors + '.');

    if (item.type === 'article-journal') {
      // SILVA, H. Título do artigo. Nome do periódico, v. X, n. Y, p. Z-W, ano.
      parts.push(title + '.');
      const journal = item['container-title'] ? '<em>' + escapeHtml(item['container-title']) + '</em>' : '';
      let tail = '';
      if (journal) tail += journal + ', ';
      if (item.volume) tail += 'v. ' + escapeHtml(item.volume) + ', ';
      if (item.issue)  tail += 'n. ' + escapeHtml(item.issue) + ', ';
      if (item.page)   tail += 'p. ' + escapeHtml(item.page) + ', ';
      if (year) tail += year;
      tail += '.';
      if (item.DOI) tail += doiLink(item.DOI);
      parts.push(tail);
    } else if (item.type === 'book' || item.type === 'chapter') {
      // SILVA, H. Título. Edição. Local: Editora, ano.
      parts.push('<em>' + title + '</em>.');
      let tail = '';
      if (item.edition) tail += escapeHtml(item.edition) + ' ed. ';
      if (item['publisher-place']) tail += escapeHtml(item['publisher-place']) + ': ';
      if (item.publisher) tail += escapeHtml(item.publisher) + ', ';
      if (year) tail += year;
      tail += '.';
      parts.push(tail);
    } else {
      parts.push('<em>' + title + '</em>.');
      let tail = '';
      if (item['container-title']) tail += escapeHtml(item['container-title']) + '. ';
      if (item.publisher) tail += escapeHtml(item.publisher) + '. ';
      if (year) tail += year;
      tail += '.';
      if (item.URL) tail += ' Disponível em: &lt;' + escapeHtml(item.URL) + '&gt;.';
      parts.push(tail);
    }
    return parts.join(' ');
  }

  function apa(item) {
    const authors = apaAuthors(item.author);
    const title   = escapeHtml(item.title || '(sem título)');
    const year    = yearOf(item);
    const parts   = [];

    if (authors) parts.push(authors);
    parts.push('(' + (year || 'n.d.') + ').');

    if (item.type === 'article-journal') {
      // Author, A. (Year). Title. Journal, Volume(Issue), Pages. https://doi.org/x
      parts.push(title + '.');
      let tail = '';
      if (item['container-title']) tail += '<em>' + escapeHtml(item['container-title']) + '</em>';
      if (item.volume) tail += ', <em>' + escapeHtml(item.volume) + '</em>';
      if (item.issue)  tail += '(' + escapeHtml(item.issue) + ')';
      if (item.page)   tail += ', ' + escapeHtml(item.page);
      tail += '.';
      if (item.DOI) tail += ' https://doi.org/' + escapeHtml(item.DOI);
      parts.push(tail);
    } else if (item.type === 'book' || item.type === 'chapter') {
      parts.push('<em>' + title + '</em>' + (item.edition ? ' (' + escapeHtml(item.edition) + ' ed.)' : '') + '.');
      let tail = '';
      if (item['publisher-place']) tail += escapeHtml(item['publisher-place']) + ': ';
      if (item.publisher) tail += escapeHtml(item.publisher) + '.';
      parts.push(tail);
    } else {
      parts.push('<em>' + title + '</em>.');
      let tail = '';
      if (item['container-title']) tail += escapeHtml(item['container-title']) + '. ';
      if (item.publisher) tail += escapeHtml(item.publisher) + '.';
      if (item.URL) tail += ' ' + escapeHtml(item.URL);
      parts.push(tail);
    }
    return parts.join(' ');
  }

  /** Formata um item em um dado estilo. */
  function formatItem(item, style = 'vancouver') {
    switch (style) {
      case 'abnt':      return abnt(item);
      case 'apa':       return apa(item);
      case 'vancouver':
      default:          return vancouver(item);
    }
  }

  /** Versão textual (sem HTML) para copy-to-clipboard. */
  function formatItemPlain(item, style = 'vancouver') {
    const html = formatItem(item, style);
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent.trim();
  }

  /* ---------------------------------------------------------------------
   * Render — item individual
   *
   * O parâmetro opcional `idAttr` permite que o caller adicione um
   * id="..." ao <li>, usado pela seção de "Referências citadas" do módulo
   * para que `[N]` no texto possa ancorar (href="#m08-ref-foo") no item
   * correspondente. A página global de bibliografia NÃO passa idAttr —
   * evita colisão com os ids da seção de módulo (ambos podem coexistir
   * no DOM em um SPA).
   * ------------------------------------------------------------------- */
  function renderItemHtml(item, style, idAttr) {
    const html = formatItem(item, style);
    const note = item.note ? `<div class="ref-note">${escapeHtml(item.note)}</div>` : '';
    const id = idAttr ? ` id="${escapeHtml(idAttr)}"` : '';
    return `
      <li class="ref-item"${id} data-id="${escapeHtml(item.id)}">
        <div class="ref-body">${html}</div>
        ${note}
        <div class="ref-actions">
          <button type="button" class="ref-action-btn" data-action="copy" title="Copiar citação">📋 Copiar</button>
        </div>
      </li>
    `;
  }

  /** Liga os event listeners de copy dentro de um container. */
  function wireItemActions(container, items, getCurrentStyle) {
    container.querySelectorAll('.ref-item').forEach(li => {
      const id = li.dataset.id;
      const item = items.find(it => it.id === id);
      const btn = li.querySelector('[data-action="copy"]');
      if (btn && item) {
        btn.addEventListener('click', () => {
          const text = formatItemPlain(item, getCurrentStyle());
          navigator.clipboard.writeText(text).then(() => {
            const old = btn.textContent;
            btn.textContent = '✓ Copiado';
            btn.classList.add('ref-action-done');
            setTimeout(() => { btn.textContent = old; btn.classList.remove('ref-action-done'); }, 1500);
          }).catch(() => {
            btn.textContent = '✗ erro';
            setTimeout(() => { btn.textContent = '📋 Copiar'; }, 1500);
          });
        });
      }
    });
  }

  /* ---------------------------------------------------------------------
   * Agrupamento
   * ------------------------------------------------------------------- */
  function modulesOf(item) {
    return (item.custom && item.custom.module) || [];
  }

  function groupByModule(items) {
    const groups = new Map();
    items.forEach(it => {
      const mods = modulesOf(it);
      if (mods.length === 0) {
        if (!groups.has('_nenhum')) groups.set('_nenhum', []);
        groups.get('_nenhum').push(it);
      } else {
        mods.forEach(m => {
          if (!groups.has(m)) groups.set(m, []);
          groups.get(m).push(it);
        });
      }
    });
    // Ordena chaves: números crescentes, '_nenhum' por último
    const keys = [...groups.keys()].sort((a, b) => {
      if (a === '_nenhum') return 1;
      if (b === '_nenhum') return -1;
      return Number(a) - Number(b);
    });
    return keys.map(k => ({ key: k, items: groups.get(k) }));
  }

  function groupChronological(items) {
    // Uma seção "Cronológico" só — ordenação por ano ascendente
    const sorted = [...items].sort((a, b) => Number(yearOf(a)) - Number(yearOf(b)));
    return [{ key: 'cronologico', items: sorted }];
  }

  function groupAlphabetical(items) {
    // Uma seção, ordenação por primeiro autor
    const sortKey = it => {
      if (!it.author || it.author.length === 0) return 'zzz' + (it.title || '');
      const a = it.author[0];
      return (a.literal || a.family || '').toLowerCase();
    };
    const sorted = [...items].sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    return [{ key: 'alfabetico', items: sorted }];
  }

  function groupHeaderLabel(key, count) {
    if (key === '_nenhum') return `Sem módulo associado (${count})`;
    if (key === 'cronologico') return `Cronológico (${count})`;
    if (key === 'alfabetico') return `Alfabético por autor (${count})`;
    // Número = módulo
    const planned = (window.EDL && EDL.modules) || [];
    const moduleObj = planned.find(m => m.number === Number(key));
    const title = moduleObj ? moduleObj.title : `Módulo ${key}`;
    return `Módulo ${String(key).padStart(2, '0')} — ${title} (${count})`;
  }

  /* ---------------------------------------------------------------------
   * Tela global de bibliografia
   * ------------------------------------------------------------------- */
  function renderGlobalPage(container) {
    container.innerHTML = `
      <article class="static-page">
        <h1>Bibliografia</h1>
        <p class="lede">
          Todas as fontes consultadas e citadas no Epidemic Dynamics Lab.
          Clique no DOI para acessar o paper original. Troque o estilo de citação
          ou o agrupamento nos botões abaixo.
        </p>

        <div class="refs-toolbar">
          <div class="refs-toolbar-group">
            <span class="refs-toolbar-label">Estilo</span>
            <div class="refs-toolbar-btns" role="group" aria-label="Estilo de citação">
              <button type="button" class="refs-toolbar-btn active" data-style="vancouver">Vancouver</button>
              <button type="button" class="refs-toolbar-btn" data-style="abnt">ABNT</button>
              <button type="button" class="refs-toolbar-btn" data-style="apa">APA</button>
            </div>
          </div>
          <div class="refs-toolbar-group">
            <span class="refs-toolbar-label">Agrupar por</span>
            <div class="refs-toolbar-btns" role="group" aria-label="Agrupamento">
              <button type="button" class="refs-toolbar-btn active" data-group="module">Módulo</button>
              <button type="button" class="refs-toolbar-btn" data-group="chronological">Cronológico</button>
              <button type="button" class="refs-toolbar-btn" data-group="alphabetical">Alfabético</button>
            </div>
          </div>
        </div>

        <div class="refs-count" id="refs-count"></div>

        <section class="refs-body" id="refs-body">
          ${loadingIndicator('Carregando bibliografia…')}
        </section>

        <div class="refs-downloads">
          <h2>Baixar</h2>
          <p>A bibliografia também está disponível para importação em gerenciadores de referência:</p>
          <div style="display:flex;gap:.6rem;flex-wrap:wrap">
            <a class="btn btn-ghost btn-small" href="references/references.bib" download>📄 references.bib (BibTeX)</a>
            <a class="btn btn-ghost btn-small" href="references/references.json" download>📄 references.json (CSL-JSON)</a>
          </div>
          <p class="muted" style="margin-top:.6rem;font-size:.88rem">
            O BibTeX importa direto em EndNote, Zotero, Mendeley, Papers ou qualquer outro
            gerenciador padrão. O CSL-JSON é útil para integrações com Pandoc, Quarto ou R Markdown.
          </p>
          <p class="muted" style="font-size:.88rem">
            Para citar <em>o próprio aplicativo</em> em trabalhos acadêmicos, veja os
            formatos (ABNT, APA, Vancouver) na
            <button type="button" data-go="about" class="link-btn">página Sobre</button>.
          </p>
        </div>
      </article>
    `;

    const toolbar = container.querySelector('.refs-toolbar');
    const body    = container.querySelector('#refs-body');
    const countEl = container.querySelector('#refs-count');

    let style = 'vancouver';
    let group = 'module';

    toolbar.querySelectorAll('[data-style]').forEach(b => {
      b.addEventListener('click', () => {
        style = b.dataset.style;
        toolbar.querySelectorAll('[data-style]').forEach(bb => bb.classList.toggle('active', bb === b));
        render();
      });
    });
    toolbar.querySelectorAll('[data-group]').forEach(b => {
      b.addEventListener('click', () => {
        group = b.dataset.group;
        toolbar.querySelectorAll('[data-group]').forEach(bb => bb.classList.toggle('active', bb === b));
        render();
      });
    });

    // O [data-go] inserido dinamicamente no texto de downloads precisa ser
    // ligado explicitamente (os bindNavButtons iniciais só veem os que já
    // existem no HTML estático).
    container.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', () => EDL.screens.goTo(btn.getAttribute('data-go')));
    });

    loadReferences().then(data => {
      const items = data.items || [];
      countEl.textContent = items.length + ' referências';
      render(items);
    }).catch(err => {
      body.innerHTML = `<p style="color:var(--danger)">Não foi possível carregar a bibliografia. ${escapeHtml(err.message)}</p>`;
    });

    function render(cachedItems) {
      loadReferences().then(data => {
        const items = cachedItems || data.items || [];
        let groups;
        if      (group === 'chronological') groups = groupChronological(items);
        else if (group === 'alphabetical')  groups = groupAlphabetical(items);
        else                                groups = groupByModule(items);

        body.innerHTML = groups.map(g => `
          <section class="refs-group">
            <h2 class="refs-group-title">${escapeHtml(groupHeaderLabel(g.key, g.items.length))}</h2>
            <ol class="refs-list">
              ${g.items.map(it => renderItemHtml(it, style)).join('')}
            </ol>
          </section>
        `).join('');

        // Wire up copy buttons para cada grupo
        body.querySelectorAll('.refs-group').forEach((section, idx) => {
          wireItemActions(section, groups[idx].items, () => style);
        });
      });
    }
  }

  /* ---------------------------------------------------------------------
   * Seção "Referências deste módulo" (embutida em cada módulo)
   * ------------------------------------------------------------------- */
  function renderModuleSection(container, moduleNumber) {
    const wrap = document.createElement('section');
    wrap.className = 'module-section refs-module-section';
    wrap.innerHTML = `
      <h2>Referências deste módulo</h2>
      <div class="refs-module-body">${loadingIndicator('Carregando…')}</div>
    `;
    container.appendChild(wrap);

    const body = wrap.querySelector('.refs-module-body');

    loadReferences().then(data => {
      const all = data.items || [];
      const mine = all.filter(it => modulesOf(it).includes(moduleNumber));
      if (mine.length === 0) {
        body.innerHTML = `<p class="muted">Este módulo ainda não tem referências associadas.</p>`;
        return;
      }

      // Mini-toolbar: só o toggle de estilo (sem agrupamento — já está agrupado por este módulo)
      body.innerHTML = `
        <div class="refs-toolbar refs-toolbar-compact">
          <div class="refs-toolbar-group">
            <span class="refs-toolbar-label">Estilo</span>
            <div class="refs-toolbar-btns">
              <button type="button" class="refs-toolbar-btn active" data-style="vancouver">Vancouver</button>
              <button type="button" class="refs-toolbar-btn" data-style="abnt">ABNT</button>
              <button type="button" class="refs-toolbar-btn" data-style="apa">APA</button>
            </div>
          </div>
          <a class="refs-module-link" href="#/references">Ver bibliografia completa →</a>
        </div>
        <ol class="refs-list refs-list-module" id="m-refs-list"></ol>
      `;

      let style = 'vancouver';
      const listEl = body.querySelector('#m-refs-list');

      function redraw() {
        listEl.innerHTML = mine.map(it => renderItemHtml(it, style)).join('');
        wireItemActions(listEl, mine, () => style);
      }
      redraw();

      body.querySelectorAll('[data-style]').forEach(b => {
        b.addEventListener('click', () => {
          style = b.dataset.style;
          body.querySelectorAll('[data-style]').forEach(bb => bb.classList.toggle('active', bb === b));
          redraw();
        });
      });
    }).catch(err => {
      body.innerHTML = `<p style="color:var(--danger)">Erro ao carregar bibliografia: ${escapeHtml(err.message)}</p>`;
    });
  }

  /* ---------------------------------------------------------------------
   * Seção "Referências" (Vancouver — só as citadas, na ordem em que
   * aparecem no texto).
   *
   * Diferenças vs. renderModuleSection:
   *   - Recebe um CitationManager (criado por EDL.citations.create()) em
   *     vez de um número de módulo.
   *   - Lista APENAS as referências efetivamente citadas via cite().
   *   - A ordem é a de primeira aparição no texto (ordem Vancouver).
   *   - Cada <li> recebe id="{prefix}{bibkey}" para os links âncora dos
   *     <sup>[N]</sup> no texto resolverem dentro da página.
   *   - Loga warning se houver chaves taggeadas para o módulo no .bib mas
   *     que não foram citadas no texto (Vancouver clássico não as inclui).
   *
   * Parâmetros:
   *   container — onde inserir a seção (geralmente o container do módulo)
   *   cm        — CitationManager retornado por EDL.citations.create()
   *   opts      — {
   *     moduleNumber: 8,   // opcional, só p/ checagem de "uncited"
   *     title: 'Referências'   // opcional, título da seção
   *   }
   * ------------------------------------------------------------------- */
  function renderCitedReferences(container, cm, opts) {
    opts = opts || {};
    const title = opts.title || 'Referências';
    const idPrefix = (cm && cm.getIdPrefix) ? cm.getIdPrefix() : 'ref-';

    const wrap = document.createElement('section');
    wrap.className = 'module-section refs-module-section refs-cited-section';
    wrap.innerHTML = `
      <h2>${escapeHtml(title)}</h2>
      <div class="refs-cited-body">${loadingIndicator('Carregando…')}</div>
    `;
    container.appendChild(wrap);

    const body = wrap.querySelector('.refs-cited-body');

    loadReferences().then(data => {
      const all = data.items || [];
      const orderedKeys = (cm && cm.getOrderedKeys) ? cm.getOrderedKeys() : [];

      // Itens efetivamente encontrados (na ordem Vancouver)
      const ordered = orderedKeys
        .map(k => all.find(it => it.id === k))
        .filter(Boolean);

      // Diagnóstico: chaves citadas mas ausentes do .bib
      const missing = (cm && cm.getMissingKeys) ? cm.getMissingKeys() : [];
      if (missing.length) {
        console.warn(
          '[EDL/refs] As seguintes chaves foram citadas no texto mas não estão em references.bib:',
          missing
        );
      }

      // Diagnóstico: chaves no .bib associadas ao módulo mas não citadas
      if (opts.moduleNumber != null && cm && cm.getUncitedForModule) {
        const uncited = cm.getUncitedForModule(opts.moduleNumber);
        if (uncited.length) {
          console.info(
            `[EDL/refs] Referências associadas ao módulo ${opts.moduleNumber} mas não citadas no texto (omitidas — Vancouver clássico):`,
            uncited
          );
        }
      }

      if (ordered.length === 0) {
        body.innerHTML = `<p class="muted">Nenhuma referência citada neste módulo ainda.</p>`;
        return;
      }

      body.innerHTML = `
        <p class="muted refs-cited-help" style="margin: 0 0 .8rem; font-size: .88rem;">
          Numeração na ordem em que cada fonte aparece no texto (estilo Vancouver).
          Clique em <span class="cite-inline-example">[N]</span> ao longo do módulo para
          saltar até a referência correspondente.
        </p>
        <div class="refs-toolbar refs-toolbar-compact">
          <div class="refs-toolbar-group">
            <span class="refs-toolbar-label">Estilo</span>
            <div class="refs-toolbar-btns">
              <button type="button" class="refs-toolbar-btn active" data-style="vancouver">Vancouver</button>
              <button type="button" class="refs-toolbar-btn" data-style="abnt">ABNT</button>
              <button type="button" class="refs-toolbar-btn" data-style="apa">APA</button>
            </div>
          </div>
          <a class="refs-module-link" href="#/references">Ver bibliografia completa →</a>
        </div>
        <ol class="refs-list refs-list-module refs-list-cited" id="refs-cited-list"></ol>
      `;

      let style = 'vancouver';
      const listEl = body.querySelector('#refs-cited-list');

      function redraw() {
        listEl.innerHTML = ordered
          .map(it => renderItemHtml(it, style, idPrefix + it.id))
          .join('');
        wireItemActions(listEl, ordered, () => style);
      }
      redraw();

      body.querySelectorAll('[data-style]').forEach(b => {
        b.addEventListener('click', () => {
          style = b.dataset.style;
          body.querySelectorAll('[data-style]').forEach(bb => bb.classList.toggle('active', bb === b));
          redraw();
        });
      });
    }).catch(err => {
      body.innerHTML = `<p style="color:var(--danger)">Erro ao carregar bibliografia: ${escapeHtml(err.message)}</p>`;
    });
  }

  EDL.refs = {
    loadReferences,
    renderGlobalPage,
    renderModuleSection,
    renderCitedReferences,
    format: formatItem,
    formatPlain: formatItemPlain,
    // exposto para tests se necessário
    _vancouver: vancouver, _abnt: abnt, _apa: apa
  };
})();
