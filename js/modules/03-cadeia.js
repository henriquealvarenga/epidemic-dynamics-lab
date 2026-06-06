/* =========================================================================
 * EDL — Módulo 03: Cadeia Epidemiológica
 *
 * Os seis elos da cadeia (conforme CDC/NIOSH):
 *   1) Microrganismo (agente patogênico)
 *   2) Reservatório/Fonte
 *   3) Portal de saída
 *   4) Modos de transmissão
 *   5) Portal de entrada
 *   6) Hospedeiro suscetível
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
   * Os seis elos — conteúdo teórico
   *
   * Construído como função para ter acesso ao cite() do citation manager,
   * que só existe no momento do render.
   * ------------------------------------------------------------------- */
  function buildLinks(cite) {
    return [
      {
        id: 'agente',
        n: 1,
        icon: '🦠',
        name: 'Microrganismo',
        tagline: 'O agente patogênico causador da doença',
        body:
          'Organismos produtores de doença, também chamados de patógenos.' + cite('cdc_niosh_chain2024') +
          ' Incluem vírus, parasitas, fungos e bactérias. Os fatores que determinam ' +
          'o risco de infecção são a <em>virulência</em> (capacidade de causar doença grave), ' +
          'a <em>patogenicidade</em> (capacidade de causar doença em quem foi infectado) e ' +
          'a capacidade de penetrar o hospedeiro.',
        examples: '<em>Vibrio cholerae</em> (bactéria) · Vírus dengue — DENV 1–4 (vírus) · <em>Mycobacterium tuberculosis</em> (bactéria) · HIV-1/HIV-2 (retrovírus) · <em>Plasmodium falciparum</em> (parasita)'
      },
      {
        id: 'reservatorio',
        n: 2,
        icon: '🏠',
        name: 'Reservatório/Fonte',
        tagline: 'Onde o patógeno vive e se multiplica',
        body:
          'O ambiente ou habitat onde o patógeno pode viver e se multiplicar.' + cite('cdc_niosh_chain2024') +
          ' Inclui superfícies ambientais, equipamentos, fluidos corporais (sangue, saliva), ' +
          'urina, matéria fecal, alimentos, água, solo, pele e trato respiratório. ' +
          'O reservatório pode ser humano, animal ou ambiental — e nem sempre coincide ' +
          'com a fonte imediata de infecção.',
        examples: 'Pessoa doente ou portadora assintomática · Animais (zoonoses: raiva, leptospirose) · Água e solo contaminados · Superfícies hospitalares'
      },
      {
        id: 'portal_saida',
        n: 3,
        icon: '💨',
        name: 'Portal de saída',
        tagline: 'Como o patógeno deixa o reservatório',
        body:
          'A via pela qual o patógeno abandona o reservatório.' + cite('cdc_niosh_chain2024') +
          ' Inclui contato pele a pele, sangue, membranas mucosas, cavidade oral e via fecal. ' +
          'Também inclui outros materiais potencialmente infecciosos (OPIM) como fluido seminal, ' +
          'líquido articular e qualquer fluido corporal com presença de sangue.',
        examples: 'Trato respiratório (tosse, espirro) · Matéria fecal · Sangue e fluidos corporais · Pele e mucosas · Via transplacentária'
      },
      {
        id: 'transmissao',
        n: 4,
        icon: '🔗',
        name: 'Modos de transmissão',
        tagline: 'Como o patógeno chega ao próximo hospedeiro',
        body:
          'A transmissão pode ser <em>direta</em> ou <em>indireta</em>.' + cite('cdc_niosh_chain2024') +
          ' <strong>Direta:</strong> via aérea (aerossóis), gotículas, contato pele a pele, mordidas ' +
          'e lesões por agulha. <strong>Indireta:</strong> por fômites (objetos contaminados), ' +
          'vetores (mosquitos, carrapatos), alimentos e água.',
        examples: 'Direta — aerossóis (TB, sarampo) · gotículas curta distância (gripe) · contato sexual (HIV) · Indireta — água contaminada (cólera) · mosquito Aedes (dengue) · fômites (norovírus)'
      },
      {
        id: 'portal_entrada',
        n: 5,
        icon: '🚪',
        name: 'Portal de entrada',
        tagline: 'Onde o patógeno penetra no novo hospedeiro',
        body:
          'As aberturas corporais e vias pelas quais o patógeno acessa o organismo.' + cite('cdc_niosh_chain2024') +
          ' Inclui boca, olhos, trato urinário, trato respiratório, incisões e feridas. ' +
          'O portal de entrada frequentemente espelha o portal de saída — a influenza ' +
          'sai e entra pelo trato respiratório; patógenos entéricos saem nas fezes e ' +
          'entram pela boca (rota fecal-oral).',
        examples: 'Trato respiratório (inalação) · Trato digestivo (ingestão) · Mucosas (oral, genital, conjuntival) · Pele lesada ou incisões · Placenta'
      },
      {
        id: 'hospedeiro',
        n: 6,
        icon: '🧍',
        name: 'Hospedeiro suscetível',
        tagline: 'A pessoa em risco de adoecer',
        body:
          'A pessoa em risco — pode ser um paciente ou um profissional de saúde.' + cite('cdc_niosh_chain2024') +
          ' A suscetibilidade depende de: idade, estado de saúde geral, comorbidades, ' +
          'sistema imunológico, estado nutricional, dose infecciosa e medicações em uso. ' +
          'Quanto maior a proporção de suscetíveis na população e mais alto o R₀ do agente, ' +
          'maior o potencial epidêmico.',
        examples: 'Crianças sem vacinação primária · Idosos e imunossuprimidos · Profissionais de saúde expostos · Populações sem exposição prévia ao agente'
      }
    ];
  }

  /* ---------------------------------------------------------------------
   * Doenças para o construtor de cadeia
   * ------------------------------------------------------------------- */
  const DISEASE_CHAINS = [
    {
      id: 'colera',
      name: 'Cólera',
      brief: '<em>Vibrio cholerae</em> — transmissão fecal-oral via água contaminada',
      chain: {
        agente:         'Vibrio cholerae (bactéria gram-negativa, sorogrupos O1 e O139)',
        reservatorio:   'Indivíduo com diarreia coleriforme (ou portador assintomático)',
        portal_saida:   'Fecal (fezes com alta carga de V. cholerae)',
        transmissao:    'Veículo: água ou alimentos contaminados por fezes',
        portal_entrada: 'Trato digestivo (ingestão)',
        hospedeiro:     'Pessoas sem exposição prévia, sobretudo em regiões sem saneamento'
      },
      // Distratores — para cada elo, 3 opções erradas + 1 certa
      options: {
        agente: [
          'Vibrio cholerae (bactéria gram-negativa, sorogrupos O1 e O139)',
          'Vírus dengue — DENV 1–4',
          'HIV-1/HIV-2 (retrovírus)',
          'Mycobacterium tuberculosis (bacilo de Koch)'
        ],
        reservatorio: [
          'Indivíduo com diarreia coleriforme (ou portador assintomático)',
          'Mosquito Aedes infectado',
          'Mamíferos silvestres',
          'Solo contaminado por esporos'
        ],
        portal_saida: [
          'Fecal (fezes com alta carga de V. cholerae)',
          'Respiratória por gotículas',
          'Sanguínea via picada de inseto',
          'Cutânea por contato direto'
        ],
        transmissao: [
          'Veículo: água ou alimentos contaminados por fezes',
          'Contato sexual desprotegido',
          'Vetor biológico (mosquito)',
          'Aerossol suspenso por horas'
        ],
        portal_entrada: [
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
      brief: 'Arbovírus transmitido pelo mosquito <em>Aedes aegypti</em>',
      chain: {
        agente:         'Vírus dengue — DENV 1–4 (arbovírus, família Flaviviridae)',
        reservatorio:   'Indivíduo com viremia (aprox. 1 dia antes dos sintomas até o 5º dia)',
        portal_saida:   'Sanguínea (mosquito se infecta durante o repasto)',
        transmissao:    'Vetor biológico: Aedes aegypti transmite ao picar próxima pessoa',
        portal_entrada: 'Inoculação cutânea via picada do mosquito',
        hospedeiro:     'Qualquer pessoa não imune (imunidade é sorotipo-específica)'
      },
      options: {
        agente: [
          'Vírus dengue — DENV 1–4 (arbovírus, família Flaviviridae)',
          'Vibrio cholerae (bactéria gram-negativa)',
          'HIV-1/HIV-2 (retrovírus)',
          'Mycobacterium tuberculosis (bacilo de Koch)'
        ],
        reservatorio: [
          'Indivíduo com viremia (aprox. 1 dia antes dos sintomas até o 5º dia)',
          'Água parada em recipientes',
          'Solo com larvas',
          'Aves silvestres'
        ],
        portal_saida: [
          'Sanguínea (mosquito se infecta durante o repasto)',
          'Fecal (contaminação de água)',
          'Respiratória (gotículas)',
          'Sexual'
        ],
        transmissao: [
          'Vetor biológico: Aedes aegypti transmite ao picar próxima pessoa',
          'Contato direto pele a pele',
          'Via aerossol a curta distância',
          'Transmissão fecal-oral'
        ],
        portal_entrada: [
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
        agente:         'HIV-1/HIV-2 (retrovírus, família Retroviridae)',
        reservatorio:   'Indivíduo soropositivo (assintomático ou com AIDS)',
        portal_saida:   'Sanguínea, genital (sêmen, secreções vaginais) e leite materno',
        transmissao:    'Contato direto com fluidos: sexual, vertical, percutâneo (agulha, sangue)',
        portal_entrada: 'Mucosa genital, mucosa oral, pele lesada ou diretamente na corrente sanguínea',
        hospedeiro:     'Pessoas não imunes (não há vacina); risco aumenta com outras ISTs'
      },
      options: {
        agente: [
          'HIV-1/HIV-2 (retrovírus, família Retroviridae)',
          'Vírus dengue — DENV 1–4',
          'Vibrio cholerae (bactéria gram-negativa)',
          'Mycobacterium tuberculosis (bacilo de Koch)'
        ],
        reservatorio: [
          'Indivíduo soropositivo (assintomático ou com AIDS)',
          'Mosquito infectado',
          'Água contaminada',
          'Animais domésticos'
        ],
        portal_saida: [
          'Sanguínea, genital (sêmen, secreções vaginais) e leite materno',
          'Apenas via respiratória',
          'Apenas fecal',
          'Apenas urinária'
        ],
        transmissao: [
          'Contato direto com fluidos: sexual, vertical, percutâneo (agulha, sangue)',
          'Contato casual, aperto de mão, abraço',
          'Picada de mosquito',
          'Compartilhamento de talheres'
        ],
        portal_entrada: [
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
        agente:         'Mycobacterium tuberculosis (bacilo de Koch, micobactéria álcool-ácido resistente)',
        reservatorio:   'Indivíduo com TB pulmonar bacilífera (baciloscopia positiva)',
        portal_saida:   'Respiratória (gotículas e núcleos de gotícula com bacilos)',
        transmissao:    'Aerossol suspenso em ambiente fechado mal ventilado',
        portal_entrada: 'Trato respiratório (bronquíolos e alvéolos)',
        hospedeiro:     'Suscetíveis: crianças, imunodeprimidos (HIV), desnutridos, contatos domiciliares'
      },
      options: {
        agente: [
          'Mycobacterium tuberculosis (bacilo de Koch, micobactéria álcool-ácido resistente)',
          'Vibrio cholerae (bactéria gram-negativa)',
          'Vírus dengue — DENV 1–4',
          'HIV-1/HIV-2 (retrovírus)'
        ],
        reservatorio: [
          'Indivíduo com TB pulmonar bacilífera (baciloscopia positiva)',
          'Água contaminada',
          'Alimento mal cozido',
          'Solo rico em bacilos'
        ],
        portal_saida: [
          'Respiratória (gotículas e núcleos de gotícula com bacilos)',
          'Fecal',
          'Sexual',
          'Sanguínea'
        ],
        transmissao: [
          'Aerossol suspenso em ambiente fechado mal ventilado',
          'Vetor biológico (mosquito)',
          'Veículo: água contaminada',
          'Contato direto de pele'
        ],
        portal_entrada: [
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
      q: 'Qual é o principal modo de transmissão da leptospirose neste contexto?',
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
        'Leptospirose tem portal de saída e portal de entrada <strong>não-respiratórios</strong>. ' +
        'Máscaras são inúteis neste caso porque o agente não está no ar. A eficácia vem de: ' +
        'controlar o reservatório (roedores), eliminar o veículo de transmissão (água parada), e bloquear o portal ' +
        'de entrada (botas, luvas, evitar pele lesada em contato com água turva). Reconhecer qual ' +
        'medida corresponde a qual elo da cadeia é o núcleo do raciocínio epidemiológico aplicado.'
    },
    {
      // NOVA: cadeia cólera
      q: 'Para a cólera, qual sequência descreve corretamente a cadeia epidemiológica?',
      opts: [
        'Mosquito → sangue (repasto) → picada → mucosa → pessoa não imune',
        'V. cholerae → doente/portador → fezes → água/alimento contaminados → ingestão → pessoa sem saneamento',
        'Fômite → superfície → contato → pele lesada → imunossuprimido',
        'Animal → sangue → aerossol → trato respiratório → recém-nascido'
      ],
      answer: 1,
      feedback:
        'A cadeia da cólera segue os seis elos: <strong>microrganismo</strong> (<em>V. cholerae</em>) → ' +
        '<strong>reservatório</strong> (indivíduo doente ou portador assintomático) → ' +
        '<strong>portal de saída</strong> (fezes) → ' +
        '<strong>modo de transmissão</strong> (água ou alimento contaminados) → ' +
        '<strong>portal de entrada</strong> (ingestão pelo trato digestivo) → ' +
        '<strong>hospedeiro suscetível</strong> (pessoa sem saneamento ou exposição prévia). ' +
        'A ausência de saneamento é o que mantém essa cadeia funcionando — foi a intuição de John Snow em Soho (1854) e continua ' +
        'valendo para o Haiti (2010).'
    },
    {
      // NOVA: quebra de elos
      q: 'Uma intervenção de saúde pública pode quebrar a cadeia epidemiológica em vários elos. Vacinação contra sarampo em crianças atua principalmente em qual elo?',
      opts: [
        'Reservatório/Fonte',
        'Portal de saída',
        'Modos de transmissão',
        'Hospedeiro suscetível'
      ],
      answer: 3,
      feedback:
        'Vacinar reduz a <strong>susceptibilidade</strong> — transforma hospedeiros potenciais em ' +
        'indivíduos imunes. O microrganismo ainda existe, o reservatório e os modos de transmissão continuam possíveis, mas ' +
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
        Toda transmissão infecciosa passa por seis elos. Interromper qualquer um deles
        quebra a cadeia — e é por isso que saúde pública funciona.
      </p>
    `;
    container.appendChild(header);
  }

  function renderChainDiagram(container, links) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>1. Os seis elos</h2>
      <p>
        Na sequência clássica (CDC/NIOSH), a cadeia começa no <strong>microrganismo</strong>,
        passa pelo <strong>reservatório</strong> onde ele vive, pelo <strong>portal de saída</strong>
        que o libera, pelo <strong>modo de transmissão</strong> até o próximo hospedeiro,
        pelo <strong>portal de entrada</strong> no novo organismo e termina no
        <strong>hospedeiro suscetível</strong>. Quebrar qualquer elo interrompe a transmissão.
      </p>
      <div class="chain-diagram" id="m03-chain"></div>
      <p class="muted" style="margin-top:1rem">Clique em cada elo para ler a definição e ver exemplos.</p>
    `;
    container.appendChild(sec);

    const chain = sec.querySelector('#m03-chain');
    renderChainLinks(chain, links);
  }

  function renderChainLinks(container, links) {
    container.innerHTML = '';
    links.forEach((link, i) => {
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

      if (i < links.length - 1) {
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

  function renderBuilder(container, links) {
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
    runBuilder(wrap, links);
  }

  function runBuilder(wrap, links) {
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
      links.forEach((link, i) => {
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
      const link = links[currentLinkIdx];
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
          if (currentLinkIdx < links.length - 1) {
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

      const isLast = currentLinkIdx === links.length - 1;
      const allFilled = links.every(l => userAnswers[l.id]);
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
      const allCorrect = links.every(l => userAnswers[l.id] === currentDisease.chain[l.id]);
      const el = wrap.querySelector('#m03-active-link');
      el.innerHTML = `
        <div class="builder-complete">
          <h3 style="margin:0 0 .5rem 0">Cadeia de ${currentDisease.name} completa</h3>
          <p class="muted">${allCorrect
            ? 'Todos os elos corretos na primeira tentativa ou após revisão.'
            : 'Cadeia montada — alguns elos precisaram de correção. Revise a sequência abaixo.'}</p>
          <ol class="builder-summary">
            ${links.map(l => `
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
        consegue integrar os seis elos num raciocínio de caso.
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
    subtitle: 'Microrganismo → reservatório → portal de saída → transmissão → portal de entrada → hospedeiro suscetível.',
    status: 'available',
    quizCount: QUIZ.length,
    render(container) {
      const cm   = EDL.citations.create({ idPrefix: 'm03-ref-' });
      const cite = (...keys) => cm.cite(...keys);
      const links = buildLinks(cite);

      renderHeader(container);
      renderChainDiagram(container, links);
      renderBuilder(container, links);
      renderActivity(container);
      EDL.refs.renderCitedReferences(container, cm);
      renderFooter(container);
    }
  });
})();
