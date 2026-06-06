/* =========================================================================
 * EDL — Módulo 03: Cadeia Epidemiológica
 *
 * Os cinco elos da cadeia (na ordem pedagógica clássica):
 *   1) Fonte de infecção
 *   2) Via de eliminação
 *   3) Mecanismo de contágio
 *   4) Porta de entrada
 *   5) Hospedeiro suscetível
 *
 * Quebrar qualquer elo interrompe a transmissão — é nisso que toda intervenção
 * de saúde pública se apoia. O laboratório deste módulo permite montar a
 * cadeia para 4 doenças diferentes (cólera, dengue, HIV, tuberculose) clicando
 * na opção correta em cada elo.
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * Os cinco elos — conteúdo teórico
   * ------------------------------------------------------------------- */
  const LINKS = [
    {
      id: 'fonte',
      n: 1,
      icon: '🦠',
      name: 'Fonte de infecção',
      tagline: 'De onde o agente sai',
      body:
        'A origem imediata do agente que infecta uma nova pessoa. Pode ser um indivíduo ' +
        '(doente sintomático, portador assintomático, convalescente), um animal, ou ' +
        'um elemento ambiental (água, solo, superfícies). Difere do <em>reservatório</em> ' +
        'por ser o ponto concreto de eliminação no caso específico em investigação.',
      examples: 'Homem com tuberculose ativa bacilífera · Portador assintomático de <em>S. aureus</em> no trabalho em saúde · Água de poço contaminada por fezes'
    },
    {
      id: 'eliminacao',
      n: 2,
      icon: '💨',
      name: 'Via de eliminação',
      tagline: 'Por onde o agente sai do organismo',
      body:
        'O caminho fisiológico pelo qual o agente deixa a fonte. Depende do tropismo do ' +
        'patógeno e do órgão em que se replica. Cada via tem implicações diretas no ' +
        'controle: via respiratória exige máscara e ventilação; via fecal exige saneamento; ' +
        'via sexual exige barreira.',
      examples: 'Respiratória (gotículas, aerossóis) · Fecal · Urinária · Sanguínea · Sexual · Cutânea · Transplacentária'
    },
    {
      id: 'contagio',
      n: 3,
      icon: '🔗',
      name: 'Mecanismo de contágio',
      tagline: 'Como o agente chega ao próximo hospedeiro',
      body:
        'A transmissão pode ser <em>direta</em> (contato imediato ou gotículas em curta ' +
        'distância) ou <em>indireta</em> (através de veículos como água, alimentos, fômites, ' +
        'ou por vetores biológicos como mosquitos e triatomíneos). Aerossóis suspensos no ar ' +
        'constituem a fronteira entre direta e indireta.',
      examples: 'Contato direto (sexual, beijo, toque) · Gotículas em curta distância · Aerossóis · Veículos (água, alimento, sangue transfundido) · Vetor biológico (Aedes, Anopheles)'
    },
    {
      id: 'porta',
      n: 4,
      icon: '🚪',
      name: 'Porta de entrada',
      tagline: 'Onde o agente penetra no novo hospedeiro',
      body:
        'O local anatômico de introdução no novo organismo — frequentemente, mas nem ' +
        'sempre, espelha a via de eliminação. Uma barreira efetiva aqui (pele íntegra, ' +
        'mucosa intacta, imunização local) bloqueia toda a cadeia, mesmo que os elos ' +
        'anteriores estejam presentes.',
      examples: 'Trato respiratório superior · Trato digestivo · Pele íntegra (raramente) ou lesada · Mucosas (oral, genital, conjuntival) · Placenta'
    },
    {
      id: 'hospedeiro',
      n: 5,
      icon: '🧍',
      name: 'Hospedeiro suscetível',
      tagline: 'Quem pode adoecer',
      body:
        'Indivíduo cuja imunidade é insuficiente para impedir a infecção e/ou o ' +
        'desenvolvimento da doença. A susceptibilidade depende de imunidade prévia ' +
        '(vacinal, natural), estado nutricional, comorbidades, idade, fatores genéticos. ' +
        'Alta susceptibilidade populacional + R₀ alto = potencial epidêmico rápido.',
      examples: 'Crianças sem vacinação primária · Idosos e imunossuprimidos · Profissionais de saúde expostos · Populações isoladas sem exposição prévia'
    }
  ];

  /* ---------------------------------------------------------------------
   * Doenças para o construtor de cadeia
   * ------------------------------------------------------------------- */
  const DISEASE_CHAINS = [
    {
      id: 'colera',
      name: 'Cólera',
      brief: '<em>Vibrio cholerae</em> — transmissão fecal-oral via água contaminada',
      chain: {
        fonte:        'Indivíduo com diarreia coleriforme (ou portador assintomático)',
        eliminacao:   'Fecal (fezes com alta carga de V. cholerae)',
        contagio:     'Veículo: água ou alimentos contaminados por fezes',
        porta:        'Trato digestivo (ingestão)',
        hospedeiro:   'Pessoas sem exposição prévia, sobretudo em regiões sem saneamento'
      },
      // Distratores — para cada elo, 3 opções erradas + 1 certa
      options: {
        fonte: [
          'Indivíduo com diarreia coleriforme (ou portador assintomático)',
          'Mosquito Aedes infectado',
          'Mamíferos silvestres',
          'Solo contaminado por esporos'
        ],
        eliminacao: [
          'Fecal (fezes com alta carga de V. cholerae)',
          'Respiratória por gotículas',
          'Sanguínea via picada',
          'Cutânea por contato direto'
        ],
        contagio: [
          'Veículo: água ou alimentos contaminados por fezes',
          'Contato sexual desprotegido',
          'Vetor biológico (mosquito)',
          'Aerossol suspenso por horas'
        ],
        porta: [
          'Trato digestivo (ingestão)',
          'Trato respiratório (inalação)',
          'Pele íntegra',
          'Mucosa genital'
        ],
        hospedeiro: [
          'Pessoas sem exposição prévia, sobretudo em regiões sem saneamento',
          'Apenas idosos com comorbidades',
          'Apenas gestantes',
          'Apenas profissionais de saúde'
        ]
      }
    },
    {
      id: 'dengue',
      name: 'Dengue',
      brief: 'Vírus transmitido por mosquito <em>Aedes aegypti</em>',
      chain: {
        fonte:        'Indivíduo com viremia (aprox. 1 dia antes dos sintomas até o 5º dia)',
        eliminacao:   'Sanguínea (mosquito se infecta durante o repasto)',
        contagio:     'Vetor biológico: Aedes aegypti transmite ao picar próxima pessoa',
        porta:        'Inoculação cutânea via picada do mosquito',
        hospedeiro:   'Qualquer pessoa não imune (imunidade é sorotipo-específica)'
      },
      options: {
        fonte: [
          'Indivíduo com viremia (aprox. 1 dia antes dos sintomas até o 5º dia)',
          'Água parada em recipientes',
          'Solo com larvas',
          'Aves silvestres'
        ],
        eliminacao: [
          'Sanguínea (mosquito se infecta durante o repasto)',
          'Fecal (contaminação de água)',
          'Respiratória (gotículas)',
          'Sexual'
        ],
        contagio: [
          'Vetor biológico: Aedes aegypti transmite ao picar próxima pessoa',
          'Contato direto pele a pele',
          'Via aerossol a curta distância',
          'Transmissão fecal-oral'
        ],
        porta: [
          'Inoculação cutânea via picada do mosquito',
          'Trato digestivo por ingestão',
          'Mucosa ocular',
          'Placenta'
        ],
        hospedeiro: [
          'Qualquer pessoa não imune (imunidade é sorotipo-específica)',
          'Apenas crianças',
          'Apenas viajantes vindos do exterior',
          'Apenas portadores de drepanocitose'
        ]
      }
    },
    {
      id: 'hiv',
      name: 'HIV',
      brief: 'Retrovírus transmitido por sangue, sêmen/fluidos genitais e aleitamento',
      chain: {
        fonte:        'Indivíduo soropositivo (assintomático ou com AIDS)',
        eliminacao:   'Sanguínea, genital (sêmen, secreções vaginais) e leite materno',
        contagio:     'Contato direto com fluidos: sexual, vertical, percutâneo (agulha, sangue)',
        porta:        'Mucosa genital, mucosa oral, pele lesada ou diretamente na corrente sanguínea',
        hospedeiro:   'Pessoas não imunes (não há vacina); risco aumenta com outras ISTs'
      },
      options: {
        fonte: [
          'Indivíduo soropositivo (assintomático ou com AIDS)',
          'Mosquito infectado',
          'Água contaminada',
          'Animais domésticos'
        ],
        eliminacao: [
          'Sanguínea, genital (sêmen, secreções vaginais) e leite materno',
          'Apenas via respiratória',
          'Apenas fecal',
          'Apenas urinária'
        ],
        contagio: [
          'Contato direto com fluidos: sexual, vertical, percutâneo (agulha, sangue)',
          'Contato casual, aperto de mão, abraço',
          'Picada de mosquito',
          'Compartilhamento de talheres'
        ],
        porta: [
          'Mucosa genital, mucosa oral, pele lesada ou diretamente na corrente sanguínea',
          'Apenas pele íntegra',
          'Apenas conjuntiva',
          'Apenas trato digestivo'
        ],
        hospedeiro: [
          'Pessoas não imunes (não há vacina); risco aumenta com outras ISTs',
          'Apenas pessoas com deficiência imunológica congênita',
          'Apenas recém-nascidos',
          'Apenas profissionais de saúde'
        ]
      }
    },
    {
      id: 'tb',
      name: 'Tuberculose',
      brief: '<em>Mycobacterium tuberculosis</em> — transmissão respiratória',
      chain: {
        fonte:        'Indivíduo com TB pulmonar bacilífera (baciloscopia positiva)',
        eliminacao:   'Respiratória (gotículas e núcleos de gotícula com bacilos)',
        contagio:     'Aerossol suspenso em ambiente fechado mal ventilado',
        porta:        'Trato respiratório (bronquíolos e alvéolos)',
        hospedeiro:   'Suscetíveis: crianças, imunodeprimidos (HIV), desnutridos, contatos domiciliares'
      },
      options: {
        fonte: [
          'Indivíduo com TB pulmonar bacilífera (baciloscopia positiva)',
          'Água contaminada',
          'Alimento mal cozido',
          'Solo rico em bacilos'
        ],
        eliminacao: [
          'Respiratória (gotículas e núcleos de gotícula com bacilos)',
          'Fecal',
          'Sexual',
          'Sanguínea'
        ],
        contagio: [
          'Aerossol suspenso em ambiente fechado mal ventilado',
          'Vetor biológico (mosquito)',
          'Veículo: água contaminada',
          'Contato direto de pele'
        ],
        porta: [
          'Trato respiratório (bronquíolos e alvéolos)',
          'Trato digestivo',
          'Mucosa ocular',
          'Pele íntegra'
        ],
        hospedeiro: [
          'Suscetíveis: crianças, imunodeprimidos (HIV), desnutridos, contatos domiciliares',
          'Apenas fumantes',
          'Apenas adultos jovens saudáveis',
          'Apenas gestantes'
        ]
      }
    }
  ];

  /* ---------------------------------------------------------------------
   * Quiz (Kahoot Q8a leptospirose + Q10 máscaras + 2 novas)
   * ------------------------------------------------------------------- */
  const QUIZ = [
    {
      // Kahoot Q8a — reescrita com mini-cenário
      scenario: {
        title: 'Após enchente em cidade ribeirinha',
        body: 'Duas semanas depois de uma enchente prolongada, unidades de saúde relatam aumento súbito de pessoas com febre alta, dor muscular intensa em panturrilhas e icterícia. Vários pacientes relatam contato com água de rua durante a limpeza das casas.',
        meta: [
          { label: 'Quadro', value: 'sugestivo de leptospirose' },
          { label: 'Agente', value: 'Leptospira interrogans' }
        ]
      },
      q: 'Qual é o principal mecanismo de contágio da leptospirose neste contexto?',
      opts: [
        'Consumo de alimentos contaminados por bactérias aéreas',
        'Contato com água contaminada por urina de roedores',
        'Contato direto com pessoas infectadas',
        'Transmissão através de picadas de insetos'
      ],
      answer: 1,
      feedback:
        'Leptospirose é transmitida principalmente por <strong>contato da pele ' +
        'lesada ou mucosas com água ou solo contaminados por urina de roedores ' +
        'infectados</strong> (ratos de esgoto, Rattus norvegicus, são o reservatório urbano ' +
        'principal). Em enchentes, a água se mistura com esgoto e urina de roedores — ' +
        'por isso a explosão de casos após cada enchente urbana. Transmissão pessoa-pessoa ' +
        'é muito rara.'
    },
    {
      // Kahoot Q10 — mesmo cenário anterior
      q: 'No cenário acima, qual medida <strong>não é eficaz</strong> para interromper a cadeia de transmissão da leptospirose?',
      opts: [
        'Controle de roedores no bairro afetado',
        'Limpeza e drenagem de áreas alagadas',
        'Uso de equipamento de proteção (botas, luvas) durante a limpeza',
        'Distribuição de máscaras faciais à população'
      ],
      answer: 3,
      feedback:
        'Leptospirose tem via de eliminação e porta de entrada <strong>não-respiratórias</strong>. ' +
        'Máscaras são inúteis neste caso porque o agente não está no ar. A eficácia vem de: ' +
        'controlar o reservatório (roedores), eliminar o veículo (água parada), e bloquear a porta ' +
        'de entrada (botas, luvas, evitar pele lesada em contato com água turva). Reconhecer qual ' +
        'medida corresponde a qual elo da cadeia é o núcleo do raciocínio epidemiológico aplicado.'
    },
    {
      // NOVA: cadeia cólera
      q: 'Para a cólera, qual sequência descreve corretamente a cadeia epidemiológica?',
      opts: [
        'Mosquito → picada → sangue → mucosa → pessoa não imune',
        'Doente → fezes → água/alimento → ingestão → pessoa sem saneamento',
        'Fômite → superfície → contato → pele lesada → imunossuprimido',
        'Animal → sangue → aerossol → respiração → recém-nascido'
      ],
      answer: 1,
      feedback:
        'A cadeia da cólera é clássica fecal-oral: <strong>indivíduo doente ou portador</strong> ' +
        'elimina <em>V. cholerae</em> nas <strong>fezes</strong>; estas contaminam ' +
        '<strong>água ou alimento</strong>; a nova pessoa <strong>ingere</strong> o agente, que ' +
        'atinge o <strong>intestino delgado</strong>. A ausência de saneamento é o que mantém essa ' +
        'cadeia funcionando historicamente — foi a intuição de John Snow em Soho (1854) e continua ' +
        'valendo para o Haiti (2010).'
    },
    {
      // NOVA: quebra de elos
      q: 'Uma intervenção de saúde pública pode quebrar a cadeia epidemiológica em vários elos. Vacinação contra sarampo em crianças atua principalmente em qual elo?',
      opts: [
        'Fonte de infecção',
        'Via de eliminação',
        'Mecanismo de contágio',
        'Hospedeiro suscetível'
      ],
      answer: 3,
      feedback:
        'Vacinar reduz a <strong>susceptibilidade</strong> — transforma hospedeiros potenciais em ' +
        'indivíduos imunes. O agente ainda existe, a fonte e a transmissão continuam possíveis, mas ' +
        'não há quem adoeça. A força dessa estratégia (vacinação) é que, se a cobertura ultrapassar ' +
        'o <em>limiar de imunidade de rebanho</em> (≈ 95% para sarampo, R₀≈15), a cadeia se rompe ' +
        'mesmo para os poucos não vacinados. Isso é o tema do Módulo 6.'
    }
  ];

  /* ---------------------------------------------------------------------
   * Renderização
   * ------------------------------------------------------------------- */

  function renderHeader(container) {
    const header = document.createElement('header');
    header.className = 'module-header';
    header.innerHTML = `
      <span class="module-badge">Módulo 03</span>
      <h1>Cadeia Epidemiológica</h1>
      <p class="module-subtitle">
        Toda transmissão infecciosa passa por cinco elos. Interromper qualquer um deles
        quebra a cadeia — e é por isso que saúde pública funciona.
      </p>
    `;
    container.appendChild(header);
  }

  function renderChainDiagram(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>1. Os cinco elos</h2>
      <p>
        Na sequência clássica, a cadeia começa no agente presente em uma fonte, passa pela
        via pela qual o agente deixa essa fonte, pelo mecanismo que o leva ao próximo hospedeiro,
        pela porta anatômica de entrada, e termina no grau de susceptibilidade desse novo hospedeiro.
      </p>
      <div class="chain-diagram" id="m03-chain"></div>
      <p class="muted" style="margin-top:1rem">Clique em cada elo para ler a definição e ver exemplos.</p>
    `;
    container.appendChild(sec);

    const chain = sec.querySelector('#m03-chain');
    renderChainLinks(chain);
  }

  function renderChainLinks(container) {
    container.innerHTML = '';
    LINKS.forEach((link, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'chain-link';
      el.dataset.id = link.id;
      el.innerHTML = `
        <div class="chain-link-num">${link.n}</div>
        <div class="chain-link-icon">${link.icon}</div>
        <div class="chain-link-name">${link.name}</div>
        <div class="chain-link-tag">${link.tagline}</div>
      `;
      el.addEventListener('click', () => selectLink(container, link, el));
      container.appendChild(el);

      if (i < LINKS.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'chain-arrow';
        arrow.innerHTML = '→';
        container.appendChild(arrow);
      }
    });

    // Panel de detalhe
    const detail = document.createElement('div');
    detail.className = 'chain-detail';
    detail.id = 'm03-chain-detail';
    detail.innerHTML = `<p class="muted" style="margin:0">Selecione um elo para ler os detalhes.</p>`;
    container.parentElement.appendChild(detail);
  }

  function selectLink(chainContainer, link, btn) {
    chainContainer.querySelectorAll('.chain-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const detail = document.getElementById('m03-chain-detail');
    detail.innerHTML = `
      <div class="chain-detail-header">
        <span class="chain-detail-icon" aria-hidden="true">${link.icon}</span>
        <div>
          <h3 style="margin:0 0 .2rem 0">${link.n}. ${link.name}</h3>
          <div class="chain-detail-tag">${link.tagline}</div>
        </div>
      </div>
      <p>${link.body}</p>
      <div class="chain-examples"><strong>Exemplos:</strong> ${link.examples}</div>
    `;
  }

  function renderBuilder(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>2. Laboratório — monte a cadeia</h2>
      <p>
        Escolha uma doença e reconstrua sua cadeia epidemiológica, elo por elo. O app mostra
        feedback imediato a cada escolha. Se errar, tente novamente — é assim que se fixa.
      </p>
      <div class="builder-wrap" id="m03-builder"></div>
    `;
    container.appendChild(sec);

    const wrap = sec.querySelector('#m03-builder');
    runBuilder(wrap);
  }

  function runBuilder(wrap) {
    let currentDisease = DISEASE_CHAINS[0];
    let currentLinkIdx = 0;
    const userAnswers = {};  // linkId → pickedText

    function render() {
      wrap.innerHTML = `
        <div class="builder-diseasetabs" id="m03-disease-tabs"></div>
        <div class="builder-disease-brief" id="m03-disease-brief"></div>
        <div class="builder-steps" id="m03-steps"></div>
        <div class="builder-active-link" id="m03-active-link"></div>
      `;
      const tabs = wrap.querySelector('#m03-disease-tabs');
      const brief = wrap.querySelector('#m03-disease-brief');

      DISEASE_CHAINS.forEach(d => {
        const t = document.createElement('button');
        t.type = 'button';
        t.className = 'builder-disease-tab' + (d.id === currentDisease.id ? ' active' : '');
        t.textContent = d.name;
        t.addEventListener('click', () => {
          if (d.id === currentDisease.id) return;
          currentDisease = d;
          currentLinkIdx = 0;
          Object.keys(userAnswers).forEach(k => delete userAnswers[k]);
          render();
        });
        tabs.appendChild(t);
      });

      brief.innerHTML = `<strong>${currentDisease.name}:</strong> ${currentDisease.brief}`;

      renderSteps();
      renderActiveLink();
    }

    function renderSteps() {
      const stepsEl = wrap.querySelector('#m03-steps');
      stepsEl.innerHTML = '';
      LINKS.forEach((link, i) => {
        const step = document.createElement('div');
        const picked = userAnswers[link.id];
        const isCorrect = picked && picked === currentDisease.chain[link.id];
        const isCurrent = i === currentLinkIdx;

        step.className = 'builder-step'
          + (isCurrent ? ' current' : '')
          + (isCorrect ? ' ok' : '')
          + (picked && !isCorrect ? ' partial' : '');

        step.innerHTML = `
          <div class="builder-step-n">${link.n}</div>
          <div class="builder-step-body">
            <div class="builder-step-name">${link.name}</div>
            <div class="builder-step-value">${picked ? picked : '—'}</div>
          </div>
        `;
        step.addEventListener('click', () => {
          currentLinkIdx = i;
          renderActiveLink();
          renderSteps();
        });
        stepsEl.appendChild(step);
      });
    }

    function renderActiveLink() {
      const el = wrap.querySelector('#m03-active-link');
      const link = LINKS[currentLinkIdx];
      const options = [...currentDisease.options[link.id]];
      // Ordenar aleatoriamente mas estável por pergunta (baseado em seed simples)
      const seed = link.id.charCodeAt(0) + currentDisease.id.charCodeAt(0);
      const rng = EDL.math.seededRNG(seed);
      EDL.math.shuffleInPlace(options, rng);

      const picked = userAnswers[link.id];
      const correctAnswer = currentDisease.chain[link.id];

      el.innerHTML = `
        <div class="builder-active-header">
          <span class="builder-active-icon">${link.icon}</span>
          <div>
            <h3 style="margin:0 0 .2rem 0">Elo ${link.n}: ${link.name}</h3>
            <div class="muted" style="font-size:.87rem">${link.tagline}</div>
          </div>
        </div>
        <p class="muted" style="font-size:.92rem">
          Para <strong>${currentDisease.name}</strong>, qual opção descreve corretamente este elo?
        </p>
        <div class="builder-options">
          ${options.map(op => `
            <button type="button" class="builder-option${picked === op ? (op === correctAnswer ? ' correct' : ' wrong') : ''}"
                    ${picked ? 'disabled' : ''} data-v="${encodeURIComponent(op)}">
              ${op}
            </button>
          `).join('')}
        </div>
        ${picked ? renderBuilderFeedback(picked, correctAnswer, link) : ''}
      `;

      el.querySelectorAll('.builder-option').forEach(btn => {
        btn.addEventListener('click', () => {
          if (picked) return;
          const v = decodeURIComponent(btn.dataset.v);
          userAnswers[link.id] = v;
          renderSteps();
          renderActiveLink();
        });
      });

      const nextBtn = el.querySelector('#builder-next');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (currentLinkIdx < LINKS.length - 1) {
            currentLinkIdx++;
            renderActiveLink();
            renderSteps();
          } else {
            renderComplete();
          }
        });
      }

      const retryBtn = el.querySelector('#builder-retry');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          delete userAnswers[link.id];
          renderActiveLink();
          renderSteps();
        });
      }
    }

    function renderBuilderFeedback(picked, correct, link) {
      const isOk = picked === correct;
      const msg = isOk
        ? `<strong>Correto.</strong> Esse é o elo ${link.n} da cadeia de ${currentDisease.name}.`
        : `<strong>Não foi dessa vez.</strong> A resposta certa é: <em>${correct}</em>`;

      const isLast = currentLinkIdx === LINKS.length - 1;
      const allFilled = LINKS.every(l => userAnswers[l.id]);
      const btnLabel = isLast
        ? (allFilled ? 'Ver cadeia completa →' : 'Fechar')
        : 'Próximo elo →';

      return `
        <div class="activity-feedback" style="margin-top:1rem">${msg}</div>
        <div class="activity-nav">
          ${!isOk ? `<button type="button" class="btn btn-ghost" id="builder-retry">Tentar outra vez</button>` : ''}
          <button type="button" class="btn btn-primary" id="builder-next">${btnLabel}</button>
        </div>
      `;
    }

    function renderComplete() {
      const allCorrect = LINKS.every(l => userAnswers[l.id] === currentDisease.chain[l.id]);
      const el = wrap.querySelector('#m03-active-link');
      el.innerHTML = `
        <div class="builder-complete">
          <h3 style="margin:0 0 .5rem 0">Cadeia de ${currentDisease.name} completa</h3>
          <p class="muted">${allCorrect
            ? 'Todos os elos corretos na primeira tentativa ou após revisão.'
            : 'Cadeia montada — alguns elos precisaram de correção. Revise a sequência abaixo.'}</p>
          <ol class="builder-summary">
            ${LINKS.map(l => `
              <li>
                <strong>${l.n}. ${l.name}:</strong>
                <span>${userAnswers[l.id] === currentDisease.chain[l.id]
                  ? userAnswers[l.id]
                  : `<span style="text-decoration:line-through;color:var(--danger)">${userAnswers[l.id]}</span> → <span style="color:var(--success)">${currentDisease.chain[l.id]}</span>`
                }</span>
              </li>
            `).join('')}
          </ol>
          <div style="display:flex; gap:.75rem; justify-content:center; margin-top:1.2rem; flex-wrap:wrap">
            <button type="button" class="btn btn-ghost" id="builder-reset">Tentar outra doença</button>
          </div>
        </div>
      `;
      el.querySelector('#builder-reset').addEventListener('click', () => {
        currentLinkIdx = 0;
        Object.keys(userAnswers).forEach(k => delete userAnswers[k]);
        render();
      });
    }

    render();
  }

  function renderActivity(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>3. Atividade — quatro perguntas</h2>
      <p>
        Duas vêm de um cenário clínico de enchente (leptospirose), e duas testam se você
        consegue integrar os cinco elos num raciocínio de caso.
      </p>
      <div class="activity-box" id="m03-activity"></div>
    `;
    container.appendChild(sec);
    EDL.quiz.run(sec.querySelector('#m03-activity'), { bank: QUIZ });
  }

  function renderFooter(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>Próximos passos</h2>
      <p>
        O <strong>Módulo 4</strong> muda o foco do coletivo para o indivíduo: o que acontece com
        quem adoece, do contato com o agente à recuperação. Período latente, período de
        incubação, fase sintomática, convalescença e reativação — com exemplos comparativos
        (COVID, dengue, cólera, herpes).
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Registro
   * ------------------------------------------------------------------- */
  EDL.registerModule({
    id: '03-cadeia',
    number: 3,
    icon: '🔗',
    title: 'Cadeia Epidemiológica',
    subtitle: 'Fonte → via → contágio → porta → hospedeiro suscetível.',
    status: 'available',
    quizCount: QUIZ.length,
    render(container) {
      renderHeader(container);
      renderChainDiagram(container);
      renderBuilder(container);
      renderActivity(container);
      EDL.refs.renderModuleSection(container, 3);
      renderFooter(container);
    }
  });
})();
