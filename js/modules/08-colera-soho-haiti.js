/* =========================================================================
 * EDL — Módulo 08: Caso Histórico — Cólera (Soho 1854 + Haiti 2010)
 *
 * O mais longo dos módulos. Um estudo de caso comparativo usando dados reais:
 *
 *   - Soho 1854: dataset completo do pacote R `cholera` (Peter Li) com as
 *     321 posições de mortes, 13 bombas, 658 segmentos de rua e atribuição
 *     por bomba (euclidiana e por caminhada, via Dijkstra no grafo de ruas).
 *
 *   - Haiti 2010: série mensal de casos e mortes oficialmente registrada
 *     pelo MSPP do Haiti, outubro/2010 a março/2016 (66 observações,
 *     772.679 casos, 9.295 mortes).
 *
 * Estrutura do módulo:
 *   1. Contexto Londres 1854 (miasma, Great Stink, sanitação)
 *   2. John Snow — biografia curta
 *   3. Timeline do surto de Broad Street
 *   4. Mapa interativo (D3) com toggle euclidiano/caminhada
 *   5. "The Grand Experiment" — tabela Southwark & Vauxhall × Lambeth
 *   6. Haiti 2010 — narrativa
 *   7. Gráfico temporal do Haiti (D3)
 *   8. Comparação Soho × Haiti — o que mudou em 156 anos
 *   9. Quiz
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * CitationManager — atribui números Vancouver às chaves bibtex na ordem
   * em que cada uma aparece no texto. Reinicializado a cada render() para
   * que recarregar o módulo zere a numeração.
   *
   * Ver js/core/citations.js para a API completa. Uso típico:
   *   `<p>... 70 mil mortes${cite('snow1855cholera')}.</p>`
   *   `<p>... cepa nepalesa${cite('piarroux2011haiti', 'orata2014haiti')}.</p>`
   * ------------------------------------------------------------------- */
  let cm = null;
  const cite = function () {
    if (!cm) return '';
    return cm.cite.apply(cm, arguments);
  };

  /**
   * Renderiza um card de erro quando um dataset necessário não foi carregado.
   * Loga no console para facilitar debug em desenvolvimento.
   *
   * @param {HTMLElement} container — onde inserir o card
   * @param {string} datasetName    — nome legível do dataset (ex: "Soho 1854")
   * @param {string} globalKey      — chave esperada em window.EDL.data.*
   * @param {string} filePath       — caminho relativo do arquivo que deveria definir o dataset
   */
  function renderDataError(container, datasetName, globalKey, filePath) {
    console.error(
      `[EDL/Módulo 8] Dataset ausente: window.EDL.data.${globalKey}. ` +
      `Esperado ter sido carregado por ${filePath}. ` +
      `Verifique se o arquivo está acessível e se o <script> correspondente foi incluído em index.html antes do módulo.`
    );
    const card = document.createElement('div');
    card.className = 'data-error-card';
    card.setAttribute('role', 'alert');
    const h = document.createElement('h3');
    h.textContent = `Dataset não disponível: ${datasetName}`;
    const p1 = document.createElement('p');
    p1.textContent =
      `Este componente depende do arquivo ${filePath}, que não foi carregado corretamente. ` +
      `O restante do módulo continua acessível; apenas esta seção foi omitida.`;
    const p2 = document.createElement('p');
    p2.className = 'muted';
    p2.style.fontSize = '.85rem';
    p2.textContent = `Detalhe técnico (para desenvolvedores): window.EDL.data.${globalKey} está undefined. Veja o console para mais informação.`;
    card.append(h, p1, p2);
    container.appendChild(card);
  }

  /* ---------------------------------------------------------------------
   * Timeline do surto (eventos documentados)
   *
   * IMPORTANTE: a fábrica é função (e não constante) porque cada `body`
   * usa cite(...) — e cite só funciona depois que o CitationManager foi
   * criado em render(). Construir o array no momento da renderização
   * garante que os números Vancouver são atribuídos corretamente.
   * ------------------------------------------------------------------- */
  function buildTimeline() {
    return [
      { date: '28 ago 1854', title: 'Primeira morte em Broad Street',
        body: `Uma bebê com diarreia severa morre no n.º 40 de Broad Street, coração do Soho. As fraldas sujas são lavadas no quintal — e a água escoa para a fossa negra que fica a pouco mais de um metro do poço público de onde sai a bomba d'água da rua. Ninguém faz essa conexão na hora${cite('johnson2006ghostmap', 'snow1855cholera')}.` },
      { date: '31 ago 1854', title: 'Surto explode',
        body: `Dezenas de mortes em 24 horas. A população começa a fugir do bairro. Famílias inteiras sucumbem à desidratação em poucas horas — a cólera tem incubação curta, da ordem de 12 horas a 5 dias${cite('azman2013cholera')}. O bairro tem ~7.000 moradores — em pouco tempo, um em cada doze estará morto ou doente${cite('johnson2006ghostmap')}.` },
      { date: '02 set 1854', title: 'Pico de letalidade',
        body: `Aproximadamente 200 mortes em um único dia. John Snow, médico que mora a poucas quadras, inicia sua investigação. Caminha de casa em casa registrando onde cada vítima obtinha água${cite('johnson2006ghostmap', 'snow1855cholera')}.` },
      { date: '07 set 1854', title: 'Snow apresenta os dados',
        body: `Snow leva a análise ao Conselho de Governadores e Diretores de St. James, mostrando a concentração das mortes em torno da bomba de Broad Street. Argumenta por sua remoção — os governadores, embora céticos, concordam${cite('johnson2006ghostmap', 'snow1855cholera')}.` },
      { date: '08 set 1854', title: 'Alça da bomba é removida',
        body: `A alça da bomba de Broad Street é desparafusada, impedindo que mais água seja retirada. O surto já dava sinais de declínio natural (a população fugira do bairro; os casos graves estavam mortos ou em recuperação) — mas o gesto entra para a história como o primeiro ato moderno de saúde pública baseado em evidência epidemiológica${cite('johnson2006ghostmap', 'snow1855cholera', 'cook2001prevention')}.` },
      { date: 'out 1854', title: 'Snow e Whitehead começam a colaborar',
        body: `O reverendo Henry Whitehead, que inicialmente duvidava da tese de Snow, percorre o bairro entrevistando sobreviventes. Whitehead identifica o caso-índice (a bebê do n.º 40) e, convertido pelos dados, passa a defender a hipótese hídrica${cite('johnson2006ghostmap')}.` },
      { date: 'dez 1854', title: 'O mapa é apresentado',
        body: `Snow apresenta na Sociedade Epidemiológica de Londres o famoso mapa que hoje aparece em todo livro-texto. Diferente da lenda, o mapa não foi criado no calor da investigação — foi construído metodicamente, quatro meses depois, a partir de todos os óbitos registrados${cite('johnson2006ghostmap', 'snow1855cholera')}.` },
      { date: '1855', title: '"The Grand Experiment"',
        body: `Snow publica a 2ª edição de On the Mode of Communication of Cholera, incluindo o estudo comparativo das empresas de água Southwark & Vauxhall (captação em Londres, abaixo dos despejos) e Lambeth (captação em Thames Ditton, acima). A taxa de mortalidade em S&V é ~8–9 vezes maior${cite('snow1855cholera')}. Apesar da força da evidência, o trabalho é minimizado pelo Lancet e pela maioria dos sanitaristas miasmatistas${cite('cook2001prevention')}.` },
      { date: 'jun 1858', title: 'Snow morre aos 45 anos',
        body: `John Snow morre em 16 de junho de 1858, provavelmente de AVC, sem ver sua tese universalmente aceita${cite('johnson2006ghostmap')}. Dois meses depois, Londres entra no "Great Stink" — e a reforma sanitária que começa ali, embora motivada pela teoria miasmática errada, acabará validando a tese hídrica de Snow na prática${cite('halliday2013great', 'cook2001prevention')}.` }
    ];
  }

  /* ---------------------------------------------------------------------
   * Quiz — 6 perguntas cobrindo ambos os casos
   * ------------------------------------------------------------------- */
  const QUIZ = [
    {
      q: 'O que tornou a contribuição de John Snow cientificamente revolucionária para além da remoção da alça da bomba?',
      opts: [
        'Ele inventou o termo "epidemiologia"',
        'O "Grand Experiment" — comparação estatística entre clientes de duas companhias de água com diferentes fontes de captação',
        'Ele descobriu o Vibrio cholerae no microscópio',
        'Ele administrou clorofórmio à rainha Vitória'
      ],
      answer: 1,
      feedback:
        'A remoção da alça é o gesto icônico. O <strong>Grand Experiment</strong> é a contribuição ' +
        'metodológica duradoura: Snow comparou a mortalidade por cólera entre clientes da Southwark ' +
        '& Vauxhall (água retirada do Tâmisa à jusante dos esgotos) e da Lambeth (captação acima ' +
        'dos despejos). A mortalidade em S&V foi ~8–9× maior. É o primeiro estudo quase-experimental ' +
        'da história, décadas antes da bacteriologia. Snow de fato administrou clorofórmio à rainha ' +
        '(opção d, verdadeiro mas não responde à pergunta); o Vibrio foi visto por Filippo Pacini em ' +
        '1854 e confirmado por Robert Koch em 1884, ambos independentemente de Snow.'
    },
    {
      scenario: {
        title: 'Soho, Londres — fim de agosto de 1854',
        body: 'Um bairro com ~7.000 moradores, fossas negras transbordantes nos porões, teoria dominante da época: as doenças se propagam pelo mau cheiro dos "miasmas" que emanam do solo e das águas paradas.',
        meta: [{ label: 'Teoria dominante', value: 'Miasmática' }, { label: 'Bacteriologia', value: 'ainda não existe' }]
      },
      q: 'Por que a teoria miasmática era aparentemente razoável para os médicos do século XIX?',
      opts: [
        'Porque eles eram cientificamente pouco sofisticados',
        'Porque o cheiro e a doença de fato correlacionavam-se: lugares fedorentos eram insalubres',
        'Porque não existia mapa de Londres',
        'Porque Snow ainda não havia publicado sua monografia'
      ],
      answer: 1,
      feedback:
        'Correlação não é causalidade — lição de epidemiologia básica. Lugares fedorentos eram ' +
        'insalubres, sim, mas não por causa do ar: por causa da <em>mesma causa que gerava o ' +
        'cheiro</em> (esgoto humano em contato com água e comida). A teoria miasmática era ' +
        '<strong>empiricamente razoável</strong> — as intervenções miasmáticas (drenar pântanos, ' +
        'limpar ruas) funcionavam! — mas pelo mecanismo errado. Foi preciso Snow e, depois, Koch ' +
        'para separar o cheiro da contaminação hídrica.'
    },
    {
      q: 'No dataset real do mapa de Snow (usado acima), qual bomba recebe a maior parte das mortes quando se atribui cada endereço à bomba mais próxima por caminhada?',
      opts: [
        'Rupert Street',
        'Dean Street',
        'Broad Street',
        'A atribuição é aproximadamente uniforme entre as bombas'
      ],
      answer: 2,
      feedback:
        '<strong>387 das 578 mortes (67%)</strong> têm a bomba de Broad Street como mais próxima ' +
        'por caminhada — no cálculo feito a partir do grafo real de ruas do bairro. A análise euclidiana ' +
        '(em linha reta) atribui 361 mortes a Broad Street; a análise por caminhada aumenta esse número ' +
        'porque algumas ruas não têm passagem direta para as bombas aparentemente mais próximas, e ' +
        'os moradores acabavam indo até Broad Street mesmo. Essa nuance é perdida quando se olha o ' +
        'mapa sem considerar a topologia das ruas.'
    },
    {
      q: 'A epidemia de cólera no Haiti (2010–2016) teve como origem:',
      opts: [
        'O terremoto de janeiro de 2010, que liberou cólera enterrada no solo',
        'Contaminação importada por tropas de paz da ONU (MINUSTAH) vindas do Nepal',
        'Água pluvial contaminada na estação chuvosa',
        'Surto espontâneo no Artibonite'
      ],
      answer: 1,
      feedback:
        'A análise genômica de 2011-2014 confirmou inequivocamente: a cepa de <em>Vibrio cholerae</em> ' +
        'no Haiti era idêntica à cepa circulante no Nepal. O surto se originou de um <strong>acampamento ' +
        'de paz da MINUSTAH</strong> (tropas nepalesas) em Meille, cujo saneamento precário contaminou ' +
        'o rio Artibonite — a principal fonte de água do país. A ONU levou anos para reconhecer a ' +
        'responsabilidade (reconhecimento formal em 2016). No total: 697 mil casos e ~9.3 mil mortes ' +
        'até 2016 (pico em dezembro de 2010, com 94.617 casos em um único mês).'
    },
    {
      q: 'Comparando Soho 1854 e Haiti 2010, qual lição epidemiológica <strong>atemporal</strong> fica clara?',
      opts: [
        'Cólera sempre pode ser evitada com vacina',
        'Sem saneamento básico, a cólera continua se propagando pelos mesmos mecanismos, independentemente do avanço científico',
        'A cólera deixa imunidade permanente após a infecção',
        'Os dois surtos tiveram origem na mesma bactéria que sobreviveu 156 anos em estado latente'
      ],
      answer: 1,
      feedback:
        'A lição central: <strong>a cadeia epidemiológica da cólera (fecal-oral via água) não mudou ' +
        'em 156 anos</strong>. O que muda é a nossa capacidade de reagir — Snow precisou de observação ' +
        'e estatística espacial em 1854; no Haiti, tínhamos sequenciamento genômico em tempo ' +
        'quase-real em 2010. Mas ambos os surtos explodiram pela mesma razão subjacente: ' +
        'infraestrutura sanitária inadequada. A vacina contra cólera existe (CVD 103-HgR, Shanchol) ' +
        'mas é subutilizada globalmente; a imunidade natural não é duradoura; e o <em>V. cholerae</em> ' +
        'do Nepal não é o mesmo do Soho — são cepas diferentes, mostrando que a cólera se reinventa ' +
        'recorrentemente.'
    },
    {
      q: 'Sobre a remoção da alça da bomba em 8 de setembro de 1854, a leitura historicamente mais correta é:',
      opts: [
        'Foi o ato que imediatamente encerrou o surto, salvando centenas de vidas',
        'Foi um gesto simbólico que ocorreu quando o surto já declinava naturalmente por fuga da população; o valor histórico está em ser um ato baseado em evidência epidemiológica',
        'Foi irrelevante — o surto continuou por semanas',
        'Não ocorreu — é um mito historiográfico'
      ],
      answer: 1,
      feedback:
        'A alça foi de fato removida, mas o surto já estava em declínio — a maior parte dos moradores ' +
        'havia fugido do bairro e os casos agudos estavam mortos ou recuperando. O <strong>valor ' +
        'histórico do gesto</strong> está no que ele representa, não no impacto numérico imediato: ' +
        'foi a primeira vez que uma autoridade sanitária agiu com base em <em>evidência epidemiológica ' +
        'espacial</em> contra a teoria dominante. A partir desse momento, epidemiologia deixa de ser ' +
        'curiosidade estatística e vira ferramenta de ação pública.'
    }
  ];

  /* =====================================================================
   * Renderização — seções
   * =================================================================== */

  function renderSectionHeader(container, number, title) {
    const s = document.createElement('section');
    s.className = 'module-section-major';
    s.innerHTML = `
      <div class="section-header-major">
        <span class="section-number">SEÇÃO ${number}</span>
        <h2>${title}</h2>
      </div>
    `;
    container.appendChild(s);
  }

  function renderHeader(container) {
    const h = document.createElement('header');
    h.className = 'module-header';
    h.innerHTML = `
      <span class="module-badge">Módulo 08</span>
      <h1>Casos Históricos<br>Cólera: Soho (1854) e Haiti (2010)</h1>
      <p class="module-subtitle">
        Dois surtos de cólera, 156 anos de distância. A mesma cadeia de transmissão, o mesmo
        veículo, respostas de saúde pública radicalmente distintas. O que persiste, o que mudou,
        e o que ainda não aprendemos.
      </p>
    `;
    container.appendChild(h);
  }

  function renderLondonContext(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>1. Londres em 1854</h2>
      <p>
        Em meados do século XIX, Londres figurava entre as maiores cidades do mundo. Em 1854, sua população era de aproximadamente 2,5 milhões de habitantes${cite('johnson2006ghostmap', 'halliday2013great')}. Mas as condições sanitárias
        eram medievais. Cavalos, vacas e porcos defecavam nas ruas. Em cada casa havia uma fossa negra no
        porão que transbordava periodicamente — quando esvaziada, seu conteúdo era despejado no Tâmisa
        ou jogado na rua${cite('johnson2006ghostmap', 'halliday2013great')}. O fedor do rio era tão intenso que, em 1858, durante o verão quente
        conhecido como <em>Great Stink</em>, o Parlamento precisaria suspender suas sessões por dias${cite('halliday2013great')}.
      </p>
      <p>
        A teoria dominante para explicar as doenças era a <strong>teoria miasmática</strong>: o ar
        viciado, o mau cheiro emanado da matéria orgânica em decomposição, transmitia enfermidades.
        Era uma teoria empiricamente razoável — lugares fedorentos, de fato, eram insalubres. A
        confusão, que Snow ia desfazer, era de <em>mecanismo</em>: o mau cheiro e a doença tinham uma
        <strong>causa comum</strong> (a contaminação fecal), não uma relação direta causa-efeito${cite('johnson2006ghostmap', 'snow1855cholera')}.
      </p>
      <p>
        Entre 1831 e 1854, Londres enfrentava três grandes epidemias de cólera, totalizando mais de
        <strong>70 mil mortes</strong>${cite('snow1855cholera')}. Ninguém sabia o que causava a doença. Em meados de 1854, uma
        nova onda vinha chegando.
      </p>
    `;
    container.appendChild(s);
  }

  function renderSnowBio(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>2. John Snow (1813–1858) — dois legados</h2>
      <p>
        Snow era um médico atípico para a época. Nascido em York em uma família humilde, trabalhou
        como aprendiz de cirurgião e eventualmente se estabeleceu em Londres. Fez nome na
        <strong>anestesia</strong> — estudou a farmacocinética do éter e do clorofórmio
        com rigor quantitativo, publicou uma tabela de concentrações em 1847 que se tornou referência,
        e em abril de 1853 administrou clorofórmio à rainha Vitória durante o parto do príncipe
        Leopoldo${cite('johnson2006ghostmap')}. Foi ele, em grande parte, quem fez a anestesia virar prática médica respeitável
        na Inglaterra.
      </p>
      <p>
        Em paralelo, desde 1849 Snow vinha desenvolvendo uma hipótese herética: que a cólera não
        era um miasma, mas uma doença transmitida pela água contaminada, ingerida oralmente, com
        período de incubação de horas a poucos dias. Na primeira edição de <em>On the Mode of
        Communication of Cholera</em> (1849), ele expunha o raciocínio${cite('snow1855cholera')}. Era ignorado.
      </p>
      <p>
        Quando o surto de Soho explodiu em agosto de 1854, Snow morava a poucas quadras. A uma
        distância que permitia investigação em tempo real. Era sua oportunidade.
      </p>
    `;
    container.appendChild(s);
  }

  function renderSnowPortraitCard(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <div class="snow-portrait-card">
        <img src="assets/images/john-snow-portrait-GPT.png" alt="John Snow (1813–1858), physician and pioneer of epidemiology" class="snow-portrait-image" />
        <div class="snow-portrait-text">
          <h3>John Snow (1813–1858)</h3>
          <p class="snow-dates">Médico pioneiro da epidemiologia moderna</p>
          <p>
            Snow dedicou sua carreira a duas revoluções científicas: a <strong>anestesia</strong> e a <strong>epidemiologia</strong>.
            Seu rigor quantitativo em ambas as áreas o distinguia dos contemporâneos.
          </p>
          <p>
            Neste momento (agosto de 1854), Snow estava prestes a conduzir a investigação que o tornaria imortal:
            mapear com precisão onde cada morte por cólera ocorreu, identificar a bomba de Broad Street como fonte,
            e apresentar ao mundo uma prova irrefutável de que a cólera não era miasmática — era hídrica.
          </p>
          <p style="margin-top: 1rem; padding: 0.8rem; background: rgba(0, 217, 192, 0.1); border-left: 3px solid var(--accent); border-radius: 4px;">
            <strong>Legado:</strong> Snow morreria em 1858, sem ver sua tese universalmente aceita. Mas 30 anos depois, Koch isolaria
            o <em>Vibrio cholerae</em>, validando tudo que Snow havia provado com observação e estatística${cite('johnson2006ghostmap', 'cook2001prevention')}.
          </p>
        </div>
      </div>
    `;
    container.appendChild(s);
  }

  function renderComplementaryMaterial(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>Material complementar</h2>
      <p>
        <strong>Curta-metragem: <em>Snow</em></strong>, de Isaac Ergas
      </p>
      <p>
        O filme apresenta, de forma dramatizada, a investigação de John Snow durante a epidemia de cólera
        em Londres, em 1854, ajudando a visualizar o contexto urbano, sanitário e epidemiológico da época.
      </p>
      <p>
        <strong>Disponível em:</strong>
      </p>
      <ul style="margin: 0.5rem 0 0 1.5rem;">
        <li><strong>YouTube:</strong> <a href="https://www.youtube.com/watch?v=qATr4D_lqZU" target="_blank" rel="noopener">https://www.youtube.com/watch?v=qATr4D_lqZU</a></li>
        <li><strong>YouTube (alternativo):</strong> <a href="https://www.youtube.com/watch?v=0B1oKBN9lhM" target="_blank" rel="noopener">https://www.youtube.com/watch?v=0B1oKBN9lhM</a></li>
        <li><strong>IMDb:</strong> <a href="https://www.imdb.com/pt/title/tt2061801/" target="_blank" rel="noopener">https://www.imdb.com/pt/title/tt2061801/</a></li>
      </ul>
    `;
    container.appendChild(s);
  }

  function renderTimelineSection(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>3. O surto de Broad Street — cronologia</h2>
      <p>
        Clique em cada evento para expandir a narrativa.
      </p>
      <div class="colera-timeline" id="m08-timeline"></div>
    `;
    container.appendChild(s);

    const wrap = s.querySelector('#m08-timeline');
    const timeline = buildTimeline();
    timeline.forEach((ev, i) => {
      const item = document.createElement('div');
      item.className = 'colera-timeline-item';
      item.innerHTML = `
        <div class="colera-timeline-date">${ev.date}</div>
        <button type="button" class="colera-timeline-head">
          <span class="colera-timeline-title">${ev.title}</span>
          <span class="colera-timeline-toggle" aria-hidden="true">+</span>
        </button>
        <div class="colera-timeline-body" hidden>
          <p>${ev.body}</p>
        </div>
      `;
      const head = item.querySelector('.colera-timeline-head');
      const body = item.querySelector('.colera-timeline-body');
      const toggle = item.querySelector('.colera-timeline-toggle');
      head.addEventListener('click', () => {
        const expanded = !body.hidden;
        body.hidden = expanded;
        item.classList.toggle('open', !expanded);
        toggle.textContent = expanded ? '+' : '−';
      });
      // Abre o primeiro por padrão
      if (i === 0) head.click();
      wrap.appendChild(item);
    });
  }

  /* ---------------------------------------------------------------------
   * Mapa interativo — o coração do módulo
   * ------------------------------------------------------------------- */
  function renderSohoMap(container) {
    const data = EDL.data && EDL.data.soho1854;
    if (!data) {
      renderDataError(container, 'Mapa de Soho (1854)', 'soho1854',
                      'assets/data/soho-1854-cholera.js');
      return;
    }

    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>4. O mapa de Snow — reconstruído com dados reais</h2>
      <p>
        O mapa abaixo reproduz a análise espacial de Snow com os
        <strong>${data.summary.totalDeaths} óbitos em ${data.summary.totalAnchors} endereços</strong>
        digitalizados por Dodson & Tobler (1992)${cite('dodson1992snow')} e mantidos no pacote R <em>cholera</em> (Peter Li)${cite('li2018cholera')}.
        As 13 bombas do distrito estão marcadas; a de <strong>Broad Street</strong> (destacada em
        vermelho) é a contaminada${cite('snow1855cholera')}.
      </p>
      <div class="colera-map-controls" id="m08-map-controls"></div>
      <div class="colera-map-wrap" id="m08-map-wrap"></div>
      <div class="colera-map-info" id="m08-map-info"></div>
      <p class="muted" style="margin-top:.8rem">
        Tamanho dos círculos proporcional ao número de mortes no endereço (1 a 18 óbitos). A
        digitalização das coordenadas é de Dodson & Tobler (1992); a atribuição por
        caminhada foi recalculada via Dijkstra sobre os 658 segmentos de rua do grafo original${cite('dodson1992snow', 'li2018cholera')}.
      </p>
    `;
    container.appendChild(s);

    const controlsEl = s.querySelector('#m08-map-controls');
    const mapEl = s.querySelector('#m08-map-wrap');
    const infoEl = s.querySelector('#m08-map-info');

    // Estado do mapa
    const mapState = {
      mode: 'nenhum',      // 'nenhum' | 'euclidiano' | 'caminhada'
      highlightPump: null   // id da bomba destacada (null = nenhum)
    };

    // Controles de modo
    const modes = [
      { id: 'nenhum',      label: 'Mostrar só mortes e bombas' },
      { id: 'euclidiano',  label: 'Colorir por bomba mais próxima (linha reta)' },
      { id: 'caminhada',   label: 'Colorir por bomba mais próxima (caminhada)' }
    ];
    controlsEl.innerHTML = `
      <div class="colera-map-toggles">
        ${modes.map(m => `<button type="button" class="colera-mode-btn${m.id === mapState.mode ? ' active' : ''}" data-mode="${m.id}">${m.label}</button>`).join('')}
      </div>
    `;
    controlsEl.querySelectorAll('.colera-mode-btn').forEach(b => {
      b.addEventListener('click', () => {
        mapState.mode = b.dataset.mode;
        controlsEl.querySelectorAll('.colera-mode-btn').forEach(bb => bb.classList.toggle('active', bb === b));
        drawMap();
      });
    });

    drawMap();

    function drawMap() {
      const d3 = window.d3;
      mapEl.innerHTML = '';

      const W = mapEl.clientWidth || 700;
      const H = 560;

      const svg = d3.select(mapEl).append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label',
          `Mapa de Soho em 1854: 321 endereços com mortes por cólera (total de ${data.summary.totalDeaths}) ` +
          `em torno de 13 bombas de água públicas. A bomba de Broad Street é destacada em vermelho ` +
          `como fonte contaminada. Dataset reconstruído a partir do pacote R cholera (Peter Li).`)
        .style('width', '100%').style('height', 'auto')
        .style('background', '#0f1422').style('border-radius', '10px');

      // Escalas — mantém proporção, com padding
      const bbox = data.bbox;
      const pad = 15;
      const dataAspect = (bbox.xmax - bbox.xmin) / (bbox.ymax - bbox.ymin);
      const plotAspect = (W - 2 * pad) / (H - 2 * pad);

      let plotW, plotH;
      if (dataAspect > plotAspect) {
        plotW = W - 2 * pad;
        plotH = plotW / dataAspect;
      } else {
        plotH = H - 2 * pad;
        plotW = plotH * dataAspect;
      }
      const offsetX = (W - plotW) / 2;
      const offsetY = (H - plotH) / 2;

      const xs = d3.scaleLinear().domain([bbox.xmin, bbox.xmax]).range([offsetX, offsetX + plotW]);
      const ys = d3.scaleLinear().domain([bbox.ymin, bbox.ymax]).range([offsetY + plotH, offsetY]);

      // Paleta de cores por bomba (só se em modo colorido)
      const pumpColors = {
        1:  '#ffb84d', 2:  '#74c0fc', 3:  '#51cf66', 4:  '#b388ff',
        5:  '#e599f7', 6:  '#c0eb75', 7:  '#ff6b6b', 8:  '#4dd0e1',
        9:  '#ff922b', 10: '#ffd93d', 11: '#66d9e8', 12: '#fcc2d7',
        13: '#d0ebff'
      };
      const greyDot = '#45526e';

      // 1) Ruas
      const g = svg.append('g');
      g.append('g').attr('class', 'colera-roads')
        .selectAll('line')
        .data(data.roads)
        .join('line')
        .attr('x1', d => xs(d.x1)).attr('y1', d => ys(d.y1))
        .attr('x2', d => xs(d.x2)).attr('y2', d => ys(d.y2))
        .attr('stroke', '#2a3449')
        .attr('stroke-width', 1.2);

      // 2) Deaths
      const colorFor = (d) => {
        if (mapState.mode === 'euclidiano') return pumpColors[d.eucl] || greyDot;
        if (mapState.mode === 'caminhada')  return pumpColors[d.walk] || greyDot;
        return '#ff6b6b';   // modo "nenhum" — todas vermelhas
      };

      const shouldHighlight = (d) => {
        if (!mapState.highlightPump) return 1;
        const pid = (mapState.mode === 'caminhada') ? d.walk :
                    (mapState.mode === 'euclidiano') ? d.eucl : null;
        if (pid === null) return 0.35;  // no modo "nenhum", escurece tudo
        return pid === mapState.highlightPump ? 1 : 0.18;
      };

      g.append('g').attr('class', 'colera-deaths')
        .selectAll('circle')
        .data(data.deaths)
        .join('circle')
        .attr('cx', d => xs(d.x))
        .attr('cy', d => ys(d.y))
        .attr('r', d => Math.min(6, 2 + Math.sqrt(d.count)))
        .attr('fill', colorFor)
        .attr('fill-opacity', shouldHighlight)
        .attr('stroke', '#0a0e1a')
        .attr('stroke-width', 0.5);

      // 3) Pumps
      const pumpG = g.append('g').attr('class', 'colera-pumps');
      data.pumps.forEach(p => {
        const gp = pumpG.append('g')
          .attr('transform', `translate(${xs(p.x)},${ys(p.y)})`)
          .style('cursor', 'pointer');

        const dim = mapState.highlightPump && mapState.highlightPump !== p.id ? 0.3 : 1;

        // Halo
        gp.append('circle')
          .attr('r', p.contaminated ? 10 : 8)
          .attr('fill', 'none')
          .attr('stroke', p.contaminated ? '#ff6b6b' : '#00d9c0')
          .attr('stroke-width', p.contaminated ? 2.5 : 1.5)
          .attr('opacity', dim);

        // Marcador
        gp.append('circle')
          .attr('r', p.contaminated ? 5 : 4)
          .attr('fill', p.contaminated ? '#ff6b6b' : '#00d9c0')
          .attr('opacity', dim);

        // Rótulo
        gp.append('text')
          .attr('x', 0).attr('y', p.contaminated ? -14 : -12)
          .attr('text-anchor', 'middle')
          .attr('fill', p.contaminated ? '#ff6b6b' : '#a8b3c4')
          .style('font-size', p.contaminated ? '11px' : '10px')
          .style('font-weight', p.contaminated ? '600' : '500')
          .style('font-family', 'Inter, sans-serif')
          .style('paint-order', 'stroke')
          .style('stroke', '#0f1422').style('stroke-width', '3px')
          .attr('opacity', dim)
          .text(p.street);

        gp.on('click', () => {
          mapState.highlightPump = mapState.highlightPump === p.id ? null : p.id;
          drawMap();
          updateInfo();
        });
      });

      // Legenda (modo colorido)
      if (mapState.mode !== 'nenhum') {
        const legend = svg.append('g').attr('class', 'colera-legend')
          .attr('transform', `translate(${W - 160},${20})`);
        legend.append('rect')
          .attr('width', 145).attr('height', data.pumps.length * 16 + 12)
          .attr('rx', 6).attr('fill', 'rgba(10,14,26,.88)').attr('stroke', '#2a3449');
        data.pumps.slice().sort((a, b) => a.id - b.id).forEach((p, i) => {
          legend.append('circle')
            .attr('cx', 14).attr('cy', 16 + i * 16)
            .attr('r', 4).attr('fill', pumpColors[p.id] || greyDot);
          legend.append('text')
            .attr('x', 24).attr('y', 20 + i * 16)
            .attr('fill', p.contaminated ? '#ff6b6b' : '#a8b3c4')
            .style('font-size', '10px')
            .style('font-family', 'Inter, sans-serif')
            .style('font-weight', p.contaminated ? '600' : '400')
            .text(`#${p.id} ${p.street}`);
        });
      }

      updateInfo();
    }

    function updateInfo() {
      if (!mapState.highlightPump) {
        infoEl.innerHTML = `
          <p class="muted">
            Dica: clique em qualquer bomba para filtrar as mortes atribuídas a ela. Troque o modo
            acima para comparar atribuição euclidiana (linha reta) versus caminhada (grafo de ruas).
          </p>
        `;
        return;
      }

      const pump = data.pumps.find(p => p.id === mapState.highlightPump);
      const nW = data.summary.byPumpWalking[mapState.highlightPump] || 0;
      const nE = data.summary.byPumpEuclidean[mapState.highlightPump] || 0;
      const pctW = (nW / data.summary.totalDeaths * 100).toFixed(1).replace('.', ',');
      const pctE = (nE / data.summary.totalDeaths * 100).toFixed(1).replace('.', ',');

      infoEl.innerHTML = `
        <div class="colera-pump-info">
          <h3>Bomba #${pump.id} — ${pump.street}</h3>
          ${pump.contaminated ? '<p style="color:var(--danger);margin:.3rem 0"><strong>Bomba contaminada</strong> — fonte do surto.</p>' : ''}
          <div class="colera-pump-stats">
            <div>
              <div class="colera-stat-label">Mortes mais próximas (linha reta)</div>
              <div class="colera-stat-value">${nE}</div>
              <div class="colera-stat-sub">${pctE}% do total</div>
            </div>
            <div>
              <div class="colera-stat-label">Mortes mais próximas (caminhada)</div>
              <div class="colera-stat-value" style="color:var(--accent)">${nW}</div>
              <div class="colera-stat-sub">${pctW}% do total</div>
            </div>
          </div>
          <p class="muted" style="margin-top:.6rem;font-size:.88rem">Clique novamente na bomba para remover o filtro.</p>
        </div>
      `;
    }

    // Responsividade
    let rafId;
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(drawMap);
    };
    window.addEventListener('resize', onResize, { passive: true });
    EDL.onModuleDestroy(() => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  /* ---------------------------------------------------------------------
   * Grand Experiment — tabela
   * ------------------------------------------------------------------- */
  function renderGrandExperiment(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>5. The Grand Experiment</h2>
      <p>
        Em 1855, Snow publicou a 2ª edição de sua monografia com o que ele mesmo chamou de
        "O Grande Experimento"${cite('snow1855cholera')}. Duas companhias de água abasteciam Londres em 1854, e o acaso
        histórico criou o teste quase-experimental perfeito: a Lambeth havia, em 1852, mudado seu
        ponto de captação para <em>Thames Ditton</em>, <strong>acima</strong> dos despejos de
        esgoto da cidade. A Southwark & Vauxhall continuava captando <strong>abaixo</strong>, no
        meio do Tâmisa poluído${cite('snow1855cholera')}.
      </p>
      <p>
        Quando o surto de 1854 chegou, Snow coletou os dados de mortalidade comparando casas
        abastecidas por uma ou outra companhia — cruzando ruas, às vezes casas vizinhas. Os
        números são contundentes${cite('snow1855cholera')}:
      </p>
      <div class="r0-table-wrap">
        <table class="r0-table">
          <thead>
            <tr>
              <th>Companhia</th>
              <th>Fonte de captação</th>
              <th>Casas atendidas</th>
              <th>Mortes por cólera</th>
              <th>Taxa por 10.000 casas</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Southwark &amp; Vauxhall</strong></td>
              <td>Tâmisa, abaixo dos despejos de Londres</td>
              <td><code>40.046</code></td>
              <td><code>1.263</code></td>
              <td><code>315</code></td>
            </tr>
            <tr>
              <td><strong>Lambeth</strong></td>
              <td>Tâmisa, acima dos despejos (Thames Ditton)</td>
              <td><code>26.107</code></td>
              <td><code>98</code></td>
              <td><code>38</code></td>
            </tr>
            <tr style="background:var(--bg-3)">
              <td colspan="3" style="font-weight:600">Razão de taxas (S&amp;V ÷ Lambeth)</td>
              <td colspan="2" style="font-weight:600;color:var(--accent);font-family:'JetBrains Mono',monospace">≈ 8,3 ×</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Snow argumentava: "<em>Não há diferença na situação social, profissão, alimentação, ou
        qualquer outra coisa entre estes dois grupos — exceto a água que consumiam</em>"${cite('snow1855cholera')}. Em
        linguagem epidemiológica moderna, era um estudo de coorte natural com quase-randomização.
        Nas primeiras quatro semanas do surto, o risco chegou a ser 14× maior para os clientes de
        S&V${cite('snow1855cholera')}. A evidência era esmagadora — mas recebida com ceticismo na época${cite('cook2001prevention')}.
      </p>
    `;
    container.appendChild(s);
  }

  /* ---------------------------------------------------------------------
   * Joseph Bazalgette — card histórico
   * ------------------------------------------------------------------- */
  function renderBazalgetteCard(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <div class="bazalgette-card">
        <div class="bazalgette-card-header">
          <h3>Joseph Bazalgette (1819–1891)</h3>
          <p class="bazalgette-subtitle">Chief Engineer, Metropolitan Board of Works de Londres${cite('halliday2013great', 'cook2001prevention')}</p>
        </div>
        <div class="bazalgette-card-body">
          <img src="assets/images/joseph-bazalgette-GPT.png" alt="Joseph Bazalgette (1819–1891)" class="bazalgette-image" />

          <div class="bazalgette-text">
            <h4>A Solução Errada Pelos Motivos Corretos</h4>
            <p>
              Em 1858, Londres enfrenta o <strong>Great Stink</strong> — o Tâmisa é um esgoto aberto, o cheiro é insuportável${cite('halliday2013great')}.
              Snow já havia provado que cólera vinha da água. Mas Bazalgette? Ele acreditava em <strong>miasmas</strong>${cite('cook2001prevention', 'halliday2013great')}.
            </p>
            <p>
              <strong>Motivação de Bazalgette:</strong> eliminar o mau cheiro (teoria miasmática — <em>errada</em>).<br>
              <strong>Solução de Bazalgette:</strong> separar esgoto de água potável (tecnicamente correta para cólera, mas por motivos científicos <em>errados</em>)${cite('cook2001prevention', 'halliday2013great')}.
            </p>
            <div class="bazalgette-stats">
              <div class="stat-box">
                <div class="stat-label">Investimento total</div>
                <div class="stat-value">£6.5 milhões</div>
                <div class="stat-note">(~£975 milhões em 2026)</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Timeline</div>
                <div class="stat-value">16 anos</div>
                <div class="stat-note">1859–1875</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Extensão</div>
                <div class="stat-value">1.300 km</div>
                <div class="stat-note">de túneis de esgoto</div>
              </div>
            </div>
            <p class="muted" style="margin-top:.4rem; font-size:.82rem;">
              Estatísticas do Metropolitan Sewerage System (1859–1875)${cite('halliday2013great', 'cook2001prevention')}.
            </p>
            <p style="margin-top: 1rem; padding: 0.8rem; background: rgba(255, 107, 107, 0.1); border-left: 3px solid var(--danger); border-radius: 4px;">
              <strong>Resultado:</strong> Eliminação da cólera de Londres. <em>Por acaso.</em>
            </p>
            <h4 style="margin-top: 1.2rem;">O Paradoxo Histórico</h4>
            <ul>
              <li><strong>Snow:</strong> tinha a TEORIA certa (transmissão hídrica), sem poder agir (1854–1855)</li>
              <li><strong>Bazalgette:</strong> tinha a AÇÃO certa (separar esgoto/água), mas motivação errada (1858–1875)</li>
              <li><strong>Resultado:</strong> ambos venceram a cólera, mas pelos motivos diferentes</li>
            </ul>
            <p style="margin-top: 1rem; font-style: italic; color: var(--text-secondary);">
              "Às vezes a política e a pressão pública fazem o que a ciência não consegue — não porque a ciência está errada, mas porque a ação estrutural custa tanto que só acontece quando a população literalmente não consegue mais respirar o ar."
            </p>
          </div>
        </div>
      </div>
    `;
    container.appendChild(s);
  }

  /* ---------------------------------------------------------------------
   * Custos de Saneamento — subsection da Seção III
   * ------------------------------------------------------------------- */
  function renderSanitationCosts(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>O Paradoxo do Saneamento: Sabemos Como, Mas Não Fazemos</h2>
      <p>
        A cólera persiste não por falta de conhecimento, mas por falta de recursos estruturais para agir.
      </p>

      <h3>O Investimento de Bazalgette (1859–1875)</h3>
      <p>
        Custou <strong>£6.5 milhões</strong> (equivalente a <strong>~£975 milhões em 2026</strong>, ou ~<strong>$1.2 bilhões USD</strong>)${cite('halliday2013great', 'cook2001prevention')}.
        Para uma população de 2.5 milhões, representava um investimento per-capita de £2.60 (ou ~£390 em moeda de 2026).
        <strong>Levou 16 anos</strong> para ser completado, motivado principalmente pela pressão política do Great Stink, não por compreensão científica da transmissão hídrica${cite('cook2001prevention', 'halliday2013great')}.
      </p>

      <h3>O Investimento Moderno (Haiti, 2010–2016)</h3>
      <div class="sanitation-comparison-table">
        <table class="r0-table">
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
              <th>Contexto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Plano Nacional de Erradicação da Cólera</strong></td>
              <td>$2.2 bilhões USD${cite('world_bank2015haiti')}</td>
              <td>Custo total estimado</td>
            </tr>
            <tr>
              <td><strong>Financiamento realizado</strong></td>
              <td>~$520 milhões (~23.7%)${cite('world_bank2015haiti')}</td>
              <td>Até 2016</td>
            </tr>
            <tr style="background: rgba(255, 107, 107, 0.15);">
              <td><strong>GAP não financiado</strong></td>
              <td>~$1.7 bilhões USD${cite('world_bank2015haiti')}</td>
              <td>Não houve fonte</td>
            </tr>
            <tr>
              <td><strong>ONU prometeu</strong></td>
              <td>$400 milhões${cite('un2016secretarygeneral')}</td>
              <td>Ban Ki-moon (2016)</td>
            </tr>
            <tr style="background: rgba(255, 107, 107, 0.15);">
              <td><strong>ONU realmente desembolsou</strong></td>
              <td>~$8 milhões (~2%)${cite('un2016secretarygeneral', 'world_bank2015haiti')}</td>
              <td>Até 2017</td>
            </tr>
            <tr>
              <td><strong>População afetada</strong></td>
              <td>10.1 milhões</td>
              <td>Haiti 2010</td>
            </tr>
            <tr>
              <td><strong>Casos de cólera</strong></td>
              <td>697.256${cite('mspp2016haiti')}</td>
              <td>2010–2016</td>
            </tr>
            <tr>
              <td><strong>Mortes</strong></td>
              <td>9.295${cite('mspp2016haiti')}</td>
              <td>2010–2016</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>O Paradoxo Econômico</h3>
      <p>
        Para cada <strong>$1 investido em saneamento</strong>, o retorno econômico é <strong>$8</strong>${cite('who2012sanitation')}:
      </p>
      <ul>
        <li>Economia de tempo em trabalho e escola</li>
        <li>Redução de tempo carregando água</li>
        <li>Aumento de produtividade</li>
        <li>Redução de custos de saúde</li>
      </ul>
      <p style="margin-top: 1rem; padding: 0.8rem; background: var(--bg-3); border-radius: 4px;">
        <strong>A pergunta:</strong> Se o ROI é $8 por $1, por que Haiti não investe em saneamento?
      </p>

      <h3>Por Que Não Investem? A Realidade Política</h3>
      <p>
        <strong>Janeiro 2010:</strong> Um terremoto de magnitude 7.0 mata 230.000 pessoas e injura 300.000${cite('world_bank2015haiti')}.
        Prioridades imediatas: abrigo, comida, resgate. Infraestrutura é um luxo que um país em colapso não consegue se dar.
      </p>
      <p>
        <strong>Outubro 2010 (9 meses depois):</strong> Cólera chega via MINUSTAH nepalesa${cite('piarroux2011haiti')}.
        Dilema: usar recursos para saneamento (longo prazo, 5–10 anos) ou vacina/tratamento (curto prazo, salva vidas agora)?
      </p>
      <p>
        <strong>Realidade estrutural:</strong>
      </p>
      <ul>
        <li>Haiti já tinha a <strong>pior infraestrutura sanitária do hemisfério ocidental</strong> (69% com água, 17% com saneamento em 2010)${cite('who2012sanitation', 'world_bank2015haiti')}</li>
        <li>Instabilidade política + terremoto + epidemia = <strong>colapso estatal</strong></li>
        <li>Doadores internacionais preferem fundos para <strong>emergência visível</strong> (salvar vidas agora) vs. <strong>infraestrutura</strong> (salvar vidas depois)</li>
        <li>Custo de saneamento para 10 milhões de pessoas é <strong>~$2.2 bilhões</strong> — <strong>mais do que o PIB anual de muitos países</strong>${cite('world_bank2015haiti', 'who2012sanitation')}</li>
      </ul>

      <h3>A Lição Atemporal</h3>
      <p style="padding: 1rem; background: rgba(100, 200, 255, 0.15); border-left: 3px solid var(--accent); border-radius: 4px;">
        <strong>Não é "não sabemos como" — é "não conseguimos fazer".</strong>
      </p>
      <p>
        O problema epidemiológico é trivial desde 1854:
      </p>
      <ul>
        <li><strong>Cadeia:</strong> fecal → água → oral</li>
        <li><strong>Solução:</strong> separar esgoto de água potável</li>
      </ul>
      <p>
        O problema estrutural é intratável:
      </p>
      <ul>
        <li>Custo bilionário</li>
        <li>Requer governança estável</li>
        <li>Requer priorização política por décadas</li>
        <li>Requer investimento internacional coordenado</li>
      </ul>
      <p style="margin-top: 1rem;">
        Snow provou o mecanismo em 10 dias (estatística, observação).
        Bazalgette levou 16 anos para implementar (engenharia, política).
        <strong>Haiti leva... quanto tempo?</strong>
      </p>
      <p style="margin-top: 1rem; font-style: italic; color: var(--text-secondary);">
        A cólera persiste não por falta de conhecimento, mas por falta de recursos estruturais para agir no conhecimento.
      </p>
    `;
    container.appendChild(s);
  }

  /* ---------------------------------------------------------------------
   * Haiti 2010 — narrativa + gráfico
   * ------------------------------------------------------------------- */
  function renderHaitiNarrative(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>6. Haiti, outubro de 2010</h2>
      <p>
        Em 12 de janeiro de 2010, um terremoto de magnitude 7,0 devastou Porto Príncipe. Morreram
        entre 100 e 316 mil pessoas (estimativas variam), e aproximadamente 1,5 milhão ficaram
        desabrigadas${cite('world_bank2015haiti')}. A ONU enviou tropas de estabilização (MINUSTAH), incluindo um contingente
        nepalês que se instalou em Meille, próximo ao rio Artibonite — a principal fonte de água
        potável do país${cite('piarroux2011haiti', 'orata2014haiti')}.
      </p>
      <p>
        <strong>O Haiti não registrava cólera há pelo menos um século</strong>${cite('piarroux2011haiti', 'orata2014haiti')}. Em 19 de outubro de
        2010, nove meses após o terremoto, surgiu o primeiro caso em Mirebalais, logo a jusante do
        acampamento da MINUSTAH${cite('piarroux2011haiti')}. Em semanas, a doença se espalhou por todo o país. A análise
        genômica conduzida em 2011-2014 (Piarroux, Barzilay, Orata et al.) mostrou que a cepa
        circulante era <strong>idêntica à cepa que circulava no Nepal na época</strong> — a mesma
        subvariante, praticamente os mesmos SNPs. A importação por tropas nepalesas com saneamento
        inadequado era inescapável como explicação${cite('piarroux2011haiti', 'orata2014haiti')}.
      </p>
      <p>
        A ONU resistiu por anos. Só em agosto de 2016, o Secretário-Geral Ban Ki-moon reconheceu
        formalmente a responsabilidade da organização${cite('un2016secretarygeneral')}. O surto persistiu até 2019 — oficialmente
        <strong>697.256 casos e 9.295 mortes</strong> (dados compilados pelo Ministério da Saúde
        haitiano até março de 2016, reproduzidos no gráfico abaixo)${cite('mspp2016haiti')}.
      </p>
    `;
    container.appendChild(s);
  }

  function renderHaitiChart(container) {
    const data = EDL.data && EDL.data.haitiCholera2010;
    if (!data) {
      renderDataError(container, 'Cólera Haiti (2010–2016)', 'haitiCholera2010',
                      'assets/data/haiti-cholera-2010.js');
      return;
    }

    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>7. A série temporal do Haiti</h2>
      <p>
        Dados mensais oficiais do Ministério da Saúde Pública e População do Haiti (MSPP), outubro de
        2010 a março de 2016${cite('mspp2016haiti')}. A escala abaixo alterna entre casos e mortes. Observe a
        sazonalidade (picos correlacionados com a estação chuvosa) e a persistência — o surto
        nunca extinguiu totalmente no período registrado${cite('rebaudet2019cholera')}.
      </p>
      <div class="haiti-chart-wrap" id="m08-haiti-chart"></div>
    `;
    container.appendChild(s);

    const wrap = s.querySelector('#m08-haiti-chart');
    drawHaitiChart(wrap, data);

    let rafId;
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawHaitiChart(wrap, data));
    };
    window.addEventListener('resize', onResize, { passive: true });
    EDL.onModuleDestroy(() => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  function drawHaitiChart(wrap, data) {
    const d3 = window.d3;
    wrap.innerHTML = `
      <div class="haiti-chart-controls">
        <button type="button" class="haiti-btn active" data-metric="cases">Casos</button>
        <button type="button" class="haiti-btn" data-metric="deaths">Mortes</button>
        <button type="button" class="haiti-btn" data-metric="both">Ambos</button>
      </div>
      <div class="haiti-chart-plot" id="m08-haiti-plot"></div>
      <div class="haiti-chart-summary" id="m08-haiti-summary"></div>
    `;

    let metric = 'cases';
    const plotEl = wrap.querySelector('#m08-haiti-plot');
    const summaryEl = wrap.querySelector('#m08-haiti-summary');
    const btns = wrap.querySelectorAll('.haiti-btn');
    btns.forEach(b => {
      b.addEventListener('click', () => {
        metric = b.dataset.metric;
        btns.forEach(bb => bb.classList.toggle('active', bb === b));
        draw();
      });
    });

    draw();

    function draw() {
      plotEl.innerHTML = '';

      const W = plotEl.clientWidth || 700;
      const H = Math.max(300, Math.round(W * 0.45));
      const margin = { top: 26, right: 18, bottom: 50, left: 70 };
      const iw = W - margin.left - margin.right;
      const ih = H - margin.top - margin.bottom;

      const metricLabel = metric === 'deaths' ? 'mortes' : metric === 'both' ? 'casos e mortes' : 'casos';
      const svg = d3.select(plotEl).append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('role', 'img')
        .attr('aria-label',
          `Série temporal mensal de ${metricLabel} por cólera no Haiti, ` +
          `de outubro de 2010 a março de 2016. Dados oficiais do Ministério da Saúde Pública do Haiti (MSPP).`)
        .style('width', '100%').style('height', 'auto').style('display', 'block');

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // Dates (dia 1 de cada mês)
      const parsed = data.map(d => ({
        date: new Date(d.year, d.month - 1, 1),
        cases: d.cases,
        deaths: d.deaths
      }));

      const xs = d3.scaleTime()
        .domain(d3.extent(parsed, d => d.date))
        .range([0, iw]);

      let yMax;
      if (metric === 'cases') yMax = d3.max(parsed, d => d.cases);
      else if (metric === 'deaths') yMax = d3.max(parsed, d => d.deaths);
      else yMax = d3.max(parsed, d => d.cases);

      const ys = d3.scaleLinear().domain([0, yMax * 1.05]).range([ih, 0]);

      // Grid
      g.append('g').call(d3.axisLeft(ys).ticks(6).tickSize(-iw).tickFormat(''))
        .call(sel => {
          sel.selectAll('path').attr('stroke', 'none');
          sel.selectAll('line').attr('stroke', '#1e2638').attr('stroke-dasharray', '2,3');
        });

      g.append('g').attr('transform', `translate(0,${ih})`)
        .call(d3.axisBottom(xs).ticks(d3.timeMonth.every(6)).tickFormat(d3.timeFormat('%b/%y')))
        .call(sel => {
          sel.selectAll('path,line').attr('stroke', '#6b7a90');
          sel.selectAll('text').attr('fill', '#a8b3c4').style('font-size', '11px');
        });

      g.append('g').call(d3.axisLeft(ys).ticks(6, '~s'))
        .call(sel => {
          sel.selectAll('path,line').attr('stroke', '#6b7a90');
          sel.selectAll('text').attr('fill', '#a8b3c4').style('font-size', '11px');
        });

      g.append('text').attr('x', iw / 2).attr('y', ih + 38)
        .attr('text-anchor', 'middle').attr('fill', '#a8b3c4').style('font-size', '12px')
        .text('Mês');
      g.append('text').attr('transform', 'rotate(-90)').attr('x', -ih / 2).attr('y', -55)
        .attr('text-anchor', 'middle').attr('fill', '#a8b3c4').style('font-size', '12px')
        .text(metric === 'deaths' ? 'Mortes no mês' :
              metric === 'cases'  ? 'Casos no mês' : 'Casos (principal) · Mortes (secundário)');

      const area = d3.area()
        .x(d => xs(d.date))
        .y0(ih)
        .y1(d => ys(d.cases))
        .curve(d3.curveMonotoneX);

      const line = (key, color) => d3.line()
        .x(d => xs(d.date))
        .y(d => ys(d[key]))
        .curve(d3.curveMonotoneX);

      if (metric === 'cases' || metric === 'both') {
        // Área clara para casos
        g.append('path').datum(parsed)
          .attr('fill', 'url(#haiti-case-grad)')
          .attr('fill-opacity', .35)
          .attr('d', area);

        // Gradient
        const defs = svg.append('defs');
        const grad = defs.append('linearGradient').attr('id', 'haiti-case-grad')
          .attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 1);
        grad.append('stop').attr('offset', '0%').attr('stop-color', '#ff6b6b');
        grad.append('stop').attr('offset', '100%').attr('stop-color', '#ff6b6b').attr('stop-opacity', 0);

        g.append('path').datum(parsed)
          .attr('fill', 'none').attr('stroke', '#ff6b6b').attr('stroke-width', 2)
          .attr('d', line('cases', '#ff6b6b'));
      }

      if (metric === 'deaths') {
        g.append('path').datum(parsed)
          .attr('fill', 'none').attr('stroke', '#ffd93d').attr('stroke-width', 2.2)
          .attr('d', line('deaths', '#ffd93d'));
      } else if (metric === 'both') {
        // Escala secundária para mortes
        const y2 = d3.scaleLinear()
          .domain([0, d3.max(parsed, d => d.deaths) * 1.05]).range([ih, 0]);
        g.append('g').attr('transform', `translate(${iw},0)`)
          .call(d3.axisRight(y2).ticks(6, '~s'))
          .call(sel => {
            sel.selectAll('path,line').attr('stroke', '#6b7a90');
            sel.selectAll('text').attr('fill', '#ffd93d').style('font-size', '11px');
          });
        g.append('path').datum(parsed)
          .attr('fill', 'none').attr('stroke', '#ffd93d').attr('stroke-width', 1.8)
          .attr('stroke-dasharray', '4,3')
          .attr('d', d3.line().x(d => xs(d.date)).y(d => y2(d.deaths)).curve(d3.curveMonotoneX));
      }

      // Anotação do pico
      const peak = parsed.reduce((m, d) => d.cases > m.cases ? d : m, parsed[0]);
      const px = xs(peak.date), py = ys(peak.cases);
      g.append('circle').attr('cx', px).attr('cy', py).attr('r', 5)
        .attr('fill', '#ff6b6b').attr('stroke', '#0a0e1a').attr('stroke-width', 2);
      g.append('text').attr('x', px + 10).attr('y', py - 4)
        .attr('fill', '#ff6b6b').style('font-size', '11px').style('font-family', 'JetBrains Mono, monospace')
        .text(`Pico: ${peak.date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })} · ${EDL.math.fmtInt(peak.cases)} casos`);

      // Summary
      const totalCases = parsed.reduce((s, d) => s + d.cases, 0);
      const totalDeaths = parsed.reduce((s, d) => s + d.deaths, 0);
      const cfr = (totalDeaths / totalCases * 100).toFixed(2).replace('.', ',');

      summaryEl.innerHTML = `
        <div class="sim-metrics">
          <div class="sim-metric">
            <div class="sim-metric-label">Período observado</div>
            <div class="sim-metric-value" style="font-size:1rem">out/2010 – mar/2016</div>
            <div class="sim-metric-sub">66 meses</div>
          </div>
          <div class="sim-metric">
            <div class="sim-metric-label">Total de casos</div>
            <div class="sim-metric-value sim-metric-b">${EDL.math.fmtInt(totalCases)}</div>
          </div>
          <div class="sim-metric">
            <div class="sim-metric-label">Total de mortes</div>
            <div class="sim-metric-value">${EDL.math.fmtInt(totalDeaths)}</div>
          </div>
          <div class="sim-metric">
            <div class="sim-metric-label">Case-fatality rate (CFR)</div>
            <div class="sim-metric-value">${cfr}%</div>
            <div class="sim-metric-sub">letalidade agregada</div>
          </div>
        </div>
      `;
    }
  }

  /* ---------------------------------------------------------------------
   * Comparação Soho × Haiti
   * ------------------------------------------------------------------- */
  function renderComparison(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>8. 156 anos depois: o que mudou, o que não</h2>
      <p>
        Pôr Soho 1854 e Haiti 2010 lado a lado é uma das melhores formas de entender o que a
        epidemiologia conseguiu e onde ela continua impotente.
      </p>
      <div class="compare-grid">
        <div class="compare-header">Soho, Londres · 1854</div>
        <div class="compare-header">Haiti · 2010–2019</div>
        <div class="compare-cell"><strong>Agente:</strong> <em>Vibrio cholerae</em> (ainda desconhecido cientificamente)</div>
        <div class="compare-cell"><strong>Agente:</strong> <em>Vibrio cholerae</em> O1 El Tor (cepa nepalesa)${cite('orata2014haiti', 'piarroux2011haiti')}</div>
        <div class="compare-cell"><strong>Fonte:</strong> bomba pública contaminada por fossa negra adjacente${cite('snow1855cholera', 'johnson2006ghostmap')}</div>
        <div class="compare-cell"><strong>Fonte:</strong> acampamento MINUSTAH → rio Artibonite${cite('piarroux2011haiti')}</div>
        <div class="compare-cell"><strong>Mortes:</strong> ~600 em 10 dias num bairro de 7.000 habitantes${cite('snow1855cholera', 'johnson2006ghostmap')}</div>
        <div class="compare-cell"><strong>Mortes:</strong> 9.295 (até 2016); 697.256 casos${cite('mspp2016haiti')}</div>
        <div class="compare-cell"><strong>Método de investigação:</strong> visita casa-a-casa, mapeamento espacial manual</div>
        <div class="compare-cell"><strong>Método de investigação:</strong> vigilância epidemiológica + genômica comparativa${cite('orata2014haiti')}</div>
        <div class="compare-cell"><strong>Diagnóstico:</strong> clínico (diarreia, desidratação, morte rápida)</div>
        <div class="compare-cell"><strong>Diagnóstico:</strong> laboratorial + clínico</div>
        <div class="compare-cell"><strong>Tecnologia disponível:</strong> estatística descritiva, cartografia</div>
        <div class="compare-cell"><strong>Tecnologia disponível:</strong> PCR, sequenciamento, GIS, modelagem SIR</div>
        <div class="compare-cell"><strong>Resposta pública:</strong> remoção da alça da bomba, 11 dias após início${cite('snow1855cholera', 'johnson2006ghostmap')}</div>
        <div class="compare-cell"><strong>Resposta pública:</strong> soluções orais, vacinação pontual (Shanchol), saneamento — tudo insuficiente nos primeiros anos${cite('world_bank2015haiti')}</div>
        <div class="compare-cell compare-cell--last"><strong>Tempo para aceitação científica:</strong> ~30 anos (Koch isola o V. cholerae em 1884)${cite('cook2001prevention', 'johnson2006ghostmap')}</div>
        <div class="compare-cell compare-cell--last"><strong>Tempo para reconhecimento de responsabilidade:</strong> ONU só admite em 2016 (6 anos)${cite('un2016secretarygeneral')}</div>
      </div>
      <div class="callout callout-info" style="margin-top:1.2rem">
        <strong>A lição que persiste:</strong> em ambos os casos, a cadeia epidemiológica foi
        a mesma (fecal–água–oral), a origem foi a mesma categoria (contaminação humana do
        recurso hídrico), e a solução definitiva foi a mesma (infraestrutura sanitária adequada —
        que em Londres veio com Bazalgette nos anos 1860, e que no Haiti permanece incompleta)${cite('halliday2013great', 'cook2001prevention', 'who2012sanitation', 'world_bank2015haiti')}.
        A ciência avançou; o desafio estrutural, não — a cólera continua sendo um problema endêmico
        em dezenas de países, com centenas de milhares de casos e milhares de mortes anuais${cite('ali2015cholera')}.
      </div>
    `;
    container.appendChild(s);
  }

  function renderActivity(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>9. Atividade — seis perguntas</h2>
      <p>
        As perguntas cobrem a metodologia de Snow, a teoria miasmática, a análise espacial real
        do dataset do mapa, a origem do surto do Haiti e as lições comparativas. Duas
        perguntas trazem mini-cenários clínicos para contextualizar.
      </p>
      <div class="activity-box" id="m08-activity"></div>
    `;
    container.appendChild(s);
    EDL.quiz.run(s.querySelector('#m08-activity'), { bank: QUIZ });
  }

  function renderFooter(container) {
    const s = document.createElement('section');
    s.className = 'module-section';
    s.innerHTML = `
      <h2>Fim do percurso</h2>
      <p>
        Você concluiu os oito módulos do Epidemic Dynamics Lab. Do conceito mais básico (definição
        de epidemiologia) ao caso histórico mais emblemático (o mapa de Snow com dados reais),
        passando pelos modelos quantitativos fundamentais. Para continuar estudando, consulte a
        <a href="references.bib" download>bibliografia BibTeX do app</a> — inclui fontes para
        aprofundamento em cada módulo.
      </p>
      <p class="muted" style="margin-top:.6rem;font-size:.88rem">
        <strong>Créditos dos dados do Módulo 8:</strong> mapa de Soho a partir do pacote R
        <em>cholera</em> (Peter Li, GPL-2, JOSS 2018)${cite('li2018cholera')}; digitalização das coordenadas por Dodson &
        Tobler (1992)${cite('dodson1992snow')}. Dados do Haiti do Ministério da Saúde Pública e População do Haiti, via
        arquivo CSV fornecido pelo autor${cite('mspp2016haiti')}. Atribuições de mortes por caminhada recalculadas via
        Dijkstra sobre o grafo de ruas original.
      </p>
    `;
    container.appendChild(s);
  }

  /* ---------------------------------------------------------------------
   * Registro
   * ------------------------------------------------------------------- */
  EDL.registerModule({
    id: '08-colera-soho-haiti',
    number: 8,
    icon: '🗺️',
    title: 'Casos Históricos',
    subtitle: 'Cólera: Soho (1854) e Haiti (2010)',
    status: 'available',
    quizCount: QUIZ.length,
    render(container) {
      // CitationManager fresco a cada render — zera numeração e mapa.
      // O idPrefix 'm08-ref-' isola os ids HTML deste módulo dos ids da
      // página global de bibliografia (que pode coexistir no DOM).
      cm = EDL.citations.create({ idPrefix: 'm08-ref-' });

      renderHeader(container);

      // ========== SEÇÃO I: SOHO, 1854 ==========
      renderSectionHeader(container, 'I', 'Londres, Soho - 1854');
      renderLondonContext(container);
      renderSnowBio(container);
      renderSnowPortraitCard(container);
      renderComplementaryMaterial(container);
      renderTimelineSection(container);
      renderSohoMap(container);
      renderGrandExperiment(container);
      renderBazalgetteCard(container);

      // ========== SEÇÃO II: HAITI, 2010–2016 ==========
      renderSectionHeader(container, 'II', 'Haiti, 2010–2016 — O Reflexo Moderno');
      renderHaitiNarrative(container);
      renderHaitiChart(container);

      // ========== SEÇÃO III: REFLEXÃO & APRENDIZADOS ==========
      renderSectionHeader(container, 'III', 'Reflexão & Aprendizados — O Que Persiste');
      renderComparison(container);
      renderSanitationCosts(container);
      renderActivity(container);

      // Rodapé (também cita refs — precisa vir antes da lista)
      renderFooter(container);

      // Referências citadas (Vancouver — só as efetivamente citadas, na
      // ordem de primeira aparição no texto, com ids para os links âncora)
      EDL.refs.renderCitedReferences(container, cm, { moduleNumber: 8 });
    }
  });
})();
