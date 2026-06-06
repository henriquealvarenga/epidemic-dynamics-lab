/* =========================================================================
 * EDL — Módulo 04: Dinâmica da Doença no Indivíduo
 *
 * Foco no sujeito adoecido. Os períodos clássicos:
 *   - Período latente:        agente presente, não se replicando
 *   - Período de incubação:   exposição → início de sintomas
 *   - Período sintomático:    prodrômico + clínico
 *   - Período de convalescença: recuperação após resolução
 *   - Reativação:              saída da latência para fase lítica
 *
 * Conteúdo baseado na Aula 1a do autor (slides sobre COVID/dengue/cólera/SARS/
 * Ebola/herpes + Radium Girls) e no banco Kahoot (Q6).
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * Dados: períodos de 6 doenças para o comparador visual
   *
   * Unidade: dias (salvo os casos marcados como "anos" explicitamente).
   * Para agentes com latência muito longa (herpes), usamos escala comprimida
   * e rotulamos a latência como "semanas a décadas" em texto.
   * ------------------------------------------------------------------- */
  const DISEASES = [
    {
      id: 'covid',
      name: 'COVID-19',
      color: '#ff6b6b',
      incubation: [4, 7],      // mediana 5.2d (Li et al. NEJM 2020)
      symptomatic: [7, 14],
      convalescence: [14, 28],
      infectious: [2, 10],
      note: 'Mediana de incubação: 5,2 dias (Li et al., NEJM 2020). Transmissão pode começar ~2 dias antes dos sintomas.'
    },
    {
      id: 'dengue',
      name: 'Dengue',
      color: '#ffd93d',
      incubation: [4, 10],
      symptomatic: [3, 7],
      convalescence: [7, 14],
      infectious: [1, 5],
      note: 'Viremia (e transmissibilidade ao mosquito) começa ~1 dia antes dos sintomas e dura ~5 dias.'
    },
    {
      id: 'sarampo',
      name: 'Sarampo',
      color: '#74c0fc',
      incubation: [10, 12],
      symptomatic: [7, 10],
      convalescence: [10, 14],
      infectious: [5, 9],
      note: 'Transmissível ~4 dias antes e ~4 dias após o aparecimento do exantema.'
    },
    {
      id: 'colera',
      name: 'Cólera',
      color: '#51cf66',
      incubation: [0.5, 5],    // 12 horas a 5 dias (Azman et al. 2013)
      symptomatic: [1, 7],
      convalescence: [7, 21],
      infectious: [1, 10],
      note: 'Incubação curta (12h a 5 dias). Portadores assintomáticos podem eliminar o V. cholerae por 1 a 10 dias.'
    },
    {
      id: 'ebola',
      name: 'Ebola',
      color: '#b388ff',
      incubation: [2, 21],
      symptomatic: [7, 14],
      convalescence: [14, 60],
      infectious: [5, 14],
      note: 'Alta letalidade (até 90%). Transmissibilidade nos fluidos corporais durante a fase sintomática e pós-mortem.'
    },
    {
      id: 'herpes',
      name: 'Herpes simples',
      color: '#ff9f43',
      incubation: [2, 12],     // primo-infecção: ~2 a 12 dias
      symptomatic: [7, 14],
      convalescence: [14, 28],
      infectious: [3, 10],
      latentYears: true,       // marcador para UI
      note: 'Após primo-infecção, o vírus estabelece latência em gânglios neurais — reativações podem ocorrer por anos/décadas, com ou sem lesão visível.'
    }
  ];

  /* ---------------------------------------------------------------------
   * Quiz (Kahoot Q6 + 3 novas)
   * ------------------------------------------------------------------- */
  const QUIZ = [
    {
      // Kahoot Q6
      q: 'O período de incubação é:',
      opts: [
        'O tempo entre a exposição e o início dos sintomas',
        'O tempo de recuperação após a doença',
        'O período de transmissão do agente infeccioso',
        'O período após os sintomas desaparecerem'
      ],
      answer: 0,
      feedback:
        'Período de incubação é, por definição, <strong>o intervalo entre a exposição ao agente ' +
        'e o surgimento dos primeiros sinais e sintomas</strong>. É uma informação epidemiológica ' +
        'central — dita quanto tempo dura a quarentena recomendada após uma exposição, e orienta a ' +
        'investigação de contatos.'
    },
    {
      // Latente vs incubação
      scenario: {
        title: 'Acompanhamento ambulatorial — paciente com HIV',
        body: 'Um homem adulto recebe diagnóstico de infecção por HIV após sorologia positiva em um rastreio. Está assintomático, carga viral detectável. Pergunta: quando deve iniciar terapia? O médico explica que entre a infecção inicial e o surgimento de manifestações clínicas de AIDS podem se passar vários anos, durante os quais o vírus se replica ativamente.',
        meta: [
          { label: 'Agente', value: 'HIV' },
          { label: 'Fase', value: 'assintomática' }
        ]
      },
      q: 'Qual termo epidemiológico descreve melhor esse intervalo entre a infecção e o início dos sintomas clínicos de AIDS?',
      opts: [
        'Período latente',
        'Período de incubação',
        'Período de convalescença',
        'Período de reativação'
      ],
      answer: 1,
      feedback:
        'Trata-se do <strong>período de incubação</strong> — tempo entre a entrada do agente e o ' +
        'aparecimento dos sinais e sintomas clínicos (no caso do HIV, anos até AIDS). A confusão ' +
        'comum é com <em>período latente</em>, mas esse termo tem sentido técnico preciso: agente ' +
        'presente mas <strong>não se replicando</strong> (herpesvírus em gânglios neurais, por ex.). ' +
        'Durante a incubação do HIV, o vírus replica-se ativamente — não é latência. ' +
        'Essa distinção é cobrada em prova e frequentemente confunde.'
    },
    {
      // Reativação
      q: 'Qual vírus é um exemplo clássico de agente que estabelece latência e pode reativar após anos ou décadas?',
      opts: [
        'SARS-CoV-2',
        'Influenza',
        'Vírus da dengue',
        'Herpes simples'
      ],
      answer: 3,
      feedback:
        'Os <strong>herpesvírus</strong> (HSV-1, HSV-2, varicela-zoster, Epstein-Barr, citomegalovírus) ' +
        'são os exemplos canônicos de vírus latentes. Após a primo-infecção, eles permanecem em estado ' +
        'quiescente em gânglios ou linfócitos e podem reativar em resposta a estímulos como estresse, ' +
        'imunossupressão, UV, ou envelhecimento. Varicela na infância → zoster décadas depois é o caso ' +
        'mais conhecido.'
    },
    {
      // Ordem dos períodos
      q: 'Na história natural de uma doença infecciosa aguda, qual é a ordem cronológica correta dos períodos?',
      opts: [
        'Incubação → prodrômico → clínico → convalescença',
        'Prodrômico → incubação → clínico → convalescença',
        'Incubação → clínico → prodrômico → convalescença',
        'Convalescença → prodrômico → incubação → clínico'
      ],
      answer: 0,
      feedback:
        'A sequência clássica é: <strong>incubação</strong> (exposição → primeiros sinais) → ' +
        '<strong>prodrômico</strong> (sintomas inespecíficos iniciais: mal-estar, febre baixa, ' +
        'mialgia) → <strong>clínico</strong> (quadro característico da doença) → ' +
        '<strong>convalescença</strong> (recuperação, sintomas residuais). Conhecer essa ' +
        'linha temporal é o que permite comunicar prognóstico ao paciente e estimar tempo ' +
        'de isolamento.'
    }
  ];

  /* ---------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------- */

  function renderHeader(container) {
    const header = document.createElement('header');
    header.className = 'module-header';
    header.innerHTML = `
      <span class="module-badge">Módulo 04</span>
      <h1>Dinâmica da Doença no Indivíduo</h1>
      <p class="module-subtitle">
        O que acontece entre a exposição ao agente e a recuperação — na escala
        de um paciente. Os períodos latente, de incubação, sintomático e de
        convalescença, e por que a distinção entre latência e incubação importa.
      </p>
    `;
    container.appendChild(header);
  }

  function renderPeriods(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>1. Os períodos da doença</h2>
      <p>
        Todo processo infeccioso agudo se desenrola em etapas previsíveis, ainda que com
        durações variáveis por doença. Conhecer essas etapas e seus limites permite o
        raciocínio clínico (quando suspeitar, o que investigar, quando liberar) e o
        raciocínio epidemiológico (quanto tempo de isolamento, quando termina o risco
        de transmissão).
      </p>

      <div class="period-cards">
        <div class="period-card">
          <div class="period-num">1</div>
          <div class="period-name">Período latente</div>
          <p>
            Fase em que o agente <strong>está presente mas não se replica</strong>.
            Conceito mais técnico que frequentemente confunde os alunos. Usado em
            contextos específicos — herpesvírus latentes em gânglios neurais são o
            exemplo clássico.
          </p>
        </div>
        <div class="period-card">
          <div class="period-num">2</div>
          <div class="period-name">Incubação</div>
          <p>
            Tempo entre a <strong>exposição ao agente e o aparecimento dos primeiros
            sinais clínicos</strong>. Não é silêncio biológico — na maioria dos casos,
            o patógeno se replica ativamente. Dá base para o tempo de quarentena.
          </p>
        </div>
        <div class="period-card">
          <div class="period-num">3</div>
          <div class="period-name">Prodrômico</div>
          <p>
            Primeiros sintomas ainda <strong>inespecíficos</strong> — mal-estar,
            febre baixa, anorexia, mialgia. Muitas doenças agudas têm prodromal
            de 1 a 3 dias.
          </p>
        </div>
        <div class="period-card">
          <div class="period-num">4</div>
          <div class="period-name">Clínico</div>
          <p>
            Fase com o quadro <strong>característico da doença</strong> — rash no
            sarampo, diarreia profusa na cólera, síndrome respiratória no COVID.
            É o período de maior carga sintomática.
          </p>
        </div>
        <div class="period-card">
          <div class="period-num">5</div>
          <div class="period-name">Convalescença</div>
          <p>
            Recuperação após a resolução do quadro agudo. Sintomas residuais,
            astenia, retorno gradual à função normal. Pode deixar sequelas
            (pós-COVID, pós-poliomielite).
          </p>
        </div>
        <div class="period-card period-card-reactivation">
          <div class="period-num">R</div>
          <div class="period-name">Reativação</div>
          <p>
            Saída da latência para uma <strong>nova fase lítica</strong> (replicação
            ativa), em que o paciente pode voltar a eliminar o agente e/ou apresentar
            sintomas. Gatilhos: imunossupressão, estresse, UV.
          </p>
        </div>
      </div>

      <div class="callout callout-info">
        <strong>Confusão frequente:</strong> latência ≠ incubação. Durante a incubação,
        em geral, há replicação ativa do patógeno — só o hospedeiro ainda não manifesta
        sintomas. Durante a latência (em sentido estrito), o agente está quiescente.
        HIV entre infecção e AIDS: <em>incubação</em> (longa), não latência.
        Herpes simples dormente entre surtos: <em>latência</em>.
      </div>
    `;
    container.appendChild(sec);
  }

  function renderLatentVsIncubation(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>2. Quarentena — origem do nome</h2>
      <p>
        Em 1377, o porto de Ragusa (atual Dubrovnik, Croácia) estabeleceu que navios
        vindos de regiões com peste ou outras doenças permanecessem isolados por
        30 dias (<em>trentino</em>) antes de desembarcar. O período foi depois ampliado
        para 40 dias (<em>quarantino</em> — daí vem <strong>quarentena</strong>).
      </p>
      <p>
        Escolheram 40 dias porque esse era o limite superior razoável para os períodos
        de incubação conhecidos. O princípio continua valendo: a duração da quarentena
        para qualquer doença parte do <em>percentil 95</em> do período de incubação
        observado. Para o SARS-CoV-2, os 14 dias de isolamento inicial vinham daí
        (percentil 95 estimado em 12,5 dias).
      </p>
    `;
    container.appendChild(sec);
  }

  function renderComparator(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>3. Laboratório — compare os períodos</h2>
      <p>
        Seis doenças, três barras cada uma (incubação, sintomática, convalescença).
        Clique em uma barra para ler a nota específica da doença. Observe como os
        tempos variam em ordens de magnitude — cólera tem incubação medida em horas,
        Ebola em semanas.
      </p>
      <div class="comparator-wrap" id="m04-comparator"></div>
    `;
    container.appendChild(sec);

    const wrap = sec.querySelector('#m04-comparator');
    requestAnimationFrame(() => drawComparator(wrap));

    let rafId;
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawComparator(wrap));
    };
    window.addEventListener('resize', onResize, { passive: true });
    EDL.onModuleDestroy(() => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  function drawComparator(wrap) {
    const d3 = window.d3;
    wrap.innerHTML = '';

    const totalW = wrap.clientWidth || 800;
    const rowH = 56;
    const labelW = 140;
    const margin = { top: 20, right: 28, bottom: 44, left: labelW + 20 };
    const plotW = totalW - margin.left - margin.right;
    const h = DISEASES.length * rowH + margin.top + margin.bottom;

    const svg = d3.select(wrap).append('svg')
      .attr('viewBox', `0 0 ${totalW} ${h}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('role', 'img')
      .attr('aria-label', 'Comparador visual dos períodos (incubação, sintomática, convalescença) em seis doenças infecciosas — COVID-19, dengue, sarampo, cólera, Ebola e herpes simples')
      .style('width', '100%')
      .style('height', 'auto')
      .style('display', 'block');

    // Escala x em dias — cobrimos até o máximo convalescença
    const maxDay = d3.max(DISEASES, d => d.convalescence[1]);
    const xScale = d3.scaleLinear().domain([0, maxDay + 2]).range([margin.left, margin.left + plotW]);

    // Grid + eixo x
    const tickVals = xScale.ticks(Math.min(10, Math.max(4, Math.floor(plotW / 60))));
    svg.append('g').selectAll('line')
      .data(tickVals).join('line')
      .attr('x1', d => xScale(d)).attr('x2', d => xScale(d))
      .attr('y1', margin.top - 4).attr('y2', h - margin.bottom + 4)
      .attr('stroke', '#1e2638').attr('stroke-dasharray', '2,3');

    svg.append('g').selectAll('text')
      .data(tickVals).join('text')
      .attr('x', d => xScale(d)).attr('y', h - margin.bottom + 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a8b3c4')
      .style('font-size', '10px')
      .style('font-family', 'JetBrains Mono, monospace')
      .text(d => d);

    svg.append('text')
      .attr('x', margin.left + plotW / 2).attr('y', h - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a8b3c4')
      .style('font-size', '11px')
      .text('dias desde a exposição');

    // Uma linha por doença
    DISEASES.forEach((d, i) => {
      const y0 = margin.top + i * rowH + 8;
      const barH = 16;

      // Rótulo
      svg.append('text')
        .attr('x', margin.left - 12).attr('y', y0 + barH + 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#f0f4f8')
        .style('font-size', '12px')
        .style('font-weight', '500')
        .text(d.name);

      // Incubação (barra tracejada, transparente)
      svg.append('rect')
        .attr('class', 'comp-bar comp-incub')
        .attr('x', xScale(d.incubation[0]))
        .attr('width', xScale(d.incubation[1]) - xScale(d.incubation[0]))
        .attr('y', y0)
        .attr('height', barH)
        .attr('fill', d.color)
        .attr('fill-opacity', 0.22)
        .attr('stroke', d.color)
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,2')
        .attr('rx', 3)
        .style('cursor', 'pointer')
        .on('click', () => showNote(d, 'incubação'));

      // Sintomática (sólida)
      const sympStart = d.incubation[1];
      const sympEnd   = sympStart + (d.symptomatic[1] - d.symptomatic[0]);
      svg.append('rect')
        .attr('class', 'comp-bar comp-symp')
        .attr('x', xScale(sympStart))
        .attr('width', xScale(sympEnd) - xScale(sympStart))
        .attr('y', y0)
        .attr('height', barH)
        .attr('fill', d.color)
        .attr('fill-opacity', 0.85)
        .attr('rx', 3)
        .style('cursor', 'pointer')
        .on('click', () => showNote(d, 'sintomática'));

      // Convalescença (hachura clara)
      const convStart = sympEnd;
      const convEnd   = convStart + (d.convalescence[1] - d.convalescence[0]);
      svg.append('rect')
        .attr('class', 'comp-bar comp-conv')
        .attr('x', xScale(convStart))
        .attr('width', xScale(convEnd) - xScale(convStart))
        .attr('y', y0)
        .attr('height', barH)
        .attr('fill', d.color)
        .attr('fill-opacity', 0.35)
        .attr('rx', 3)
        .style('cursor', 'pointer')
        .on('click', () => showNote(d, 'convalescença'));

      // Marcador de latência para herpes
      if (d.latentYears) {
        svg.append('text')
          .attr('x', xScale(convEnd) + 8)
          .attr('y', y0 + barH - 3)
          .attr('fill', d.color)
          .style('font-size', '10px')
          .style('font-weight', '600')
          .text('→ latência (anos)');
      }
    });

    // Nota — painel abaixo
    const note = document.createElement('div');
    note.className = 'comparator-note';
    note.id = 'm04-comp-note';
    note.innerHTML = `<p class="muted" style="margin:0">Clique em uma das barras coloridas para ler a nota da doença.</p>`;
    wrap.appendChild(note);

    // Legenda
    const legend = document.createElement('div');
    legend.className = 'comparator-legend';
    legend.innerHTML = `
      <span class="comparator-legend-item">
        <span class="comparator-legend-swatch comp-incub-sw"></span>
        Incubação (tracejada)
      </span>
      <span class="comparator-legend-item">
        <span class="comparator-legend-swatch comp-symp-sw"></span>
        Sintomática (sólida)
      </span>
      <span class="comparator-legend-item">
        <span class="comparator-legend-swatch comp-conv-sw"></span>
        Convalescença (clara)
      </span>
    `;
    wrap.insertBefore(legend, note);

    function showNote(d, phase) {
      const inc = d.incubation[0] === d.incubation[1]
        ? `${d.incubation[0]}d`
        : `${d.incubation[0]}–${d.incubation[1]}d`;
      const sy = `${d.symptomatic[0]}–${d.symptomatic[1]}d`;
      const cv = `${d.convalescence[0]}–${d.convalescence[1]}d`;
      note.innerHTML = `
        <h4 style="color:${d.color};font-size:.82rem;margin:0 0 .4rem 0">${d.name.toUpperCase()}</h4>
        <p style="margin:0 0 .5rem 0;font-size:.92rem">${d.note}</p>
        <div class="comp-ranges">
          <span><strong>Incubação:</strong> ${inc}</span>
          <span><strong>Sintomática:</strong> ${sy}</span>
          <span><strong>Convalescença:</strong> ${cv}</span>
        </div>
      `;
    }
  }

  function renderActivity(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>4. Atividade — quatro perguntas</h2>
      <p>
        Quatro perguntas focando no que mais confunde: definição de incubação,
        latência × incubação, ordem dos períodos e reativação.
      </p>
      <div class="activity-box" id="m04-activity"></div>
    `;
    container.appendChild(sec);
    EDL.quiz.run(sec.querySelector('#m04-activity'), { bank: QUIZ });
  }

  function renderFooter(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>Próximos passos</h2>
      <p>
        Do indivíduo à população: o <strong>Módulo 5</strong> introduz R₀, o número básico
        de reprodução, e o crescimento exponencial — com o simulador comparador
        A versus B que já existia na versão anterior do R_Naught, agora completamente
        repaginado. Em construção.
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Registro
   * ------------------------------------------------------------------- */
  EDL.registerModule({
    id: '04-dinamica-individuo',
    number: 4,
    icon: '🧬',
    title: 'Dinâmica da Doença no Indivíduo',
    subtitle: 'Período latente × incubação × sintomático × convalescença × reativação.',
    status: 'available',
    quizCount: QUIZ.length,
    render(container) {
      renderHeader(container);
      renderPeriods(container);
      renderLatentVsIncubation(container);
      renderComparator(container);
      renderActivity(container);
      EDL.refs.renderModuleSection(container, 4);
      renderFooter(container);
    }
  });
})();
