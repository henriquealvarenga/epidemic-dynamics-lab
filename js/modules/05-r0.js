/* =========================================================================
 * EDL — Módulo 05: R₀ e Crescimento Exponencial
 *
 * Herdeiro direto do R_Naught v1 (app Shiny). O simulador comparador A×B é
 * preservado em espírito: dois cenários com R₀ diferentes, visualizados lado
 * a lado ao longo de N ciclos, com toggle de escala (linear/log) e série
 * (acumulado/no ciclo). Agora em JS puro, reativo aos sliders sem botão
 * "Calcular" — o gráfico atualiza em tempo real.
 *
 * Baseado em: banco Kahoot Q5a (definição de R₀) + conteúdo da Aula 1a
 * e reproduzindo fielmente a fórmula do v1 (inc[k] = inc[k-1] × R₀).
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * R₀ de doenças clássicas — valores encontrados na literatura, citados
   * com cuidado (faixas, não ponto único). Esses valores alimentam a
   * tabela de referência e o quiz.
   * ------------------------------------------------------------------- */
  const R0_TABLE = [
    { name: 'Sarampo',                R0: [12, 18], mode: 'Respiratório (gotículas + aerossol)', herd: [92, 94] },
    { name: 'Coqueluche',              R0: [12, 17], mode: 'Respiratório',                        herd: [92, 94] },
    { name: 'Varíola (erradicada)',    R0: [5, 7],   mode: 'Respiratório + contato',              herd: [80, 86] },
    { name: 'Poliomielite',            R0: [5, 7],   mode: 'Fecal-oral',                          herd: [80, 86] },
    { name: 'Rubéola',                 R0: [5, 7],   mode: 'Respiratório',                        herd: [80, 86] },
    { name: 'Caxumba',                 R0: [4, 7],   mode: 'Respiratório',                        herd: [75, 86] },
    { name: 'COVID-19 (variante inicial)', R0: [2.0, 3.0], mode: 'Respiratório + aerossol',      herd: [50, 67] },
    { name: 'SARS (2003)',             R0: [2, 4],   mode: 'Respiratório + gotículas',            herd: [50, 75] },
    { name: 'HIV',                     R0: [2, 5],   mode: 'Sexual, sanguíneo, vertical',         herd: [50, 80] },
    { name: 'Ebola',                   R0: [1.5, 2.5], mode: 'Contato com fluidos',              herd: [33, 60] },
    { name: 'Dengue',                  R0: [1.5, 3], mode: 'Vetor (Aedes)',                       herd: [33, 67] },
    { name: 'Gripe (sazonal)',         R0: [1.2, 1.5], mode: 'Respiratório',                     herd: [17, 33] },
    { name: 'Gripe pandêmica (1918)',  R0: [1.8, 3], mode: 'Respiratório',                        herd: [44, 67] }
  ];

  /* ---------------------------------------------------------------------
   * Quiz — banco Kahoot Q5a + 4 perguntas adicionais
   * ------------------------------------------------------------------- */
  const QUIZ = [
    {
      // Kahoot Q5a
      q: 'O que significa o termo "R₀" em epidemiologia?',
      opts: [
        'Tempo que a doença leva para se manifestar',
        'Porcentagem de casos confirmados por testes',
        'Número médio de pessoas que um indivíduo infectado pode contaminar',
        'Duração média da doença'
      ],
      answer: 2,
      feedback:
        '<strong>R₀ (R-naught)</strong> é o número básico de reprodução: o número médio de ' +
        'casos secundários gerados por um indivíduo infeccioso em uma população <em>totalmente ' +
        'suscetível</em>. É um número adimensional, calculado para o início de um surto (antes ' +
        'que imunidade populacional reduza a transmissão).'
    },
    {
      q: 'Se R₀ = 1,8 para uma doença respiratória, qual a melhor interpretação?',
      opts: [
        'A doença tende a desaparecer naturalmente em poucos ciclos',
        'Cada infectado transmite, em média, para 1,8 pessoas — o surto tende a crescer',
        'A doença afeta 1,8% da população',
        'O período de incubação é de 1,8 dias'
      ],
      answer: 1,
      feedback:
        'R₀ > 1 significa crescimento epidêmico; R₀ < 1 significa extinção; R₀ = 1 é a fronteira ' +
        '(cada infectado reproduz a si mesmo na próxima geração, mantendo o patamar). 1,8 indica ' +
        'que, em média, cada infectado gera 1,8 novos casos — crescimento sustentado.'
    },
    {
      q: 'Dois surtos começam com 1 caso cada. No Cenário A o R₀ é 1,5; no Cenário B, 3,0. Após 10 ciclos (assumindo crescimento exponencial puro e população suscetível), quantas vezes o Cenário B terá mais casos acumulados que o A?',
      opts: [
        'Cerca de 2 vezes',
        'Cerca de 10 vezes',
        'Cerca de 100 vezes',
        'Cerca de 400 vezes'
      ],
      answer: 3,
      feedback:
        'A matemática: no 10º ciclo, a incidência é I₀ × R₀¹⁰, então o quociente das ' +
        'incidências é (3/1,5)¹⁰ = 2¹⁰ = 1024. Como comparamos <em>acumulados</em> (soma de ' +
        'todas as incidências até k=10), a razão fica um pouco menor — numericamente, ' +
        '~518× — mas ainda da ordem de algumas centenas. A opção <strong>“cerca de 400 vezes”</strong> ' +
        'é a que mais se aproxima. Essa é a razão de pequenas diferenças em R₀ importarem ' +
        'tanto: o efeito se <em>multiplica</em> a cada ciclo. Use o simulador acima com ' +
        'R₀=1,5 vs R₀=3,0 e 10 ciclos para conferir.'
    },
    {
      q: 'O tempo de duplicação (em ciclos) para crescimento exponencial puro é dado por:',
      opts: [
        't = R₀ / 2',
        't = log(2) / log(R₀)',
        't = 2 × R₀',
        't = 1 / (R₀ − 1)'
      ],
      answer: 1,
      feedback:
        'Se incidência(k) = I₀ × R₀ᵏ, o tempo em ciclos para dobrar é t = log(2)/log(R₀). Para ' +
        'R₀=2, t=1 (óbvio); para R₀=1,1 (pouco acima de 1), t ≈ 7,27 ciclos. Isso explica por que ' +
        'epidemias com R₀ "baixo" podem ser menos explosivas mas ainda muito preocupantes a longo ' +
        'prazo.'
    },
    {
      q: 'R₀ é teoricamente calculado para uma população totalmente suscetível. O que usamos na prática, quando parte da população já está imune?',
      opts: [
        'R₀ permanece o mesmo; ele não varia com a imunidade',
        'Usa-se o número efetivo de reprodução (Rₑ ou Rₜ), que é R₀ × fração ainda suscetível',
        'Calcula-se um novo R₀ do zero a cada ciclo',
        'Usa-se R₀ multiplicado pelo número de dias da epidemia'
      ],
      answer: 1,
      feedback:
        'R₀ é uma constante para uma dada doença em uma dada população. O que muda ao longo de ' +
        'um surto é o <strong>Rₑ (R efetivo)</strong> = R₀ × S/N, onde S/N é a fração ainda ' +
        'suscetível. Quando Rₑ cai abaixo de 1, o surto começa a declinar — foi assim que a ' +
        'imunidade adquirida encerrou ondas da gripe espanhola e da COVID-19 antes mesmo de ' +
        'intervenções chegarem à saturação. Voltamos a isso no Módulo 6 (imunidade de rebanho).'
    }
  ];

  /* ---------------------------------------------------------------------
   * Estado do simulador (local a este módulo)
   * ------------------------------------------------------------------- */
  const sim = {
    R0_A: 1.5,
    R0_B: 3.0,
    cycles: 12,
    i0: 1,
    series: 'cumulative', // 'cumulative' | 'incidence'
    logY: false
  };

  /* ---------------------------------------------------------------------
   * Renderização — seções de teoria
   * ------------------------------------------------------------------- */
  function renderHeader(container) {
    const header = document.createElement('header');
    header.className = 'module-header';
    header.innerHTML = `
      <span class="module-badge">Módulo 05</span>
      <h1>R₀ e Crescimento Exponencial</h1>
      <p class="module-subtitle">
        O número básico de reprodução — a constante mais citada da epidemiologia
        quantitativa — e o simulador comparador A×B herdado do R_Naught v1,
        agora reativo e em JavaScript puro.
      </p>
    `;
    container.appendChild(header);
  }

  function renderConceptSection(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>1. O conceito</h2>
      <p>
        <strong>R₀</strong> — pronuncia-se <em>“erre-naught”</em> ou <em>“erre-zero”</em> —
        é o número médio de casos secundários gerados por um único infectado em uma
        população <strong>totalmente suscetível</strong>. É calculado para o início
        do surto, antes que a imunidade adquirida reduza a transmissão.
      </p>

      <div class="r0-interp">
        <div class="r0-interp-card r0-interp-below">
          <div class="r0-interp-sym">R₀ &lt; 1</div>
          <div class="r0-interp-text">
            Cada infectado gera, em média, menos de um novo caso. A doença
            <strong>tende a desaparecer</strong> naturalmente, mesmo sem intervenção.
          </div>
        </div>
        <div class="r0-interp-card r0-interp-one">
          <div class="r0-interp-sym">R₀ = 1</div>
          <div class="r0-interp-text">
            Cada infectado gera exatamente um novo caso. A doença se mantém
            <strong>endêmica</strong>, sem crescimento nem declínio.
          </div>
        </div>
        <div class="r0-interp-card r0-interp-above">
          <div class="r0-interp-sym">R₀ &gt; 1</div>
          <div class="r0-interp-text">
            Cada infectado gera mais de um caso secundário. A doença
            <strong>se espalha exponencialmente</strong>, até o limite da
            suscetibilidade populacional.
          </div>
        </div>
      </div>

      <p>
        A matemática é simples e implacável: se cada ciclo de transmissão multiplica
        o número de casos por R₀, a incidência cresce como
        <code>I(k) = I₀ × R₀<sup>k</sup></code>. O tempo de duplicação — quantos ciclos
        até dobrar o número de casos — é <code>log(2) / log(R₀)</code>. Para
        R₀ = 2, é exatamente 1 ciclo; para R₀ = 1,1, cerca de 7 ciclos.
      </p>
    `;
    container.appendChild(sec);
  }

  function renderR0Table(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>2. R₀ de doenças conhecidas</h2>
      <p>
        Os valores abaixo são faixas estimadas na literatura (não valores únicos) —
        R₀ varia conforme a variante do patógeno, as condições socioambientais e os
        métodos de estimativa. Use como ordens de grandeza, não como medidas precisas.
      </p>
      <div class="r0-table-wrap">
        <table class="r0-table">
          <thead>
            <tr>
              <th>Doença</th>
              <th>R₀ (faixa)</th>
              <th>Transmissão</th>
              <th>Limiar de imunidade de rebanho</th>
            </tr>
          </thead>
          <tbody>
            ${R0_TABLE.map(d => `
              <tr>
                <td><strong>${d.name}</strong></td>
                <td><code>${d.R0[0]}–${d.R0[1]}</code></td>
                <td>${d.mode}</td>
                <td>${d.herd[0]}–${d.herd[1]}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <p class="muted" style="margin-top:.5rem">
        O limiar de imunidade de rebanho é o tema do Módulo 6 — mas fica claro aqui
        por que doenças com R₀ muito alto, como sarampo, exigem cobertura vacinal
        acima de 90% para controle populacional, enquanto gripe sazonal se mantém
        em equilíbrio com coberturas muito mais modestas.
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Simulador comparador A×B — o coração do R_Naught v1
   * ------------------------------------------------------------------- */
  function renderSimulator(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>3. Laboratório — comparador A × B</h2>
      <p>
        Dois cenários epidêmicos com valores de R₀ diferentes, simulados lado a lado
        ao longo dos ciclos escolhidos. Mova os controles e observe como a curva
        responde em tempo real. Modelo: crescimento exponencial puro
        (<code>I(k) = I(k−1) × R₀</code>), reproduzindo o comportamento do R_Naught v1.
      </p>

      <div class="sim-wrap" id="m05-sim"></div>
    `;
    container.appendChild(sec);

    const wrap = sec.querySelector('#m05-sim');
    buildSimulator(wrap);
  }

  function buildSimulator(wrap) {
    wrap.innerHTML = `
      <div class="sim-layout">
        <aside class="sim-controls">
          <div class="sim-group">
            <h4>Parâmetros gerais</h4>
            <label class="sim-slider">
              <span class="sim-slider-label">Ciclos</span>
              <input type="range" id="ctrl-cycles" min="1" max="20" step="1" value="${sim.cycles}">
              <output id="out-cycles">${sim.cycles}</output>
            </label>
            <label class="sim-slider">
              <span class="sim-slider-label">Casos iniciais</span>
              <input type="number" id="ctrl-i0" min="1" max="1000" step="1" value="${sim.i0}" style="width:90px">
            </label>
          </div>

          <div class="sim-group sim-group-a">
            <h4>Cenário A</h4>
            <label class="sim-slider">
              <span class="sim-slider-label">R₀ (A)</span>
              <input type="range" id="ctrl-r0a" min="0" max="10" step="0.1" value="${sim.R0_A}">
              <output id="out-r0a">${sim.R0_A.toFixed(1)}</output>
            </label>
          </div>

          <div class="sim-group sim-group-b">
            <h4>Cenário B</h4>
            <label class="sim-slider">
              <span class="sim-slider-label">R₀ (B)</span>
              <input type="range" id="ctrl-r0b" min="0" max="10" step="0.1" value="${sim.R0_B}">
              <output id="out-r0b">${sim.R0_B.toFixed(1)}</output>
            </label>
          </div>

          <div class="sim-group">
            <h4>Visualização</h4>
            <div class="sim-radio-row">
              <label><input type="radio" name="series" value="cumulative" ${sim.series==='cumulative'?'checked':''}> Acumulado</label>
              <label><input type="radio" name="series" value="incidence" ${sim.series==='incidence'?'checked':''}> Por ciclo</label>
            </div>
            <label class="sim-checkbox">
              <input type="checkbox" id="ctrl-logy" ${sim.logY?'checked':''}>
              Escala log no eixo Y
            </label>
          </div>

          <div class="sim-group">
            <h4>Presets</h4>
            <div class="sim-presets">
              <button type="button" data-preset="gripe-covid">Gripe × COVID inicial</button>
              <button type="button" data-preset="sarampo-covid">Sarampo × COVID</button>
              <button type="button" data-preset="ebola-covid">Ebola × COVID</button>
            </div>
          </div>

          <div class="sim-actions">
            <button type="button" class="btn btn-ghost btn-small" id="sim-download">Baixar CSV</button>
          </div>
        </aside>

        <div class="sim-main">
          <div class="sim-plot-wrap" id="sim-plot"></div>
          <div class="sim-metrics" id="sim-metrics"></div>
          <details class="sim-table-details">
            <summary>Ver tabela de valores</summary>
            <div class="sim-table-wrap" id="sim-table"></div>
          </details>
        </div>
      </div>
    `;

    const ctrl = {
      cycles: wrap.querySelector('#ctrl-cycles'),
      i0:     wrap.querySelector('#ctrl-i0'),
      r0a:    wrap.querySelector('#ctrl-r0a'),
      r0b:    wrap.querySelector('#ctrl-r0b'),
      logy:   wrap.querySelector('#ctrl-logy'),
      series: wrap.querySelectorAll('input[name="series"]')
    };
    const out = {
      cycles: wrap.querySelector('#out-cycles'),
      r0a:    wrap.querySelector('#out-r0a'),
      r0b:    wrap.querySelector('#out-r0b')
    };

    ctrl.cycles.addEventListener('input', () => { sim.cycles = +ctrl.cycles.value; out.cycles.textContent = sim.cycles; update(); });
    ctrl.i0    .addEventListener('input', () => { sim.i0     = Math.max(1, +ctrl.i0.value); update(); });
    ctrl.r0a   .addEventListener('input', () => { sim.R0_A   = +ctrl.r0a.value; out.r0a.textContent = sim.R0_A.toFixed(1); update(); });
    ctrl.r0b   .addEventListener('input', () => { sim.R0_B   = +ctrl.r0b.value; out.r0b.textContent = sim.R0_B.toFixed(1); update(); });
    ctrl.logy  .addEventListener('change', () => { sim.logY  = ctrl.logy.checked; update(); });
    ctrl.series.forEach(r => r.addEventListener('change', () => {
      sim.series = wrap.querySelector('input[name="series"]:checked').value;
      update();
    }));

    // Presets
    const presets = {
      'gripe-covid':   { R0_A: 1.3, R0_B: 2.5 },
      'sarampo-covid': { R0_A: 15,  R0_B: 2.5 },
      'ebola-covid':   { R0_A: 2,   R0_B: 2.5 }
    };
    wrap.querySelectorAll('.sim-presets button').forEach(b => {
      b.addEventListener('click', () => {
        const p = presets[b.dataset.preset];
        if (!p) return;
        sim.R0_A = p.R0_A;
        sim.R0_B = p.R0_B;
        ctrl.r0a.value = p.R0_A;
        ctrl.r0b.value = p.R0_B;
        out.r0a.textContent = p.R0_A.toFixed(1);
        out.r0b.textContent = p.R0_B.toFixed(1);
        update();
      });
    });

    // Download CSV
    wrap.querySelector('#sim-download').addEventListener('click', () => downloadCSV());

    // Primeira renderização
    update();
    // Redesenha em resize
    let rafId;
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawPlot(wrap));
    };
    window.addEventListener('resize', onResize, { passive: true });
    EDL.onModuleDestroy(() => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    });

    function update() {
      drawPlot(wrap);
      drawMetrics(wrap);
      drawTable(wrap);
    }
  }

  /* ---- Plot (D3) ----------------------------------------------------- */
  function computeSeries() {
    const a = EDL.models.exponential({ R0: sim.R0_A, cycles: sim.cycles, i0: sim.i0 });
    const b = EDL.models.exponential({ R0: sim.R0_B, cycles: sim.cycles, i0: sim.i0 });
    return { a, b };
  }

  function drawPlot(wrap) {
    const d3 = window.d3;
    const plotEl = wrap.querySelector('#sim-plot');
    plotEl.innerHTML = '';

    const { a, b } = computeSeries();
    const seriesKey = (sim.series === 'cumulative') ? 'acum' : 'inc';
    const yA = a[seriesKey];
    const yB = b[seriesKey];

    const W = plotEl.clientWidth || 600;
    const margin = { top: 24, right: 28, bottom: 44, left: 64 };
    const ratio = 0.55;
    const H = Math.round(W * ratio);
    const iw = W - margin.left - margin.right;
    const ih = H - margin.top - margin.bottom;

    const svg = d3.select(plotEl).append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label',
        `Gráfico comparando dois cenários epidêmicos: A com R₀ igual a ${sim.R0_A.toFixed(1)} ` +
        `e B com R₀ igual a ${sim.R0_B.toFixed(1)}, ao longo de ${sim.cycles} ciclos, ` +
        `em escala ${sim.logY ? 'logarítmica' : 'linear'}, mostrando ${sim.series === 'cumulative' ? 'casos acumulados' : 'casos por ciclo'}.`)
      .style('display', 'block').style('width', '100%').style('height', 'auto');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Escalas
    const xs = d3.scaleLinear().domain([0, sim.cycles]).range([0, iw]);
    const maxY = d3.max([...yA, ...yB]) || 1;

    let ys;
    if (sim.logY) {
      // min tem de ser >0 para log; usamos max(0.5, mínimo das séries positivas)
      const positives = [...yA, ...yB].filter(v => v > 0);
      const minY = positives.length ? d3.min(positives) : 1;
      ys = d3.scaleLog().domain([Math.max(0.5, minY * 0.5), maxY * 1.1]).range([ih, 0]);
    } else {
      ys = d3.scaleLinear().domain([0, maxY * 1.1]).range([ih, 0]);
    }

    // Grid
    g.append('g').attr('class', 'edl-grid-y')
      .call(d3.axisLeft(ys).ticks(6).tickSize(-iw).tickFormat(''))
      .call(sel => {
        sel.selectAll('path').attr('stroke', 'none');
        sel.selectAll('line').attr('stroke', '#1e2638').attr('stroke-dasharray', '2,3');
      });

    // Axes
    const xAxis = d3.axisBottom(xs).ticks(Math.min(sim.cycles, 12)).tickFormat(d3.format('d'));
    g.append('g').attr('transform', `translate(0,${ih})`).call(xAxis)
      .call(sel => {
        sel.selectAll('path,line').attr('stroke', '#6b7a90');
        sel.selectAll('text').attr('fill', '#a8b3c4').style('font-size','11px');
      });
    const yAxis = sim.logY ? d3.axisLeft(ys).ticks(6, '~s') : d3.axisLeft(ys).ticks(6, '~s');
    g.append('g').call(yAxis)
      .call(sel => {
        sel.selectAll('path,line').attr('stroke', '#6b7a90');
        sel.selectAll('text').attr('fill', '#a8b3c4').style('font-size','11px');
      });

    // Eixos — rótulos
    g.append('text').attr('x', iw / 2).attr('y', ih + 34)
      .attr('text-anchor', 'middle').attr('fill', '#a8b3c4').style('font-size','12px').text('Ciclo');
    g.append('text').attr('transform', 'rotate(-90)').attr('x', -ih / 2).attr('y', -46)
      .attr('text-anchor', 'middle').attr('fill', '#a8b3c4').style('font-size','12px')
      .text(sim.series === 'cumulative' ? 'Casos (acumulado)' : 'Casos (no ciclo)');

    // Gerador de linhas
    const line = d3.line()
      .x((d, i) => xs(i))
      .y(d => ys(Math.max(d, sim.logY ? 0.5 : 0)))  // no log, evita log(0)
      .curve(d3.curveMonotoneX);

    // Série B primeiro (desenhada "atrás")
    g.append('path')
      .datum(yB)
      .attr('fill', 'none')
      .attr('stroke', '#ff6b6b')
      .attr('stroke-width', 2.2)
      .attr('d', line);

    g.append('path')
      .datum(yA)
      .attr('fill', 'none')
      .attr('stroke', '#00d9c0')
      .attr('stroke-width', 2.2)
      .attr('d', line);

    // Pontos
    [{ series: yA, color: '#00d9c0' }, { series: yB, color: '#ff6b6b' }].forEach(s => {
      g.selectAll(null)
        .data(s.series)
        .join('circle')
        .attr('cx', (d, i) => xs(i))
        .attr('cy', d => ys(Math.max(d, sim.logY ? 0.5 : 0)))
        .attr('r', 3)
        .attr('fill', s.color)
        .attr('stroke', '#0a0e1a')
        .attr('stroke-width', 1);
    });

    // Legenda dentro do SVG (canto superior esquerdo, não polui quando curvas ocupam muito)
    const legend = svg.append('g').attr('transform', `translate(${margin.left + 8},${margin.top + 4})`);
    const items = [
      { label: `A · R₀=${sim.R0_A.toFixed(1)}`, color: '#00d9c0' },
      { label: `B · R₀=${sim.R0_B.toFixed(1)}`, color: '#ff6b6b' }
    ];
    items.forEach((it, i) => {
      const gi = legend.append('g').attr('transform', `translate(0,${i * 20})`);
      gi.append('circle').attr('r', 5).attr('fill', it.color);
      gi.append('text').attr('x', 12).attr('y', 4)
        .attr('fill', '#f0f4f8').style('font-size','12px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(it.label);
    });
  }

  /* ---- Métricas e tabela --------------------------------------------- */
  function drawMetrics(wrap) {
    const el = wrap.querySelector('#sim-metrics');
    const { a, b } = computeSeries();
    const finalAcumA = a.acum[a.acum.length - 1];
    const finalAcumB = b.acum[b.acum.length - 1];
    const ratio = finalAcumA > 0 ? (finalAcumB / finalAcumA) : Infinity;

    const tdA = EDL.models.doublingTime(sim.R0_A);
    const tdB = EDL.models.doublingTime(sim.R0_B);

    el.innerHTML = `
      <div class="sim-metric">
        <div class="sim-metric-label">Cenário A · total em ${sim.cycles} ciclos</div>
        <div class="sim-metric-value sim-metric-a">${EDL.math.fmtInt(finalAcumA)}</div>
        <div class="sim-metric-sub">Tempo de duplicação: ${Number.isFinite(tdA) ? tdA.toFixed(2) + ' ciclos' : '—'}</div>
      </div>
      <div class="sim-metric">
        <div class="sim-metric-label">Cenário B · total em ${sim.cycles} ciclos</div>
        <div class="sim-metric-value sim-metric-b">${EDL.math.fmtInt(finalAcumB)}</div>
        <div class="sim-metric-sub">Tempo de duplicação: ${Number.isFinite(tdB) ? tdB.toFixed(2) + ' ciclos' : '—'}</div>
      </div>
      <div class="sim-metric">
        <div class="sim-metric-label">Razão B / A</div>
        <div class="sim-metric-value">${Number.isFinite(ratio) ? (ratio > 100 ? ratio.toExponential(2) : ratio.toFixed(2) + '×') : '—'}</div>
        <div class="sim-metric-sub">Quantas vezes B ultrapassa A</div>
      </div>
    `;
  }

  function drawTable(wrap) {
    const el = wrap.querySelector('#sim-table');
    const { a, b } = computeSeries();
    const rows = [];
    for (let k = 0; k <= sim.cycles; k++) {
      rows.push({
        ciclo: k,
        incA: a.inc[k],
        incB: b.inc[k],
        acumA: a.acum[k],
        acumB: b.acum[k]
      });
    }

    const fmt = (x) => EDL.math.fmtBR(x, 2);

    el.innerHTML = `
      <table class="sim-table">
        <thead>
          <tr>
            <th>Ciclo</th>
            <th>Inc. A</th>
            <th>Inc. B</th>
            <th>Acum. A</th>
            <th>Acum. B</th>
            <th>Razão B/A</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${r.ciclo}</td>
              <td>${fmt(r.incA)}</td>
              <td>${fmt(r.incB)}</td>
              <td>${fmt(r.acumA)}</td>
              <td>${fmt(r.acumB)}</td>
              <td>${r.acumA > 0 ? fmt(r.acumB / r.acumA) : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function downloadCSV() {
    const { a, b } = computeSeries();
    const sep = ';';
    const header = ['Ciclo', 'Inc_A', 'Inc_B', 'Acum_A', 'Acum_B', 'Razao_B_sobre_A'];
    const lines = [header.join(sep)];

    for (let k = 0; k <= sim.cycles; k++) {
      // decimal BR com vírgula
      const fmt = (x) => (Math.round(x * 100) / 100).toString().replace('.', ',');
      const razao = a.acum[k] > 0 ? fmt(b.acum[k] / a.acum[k]) : '';
      lines.push([k, fmt(a.inc[k]), fmt(b.inc[k]), fmt(a.acum[k]), fmt(b.acum[k]), razao].join(sep));
    }

    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const fname = `edl_m05_r0a${sim.R0_A.toFixed(1)}_r0b${sim.R0_B.toFixed(1)}.csv`;
    const a_ = document.createElement('a');
    a_.href = url; a_.download = fname; document.body.appendChild(a_); a_.click();
    setTimeout(() => { URL.revokeObjectURL(url); a_.remove(); }, 0);
  }

  function renderActivity(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>4. Atividade — cinco perguntas</h2>
      <p>
        Cinco perguntas: começam pela definição de R₀ e avançam para interpretação,
        tempo de duplicação e a distinção entre R₀ e R efetivo. Use o simulador da
        seção 3 para verificar numericamente qualquer das afirmações.
      </p>
      <div class="activity-box" id="m05-activity"></div>
    `;
    container.appendChild(sec);
    EDL.quiz.run(sec.querySelector('#m05-activity'), { bank: QUIZ });
  }

  function renderFooter(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>Próximos passos</h2>
      <p>
        Já entendemos que um R₀ alto pressiona o sistema. O <strong>Módulo 6</strong>
        fecha esse raciocínio mostrando como a imunidade de rebanho — a fração mínima
        de pessoas imunes para que o surto se extinga — se deduz diretamente de R₀
        pela fórmula <code>1 − 1/R₀</code>. Em construção.
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Registro
   * ------------------------------------------------------------------- */
  EDL.registerModule({
    id: '05-r0',
    number: 5,
    icon: '📈',
    title: 'R₀ e Crescimento Exponencial',
    subtitle: 'Número básico de reprodução, tempo de duplicação, comparador A×B.',
    status: 'available',
    quizCount: QUIZ.length,
    render(container) {
      renderHeader(container);
      renderConceptSection(container);
      renderR0Table(container);
      renderSimulator(container);
      renderActivity(container);
      EDL.refs.renderModuleSection(container, 5);
      renderFooter(container);
    }
  });
})();
