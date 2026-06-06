/* =========================================================================
 * EDL — Módulo 02: Conceitos Básicos
 *
 * Cobre o vocabulário fundamental da epidemiologia:
 *   - Endemia, Surto, Epidemia, Pandemia
 *   - Reservatórios
 *   - Risco e Fator de Risco
 *   - Correlação, Desfecho, Exposição
 *   - Caso Notificado vs Caso Confirmado
 *
 * Baseado em: "Conceitos de Epidemiologia.pdf" do autor e banco de
 * perguntas Kahoot testadas em sala (Q1, Q2, Q4a, Q4b, Q5b, Q7, Q9).
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * Cenários para o classificador interativo
   * ------------------------------------------------------------------- */
  const CLASSIFIER_SCENARIOS = [
    {
      title: 'Malária na África Subsaariana',
      body: 'Em partes de Moçambique, Nigéria e Gabão, a malária causa centenas de milhares de casos por ano, ano após ano, sem interrupção. O número de casos é relativamente estável ao longo do tempo.',
      correct: 'endemia',
      feedback: 'Endemia — presença constante e habitual em uma área geográfica específica. O número de casos está dentro do esperado para aquela região.'
    },
    {
      title: 'COVID-19 em março de 2020',
      body: 'Ao longo de poucas semanas, o SARS-CoV-2 se espalha do leste asiático para Europa, Américas, África, Oceania. Em 11 de março, a OMS declara o estado.',
      correct: 'pandemia',
      feedback: 'Pandemia — epidemia com disseminação entre vários países e continentes, afetando um grande número de pessoas.'
    },
    {
      title: 'Sarampo numa escola municipal',
      body: 'Após uma criança não vacinada contrair sarampo em viagem ao exterior, 12 colegas da mesma escola apresentam o quadro nas 3 semanas seguintes. Fora da escola, nenhum caso novo é notificado na cidade.',
      correct: 'surto',
      feedback: 'Surto — aumento de casos numa área geográfica pequena e bem delimitada (a escola). É uma forma de epidemia localizada.'
    },
    {
      title: 'Ebola na África Ocidental, 2014–2016',
      body: 'O vírus se espalha da Guiné para Serra Leoa e Libéria. Mais de 28 mil casos e 11 mil mortes nos três países. Casos isolados atingem ainda Nigéria, Mali e Senegal, além de transferências para EUA e Europa com tratamento.',
      correct: 'epidemia',
      feedback: 'Epidemia — aumento significativo de casos em múltiplas áreas ou regiões, acima do esperado. Não chega a pandemia porque a disseminação permanece regional (não atinge múltiplos continentes como casos autóctones).'
    },
    {
      title: 'Gripe sazonal em cidade de médio porte',
      body: 'Todos os anos, entre maio e agosto, hospitais do município registram um aumento previsível de consultas por síndromes gripais. A curva sobe, estabiliza e desce de forma semelhante ano após ano.',
      correct: 'endemia',
      feedback: 'Endemia — a doença está sazonalmente presente de forma esperada, sem ultrapassar o patamar habitual para a região e o período.'
    },
    {
      title: 'Febre amarela urbana, Rio de Janeiro, 1900',
      body: 'Após anos de casos esporádicos, o Rio enfrenta em 1900 um aumento súbito e intenso de casos de febre amarela. O governo convoca Oswaldo Cruz para combater vetores urbanos (Aedes aegypti).',
      correct: 'surto',
      feedback: 'Surto — aumento súbito e bem delimitado geograficamente (a cidade do Rio de Janeiro). A classificação seria epidemia se atingisse múltiplas cidades simultaneamente.'
    }
  ];

  const CLASSIFIER_OPTIONS = [
    { id: 'endemia',  label: 'Endemia',  color: 'var(--c-susceptible)' },
    { id: 'surto',    label: 'Surto',    color: 'var(--c-exposed)' },
    { id: 'epidemia', label: 'Epidemia', color: 'var(--c-infected)' },
    { id: 'pandemia', label: 'Pandemia', color: '#b388ff' }
  ];

  /* ---------------------------------------------------------------------
   * Banco do quiz (7 de Kahoot + 3 novas)
   * ------------------------------------------------------------------- */
  const QUIZ = [
    {
      // Kahoot Q1
      q: 'Qual conceito descreve o aumento repentino de casos de uma doença em uma pequena região geográfica?',
      opts: ['Epidemia', 'Pandemia', 'Endemia', 'Surto'],
      answer: 3,
      feedback:
        '<strong>Surto</strong> é, na prática, uma epidemia geograficamente limitada. ' +
        'Alguns autores usam surto e epidemia como sinônimos, mas “surto” enfatiza a ' +
        'concentração num ponto (uma escola, um bairro, um hospital). Quando o aumento ' +
        'é mais amplo regionalmente, chamamos de epidemia.'
    },
    {
      // Kahoot Q2
      q: 'O que caracteriza uma doença como endêmica?',
      opts: [
        'O aumento repentino em várias regiões',
        'A presença constante e habitual em uma área específica',
        'Uma doença erradicada que reaparece',
        'Uma doença nova em uma população'
      ],
      answer: 1,
      feedback:
        'Endemia é a <strong>presença constante e habitual</strong> de uma doença numa área ' +
        'geográfica específica — os casos ocorrem em número esperado, sem ultrapassar o padrão. ' +
        'Malária em regiões da África, dengue em muitas áreas do Brasil durante o verão ' +
        'são exemplos clássicos.'
    },
    {
      // Kahoot Q4a (primeiro "4" do pdf)
      q: 'Qual das situações abaixo seria classificada como epidemia, e não como surto ou pandemia?',
      opts: [
        'Casos isolados de gripe em uma escola',
        'Aumento significativo de casos de gripe em uma universidade',
        'Propagação mundial do COVID-19',
        'Casos regulares de malária em uma região'
      ],
      answer: 1,
      feedback:
        'Epidemia é o <strong>aumento de casos acima do esperado</strong> numa região mais ampla ' +
        'do que um surto localizado, mas sem atingir a escala intercontinental de uma pandemia. ' +
        'Uma universidade com aumento significativo de gripe se encaixa: maior que um surto de ' +
        'escola isolada, menor que uma pandemia global.'
    },
    {
      // Kahoot Q4b (segundo "4")
      q: 'Qual o conceito epidemiológico que se refere ao local onde os microorganismos vivem, crescem e se multiplicam?',
      opts: ['Vetor', 'Reservatório', 'Porta de entrada', 'Contágio'],
      answer: 1,
      feedback:
        '<strong>Reservatório</strong> é o ambiente — humano, animal ou inanimado — onde o agente ' +
        'infeccioso sobrevive e se multiplica de forma sustentada. Exemplos: morcegos como ' +
        'reservatório de Ebola e raiva; humanos como reservatório de HIV e sarampo; água ' +
        'contaminada como reservatório de cólera (<em>Vibrio cholerae</em>). Um <em>vetor</em> é ' +
        'diferente: transporta o agente, como o Aedes aegypti.'
    },
    {
      // Kahoot Q5b (segundo "5")
      q: 'Uma epidemia localizada em uma pequena cidade, após contaminação da água potável, seria classificada como:',
      opts: ['Surto', 'Pandemia', 'Endemia', 'Casos esporádicos'],
      answer: 0,
      feedback:
        'Um <strong>surto</strong> — epidemia restrita a uma área pequena e bem delimitada, como ' +
        'uma cidade ou bairro. O caso clássico é o próprio surto de cólera em Soho, Londres, em ' +
        '1854 (que exploraremos em detalhe no Módulo 8): água contaminada por uma única bomba ' +
        'causou ~600 mortes em menos de duas semanas num bairro.'
    },
    {
      // Kahoot Q7
      q: 'Qual exemplo ilustra melhor uma pandemia?',
      opts: [
        'Surto de sarampo numa escola',
        'Epidemia de gripe em um campus universitário',
        'Malária endêmica em partes da África',
        'COVID-19 em vários continentes simultaneamente'
      ],
      answer: 3,
      feedback:
        '<strong>Pandemia</strong> exige disseminação intercontinental com número expressivo de ' +
        'casos em muitos países simultaneamente. COVID-19 se tornou pandemia quando a OMS fez a ' +
        'declaração em 11 de março de 2020 — até ali era uma epidemia regional concentrada na ' +
        'China.'
    },
    {
      // Kahoot Q9
      q: 'O que caracteriza um “caso confirmado” de doença em epidemiologia?',
      opts: [
        'Caso suspeito informado às autoridades',
        'Caso comprovado por testes laboratoriais',
        'Caso tratado com sucesso',
        'Caso registrado em qualquer unidade de saúde'
      ],
      answer: 1,
      feedback:
        '<strong>Caso confirmado</strong> exige comprovação laboratorial (cultura, PCR, sorologia) ' +
        'ou preenchimento estrito dos critérios epidemiológicos estabelecidos. É a categoria mais ' +
        'sólida para vigilância e atribuição causal. Difere de <em>caso notificado</em> (qualquer ' +
        'caso comunicado às autoridades, mesmo suspeito) e de <em>caso provável</em> (quadro ' +
        'clínico típico sem confirmação laboratorial).'
    },
    {
      // NOVA: distinção notificado vs confirmado
      scenario: {
        title: 'Unidade Básica de Saúde — segunda-feira cedo',
        body: 'Um homem de 35 anos chega com febre alta, mialgia, dor retro-orbital e rash. Mora em bairro com surto recente de dengue. O médico preenche a ficha de notificação compulsória e solicita sorologia. Aguarda-se o resultado.',
        meta: [
          { label: 'Quadro', value: 'sugestivo de dengue' },
          { label: 'Resultado lab.', value: 'pendente' }
        ]
      },
      q: 'Do ponto de vista epidemiológico, neste momento este paciente representa:',
      opts: [
        'Um caso confirmado de dengue',
        'Um caso notificado (ainda não confirmado)',
        'Um caso descartado',
        'Não é um caso, pois não há confirmação'
      ],
      answer: 1,
      feedback:
        '<strong>Notificado</strong>, sim; <strong>confirmado</strong>, ainda não. A notificação ' +
        'compulsória entra no sistema assim que a suspeita clínica é registrada — isso é fundamental ' +
        'para a vigilância epidemiológica em tempo real. A confirmação só ocorre após o laudo ' +
        'laboratorial ou preenchimento de critérios epidemiológicos específicos. Ambos os níveis ' +
        'importam: a notificação sustenta a resposta rápida, a confirmação refina os dados.'
    },
    {
      // NOVA: fator de risco vs causa
      q: 'Tabagismo está associado a maior incidência de câncer de pulmão. Do ponto de vista epidemiológico, o tabagismo é melhor descrito como:',
      opts: [
        'A causa do câncer de pulmão',
        'Um fator de risco para o câncer de pulmão',
        'Um desfecho do câncer de pulmão',
        'Um reservatório do câncer de pulmão'
      ],
      answer: 1,
      feedback:
        '<strong>Fator de risco</strong> é o termo correto: uma exposição que aumenta a ' +
        'probabilidade do desfecho (câncer), mas não o determina sozinha. Nem todo fumante tem ' +
        'câncer de pulmão, nem todos os cânceres de pulmão são de fumantes — há múltiplas causas ' +
        'componentes. Essa distinção vem dos critérios de Bradford Hill (1965), que formalizaram ' +
        'como inferir causa a partir de associação estatística.'
    },
    {
      // NOVA: reservatório humano
      q: 'Qual das doenças abaixo tem o ser humano como <em>único</em> reservatório conhecido?',
      opts: [
        'Raiva',
        'Sarampo',
        'Dengue',
        'Leptospirose'
      ],
      answer: 1,
      feedback:
        'O <strong>sarampo</strong> tem exclusivamente o ser humano como reservatório — por isso ' +
        'é teoricamente erradicável com vacinação em massa suficientemente alta. Raiva tem ' +
        'reservatórios silvestres (morcegos, cães) além do humano. Dengue tem o mosquito Aedes ' +
        'como vetor, e o ciclo envolve também humanos (reservatório primário em áreas urbanas). ' +
        'Leptospirose tem roedores como reservatório principal. Conhecer o reservatório é ' +
        'essencial para planejar o controle.'
    }
  ];

  /* ---------------------------------------------------------------------
   * Renderização
   * ------------------------------------------------------------------- */

  function renderHeader(container) {
    const header = document.createElement('header');
    header.className = 'module-header';
    header.innerHTML = `
      <span class="module-badge">Módulo 02</span>
      <h1>Conceitos Básicos</h1>
      <p class="module-subtitle">
        O vocabulário que o epidemiologista precisa dominar antes de falar em números:
        endemia, surto, epidemia, pandemia, reservatórios, risco, e os dois níveis de
        certeza de um caso.
      </p>
    `;
    container.appendChild(header);
  }

  function renderEndemiaSection(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>1. Endemia, surto, epidemia, pandemia</h2>
      <p>
        Esses quatro termos diferem em duas dimensões: <strong>quantidade de casos</strong>
        (habitual vs. acima do esperado) e <strong>extensão geográfica</strong>
        (local, regional, ou intercontinental). A tabela mental abaixo ajuda a não confundi-los.
      </p>

      <div class="concept-grid">
        <div class="concept-card concept-endemia">
          <div class="concept-label">Endemia</div>
          <div class="concept-tagline">Habitual, localizada</div>
          <p>
            Presença constante de uma doença numa região específica, em número <em>esperado</em>
            para aquela população e aquele período.
          </p>
          <div class="concept-example"><strong>Exemplo:</strong> malária em várias partes da África;
          dengue em cidades brasileiras durante o verão.</div>
        </div>
        <div class="concept-card concept-surto">
          <div class="concept-label">Surto</div>
          <div class="concept-tagline">Acima do esperado, localizado</div>
          <p>
            Aumento repentino de casos numa área geográfica pequena e bem delimitada
            (uma escola, um bairro, um hospital).
          </p>
          <div class="concept-example"><strong>Exemplo:</strong> sarampo em uma escola após
          contato com viajante não vacinado.</div>
        </div>
        <div class="concept-card concept-epidemia">
          <div class="concept-label">Epidemia</div>
          <div class="concept-tagline">Acima do esperado, regional</div>
          <p>
            Aumento significativo de casos acima do esperado numa área mais ampla
            (cidade, estado, país ou região).
          </p>
          <div class="concept-example"><strong>Exemplo:</strong> surto de Ebola na África
          Ocidental (2014–2016) — Guiné, Serra Leoa, Libéria.</div>
        </div>
        <div class="concept-card concept-pandemia">
          <div class="concept-label">Pandemia</div>
          <div class="concept-tagline">Acima do esperado, intercontinental</div>
          <p>
            Epidemia que atinge vários países e continentes simultaneamente, afetando
            um grande número de pessoas.
          </p>
          <div class="concept-example"><strong>Exemplo:</strong> COVID-19 a partir de março de 2020;
          gripe espanhola em 1918.</div>
        </div>
      </div>

      <div class="callout callout-info">
        <strong>Sobre a palavra “surto”:</strong> alguns autores tratam surto e epidemia como
        sinônimos, diferindo apenas na ênfase (surto realça a concentração num ponto).
        Operacionalmente, a distinção vale a pena: um surto pede ação rápida e focal (quem
        esteve no local?); uma epidemia, ação ampla e coordenada.
      </div>
    `;
    container.appendChild(sec);
  }

  function renderReservatoriosSection(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>2. Reservatórios de microorganismos</h2>
      <p>
        <strong>Reservatório</strong> é o ambiente — humano, animal ou inanimado — onde o agente
        infeccioso sobrevive, se multiplica e permanece disponível para transmissão. Identificar
        o reservatório é ponto de partida para qualquer estratégia de controle: não é possível
        interromper a cadeia epidemiológica sem saber de onde o agente vem.
      </p>

      <div class="reservoir-grid">
        <div class="reservoir-card">
          <h4>Humano</h4>
          <p>Sarampo, HIV, tuberculose pulmonar, hanseníase, sífilis, rubéola.
          Doenças com reservatório exclusivamente humano são, em tese, erradicáveis por
          vacinação universal — como a varíola já foi.</p>
        </div>
        <div class="reservoir-card">
          <h4>Animal</h4>
          <p>Morcegos (raiva, Ebola, coronavírus), roedores (leptospirose, hantavirose),
          cães (raiva), aves (influenza aviária), primatas (febre amarela silvestre).</p>
        </div>
        <div class="reservoir-card">
          <h4>Ambiental</h4>
          <p>Água (cólera — <em>Vibrio cholerae</em> tem reservatório ambiental em copépodes e
          biofilmes estuarinos), solo (tétano, leptospirose secundária),
          superfícies (patógenos nosocomiais persistentes).</p>
        </div>
      </div>
    `;
    container.appendChild(sec);
  }

  function renderRiskSection(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>3. Risco, fator de risco e correlação</h2>
      <p>
        <strong>Risco</strong> é a probabilidade de desenvolver uma doença. Um
        <strong>fator de risco</strong> é qualquer atributo, característica ou exposição
        associado a um aumento dessa probabilidade — mas não necessariamente sua causa direta.
      </p>
      <p>
        A distinção entre causa e fator de risco é sutil e central: tabagismo é fator de risco
        para câncer de pulmão, mas nem todo fumante adoece, nem todo doente é fumante. Fatores
        de risco operam em conjunto — o que chamamos de <em>causas componentes</em> — e raramente
        um único fator é suficiente por si só. Bradford Hill, em 1965, formalizou nove critérios
        para inferir causalidade a partir de associações estatísticas; esse framework continua sendo
        a base da epidemiologia aplicada até hoje.
      </p>
      <div class="definition-row">
        <div class="definition-item">
          <div class="definition-term">Correlação</div>
          <div class="definition-body">Relação estatística entre duas variáveis. Não implica causalidade sozinha.</div>
        </div>
        <div class="definition-item">
          <div class="definition-term">Exposição</div>
          <div class="definition-body">Contato com um fator (agente, comportamento, ambiente) que pode influenciar o desfecho.</div>
        </div>
        <div class="definition-item">
          <div class="definition-term">Desfecho</div>
          <div class="definition-body">Evento final que se investiga — doença, morte, cura, complicação.</div>
        </div>
      </div>
    `;
    container.appendChild(sec);
  }

  function renderCasesSection(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>4. Caso notificado × caso confirmado</h2>
      <p>
        Na vigilância epidemiológica, um caso passa por estágios. A terminologia importa porque
        a contagem entra em painéis oficiais e direciona decisões.
      </p>
      <div class="case-flow">
        <div class="case-flow-step">
          <div class="case-flow-num">1</div>
          <div class="case-flow-title">Suspeito</div>
          <p>Quadro clínico compatível, sem ligação epidemiológica confirmada.</p>
        </div>
        <div class="case-flow-arrow">→</div>
        <div class="case-flow-step">
          <div class="case-flow-num">2</div>
          <div class="case-flow-title">Notificado</div>
          <p>Foi comunicado oficialmente à vigilância. Em doenças de notificação compulsória
          (dengue, sarampo, COVID, TB, hanseníase…) essa etapa é obrigatória.</p>
        </div>
        <div class="case-flow-arrow">→</div>
        <div class="case-flow-step">
          <div class="case-flow-num">3</div>
          <div class="case-flow-title">Provável</div>
          <p>Quadro clínico típico + vínculo epidemiológico, mas sem confirmação laboratorial.</p>
        </div>
        <div class="case-flow-arrow">→</div>
        <div class="case-flow-step">
          <div class="case-flow-num">4</div>
          <div class="case-flow-title">Confirmado</div>
          <p>Laudo laboratorial (PCR, cultura, sorologia) ou preenchimento estrito dos
          critérios epidemiológicos.</p>
        </div>
      </div>
      <p class="muted" style="margin-top:.8rem">
        A decisão de saúde pública geralmente usa <strong>casos notificados</strong> (rápido, em
        tempo real) e, em segundo momento, é corrigida com <strong>casos confirmados</strong>
        (mais lento, mais preciso).
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---- Lab: classificador de cenários ---- */
  function renderClassifier(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>5. Laboratório — classifique cada cenário</h2>
      <p>
        A seguir vêm seis cenários para você classificar. Endemia, surto, epidemia ou pandemia.
      </p>
      <p>
        Em cada um, escolha a categoria que melhor descreve a situação — em seguida o sistema
        mostra a justificativa, útil tanto para confirmar acertos quanto para entender erros.
      </p>
      <div class="classifier-wrap" id="m02-classifier"></div>
    `;
    container.appendChild(sec);

    const wrap = sec.querySelector('#m02-classifier');
    runClassifier(wrap);
  }

  function runClassifier(wrap) {
    const state = {
      idx: 0,
      correct: 0,
      decided: false
    };

    function render() {
      if (state.idx >= CLASSIFIER_SCENARIOS.length) return renderDone();

      const cur = CLASSIFIER_SCENARIOS[state.idx];
      wrap.innerHTML = `
        <div class="activity-header">
          <div class="activity-counter">Cenário ${state.idx + 1} de ${CLASSIFIER_SCENARIOS.length}</div>
          <div class="activity-score">${state.correct} acerto(s)</div>
        </div>
        <div class="scenario-card">
          <div class="scenario-tag">Cenário</div>
          <h3 class="scenario-title">${cur.title}</h3>
          <p class="scenario-body">${cur.body}</p>
        </div>
        <div class="classifier-choices">
          ${CLASSIFIER_OPTIONS.map(op => `
            <button type="button" class="classifier-btn" data-id="${op.id}" style="--c:${op.color}">
              ${op.label}
            </button>
          `).join('')}
        </div>
        <div class="activity-feedback" id="cl-feedback" hidden></div>
        <div class="activity-nav">
          <button type="button" class="btn btn-primary" id="cl-next" hidden>Próximo →</button>
        </div>
      `;

      const fb = wrap.querySelector('#cl-feedback');
      const next = wrap.querySelector('#cl-next');
      const btns = wrap.querySelectorAll('.classifier-btn');

      btns.forEach(b => b.addEventListener('click', () => {
        if (state.decided) return;
        state.decided = true;
        const picked = b.dataset.id;
        const correct = (picked === cur.correct);
        if (correct) state.correct++;

        btns.forEach(bb => {
          bb.disabled = true;
          if (bb.dataset.id === cur.correct) bb.classList.add('correct');
          else if (bb === b) bb.classList.add('wrong');
        });

        fb.hidden = false;
        fb.innerHTML = `<strong>${correct ? 'Correto.' : 'Releia com atenção.'}</strong> ${cur.feedback}`;
        next.hidden = false;
        next.textContent = (state.idx === CLASSIFIER_SCENARIOS.length - 1) ? 'Ver resumo →' : 'Próximo →';
      }));

      next.addEventListener('click', () => {
        state.idx++;
        state.decided = false;
        render();
      });
    }

    function renderDone() {
      const pct = Math.round(100 * state.correct / CLASSIFIER_SCENARIOS.length);
      wrap.innerHTML = `
        <div class="activity-done">
          <div class="activity-counter">Classificador concluído</div>
          <div class="big-score">${state.correct}/${CLASSIFIER_SCENARIOS.length}</div>
          <p class="muted" style="margin:.5rem 0 1.5rem 0">${
            pct === 100 ? 'Mandou bem. Você distingue os quatro conceitos sem oscilar.' :
            pct >= 70 ? 'Bom. Revise o cenário que você errou — costuma haver um termo que confunde.' :
            'Releia a Seção 1 e volte aqui. Essa distinção é a base de todos os próximos módulos.'
          }</p>
          <button type="button" class="btn btn-ghost" id="cl-redo">Refazer classificador</button>
        </div>
      `;
      wrap.querySelector('#cl-redo').addEventListener('click', () => {
        state.idx = 0; state.correct = 0; state.decided = false; render();
      });
    }

    render();
  }

  /* ---- Atividade (quiz) ---- */
  function renderActivity(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>6. Atividade — dez perguntas</h2>
      <p>
        Dez perguntas para consolidar os conceitos do módulo, incluindo um mini-cenário
        clínico sobre caso notificado × confirmado — uma distinção que aparece com
        frequência em prova e na prática.
      </p>
      <div class="activity-box" id="m02-activity"></div>
    `;
    container.appendChild(sec);

    EDL.quiz.run(sec.querySelector('#m02-activity'), { bank: QUIZ });
  }

  function renderFooter(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>Próximos passos</h2>
      <p>
        Com o vocabulário firme, o <strong>Módulo 3 — Cadeia Epidemiológica</strong>
        vai abrir a caixa preta da transmissão: de onde o agente vem, como sai do
        reservatório, como chega ao próximo hospedeiro, e onde podemos intervir para
        quebrar a cadeia. Ainda em construção — volte em breve.
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Registro
   * ------------------------------------------------------------------- */
  EDL.registerModule({
    id: '02-conceitos',
    number: 2,
    icon: '📚',
    title: 'Conceitos Básicos',
    subtitle: 'Endemia, surto, epidemia, pandemia. Reservatórios, risco, caso notificado.',
    status: 'available',
    quizCount: QUIZ.length,
    render(container) {
      renderHeader(container);
      renderEndemiaSection(container);
      renderReservatoriosSection(container);
      renderRiskSection(container);
      renderCasesSection(container);
      renderClassifier(container);
      renderActivity(container);
      EDL.refs.renderModuleSection(container, 2);
      renderFooter(container);
    }
  });
})();
