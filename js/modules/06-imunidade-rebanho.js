/* =========================================================================
 * EDL — Módulo 06: Imunidade de Rebanho
 *
 * O limiar crítico de imunidade é a fração mínima da população que precisa
 * estar imune (por vacinação ou infecção prévia) para que o surto se extinga
 * mesmo sem intervenções adicionais. Deriva-se diretamente de R₀:
 *
 *     limiar = 1 − 1/R₀
 *
 * Este módulo traz:
 *   1. A derivação conceitual (Rₑ cai abaixo de 1 quando fração imune > limiar)
 *   2. Um calculador interativo: slider R₀ → limiar
 *   3. Tabela de doenças com cobertura vacinal necessária
 *   4. Simulador de surto em rede de 196 pessoas (14×14):
 *      o aluno ajusta a cobertura vacinal e vê se o surto se extingue
 *   5. Quiz
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * Tabela: para cada doença, o R₀ típico e a cobertura vacinal
   * equivalente (1 − 1/R₀).
   * ------------------------------------------------------------------- */
  const HERD_TABLE = [
    { name: 'Sarampo',    R0: 15,   pct: 93.3 },
    { name: 'Coqueluche', R0: 14,   pct: 92.9 },
    { name: 'Rubéola',    R0: 6,    pct: 83.3 },
    { name: 'Poliomielite', R0: 6,  pct: 83.3 },
    { name: 'Caxumba',    R0: 5,    pct: 80.0 },
    { name: 'Varíola',    R0: 6,    pct: 83.3 },
    { name: 'COVID-19 (inicial)', R0: 2.5,  pct: 60.0 },
    { name: 'SARS',       R0: 3,    pct: 66.7 },
    { name: 'Ebola',      R0: 2,    pct: 50.0 },
    { name: 'Gripe sazonal', R0: 1.3, pct: 23.1 }
  ];

  /* ---------------------------------------------------------------------
   * Quiz — 5 perguntas
   * ------------------------------------------------------------------- */
  const QUIZ = [
    {
      q: 'A fórmula do limiar de imunidade de rebanho é:',
      opts: [
        '1 − 1/R₀',
        'R₀ × 100',
        '1 / (R₀ − 1)',
        'R₀ × 0,5'
      ],
      answer: 0,
      feedback:
        'O limiar é <strong>1 − 1/R₀</strong>. Deriva-se exigindo que o número efetivo de ' +
        'reprodução Rₑ = R₀ × (fração ainda suscetível) caia abaixo de 1. Se <em>p</em> é a ' +
        'fração imune, então (1 − <em>p</em>) é a suscetível; queremos R₀(1 − <em>p</em>) &lt; 1, ' +
        'o que resulta em <em>p</em> &gt; 1 − 1/R₀.'
    },
    {
      q: 'Uma doença com R₀ = 4 precisa de qual cobertura vacinal mínima para imunidade de rebanho?',
      opts: ['25%', '50%', '75%', '100%'],
      answer: 2,
      feedback:
        '1 − 1/4 = 3/4 = <strong>75%</strong>. Para R₀=4, ao menos 75% da população precisa ' +
        'estar imune para que a transmissão caia abaixo do patamar sustentável. Abaixo disso, ' +
        'surtos ainda podem se propagar.'
    },
    {
      q: 'Por que sarampo exige coberturas vacinais tão altas (&gt;93%) comparado, por exemplo, à gripe (&lt;30%)?',
      opts: [
        'Porque a vacina contra sarampo é menos eficaz',
        'Porque o R₀ do sarampo é muito maior (12–18 × 1,2–1,5)',
        'Porque o sarampo afeta principalmente crianças',
        'Porque a gripe muda todo ano e a imunidade não se acumula'
      ],
      answer: 1,
      feedback:
        'É <strong>matemática direta</strong>: com R₀=15, o limiar é 1 − 1/15 ≈ 93,3%. Com ' +
        'R₀=1,3, basta 23%. Doenças altamente transmissíveis exigem barras altíssimas de ' +
        'cobertura — qualquer bolsão de pessoas não vacinadas vira ignição potencial. A alternativa ' +
        'sobre gripe contém verdade (a imunidade não se acumula bem), mas não é a razão do ' +
        'limiar diferente — o limiar estático depende só de R₀.'
    },
    {
      q: 'Sobre imunidade de rebanho, qual afirmação é correta?',
      opts: [
        'Ela protege 100% das pessoas, inclusive as não vacinadas',
        'Ela funciona igualmente bem para todas as doenças, incluindo aquelas sem transmissão pessoa-pessoa',
        'Ela reduz a chance de que um surto se propague, protegendo indiretamente quem não pode se vacinar',
        'Ela substitui a necessidade de vacinação individual'
      ],
      answer: 2,
      feedback:
        'A imunidade de rebanho <strong>não é uma barreira absoluta</strong>. Ela reduz a ' +
        'probabilidade de que um caso introduzido encontre suscetíveis suficientes para gerar ' +
        'transmissão sustentada. Protege indiretamente quem <em>não pode</em> ser vacinado ' +
        '(recém-nascidos, imunodeprimidos, alérgicos à vacina). Não funciona para doenças ' +
        'sem transmissão pessoa-pessoa (tétano, por exemplo — fonte ambiental).'
    },
    {
      q: 'Uma comunidade de 10.000 pessoas tem cobertura vacinal de 70% para uma doença com R₀ = 5. Qual a situação?',
      opts: [
        'Imunidade de rebanho atingida, surto improvável',
        'Abaixo do limiar (80%) — surto pode se propagar se introduzido',
        'Impossível determinar sem saber a incidência basal',
        'A imunidade de rebanho não se aplica em populações dessa escala'
      ],
      answer: 1,
      feedback:
        'Para R₀ = 5, o limiar é 1 − 1/5 = <strong>80%</strong>. A comunidade com 70% está ' +
        'abaixo desse corte — <em>Rₑ</em> = 5 × 0,30 = 1,5, ainda acima de 1. Um caso introduzido ' +
        'pode se propagar. Esse é o raciocínio que orienta decisões de campanhas de reforço em ' +
        'regiões com bolsões de recusa vacinal.'
    }
  ];

  /* ---------------------------------------------------------------------
   * Renderização
   * ------------------------------------------------------------------- */
  function renderHeader(container) {
    const header = document.createElement('header');
    header.className = 'module-header';
    header.innerHTML = `
      <span class="module-badge">Módulo 06</span>
      <h1>Imunidade de Rebanho</h1>
      <p class="module-subtitle">
        Se suficiente gente está imune, a doença não encontra para onde ir.
        O limiar exato — <code>1 − 1/R₀</code> — é uma das equações mais úteis da
        saúde pública.
      </p>
    `;
    container.appendChild(header);
  }

  function renderDerivation(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>1. A derivação</h2>
      <p>
        Se <strong>p</strong> é a fração da população imune, então <strong>(1 − p)</strong>
        é a fração ainda suscetível. O número efetivo de reprodução em uma população
        parcialmente imune é:
      </p>
      <div class="formula-row">
        <code class="formula-big">R<sub>e</sub> = R₀ × (1 − p)</code>
      </div>
      <p>
        Para que o surto se extinga naturalmente, basta exigir <code>R<sub>e</sub> &lt; 1</code>:
      </p>
      <div class="formula-row">
        <code class="formula-big">R₀ × (1 − p) &lt; 1  ⇒  p &gt; 1 − 1/R₀</code>
      </div>
      <p>
        Esse é o <strong>limiar de imunidade de rebanho</strong>. Note o que a fórmula diz:
        quanto maior o R₀, maior a fração que precisa estar imune. A relação não é linear —
        entre R₀=2 e R₀=4 o limiar sobe de 50% para 75% (ganho de 25pp); entre R₀=4 e R₀=20
        sobe de 75% para 95% (só 20pp, mas exige coberturas absurdamente altas).
      </p>
    `;
    container.appendChild(sec);
  }

  function renderCalculator(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>2. Calculador interativo</h2>
      <p>Arraste o slider de R₀ e veja o limiar mínimo de cobertura imune necessário.</p>
      <div class="calc-box" id="m06-calc">
        <div class="calc-row">
          <label class="sim-slider">
            <span class="sim-slider-label">R₀</span>
            <input type="range" id="calc-r0" min="0.5" max="20" step="0.1" value="3">
            <output id="out-calc-r0">3,0</output>
          </label>
        </div>
        <div class="calc-gauge-wrap">
          <svg id="calc-gauge" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="gauge-grad" x1="0" x2="1">
                <stop offset="0"   stop-color="#51cf66"/>
                <stop offset="0.5" stop-color="#ffd93d"/>
                <stop offset="1"   stop-color="#ff6b6b"/>
              </linearGradient>
            </defs>
            <!-- trilha e arco serão desenhados em JS -->
          </svg>
          <div class="calc-readout" id="calc-readout"></div>
        </div>
      </div>
    `;
    container.appendChild(sec);

    const calcR0   = sec.querySelector('#calc-r0');
    const outR0    = sec.querySelector('#out-calc-r0');
    const svgEl    = sec.querySelector('#calc-gauge');
    const readout  = sec.querySelector('#calc-readout');

    function update() {
      const r0 = +calcR0.value;
      outR0.textContent = r0.toFixed(1).replace('.', ',');
      const threshold = EDL.models.herdImmunityThreshold(r0);  // fração entre 0 e 1
      drawGauge(svgEl, threshold);
      readout.innerHTML = (r0 <= 1)
        ? `<div class="calc-readout-big" style="color:var(--success)">—</div>
           <div class="calc-readout-sub">Com R₀ ≤ 1, o surto não se sustenta mesmo sem imunidade. Nenhuma cobertura vacinal é exigida para o controle.</div>`
        : `<div class="calc-readout-big">${(threshold * 100).toFixed(1).replace('.', ',')}%</div>
           <div class="calc-readout-sub">Cobertura mínima para imunidade de rebanho com R₀ = ${r0.toFixed(1).replace('.', ',')}.</div>`;
    }

    calcR0.addEventListener('input', update);
    update();
  }

  function drawGauge(svg, frac) {
    const d3 = window.d3;
    d3.select(svg).selectAll('*').filter(':not(defs)').remove();
    // Mantém defs — mas limpamos o resto

    const cx = 150, cy = 140, radius = 110;
    const arcStart = Math.PI; // 180° — começa à esquerda
    const arcEnd   = 2 * Math.PI; // 360° — termina à direita

    // Arco de fundo
    const bgArc = d3.arc()
      .innerRadius(radius - 18)
      .outerRadius(radius)
      .startAngle(arcStart - Math.PI/2)
      .endAngle(arcEnd - Math.PI/2);
    d3.select(svg).append('path')
      .attr('transform', `translate(${cx},${cy})`)
      .attr('d', bgArc)
      .attr('fill', '#1c2436');

    // Arco preenchido
    if (frac > 0) {
      const filledEnd = arcStart + (arcEnd - arcStart) * frac;
      const fillArc = d3.arc()
        .innerRadius(radius - 18)
        .outerRadius(radius)
        .startAngle(arcStart - Math.PI/2)
        .endAngle(filledEnd - Math.PI/2);
      d3.select(svg).append('path')
        .attr('transform', `translate(${cx},${cy})`)
        .attr('d', fillArc)
        .attr('fill', 'url(#gauge-grad)');
    }

    // Marcadores de 25/50/75%
    [0.25, 0.5, 0.75].forEach(t => {
      const a = arcStart + (arcEnd - arcStart) * t - Math.PI/2;
      const x1 = cx + Math.cos(a) * (radius - 18);
      const y1 = cy + Math.sin(a) * (radius - 18);
      const x2 = cx + Math.cos(a) * (radius + 6);
      const y2 = cy + Math.sin(a) * (radius + 6);
      d3.select(svg).append('line')
        .attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2)
        .attr('stroke', '#6b7a90').attr('stroke-width', 1);
      d3.select(svg).append('text')
        .attr('x', cx + Math.cos(a) * (radius + 18))
        .attr('y', cy + Math.sin(a) * (radius + 18) + 4)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6b7a90')
        .style('font-size', '10px')
        .style('font-family', 'JetBrains Mono, monospace')
        .text(`${Math.round(t * 100)}%`);
    });
  }

  function renderHerdTable(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>3. Quanto vacinar, por doença</h2>
      <p>
        A coluna direita é o cálculo direto de <code>1 − 1/R₀</code>. Note o salto entre
        doenças de R₀ alto (sarampo) e baixo (gripe sazonal). Esses números ajudam a
        entender por que o Programa Nacional de Imunizações persegue coberturas
        universais altas para sarampo e rubéola.
      </p>
      <div class="r0-table-wrap">
        <table class="r0-table">
          <thead>
            <tr>
              <th>Doença</th>
              <th>R₀ típico</th>
              <th>Cobertura vacinal mínima</th>
              <th>Visualização</th>
            </tr>
          </thead>
          <tbody>
            ${HERD_TABLE.map(d => `
              <tr>
                <td><strong>${d.name}</strong></td>
                <td><code>${d.R0}</code></td>
                <td><code>${d.pct.toFixed(1).replace('.', ',')}%</code></td>
                <td style="width:180px">
                  <div class="herd-bar">
                    <div class="herd-bar-fill" style="width:${d.pct}%"></div>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Laboratório — simulação de surto em rede 14x14
   *
   * Modelo pedagógico simples:
   *   - 196 indivíduos num grid 14x14
   *   - Coverage% são vacinados aleatoriamente no início
   *   - 1 caso inicial em posição fixa (centro)
   *   - Cada ciclo, cada infectado tenta infectar seus vizinhos (até 8)
   *     com probabilidade proporcional a R0/8 (aproximação)
   *   - Vacinados não podem ser infectados
   *   - Registra-se o tamanho final do surto
   *
   * Não é SIR rigoroso — é ilustrativo. O objetivo pedagógico é mostrar
   * visualmente como o limiar de cobertura "apaga" o surto.
   * ------------------------------------------------------------------- */
  /* ---------------------------------------------------------------------
   * Laboratório de rede — fase de aprendizagem
   *
   * Grid 25×25 = 625 pessoas. Cada célula é um indivíduo com um estado:
   *   0 = suscetível (cinza)
   *   1 = vacinado (verde, imune)
   *   2 = infectado ativo (vermelho) — transmitindo no ciclo atual
   *   3 = recuperado (roxo, imune pós-infecção)
   *
   * Diferente da versão inicial (síncrona/instantânea), a simulação agora
   * roda em ciclos animados: o aluno vê o surto se propagar em tempo real,
   * ciclo a ciclo, com indicador visível do ciclo atual.
   *
   * Velocidade ajustável (Lento 1500ms / Rápido 500ms) via botões.
   * A simulação é cancelável: sair do módulo para o interval; clicar em
   * Rodar novamente cancela a animação em curso.
   * ------------------------------------------------------------------- */

  const NET_N = 25;       // lado do grid → 625 pessoas
  const NET_MAX_CYCLES = 40;
  const NET_SPEEDS = {
    slow: 1500,   // ms por ciclo
    fast: 500
  };

  function renderNetworkLab(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>4. Laboratório — surto em uma comunidade de 625 pessoas</h2>
      <p>
        Uma comunidade hipotética de <strong>${NET_N * NET_N} pessoas</strong> (grid ${NET_N}×${NET_N}).
        Você controla <em>cobertura vacinal</em> (quantos começam imunes pela vacina) e <em>R₀</em>
        (quão contagiosa é a doença). Um caso-índice é introduzido no centro. A cada ciclo,
        cada infectado tenta contaminar seus 8 vizinhos com probabilidade proporcional a R₀.
        Vacinados (verdes) e já recuperados (roxos) não podem ser infectados. Observe a
        propagação ciclo a ciclo e veja como o surto morre cedo ou se espalha conforme a
        cobertura cruza o limiar <code>1 − 1/R₀</code>.
      </p>

      <div class="net-legend-static">
        <span class="net-legend-item"><span class="net-dot" style="background:#2a3449"></span> Suscetível</span>
        <span class="net-legend-item"><span class="net-dot" style="background:#51cf66"></span> Vacinado (imune)</span>
        <span class="net-legend-item"><span class="net-dot" style="background:#ff6b6b"></span> Infectado ativo</span>
        <span class="net-legend-item"><span class="net-dot" style="background:#b388ff"></span> Recuperado (imune)</span>
      </div>

      <p class="muted" style="font-size:.88rem;margin-top:1rem">
        Modelo deliberadamente simples para visualização — a rede é um grid uniforme e cada
        infectado infecta por apenas um ciclo antes de se recuperar. Para dinâmica epidêmica
        mais realista com incubação e período infeccioso prolongado, veja o Módulo 7 (SIR/SEIR).
      </p>

      <div class="network-lab-wrap" id="m06-netlab">
        <div class="network-controls">
          <label class="sim-slider">
            <span class="sim-slider-label">Cobertura vacinal</span>
            <input type="range" id="net-cov" min="0" max="100" step="1" value="60">
            <output id="out-net-cov">60%</output>
          </label>
          <label class="sim-slider">
            <span class="sim-slider-label">R₀ implícito</span>
            <input type="range" id="net-r0" min="1" max="8" step="0.5" value="3">
            <output id="out-net-r0">3,0</output>
          </label>
          <div class="net-threshold-hint" id="net-threshold-hint" aria-live="polite">
            Limiar teórico: 67% <span class="muted">(= 1 − 1/3)</span>
          </div>
          <label class="sim-slider">
            <span class="sim-slider-label">Seed da simulação</span>
            <input type="range" id="net-seed" min="1" max="50" step="1" value="7">
            <output id="out-net-seed">7</output>
          </label>

          <div class="net-speed-group">
            <span class="net-speed-label">Velocidade</span>
            <div class="net-speed-buttons">
              <button type="button" class="net-speed-btn" data-speed="slow">Lento</button>
              <button type="button" class="net-speed-btn active" data-speed="fast">Rápido</button>
            </div>
          </div>

          <div class="network-actions">
            <button type="button" class="btn btn-primary btn-small" id="net-run">Rodar surto</button>
          </div>
        </div>

        <div class="network-main">
          <div class="net-cycle-indicator" id="net-cycle-indicator" aria-live="polite">
            <span class="net-cycle-label">Ciclo</span>
            <span class="net-cycle-value" id="net-cycle-value">—</span>
            <span class="net-cycle-sub" id="net-cycle-sub"></span>
          </div>
          <canvas id="net-canvas" width="500" height="500"></canvas>
          <div class="network-results" id="net-results">
            <p class="muted" style="margin:0">Ajuste os parâmetros e clique em <em>Rodar surto</em>.</p>
          </div>
        </div>
      </div>
    `;
    container.appendChild(sec);

    const wrap = sec.querySelector('#m06-netlab');
    const cov  = wrap.querySelector('#net-cov');
    const r0   = wrap.querySelector('#net-r0');
    const seed = wrap.querySelector('#net-seed');
    const outCov  = wrap.querySelector('#out-net-cov');
    const outR0   = wrap.querySelector('#out-net-r0');
    const outSeed = wrap.querySelector('#out-net-seed');
    const canvas  = wrap.querySelector('#net-canvas');
    const results = wrap.querySelector('#net-results');
    const runBtn  = wrap.querySelector('#net-run');
    const cycleIndicator = wrap.querySelector('#net-cycle-indicator');
    const cycleValue = wrap.querySelector('#net-cycle-value');
    const cycleSub   = wrap.querySelector('#net-cycle-sub');
    const thresholdHint = wrap.querySelector('#net-threshold-hint');
    const speedBtns = wrap.querySelectorAll('.net-speed-btn');

    // Estado da animação corrente (permite cancelamento)
    let animTimeoutId = null;
    let currentSpeed = NET_SPEEDS.fast;

    /* --- Handlers de UI --- */
    cov .addEventListener('input', () => { outCov.textContent = cov.value + '%'; });
    r0  .addEventListener('input', () => {
      outR0.textContent = (+r0.value).toFixed(1).replace('.', ',');
      updateThresholdHint();
    });
    seed.addEventListener('input', () => { outSeed.textContent = seed.value; });
    runBtn.addEventListener('click', startSimulation);
    speedBtns.forEach(b => b.addEventListener('click', () => {
      currentSpeed = NET_SPEEDS[b.dataset.speed];
      speedBtns.forEach(bb => bb.classList.toggle('active', bb === b));
    }));

    updateThresholdHint();

    /* --- Cleanup ao sair do módulo --- */
    if (typeof EDL.onModuleDestroy === 'function') EDL.onModuleDestroy(stopAnimation);

    /* --- Render inicial: grid vazio, sem rodar automaticamente --- */
    drawInitial();

    /* ------------------------------------------------------------------ */

    function updateThresholdHint() {
      const r0Val = +r0.value;
      const threshold = EDL.models.herdImmunityThreshold(r0Val);
      const pct = (threshold * 100).toFixed(0);
      const r0Str = r0Val.toFixed(1).replace('.', ',');
      if (threshold <= 0) {
        thresholdHint.innerHTML = 'Com R₀ ≤ 1, a doença não se sustenta — cobertura zero já basta.';
      } else {
        thresholdHint.innerHTML =
          `Limiar teórico: <strong>${pct}%</strong> <span class="muted">(= 1 − 1/${r0Str})</span>`;
      }
    }

    function drawInitial() {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const grid = new Array(NET_N * NET_N).fill(0);
      drawNetwork(canvas, grid, NET_N);
      cycleValue.textContent = '—';
      cycleSub.textContent = 'Aguardando início';
    }

    function stopAnimation() {
      if (animTimeoutId) {
        clearTimeout(animTimeoutId);
        animTimeoutId = null;
      }
    }

    /* --- Setup + animação do surto --- */
    function startSimulation() {
      stopAnimation();
      runBtn.disabled = true;
      setSlidersDisabled(true);

      const coverage = +cov.value / 100;
      const r0Val    = +r0.value;
      const seedVal  = +seed.value;
      const rng = EDL.math.seededRNG(seedVal);

      // Setup inicial
      const grid = new Array(NET_N * NET_N).fill(0);
      for (let i = 0; i < grid.length; i++) {
        if (rng() < coverage) grid[i] = 1;
      }
      // Caso-índice no centro geométrico do grid (row/col = N/2).
      // Fórmula antiga `Math.floor(N*N/2) + Math.floor(N/2)` caía na borda
      // direita para N ímpar (bug revelado ao migrar de 14 para 25).
      const centerIdx = Math.floor(NET_N / 2);
      const center = centerIdx * NET_N + centerIdx;
      grid[center] = 2;

      const pPerNeighbor = Math.min(1, r0Val / 8);
      let cycle = 0;
      const totalInfectedEver = { count: 1 };

      // Primeira renderização — ciclo 0, caso-índice visível
      drawNetwork(canvas, grid, NET_N);
      cycleValue.textContent = '0';
      cycleSub.textContent = '1 ativo (paciente-zero)';
      // Limpa resultados anteriores
      results.innerHTML = '<p class="muted" style="margin:0">Surto em andamento — aguarde a animação terminar.</p>';

      // Agenda próximo ciclo
      scheduleNextCycle();

      function scheduleNextCycle() {
        animTimeoutId = setTimeout(stepOnce, currentSpeed);
      }

      function stepOnce() {
        cycle++;

        // Computa novos infectados a partir dos ativos
        const newInfected = [];
        for (let i = 0; i < grid.length; i++) {
          if (grid[i] !== 2) continue;
          const row = Math.floor(i / NET_N);
          const col = i % NET_N;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = row + dr, nc = col + dc;
              if (nr < 0 || nr >= NET_N || nc < 0 || nc >= NET_N) continue;
              const ni = nr * NET_N + nc;
              if (grid[ni] === 0 && rng() < pPerNeighbor) {
                newInfected.push(ni);
              }
            }
          }
        }

        // Atualiza estados: atuais infectados → recuperados; novos → infectados
        for (let i = 0; i < grid.length; i++) if (grid[i] === 2) grid[i] = 3;
        newInfected.forEach(i => { grid[i] = 2; });
        totalInfectedEver.count += newInfected.length;

        // Desenha e atualiza contador
        drawNetwork(canvas, grid, NET_N);
        cycleValue.textContent = String(cycle);
        if (newInfected.length === 0) {
          cycleSub.textContent = 'Surto extinguiu';
        } else {
          cycleSub.textContent = `${newInfected.length} novo(s) · ${totalInfectedEver.count} total até aqui`;
        }

        // Critério de parada
        if (newInfected.length === 0 || cycle >= NET_MAX_CYCLES) {
          finishAnimation(grid, coverage, r0Val, cycle);
        } else {
          scheduleNextCycle();
        }
      }

      function finishAnimation(finalGrid, coverage, r0Val, totalCycles) {
        animTimeoutId = null;
        runBtn.disabled = false;
        setSlidersDisabled(false);
        drawResults(results, finalGrid, coverage, r0Val, totalCycles);
      }
    }

    function setSlidersDisabled(disabled) {
      [cov, r0, seed].forEach(el => { el.disabled = disabled; });
    }
  }

  function drawNetwork(canvas, grid, N) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, W, H);

    // Padding proporcional ao tamanho da célula; raio dos círculos um pouco
    // menor que meia célula para dar respiração visual.
    const pad = Math.max(6, Math.round(W * 0.015));
    const cell = (W - 2 * pad) / N;
    const r = cell * 0.42;

    const COLORS = {
      0: '#2a3449',  // suscetível (cinza)
      1: '#51cf66',  // vacinado (verde)
      2: '#ff6b6b',  // infectado ativo (vermelho)
      3: '#b388ff'   // recuperado (roxo)
    };

    for (let row = 0; row < N; row++) {
      for (let col = 0; col < N; col++) {
        const state = grid[row * N + col];
        const x = pad + col * cell + cell / 2;
        const y = pad + row * cell + cell / 2;
        ctx.fillStyle = COLORS[state];
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Destaque sutil para infectados ativos — halo levemente mais claro
        if (state === 2) {
          ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(x, y, r + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  function drawResults(el, grid, coverage, r0Val, totalCycles) {
    const total = grid.length;
    const counts = { sus: 0, vac: 0, inf: 0, rec: 0 };
    for (let i = 0; i < total; i++) {
      if (grid[i] === 0) counts.sus++;
      else if (grid[i] === 1) counts.vac++;
      else if (grid[i] === 2) counts.inf++;
      else counts.rec++;
    }
    const totalInfected = counts.inf + counts.rec;
    const threshold = EDL.models.herdImmunityThreshold(r0Val);
    const thresholdPct = (threshold * 100).toFixed(1).replace('.', ',');
    const coveragePct = (coverage * 100).toFixed(0);

    const outbreakStatus = (coverage >= threshold)
      ? `<span style="color:var(--success)">acima do limiar (${thresholdPct}%)</span>`
      : `<span style="color:var(--danger)">abaixo do limiar (${thresholdPct}%)</span>`;

    const surtoDescription = (totalInfected <= 2)
      ? `O caso-índice não se propagou — a rede estava densa em vacinados. Surto extinto no ciclo ${totalCycles}.`
      : (totalInfected < total * 0.1)
        ? `O surto atingiu ${totalInfected} pessoas e se extinguiu cedo (ciclo ${totalCycles}).`
        : (totalInfected < total * 0.3)
          ? `O surto atingiu ${totalInfected} pessoas antes de parar no ciclo ${totalCycles}.`
          : `Surto significativo: ${totalInfected} pessoas (${(100 * totalInfected / total).toFixed(0)}% da comunidade) foram infectadas ao longo de ${totalCycles} ciclos.`;

    el.innerHTML = `
      <div class="net-legend">
        <span class="net-legend-item"><span class="net-dot" style="background:#2a3449"></span> Suscetível: ${counts.sus}</span>
        <span class="net-legend-item"><span class="net-dot" style="background:#51cf66"></span> Vacinado: ${counts.vac}</span>
        <span class="net-legend-item"><span class="net-dot" style="background:#b388ff"></span> Recuperado: ${counts.rec}</span>
      </div>
      <div class="net-summary">
        Cobertura: <strong>${coveragePct}%</strong> · Status: ${outbreakStatus}
      </div>
      <p style="margin:.5rem 0 0 0">${surtoDescription}</p>
    `;
  }

  function renderActivity(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>5. Atividade — cinco perguntas</h2>
      <p>
        As perguntas exercitam a fórmula do limiar, sua interpretação, e a nuance de que
        imunidade de rebanho <em>reduz probabilidade</em>, não dá garantia individual.
      </p>
      <div class="activity-box" id="m06-activity"></div>
    `;
    container.appendChild(sec);
    EDL.quiz.run(sec.querySelector('#m06-activity'), { bank: QUIZ });
  }

  function renderFooter(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>Próximos passos</h2>
      <p>
        O <strong>Módulo 7</strong> traz os modelos compartimentais completos: SIR (com
        imunidade), SEIR (com incubação) e SIR com intervenção no meio do surto. Ali o
        crescimento exponencial puro do Módulo 5 ganha realismo — as curvas atingem
        pico e declinam — e a imunidade de rebanho emerge naturalmente da dinâmica.
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Registro
   * ------------------------------------------------------------------- */
  EDL.registerModule({
    id: '06-imunidade-rebanho',
    number: 6,
    icon: '🛡️',
    title: 'Imunidade de Rebanho',
    subtitle: 'Limiar 1 − 1/R₀, vacinação, simulação de rede de contatos.',
    status: 'available',
    quizCount: QUIZ.length,
    render(container) {
      renderHeader(container);
      renderDerivation(container);
      renderCalculator(container);
      renderHerdTable(container);
      renderNetworkLab(container);
      renderActivity(container);
      EDL.refs.renderModuleSection(container, 6);
      renderFooter(container);
    }
  });
})();
