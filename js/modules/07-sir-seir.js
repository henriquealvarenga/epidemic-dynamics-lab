/* =========================================================================
 * EDL — Módulo 07: Modelos Compartimentais (SIR, SEIR, intervenção)
 *
 * Três modelos selecionáveis no simulador:
 *   - SIR clássico (S, I, R — com imunidade adquirida)
 *   - SEIR (adiciona E — exposto em incubação)
 *   - SIR com intervenção (R₀ muda num ciclo específico — simulando
 *     lockdown, vacinação em massa, mudança comportamental)
 *
 * Todos são integrados numericamente via RK4 no módulo core `models.js`.
 *
 * Conteúdo:
 *   1. Teoria: compartimentos, equações, diferença para exponencial puro
 *   2. Laboratório: simulador interativo com os três modelos
 *   3. Desafio de intervenção: o aluno escolhe quando intervir e quanto
 *      reduzir R₀ para minimizar casos totais
 *   4. Quiz
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * Estado do simulador
   * ------------------------------------------------------------------- */
  const sim = {
    model: 'sir',                       // 'sir' | 'seir' | 'sir-int'
    R0: 3.0,
    infectious_period: 7,               // em ciclos
    incubation_period: 5,               // só usado no SEIR
    N: 10000,
    I0: 10,
    cycles: 60,
    // Intervenção (somente 'sir-int')
    intervention_cycle: 15,
    R0_after: 1.2
  };

  /* ---------------------------------------------------------------------
   * Quiz
   * ------------------------------------------------------------------- */
  const QUIZ = [
    {
      q: 'No modelo SIR clássico, os três compartimentos representam:',
      opts: [
        'Sintomático, Incubação, Recuperado',
        'Suscetível, Infectado, Recuperado',
        'Sistêmico, Infeccioso, Resistente',
        'Sensível, Imune, Reinfectado'
      ],
      answer: 1,
      feedback:
        'SIR = <strong>S</strong>uscetível → <strong>I</strong>nfectado → <strong>R</strong>ecuperado. ' +
        'O fluxo é unidirecional (no modelo clássico sem reinfecção). Quem passou por I vai para ' +
        'R e fica imune para sempre (simplificação do modelo — a realidade admite perda de ' +
        'imunidade ao longo do tempo para muitas doenças).'
    },
    {
      q: 'Qual a principal diferença entre SIR e SEIR?',
      opts: [
        'SEIR trata doenças crônicas; SIR só agudas',
        'SEIR adiciona um compartimento E — Exposto (infectado mas ainda não infeccioso)',
        'SEIR funciona apenas com R₀ &lt; 1',
        'SEIR desconsidera a imunidade adquirida'
      ],
      answer: 1,
      feedback:
        'SEIR = <strong>S</strong>uscetível → <strong>E</strong>xposto → <strong>I</strong>nfectado → ' +
        '<strong>R</strong>ecuperado. O compartimento E representa o período de incubação: a ' +
        'pessoa está infectada mas ainda não transmite. Esse refinamento é importante para ' +
        'doenças com incubação longa (COVID, sarampo) — muda a forma da curva (pico mais atrasado, ' +
        'geralmente mais alto) e a janela para intervenção.'
    },
    {
      q: 'Por que a curva do SIR atinge um pico e depois declina, enquanto o crescimento exponencial puro do Módulo 5 cresce indefinidamente?',
      opts: [
        'Porque o SIR assume R₀ = 1 por definição',
        'Porque o compartimento S vai se esgotando — quem já passou para I e R não pode mais se infectar',
        'Porque o SIR considera o tempo de recuperação',
        'Todas as alternativas b e c estão corretas'
      ],
      answer: 3,
      feedback:
        'Duas razões complementares: (b) à medida que pessoas transitam para R, a <em>fração ' +
        'suscetível</em> cai — Rₑ = R₀ × S/N diminui, e eventualmente Rₑ &lt; 1 (é exatamente o ' +
        'limiar de imunidade de rebanho emergindo naturalmente da dinâmica!); e (c) infectados ' +
        'recuperam em velocidade γ = 1/período infeccioso, então a cada ciclo sai gente do ' +
        'compartimento I. O crescimento exponencial puro ignora ambos.'
    },
    {
      q: 'No modelo com intervenção no ciclo T, o que acontece se T for tarde demais (muito depois do pico)?',
      opts: [
        'A intervenção não tem efeito — o surto já consumiu a maioria dos suscetíveis',
        'A intervenção reverte completamente o surto',
        'A intervenção causa nova onda',
        'A intervenção aumenta a mortalidade'
      ],
      answer: 0,
      feedback:
        'Intervenções atrasadas têm retorno marginal. Se o pico já passou, a maioria dos ' +
        'suscetíveis virou R — não há quem salvar. Intervir <strong>antes do pico</strong> (ou ' +
        'idealmente no início do crescimento exponencial) é o momento de maior impacto. Esse é ' +
        'o cerne do desafio de intervenção abaixo: o momento é tão importante quanto a intensidade ' +
        'da medida.'
    },
    {
      q: 'Num SIR com R₀=3 e N=10.000 sem intervenção, aproximadamente que fração da população é infectada até o fim do surto?',
      opts: [
        'Cerca de 33% (1 − 1/R₀)',
        'Cerca de 67%',
        'Cerca de 94%',
        '100%'
      ],
      answer: 2,
      feedback:
        'Conceito importante: o limiar de imunidade de rebanho (1 − 1/R₀ = 67% para R₀=3) é o ' +
        'ponto em que Rₑ atinge 1 — <em>não</em> onde o surto para. Como a transmissão continua ' +
        'por inércia depois que Rₑ passa de 1, o <em>tamanho final do surto</em> é maior: aprox. ' +
        '<strong>94%</strong> da população acaba infectada no SIR clássico com R₀=3. Esse ' +
        '"overshoot" é uma das justificativas mais fortes para atingir imunidade de rebanho por ' +
        'vacinação, não por infecção — a vacina controla o surto no limiar; a infecção natural ' +
        'ultrapassa muito o limiar. Teste no simulador acima.'
    }
  ];

  /* ---------------------------------------------------------------------
   * Renderização
   * ------------------------------------------------------------------- */
  function renderHeader(container) {
    const header = document.createElement('header');
    header.className = 'module-header';
    header.innerHTML = `
      <span class="module-badge">Módulo 07</span>
      <h1>Modelos Compartimentais (SIR · SEIR · com intervenção)</h1>
      <p class="module-subtitle">
        Do crescimento exponencial ingênuo ao modelo SIR, que captura o pico e o
        declínio. Depois o SEIR, que acomoda a incubação. E o SIR com intervenção,
        para testar quando vale a pena pisar no freio.
      </p>
    `;
    container.appendChild(header);
  }

  function renderTheory(container, cite) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>1. Por que precisamos de mais que um exponencial</h2>
      <p>
        O modelo exponencial puro (Módulo 5) assume que todos são sempre suscetíveis e que a
        taxa de novos casos depende só de R₀ × infectados. Isso funciona no início do surto
        mas superestima grosseiramente em qualquer tempo mais longo. Na prática, à medida
        que pessoas são infectadas, dois processos limitam a transmissão:
      </p>
      <ol class="ordered-list">
        <li>Pessoas recuperam (saem do compartimento I) — deixam de transmitir.</li>
        <li>Pessoas se tornam imunes (entram em R) — reduzem a fração suscetível.</li>
      </ol>
      <p>
        Para capturar tudo isso, usamos <strong>modelos compartimentais</strong>: a população é
        dividida em "caixas" e equações diferenciais descrevem o fluxo entre elas.${cite('kermack1927sir', 'anderson1991infectious')}
      </p>

      <h3 style="margin-top:1.5rem">SIR clássico</h3>
      <div class="compartment-diagram">
        <div class="comp-box comp-box-s">S<br><small>Suscetível</small></div>
        <div class="comp-arrow">→</div>
        <div class="comp-box comp-box-i">I<br><small>Infectado</small></div>
        <div class="comp-arrow">→</div>
        <div class="comp-box comp-box-r">R<br><small>Recuperado</small></div>
      </div>
      <div class="formula-row">
        <code class="formula-medium">
          dS/dt = −β·S·I/N &nbsp;&nbsp; dI/dt = β·S·I/N − γ·I &nbsp;&nbsp; dR/dt = γ·I
        </code>
      </div>
      <p>
        onde <code>β = R₀·γ</code> é a taxa de transmissão e <code>γ = 1/período infeccioso</code>
        é a taxa de recuperação. O produto <code>β·S·I/N</code> é a incidência — cresce
        quando há muitos infectados e muitos suscetíveis, mas <em>cai</em> quando S se esgota.
      </p>

      <h3 style="margin-top:1.5rem">SEIR — com incubação</h3>
      <div class="compartment-diagram">
        <div class="comp-box comp-box-s">S</div>
        <div class="comp-arrow">→</div>
        <div class="comp-box comp-box-e">E<br><small>Exposto</small></div>
        <div class="comp-arrow">→</div>
        <div class="comp-box comp-box-i">I</div>
        <div class="comp-arrow">→</div>
        <div class="comp-box comp-box-r">R</div>
      </div>
      <p>
        O compartimento <strong>E</strong> representa pessoas infectadas mas ainda não
        infecciosas (período de incubação). Transitam para I à taxa <code>σ = 1/período de
        incubação</code>. Útil para doenças com incubação longa (sarampo, COVID, HIV).
      </p>

      <h3 style="margin-top:1.5rem">SIR com intervenção</h3>
      <p>
        Idêntico ao SIR, mas num ciclo <code>T</code> o R₀ efetivo muda de um valor alto
        para um valor menor — simulando lockdown, distanciamento social, vacinação em massa,
        ou qualquer outra intervenção que reduza transmissão abruptamente. No laboratório
        abaixo, você escolhe <code>T</code> e o <code>R₀ pós-intervenção</code>.
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Laboratório — simulador dos três modelos
   * ------------------------------------------------------------------- */
  function renderLab(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>2. Laboratório — simulador SIR / SEIR / intervenção</h2>
      <p>
        Selecione o modelo, ajuste os parâmetros, observe a curva responder em tempo real.
        As curvas coloridas mostram cada compartimento ao longo do tempo. A "incidência
        diária" (área vermelha clara) é o número de novos casos por ciclo — é essa a
        curva que se confunde popularmente com a "curva da epidemia".
      </p>
      <div class="sir-wrap" id="m07-sir"></div>
    `;
    container.appendChild(sec);
    buildSirLab(sec.querySelector('#m07-sir'));
  }

  function buildSirLab(wrap) {
    wrap.innerHTML = `
      <div class="sim-layout">
        <aside class="sim-controls">
          <div class="sim-group">
            <h4>Modelo</h4>
            <div class="sir-modeselect">
              <button type="button" class="sir-model-btn" data-model="sir">SIR</button>
              <button type="button" class="sir-model-btn" data-model="seir">SEIR</button>
              <button type="button" class="sir-model-btn" data-model="sir-int">SIR + intervenção</button>
            </div>
          </div>

          <div class="sim-group">
            <h4>Parâmetros gerais</h4>
            <label class="sim-slider">
              <span class="sim-slider-label">R₀</span>
              <input type="range" id="sir-r0" min="0.5" max="10" step="0.1" value="${sim.R0}">
              <output id="out-sir-r0">${sim.R0.toFixed(1)}</output>
            </label>
            <label class="sim-slider">
              <span class="sim-slider-label">Período infeccioso (ciclos)</span>
              <input type="range" id="sir-infp" min="1" max="30" step="1" value="${sim.infectious_period}">
              <output id="out-sir-infp">${sim.infectious_period}</output>
            </label>
            <label class="sim-slider" data-only-seir>
              <span class="sim-slider-label">Período de incubação (ciclos)</span>
              <input type="range" id="sir-incp" min="1" max="20" step="1" value="${sim.incubation_period}">
              <output id="out-sir-incp">${sim.incubation_period}</output>
            </label>
            <label class="sim-slider">
              <span class="sim-slider-label">População (N)</span>
              <input type="number" id="sir-n" min="100" max="10000000" step="100" value="${sim.N}" style="width:110px">
            </label>
            <label class="sim-slider">
              <span class="sim-slider-label">Infectados iniciais</span>
              <input type="number" id="sir-i0" min="1" max="1000" step="1" value="${sim.I0}" style="width:90px">
            </label>
            <label class="sim-slider">
              <span class="sim-slider-label">Ciclos a simular</span>
              <input type="range" id="sir-cycles" min="30" max="200" step="10" value="${sim.cycles}">
              <output id="out-sir-cycles">${sim.cycles}</output>
            </label>
          </div>

          <div class="sim-group" data-only-sir-int hidden>
            <h4>Intervenção</h4>
            <label class="sim-slider">
              <span class="sim-slider-label">Ciclo da intervenção</span>
              <input type="range" id="sir-tint" min="0" max="100" step="1" value="${sim.intervention_cycle}">
              <output id="out-sir-tint">${sim.intervention_cycle}</output>
            </label>
            <label class="sim-slider">
              <span class="sim-slider-label">R₀ após intervenção</span>
              <input type="range" id="sir-r0after" min="0.2" max="5" step="0.1" value="${sim.R0_after}">
              <output id="out-sir-r0after">${sim.R0_after.toFixed(1)}</output>
            </label>
          </div>
        </aside>

        <div class="sim-main">
          <div class="sim-plot-wrap" id="sir-plot"></div>
          <div class="sim-metrics" id="sir-metrics"></div>
        </div>
      </div>
    `;

    const ctrl = {
      r0:      wrap.querySelector('#sir-r0'),
      infp:    wrap.querySelector('#sir-infp'),
      incp:    wrap.querySelector('#sir-incp'),
      n:       wrap.querySelector('#sir-n'),
      i0:      wrap.querySelector('#sir-i0'),
      cycles:  wrap.querySelector('#sir-cycles'),
      tint:    wrap.querySelector('#sir-tint'),
      r0after: wrap.querySelector('#sir-r0after')
    };
    const out = {
      r0:      wrap.querySelector('#out-sir-r0'),
      infp:    wrap.querySelector('#out-sir-infp'),
      incp:    wrap.querySelector('#out-sir-incp'),
      cycles:  wrap.querySelector('#out-sir-cycles'),
      tint:    wrap.querySelector('#out-sir-tint'),
      r0after: wrap.querySelector('#out-sir-r0after')
    };

    // Botões de modelo
    const modelBtns = wrap.querySelectorAll('.sir-model-btn');
    function setModelButtons() {
      modelBtns.forEach(b => b.classList.toggle('active', b.dataset.model === sim.model));
      // Mostra/esconde grupos condicionais
      wrap.querySelectorAll('[data-only-seir]').forEach(el => {
        el.style.display = sim.model === 'seir' ? '' : 'none';
      });
      wrap.querySelectorAll('[data-only-sir-int]').forEach(el => {
        el.hidden = sim.model !== 'sir-int';
      });
    }
    modelBtns.forEach(b => b.addEventListener('click', () => {
      sim.model = b.dataset.model;
      setModelButtons();
      update();
    }));
    setModelButtons();

    // Sliders
    ctrl.r0     .addEventListener('input', () => { sim.R0 = +ctrl.r0.value; out.r0.textContent = sim.R0.toFixed(1); update(); });
    ctrl.infp   .addEventListener('input', () => { sim.infectious_period = +ctrl.infp.value; out.infp.textContent = sim.infectious_period; update(); });
    ctrl.incp   .addEventListener('input', () => { sim.incubation_period = +ctrl.incp.value; out.incp.textContent = sim.incubation_period; update(); });
    ctrl.n      .addEventListener('input', () => { sim.N = Math.max(100, +ctrl.n.value); update(); });
    ctrl.i0     .addEventListener('input', () => { sim.I0 = Math.max(1, +ctrl.i0.value); update(); });
    ctrl.cycles .addEventListener('input', () => {
      sim.cycles = +ctrl.cycles.value;
      out.cycles.textContent = sim.cycles;
      // Ajusta max do ciclo de intervenção
      ctrl.tint.max = sim.cycles;
      if (sim.intervention_cycle > sim.cycles) {
        sim.intervention_cycle = sim.cycles;
        ctrl.tint.value = sim.cycles;
        out.tint.textContent = sim.cycles;
      }
      update();
    });
    ctrl.tint   .addEventListener('input', () => { sim.intervention_cycle = +ctrl.tint.value; out.tint.textContent = sim.intervention_cycle; update(); });
    ctrl.r0after.addEventListener('input', () => { sim.R0_after = +ctrl.r0after.value; out.r0after.textContent = sim.R0_after.toFixed(1); update(); });

    // Ajusta max inicial do slider de intervenção
    ctrl.tint.max = sim.cycles;

    let rafId;
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawSirPlot(wrap));
    };
    window.addEventListener('resize', onResize, { passive: true });
    EDL.onModuleDestroy(() => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    });

    update();

    function update() {
      drawSirPlot(wrap);
      drawSirMetrics(wrap);
    }
  }

  /* ---- Simulação ---- */
  function runSim() {
    switch (sim.model) {
      case 'sir':
        return EDL.models.sir({
          R0: sim.R0, infectious_period: sim.infectious_period,
          cycles: sim.cycles, N: sim.N, I0: sim.I0
        });
      case 'seir':
        return EDL.models.seir({
          R0: sim.R0, infectious_period: sim.infectious_period,
          incubation_period: sim.incubation_period,
          cycles: sim.cycles, N: sim.N, I0: sim.I0
        });
      case 'sir-int':
        return EDL.models.sirWithIntervention({
          R0: sim.R0, R0_after: sim.R0_after,
          intervention_cycle: sim.intervention_cycle,
          infectious_period: sim.infectious_period,
          cycles: sim.cycles, N: sim.N, I0: sim.I0
        });
    }
  }

  /* ---- Plot ---- */
  function drawSirPlot(wrap) {
    const d3 = window.d3;
    const plotEl = wrap.querySelector('#sir-plot');
    plotEl.innerHTML = '';

    const data = runSim();
    const W = plotEl.clientWidth || 600;
    const margin = { top: 24, right: 18, bottom: 44, left: 64 };
    const H = Math.round(W * 0.55);
    const iw = W - margin.left - margin.right;
    const ih = H - margin.top - margin.bottom;

    const modelLabel = sim.model === 'seir' ? 'SEIR'
                     : sim.model === 'sir-int' ? 'SIR com intervenção'
                     : 'SIR';
    const svg = d3.select(plotEl).append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label',
        `Simulação do modelo ${modelLabel} com R₀ igual a ${sim.R0.toFixed(1)}, ` +
        `período infeccioso de ${sim.infectious_period} ciclos, população de ${sim.N} pessoas, ` +
        `ao longo de ${sim.cycles} ciclos. Curvas dos compartimentos Suscetíveis, Infectados e Recuperados.`)
      .style('display', 'block').style('width', '100%').style('height', 'auto');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xs = d3.scaleLinear().domain([0, sim.cycles]).range([0, iw]);
    const ys = d3.scaleLinear().domain([0, sim.N]).range([ih, 0]);

    // Grid
    g.append('g').call(d3.axisLeft(ys).ticks(6).tickSize(-iw).tickFormat(''))
      .call(sel => { sel.selectAll('path').attr('stroke', 'none');
                     sel.selectAll('line').attr('stroke', '#1e2638').attr('stroke-dasharray', '2,3'); });

    // Eixos
    g.append('g').attr('transform', `translate(0,${ih})`).call(d3.axisBottom(xs).ticks(8).tickFormat(d3.format('d')))
      .call(sel => { sel.selectAll('path,line').attr('stroke', '#6b7a90');
                     sel.selectAll('text').attr('fill', '#a8b3c4').style('font-size','11px'); });
    g.append('g').call(d3.axisLeft(ys).ticks(6, '~s'))
      .call(sel => { sel.selectAll('path,line').attr('stroke', '#6b7a90');
                     sel.selectAll('text').attr('fill', '#a8b3c4').style('font-size','11px'); });

    g.append('text').attr('x', iw/2).attr('y', ih + 34)
      .attr('text-anchor','middle').attr('fill','#a8b3c4').style('font-size','12px').text('Ciclos');
    g.append('text').attr('transform','rotate(-90)').attr('x', -ih/2).attr('y', -50)
      .attr('text-anchor','middle').attr('fill','#a8b3c4').style('font-size','12px').text('Número de pessoas');

    const lineGen = (series) => d3.line()
      .x((_, i) => xs(i))
      .y(d => ys(d))
      .curve(d3.curveMonotoneX)(series);

    // Plot das séries (ordem importa — S mais atrás, I em destaque)
    const series = [
      { key: 'S', color: '#74c0fc', label: 'Suscetíveis', data: data.S, dash: null },
      { key: 'R', color: '#51cf66', label: 'Recuperados', data: data.R, dash: null },
      { key: 'I', color: '#ff6b6b', label: 'Infectados (ativos)', data: data.I, dash: null }
    ];
    if (sim.model === 'seir') {
      series.splice(2, 0, { key: 'E', color: '#ffd93d', label: 'Expostos (incubação)', data: data.E, dash: '3,3' });
    }

    series.forEach(s => {
      g.append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', s.color)
        .attr('stroke-width', s.key === 'I' ? 2.6 : 1.8)
        .attr('stroke-dasharray', s.dash || null)
        .attr('d', lineGen(s.data));
    });

    // Linha vertical da intervenção (se modelo apropriado e dentro do domínio)
    if (sim.model === 'sir-int' && sim.intervention_cycle >= 0 && sim.intervention_cycle <= sim.cycles) {
      const xi = xs(sim.intervention_cycle);
      g.append('line')
        .attr('x1', xi).attr('x2', xi)
        .attr('y1', 0).attr('y2', ih)
        .attr('stroke', '#ffd93d').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '5,3');
      g.append('text')
        .attr('x', xi + 5).attr('y', 12)
        .attr('fill', '#ffd93d').style('font-size', '11px').style('font-family', 'JetBrains Mono, monospace')
        .text(`T=${sim.intervention_cycle} · R₀→${sim.R0_after.toFixed(1)}`);
    }

    // Legenda
    const legend = svg.append('g').attr('transform', `translate(${margin.left + 8},${margin.top + 2})`);
    series.forEach((it, i) => {
      const gi = legend.append('g').attr('transform', `translate(0,${i * 18})`);
      gi.append('line').attr('x1', 0).attr('x2', 14).attr('y1', 0).attr('y2', 0)
        .attr('stroke', it.color).attr('stroke-width', 2).attr('stroke-dasharray', it.dash || null);
      gi.append('text').attr('x', 20).attr('y', 4)
        .attr('fill', '#f0f4f8').style('font-size','11px').style('font-family', 'JetBrains Mono, monospace')
        .text(it.label);
    });
  }

  /* ---- Métricas ---- */
  function drawSirMetrics(wrap) {
    const el = wrap.querySelector('#sir-metrics');
    const data = runSim();

    // Pico de I
    let peakI = 0, peakK = 0;
    data.I.forEach((v, i) => { if (v > peakI) { peakI = v; peakK = i; } });

    // Total final infectado (R + I final)
    const finalR = data.R[data.R.length - 1];
    const finalI = data.I[data.I.length - 1];
    const totalInfected = finalR + finalI;
    const pctInfected = (totalInfected / sim.N * 100);

    const limiar = (1 - 1/sim.R0) * 100;
    const overshoot = pctInfected - limiar;

    el.innerHTML = `
      <div class="sim-metric">
        <div class="sim-metric-label">Pico de infectados</div>
        <div class="sim-metric-value">${EDL.math.fmtInt(peakI)}</div>
        <div class="sim-metric-sub">no ciclo ${peakK}</div>
      </div>
      <div class="sim-metric">
        <div class="sim-metric-label">Total infectados (fim)</div>
        <div class="sim-metric-value">${EDL.math.fmtInt(totalInfected)}</div>
        <div class="sim-metric-sub">${pctInfected.toFixed(1).replace('.',',')}% da população</div>
      </div>
      <div class="sim-metric">
        <div class="sim-metric-label">Limiar imunidade rebanho</div>
        <div class="sim-metric-value">${limiar.toFixed(1).replace('.',',')}%</div>
        <div class="sim-metric-sub">1 − 1/R₀</div>
      </div>
      ${sim.R0 > 1 ? `
      <div class="sim-metric">
        <div class="sim-metric-label">Overshoot</div>
        <div class="sim-metric-value ${overshoot > 5 ? 'sim-metric-b' : ''}">${overshoot > 0 ? '+' : ''}${overshoot.toFixed(1).replace('.',',')}pp</div>
        <div class="sim-metric-sub">acima do limiar</div>
      </div>` : ''}
    `;
  }

  function renderActivity(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>3. Atividade — cinco perguntas</h2>
      <p>
        As perguntas cobrem os compartimentos, a diferença SIR × SEIR, a razão do pico e do
        declínio, o papel do timing de intervenção, e o conceito crucial de <em>overshoot</em>
        (por que a imunidade natural vai além do limiar de rebanho).
      </p>
      <div class="activity-box" id="m07-activity"></div>
    `;
    container.appendChild(sec);
    EDL.quiz.run(sec.querySelector('#m07-activity'), { bank: QUIZ });
  }

  function renderFooter(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>Próximos passos</h2>
      <p>
        O <strong>Módulo 8</strong> sai da abstração e entra na história: o surto de cólera
        de Soho em 1854, a investigação de John Snow, e sua inesperada repetição no Haiti em
        2010 — 156 anos depois, a mesma doença, em circunstâncias análogas, com resposta
        moderna de saúde pública e genômica. Em construção.
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Registro
   * ------------------------------------------------------------------- */
  EDL.registerModule({
    id: '07-sir-seir',
    number: 7,
    icon: '🔄',
    title: 'Modelos Compartimentais (SIR/SEIR)',
    subtitle: 'Simulador livre A×B, desafios de intervenção, modelos realistas.',
    status: 'available',
    quizCount: QUIZ.length,
    render(container) {
      const cm   = EDL.citations.create({ idPrefix: 'm07-ref-' });
      const cite = (...keys) => cm.cite(...keys);
      renderHeader(container);
      renderTheory(container, cite);
      renderLab(container);
      renderActivity(container);
      EDL.refs.renderCitedReferences(container, cm);
      renderFooter(container);
    }
  });
})();
