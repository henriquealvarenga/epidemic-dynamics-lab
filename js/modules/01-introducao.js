/* =========================================================================
 * EDL — Módulo 01: Introdução à Epidemiologia
 *
 * Objetivos pedagógicos:
 *   1. Apresentar a definição e etimologia de epidemiologia.
 *   2. Distinguir os quatro níveis de prevenção (primária, secundária,
 *      terciária e quaternária — Jamoulle, 1986).
 *   3. Revisitar marcos históricos do campo, do séc. XVII ao XX.
 *   4. Consolidar o aprendizado com um quiz rápido.
 *
 * Baseado em: Aula 1a — História da Epidemiologia e Dinâmica de doenças,
 * Prof. Henrique Alvarenga, e em "Conceitos de Epidemiologia" (2024).
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * CitationManager — atribui números Vancouver às chaves bibtex na ordem
   * em que cada uma aparece no texto. Reinicializado a cada render().
   *
   * Ver js/core/citations.js para a API completa.
   * ------------------------------------------------------------------- */
  let cm = null;
  const cite = function () {
    if (!cm) return '';
    return cm.cite.apply(cm, arguments);
  };

  /* ---------------------------------------------------------------------
   * Marcos históricos — organizados em 5 "eras" / viradas conceituais
   *
   * Cada era tem: numeral, título, subtítulo (intervalo temporal),
   * texto introdutório (lede) explicando a virada, domínio do eixo, e
   * array de marcadores cronologicamente ordenados. Cada marcador tem
   * year, short (rótulo do dot), title (título do detail panel), byline
   * (autor·local), body (texto explicativo com cite() inline).
   *
   * IMPORTANTE: a fábrica é função (e não constante) porque os bodies
   * usam cite(...) — e cite só funciona depois que o CitationManager foi
   * criado em render(). buildEras() é chamada uma única vez por
   * renderTimeline(), e o resultado é cacheado em `erasCache` para uso
   * pelos drawEraTimeline em re-renders (resize).
   *
   * Mantemos o nome legado buildMilestones() como wrapper para minimizar
   * mudanças, mas a nova estrutura é "eras" (não mais lista plana).
   * ------------------------------------------------------------------- */
  let erasCache = null;

  function buildEras() {
    return [
      /* ============ ERA 1 — Virada ambiental e populacional ============ */
      {
        id: 'era1',
        numeral: 'I',
        title: 'Virada ambiental e populacional',
        subtitle: 'Antiguidade → 1700',
        lede:
          'A epidemiologia tem uma pré-história longa. Antes dos métodos estatísticos modernos, ' +
          'médicos e administradores já intuíam que a doença não se distribui ao acaso — que ela ' +
          'responde ao clima, ao ambiente, à organização das cidades, aos hábitos dos povos. ' +
          'Hipócrates abriu essa porta no século V a.C.; a peste medieval forçou a Europa a inventar ' +
          'formas coletivas de resposta sanitária; e John Graunt, em 1662, fez a primeira coisa que ' +
          'reconheceríamos como análise epidemiológica — contar mortes em Londres e procurar padrões ' +
          'nelas. É a virada que tira a doença do plano puramente individual e a coloca no plano da ' +
          'população.',
        domain: [-500, 1800],
        markers: [
          {
            year: -450, displayYear: '~450 a.C.',
            short: 'Hipócrates',
            title: 'Ares, Águas e Lugares — a doença e o ambiente',
            byline: 'Corpus hipocrático · Grécia clássica',
            body:
              `No tratado <em>Ares, Águas e Lugares</em>, atribuído ao corpus hipocrático, a doença é ` +
              `apresentada como dependente do clima, das águas, dos ventos, das estações do ano e dos ` +
              `hábitos das populações. Esse texto desloca a explicação do adoecimento de uma perspectiva ` +
              `mágico-religiosa para uma abordagem naturalista e observacional — uma intuição que ` +
              `reaparecerá, milênios depois, no coração da epidemiologia ambiental moderna${cite('hippocrates_airs_waters')}.`
          },
          {
            year: 1377, displayYear: '~1377',
            short: 'Quarentena',
            title: 'Peste, cordões sanitários e a invenção da quarentena',
            byline: 'Ragusa (Dubrovnik) · República de Veneza',
            body:
              `A peste negra do século XIV mata cerca de um terço da população europeia. Em 1377, a ` +
              `cidade-estado de Ragusa institui o primeiro <em>trentino</em> (30 dias) e, em seguida, a ` +
              `<em>quarantina</em> (40 dias) — períodos de isolamento obrigatório de navios suspeitos ` +
              `antes da entrada no porto. É a primeira resposta sanitária coletiva e estatal documentada ` +
              `da história ocidental, baseada em conhecimento empírico (associação entre contato e ` +
              `doença), sem ainda compreender o mecanismo de transmissão${cite('tognotti2013quarantine')}.`
          },
          {
            year: 1662, displayYear: '1662',
            short: 'Graunt',
            title: 'Natural and Political Observations upon the Bills of Mortality',
            byline: 'John Graunt · Londres',
            body:
              `John Graunt publica em Londres o primeiro estudo sistemático de dados de mortalidade, ` +
              `usando os registros paroquiais (<em>Bills of Mortality</em>) para descrever padrões de ` +
              `morte por causa, sexo e estação do ano${cite('graunt1662')}. É considerado um dos textos ` +
              `fundadores da estatística e da demografia — e, em última análise, da epidemiologia como ` +
              `disciplina.`
          },
          {
            year: 1796, displayYear: '1796',
            short: 'Jenner',
            title: 'Vacinação contra a varíola — primeira prevenção primária moderna',
            byline: 'Edward Jenner · Gloucestershire, Inglaterra',
            body:
              `Edward Jenner inocula, em maio de 1796, o menino James Phipps com material de uma lesão de ` +
              `varíola bovina (<em>cowpox</em>) e demonstra proteção contra a varíola humana. Publica os ` +
              `achados em 1798${cite('jenner1798inquiry')}, batizando o procedimento de <em>vaccination</em> ` +
              `(de <em>vacca</em>, vaca). Marco fundador da prevenção primária baseada em evidência ` +
              `empírica — décadas antes da teoria germinal.`
          }
        ]
      },

      /* ============ ERA 2 — Virada estatística ============ */
      {
        id: 'era2',
        numeral: 'II',
        title: 'Virada estatística',
        subtitle: '1830 → 1860',
        lede:
          'No início do século XIX, a medicina ainda decidia tratamentos pela intuição clínica do ' +
          'médico. A virada estatística é o momento em que isso começa a ser contestado: Pierre Louis ' +
          'propõe que a sangria seja avaliada por contagem, não por impressão; William Farr organiza ' +
          'pela primeira vez as estatísticas oficiais de mortalidade da Inglaterra; Ignaz Semmelweis ' +
          'prova, comparando duas clínicas de obstetrícia em Viena, que lavar as mãos reduz drasticamente ' +
          'a mortalidade puerperal. E em 1854 John Snow leva esse raciocínio à epidemia de cólera de Soho ' +
          '— fazendo da observação populacional uma arma de saúde pública. É a virada em que a doença ' +
          'passa a ser <em>medida</em>.',
        domain: [1830, 1860],
        markers: [
          {
            year: 1835, displayYear: '1835',
            short: 'P. Louis',
            title: 'O método numérico — avaliando a sangria',
            byline: 'Pierre Charles Alexandre Louis · Paris',
            body:
              `Pierre Louis publica <em>Recherches sur les effets de la saignée</em>, no qual aplica o ` +
              `chamado "método numérico": ao tratar pneumonia, compara a evolução clínica de grupos de ` +
              `pacientes sangrados em momentos diferentes da doença e mostra que a sangria precoce ` +
              `<em>não</em> melhora os desfechos${cite('louis1835saignee')}. É uma das primeiras vezes na ` +
              `história em que um tratamento consagrado é avaliado por contagem sistemática e comparação ` +
              `entre grupos — antecipando a lógica do ensaio clínico.`
          },
          {
            year: 1839, displayYear: '1839',
            short: 'Farr',
            title: 'Primeiro relatório de William Farr como Registrar General',
            byline: 'William Farr · Inglaterra e País de Gales',
            body:
              `Farr, médico e estatístico, assume o cargo de <em>Registrar General</em> e começa a ` +
              `sistematizar as estatísticas de mortalidade da Inglaterra${cite('langmuir1976farr')}. Em seu ` +
              `primeiro relatório alerta: "cada doença tem, em muitos casos, três ou quatro nomes ` +
              `diferentes, e um mesmo nome é usado para muitas doenças diferentes". A urgência por uma ` +
              `nomenclatura padronizada é a semente da futura Classificação Internacional de Doenças.`
          },
          {
            year: 1847, displayYear: '1847',
            short: 'Semmelweis',
            title: 'Febre puerperal e a primeira intervenção antisséptica',
            byline: 'Ignaz Semmelweis · Hospital Geral de Viena',
            body:
              `No Hospital Geral de Viena, Semmelweis observa que a mortalidade por febre puerperal na ` +
              `clínica atendida por médicos e estudantes (que vinham de autópsias) era cerca de três vezes ` +
              `maior do que na clínica atendida apenas por parteiras. Ao instituir a lavagem das mãos com ` +
              `solução clorada, a mortalidade despenca drasticamente${cite('semmelweis1861aetiologie')}. ` +
              `A descoberta ocorre décadas antes da teoria germinal — Semmelweis simplesmente confiou na ` +
              `comparação entre grupos. Foi recebido com hostilidade pela comunidade médica e morreu ` +
              `marginalizado.`
          },
          {
            year: 1853, displayYear: '1853',
            short: 'Bruxelas',
            title: '1º Congresso Internacional de Estatística',
            byline: 'Bruxelas',
            body:
              `O congresso aprova uma resolução sobre a necessidade urgente de uma nomenclatura ` +
              `internacional padronizada de causas de morte. Farr e o médico suíço Marc d'Espine são ` +
              `encarregados de desenvolver a proposta${cite('moriyama1993classification')} — semente que ` +
              `germinaria mais tarde na Classificação Internacional de Doenças (CID, 1900).`
          },
          {
            year: 1854, displayYear: '1854',
            short: 'Soho',
            title: 'Surto de cólera em Soho — o caso clássico de John Snow',
            byline: 'John Snow · Londres, agosto–setembro',
            body:
              `Aproximadamente 600 mortes em 10 dias no bairro de Soho. Snow identifica a bomba da ` +
              `Broad Street como fonte comum das vítimas e, em 7 de setembro, apresenta os dados ao ` +
              `Conselho de Governadores; no dia seguinte a alça da bomba é removida${cite('snow1855cholera')}. ` +
              `Esse gesto é icônico, mas é apenas parte do trabalho — o <em>Grand Experiment</em> ` +
              `comparando as companhias de água Southwark & Vauxhall e Lambeth virá em seguida e ` +
              `consolidará a hipótese de transmissão hídrica do cólera. ` +
              `<br><br><span class="figure-caption">Explorado em detalhe no Módulo 8.</span>`
          },
          {
            year: 1855, displayYear: '1855',
            short: 'Snow II',
            title: '2ª edição de "On the Mode of Communication of Cholera"',
            byline: 'John Snow · Londres',
            body:
              `Snow publica a monografia expandida com o resultado do <em>Grand Experiment</em>: entre ` +
              `os clientes da Southwark & Vauxhall (que abastecia com água do Tâmisa poluída) a taxa de ` +
              `mortalidade por cólera foi cerca de <strong>oito a nove vezes maior</strong> do que entre ` +
              `os da Lambeth; nas primeiras 4 semanas da epidemia, <strong>14 vezes maior</strong>${cite('snow1855cholera')}. ` +
              `É uma peça-chave na consolidação do método epidemiológico moderno — embora inicialmente ` +
              `tenha sido minimizada pelo próprio <em>Lancet</em>.`
          }
        ]
      },

      /* ============ ERA 3 — Virada infecciosa ============ */
      {
        id: 'era3',
        numeral: 'III',
        title: 'Virada infecciosa',
        subtitle: '1858 → 1910',
        lede:
          'A segunda metade do século XIX viu a teoria miasmática ser substituída pela teoria germinal. ' +
          'Pasteur demonstra o papel de microrganismos na fermentação e na doença; Koch isola o bacilo ' +
          'da tuberculose e formula os critérios para atribuir uma doença a um agente específico. A ' +
          'saúde pública absorve essa revolução em programas concretos — saneamento, controle vetorial, ' +
          'vacinação, vigilância. No Brasil, Oswaldo Cruz e Carlos Chagas, no Instituto que leva o nome ' +
          'do primeiro, simbolizam essa virada nas Américas. É o momento em que epidemiologia, ' +
          'microbiologia e política sanitária passam a operar em conjunto.',
        domain: [1855, 1915],
        markers: [
          {
            year: 1858, displayYear: '1858',
            short: 'Great Stink',
            title: 'The Great Stink — saneamento de Londres',
            byline: 'Joseph Bazalgette · Londres',
            body:
              `O verão quente de 1858 concentra dejetos humanos e animais no rio Tâmisa. O mau cheiro é ` +
              `insuportável até dentro do Parlamento, acelerando a aprovação do plano de Joseph Bazalgette ` +
              `para a construção do sistema de esgoto de Londres${cite('halliday2013great')}. Resultado: ` +
              `redução drástica das epidemias de cólera nas décadas seguintes — validando, na prática, a ` +
              `hipótese de Snow antes mesmo que ela fosse universalmente aceita na teoria.`
          },
          {
            year: 1880, displayYear: '~1880',
            short: 'Pasteur',
            title: 'Pasteur e a consolidação da teoria germinal',
            byline: 'Louis Pasteur · França',
            body:
              `Ao longo das décadas de 1860–1880, Louis Pasteur consolida a teoria germinal das doenças. ` +
              `Demonstra primeiro que a fermentação é causada por microrganismos (não por geração ` +
              `espontânea), depois aplica o princípio para entender doenças do bicho-da-seda, do gado e do ` +
              `homem. Em 1885 administra a vacina antirrábica ao menino Joseph Meister, salvando-o. A ` +
              `teoria germinal transforma a medicina e a saúde pública${cite('geison1995pasteur')}.`
          },
          {
            year: 1884, displayYear: '1882–84',
            short: 'Koch',
            title: 'Bacilo da tuberculose e os postulados de Koch',
            byline: 'Robert Koch · Berlim',
            body:
              `Em 24 de março de 1882, Robert Koch anuncia o isolamento do <em>Mycobacterium ` +
              `tuberculosis</em>. Em 1884, em monografia expandida na <em>Mittheilungen aus dem ` +
              `Kaiserlichen Gesundheitsamte</em>, consolida os critérios — depois conhecidos como ` +
              `<strong>postulados de Koch</strong> — para atribuir uma doença a um microrganismo ` +
              `específico${cite('koch1884aetiologie')}. Embora hoje saibamos que muitos agentes não ` +
              `cumprem os postulados rigorosamente (portadores assintomáticos, doenças multifatoriais), ` +
              `foi a primeira tentativa sistemática de inferência causal em microbiologia.`
          },
          {
            year: 1900, displayYear: '1900',
            short: 'CID',
            title: 'Primeira Classificação Internacional de Doenças',
            byline: 'Paris',
            body:
              `A primeira Conferência Internacional para Revisão da Lista de Bertillon (ILCD) produz o ` +
              `que hoje chamamos de <strong>CID</strong> — o padrão global de codificação de causas de ` +
              `morte e doenças. É o fruto direto das propostas de Farr e de décadas de debate nos ` +
              `Institutos Internacionais de Estatística (Viena 1891, Chicago 1893, Oslo 1899)${cite('moriyama1993classification')}.`
          },
          {
            year: 1903, displayYear: '1903',
            short: 'Oswaldo Cruz',
            title: 'Saneamento do Rio de Janeiro e erradicação da febre amarela urbana',
            byline: 'Oswaldo Cruz · Brasil',
            body:
              `Oswaldo Cruz assume a Diretoria-Geral de Saúde Pública do Brasil em 1903 e conduz, até 1909, ` +
              `campanhas sistemáticas de combate à febre amarela urbana, peste bubônica e varíola no Rio ` +
              `de Janeiro. Combina vigilância epidemiológica, controle vetorial e vacinação compulsória — ` +
              `esta última detonando a <strong>Revolta da Vacina</strong> em 1904. A febre amarela urbana ` +
              `é dada como erradicada do Rio em 1907, em um dos primeiros casos da história de combate em ` +
              `larga escala a uma doença infecciosa com ferramentas epidemiológicas modernas${cite('stepan1976beginnings')}.`
          },
          {
            year: 1909, displayYear: '1909',
            short: 'Chagas',
            title: 'Carlos Chagas descreve a tripanossomíase americana',
            byline: 'Carlos Chagas · Instituto Oswaldo Cruz, Rio de Janeiro',
            body:
              `Num único trabalho, Carlos Chagas descreve simultaneamente o agente etiológico ` +
              `(<em>Trypanosoma cruzi</em>), o vetor (o barbeiro, <em>Triatoma infestans</em>), o ciclo ` +
              `biológico do parasita e o quadro clínico da doença que hoje leva seu nome${cite('chagas1909nova')} ` +
              `— feito raríssimo na história da medicina, em que esses elementos normalmente são ` +
              `descobertos por pesquisadores diferentes ao longo de décadas. A doença de Chagas continua ` +
              `sendo uma das principais doenças tropicais negligenciadas das Américas (~6–7 milhões de ` +
              `infectados), e o trabalho inaugura a tradição brasileira de pesquisa em medicina tropical.`
          }
        ]
      },

      /* ============ ERA 4 — Virada crônica e probabilística ============ */
      {
        id: 'era4',
        numeral: 'IV',
        title: 'Virada crônica e probabilística',
        subtitle: '1948 → 1965',
        lede:
          'O século XX trouxe um problema novo para a epidemiologia: como estudar doenças sem um agente ' +
          'único? Câncer, infarto, AVC, diabetes — nenhuma se encaixa no modelo de Koch. A resposta vem ' +
          'em duas frentes, ambas a partir de 1948. Primeiro, o ensaio clínico randomizado é formalizado ' +
          '(estreptomicina vs. tuberculose, MRC) — uma forma rigorosa de avaliar intervenções. Segundo, ' +
          'surge o conceito moderno de <em>fator de risco</em>: o Framingham Heart Study acompanha uma ' +
          'cidade inteira ao longo de décadas, e Doll & Hill provam, no caso-controle de 1950 e na coorte ' +
          'britânica que se seguiu, que tabagismo causa câncer de pulmão. Em 1965, Austin Bradford Hill ' +
          'publica seus nove pontos para inferir causalidade a partir de associações. É a virada em que ' +
          'a epidemiologia ganha sua caixa de ferramentas atual.',
        domain: [1945, 1970],
        markers: [
          {
            year: 1948, displayYear: '1948',
            short: 'MRC RCT',
            title: 'Primeiro ensaio clínico randomizado moderno — estreptomicina vs. tuberculose',
            byline: 'Medical Research Council · Reino Unido',
            body:
              `O Medical Research Council britânico publica no BMJ os resultados do ensaio sobre ` +
              `estreptomicina no tratamento de tuberculose pulmonar. O estudo incorporou ` +
              `<strong>randomização</strong> (por envelopes selados), <strong>comparação controlada</strong> ` +
              `(estreptomicina vs. repouso) e <strong>cegamento parcial</strong>${cite('mrc1948streptomycin')}. ` +
              `É geralmente considerado o primeiro RCT moderno — o modelo metodológico que se tornaria o ` +
              `padrão-ouro para avaliação de intervenções terapêuticas.`
          },
          {
            year: 1949, displayYear: '1948',
            short: 'Framingham',
            title: 'Início do Framingham Heart Study',
            byline: 'U.S. Public Health Service · Framingham, Massachusetts',
            body:
              `Em 1948, o U.S. Public Health Service inicia em Framingham uma coorte longitudinal de ` +
              `adultos sem doença cardiovascular. O primeiro paper descrevendo o desenho é publicado em ` +
              `1951 no <em>American Journal of Public Health</em>${cite('dawber1951framingham')}. Ao longo ` +
              `de décadas, o estudo estabelece o conceito moderno de <strong>fator de risco</strong> — ` +
              `hipertensão, colesterol, tabagismo, diabetes — e mostra como a epidemiologia pode lidar ` +
              `com doenças crônicas sem um agente único e identificável.`
          },
          {
            year: 1950, displayYear: '1950',
            short: 'Doll & Hill',
            title: 'Tabagismo e câncer de pulmão — estudo caso-controle',
            byline: 'Richard Doll e Austin Bradford Hill · Reino Unido',
            body:
              `Doll e Hill publicam no BMJ um estudo caso-controle com pacientes hospitalizados em Londres, ` +
              `demonstrando associação forte entre tabagismo e câncer de pulmão${cite('doll1950smoking')}. ` +
              `É um dos primeiros usos clássicos do desenho caso-controle aplicado a doença crônica não ` +
              `infecciosa — e prepara o terreno para o estudo de coorte que viriam a conduzir entre ` +
              `médicos britânicos a partir de 1951.`
          },
          {
            year: 1954, displayYear: '1954',
            short: 'British Doctors',
            title: 'British Doctors Study — confirmação prospectiva',
            byline: 'Richard Doll e Austin Bradford Hill · Reino Unido',
            body:
              `Primeiros resultados do British Doctors Study — coorte prospectiva acompanhando ~40 mil ` +
              `médicos britânicos desde 1951${cite('doll1954smoking')}. O desenho prospectivo confirma a ` +
              `temporalidade (exposição precede o desfecho) e amplia o achado de 1950, mostrando ` +
              `dose-resposta robusta entre número de cigarros fumados e risco de câncer de pulmão. ` +
              `Tornou-se exemplo clássico da força dos estudos de coorte em epidemiologia.`
          },
          {
            year: 1965, displayYear: '1965',
            short: 'B. Hill',
            title: 'Os nove pontos de Bradford Hill — associação ou causação?',
            byline: 'Austin Bradford Hill · Royal Society of Medicine, Londres',
            body:
              `Em palestra na Royal Society of Medicine, Bradford Hill propõe nove "aspectos" a considerar ` +
              `quando se quer distinguir associação de causalidade: força, consistência, especificidade, ` +
              `temporalidade, gradiente biológico, plausibilidade, coerência, evidência experimental e ` +
              `analogia${cite('hill1965criteria')}. Ficariam conhecidos como <strong>critérios de Bradford ` +
              `Hill</strong> — embora ele os tenha apresentado mais como pontos de vista do que como uma ` +
              `lista rígida. Continuam sendo o ponto de partida prático da inferência causal em ` +
              `epidemiologia.`
          }
        ]
      },

      /* ============ ERA 5 — Virada contemporânea ============ */
      {
        id: 'era5',
        numeral: 'V',
        title: 'Virada contemporânea',
        subtitle: '1986 → hoje',
        lede:
          'Nas últimas décadas, a epidemiologia se ampliou em três direções simultâneas. Para fora — ' +
          'Cochrane e Global Burden of Disease consolidam síntese sistemática de evidências e comparação ' +
          'global de carga de doença. Para dentro — Marc Jamoulle propõe a prevenção quaternária para ' +
          'nomear os danos causados pelo próprio excesso de medicina. E para frente — métodos como ' +
          'diagramas causais (DAGs) e inferência contrafactual procuram responder com mais rigor a ' +
          'pergunta que sempre esteve no coração da disciplina: o que aconteceria se mudássemos a ' +
          'exposição? A pandemia de COVID-19, no meio disso, pôs a epidemiologia de volta no centro da ' +
          'vida pública. É a virada em que a disciplina se torna autoconsciente: ela passa a estudar não ' +
          'só doenças, mas também os efeitos da própria medicina, e a refinar o pensamento causal por ' +
          'trás de tudo o que faz.',
        domain: [1984, 2026],
        markers: [
          {
            year: 1986, displayYear: '1986',
            short: 'P4',
            title: 'Prevenção quaternária — proteger contra o excesso de medicina',
            byline: 'Marc Jamoulle · Bélgica',
            body:
              `O médico de família belga Marc Jamoulle propõe o conceito de <strong>prevenção ` +
              `quaternária</strong>${cite('jamoulle1986information')} como resposta à supermedicalização: ` +
              `identificar pessoas em risco de invasão médica desnecessária e protegê-las dela. A ` +
              `epidemiologia passa, pela primeira vez, a estudar sistematicamente os danos produzidos pela ` +
              `própria medicina. ` +
              `<br><br><span class="figure-caption">Detalhado na §2 deste módulo.</span>`
          },
          {
            year: 1992, displayYear: '1992',
            short: 'MBE',
            title: 'Medicina Baseada em Evidências',
            byline: 'Evidence-Based Medicine Working Group · McMaster, JAMA',
            body:
              `O grupo de McMaster (Guyatt, Sackett e outros) publica no JAMA o paper fundador da ` +
              `<strong>Medicina Baseada em Evidências</strong>${cite('ebmworkinggroup1992evidence')}. A ` +
              `proposta — sistematizar a integração entre melhor evidência científica disponível, ` +
              `experiência clínica e valores do paciente — é refinada em 1996 por Sackett${cite('sackett1996evidence')} ` +
              `e transforma a forma como a medicina é ensinada e praticada.`
          },
          {
            year: 1993, displayYear: '1993',
            short: 'Cochrane',
            title: 'Fundação da Cochrane Collaboration',
            byline: 'Iain Chalmers · Oxford',
            body:
              `Iain Chalmers funda a <strong>Cochrane Collaboration</strong> — organização internacional ` +
              `sem fins lucrativos dedicada a preparar, manter e disseminar revisões sistemáticas dos ` +
              `efeitos de intervenções em saúde${cite('chalmers1993cochrane')}. A Cochrane se torna a ` +
              `instituição operacional da MBE; suas revisões sistemáticas e metanálises passam a alicerçar ` +
              `diretrizes clínicas em todo o mundo.`
          },
          {
            year: 1996, displayYear: '1996',
            short: 'GBD',
            title: 'Global Burden of Disease — a epidemiologia em escala planetária',
            byline: 'Christopher Murray e Alan Lopez · OMS, Banco Mundial, Harvard',
            body:
              `Murray e Lopez, em colaboração com a OMS e o Banco Mundial, publicam o primeiro volume do ` +
              `<strong>Global Burden of Disease</strong>${cite('murray1996gbd')}. O projeto introduz medidas ` +
              `como o <strong>DALY</strong> (anos de vida ajustados por incapacidade) para comparar carga ` +
              `de doença entre países, regiões e ao longo do tempo. Pela primeira vez a epidemiologia tem ` +
              `uma linguagem unificada para descrever a saúde global.`
          },
          {
            year: 2020, displayYear: '2020',
            short: 'COVID-19',
            title: 'Pandemia de COVID-19 — a epidemiologia em tempo real',
            byline: 'Pandemia global · 2020–2023',
            body:
              `A pandemia de COVID-19 recoloca a epidemiologia no centro da vida pública${cite('li2020covid')}. ` +
              `Conceitos como R₀, curva epidêmica, excesso de mortalidade, vigilância genômica, vacinação ` +
              `e quarentena tornam-se vocabulário cotidiano. A pandemia também expõe tensões da disciplina: ` +
              `incerteza científica, comunicação pública, desigualdades sociais e o desafio de fazer ` +
              `ciência sob pressão e em tempo real.`
          },
          {
            year: 2022, displayYear: '~hoje',
            short: 'Causal',
            title: 'Inferência causal contemporânea — DAGs e ensaios-alvo',
            byline: 'Miguel Hernán, James Robins e outros',
            body:
              `Métodos formais de inferência causal — <strong>diagramas acíclicos direcionados</strong> ` +
              `(DAGs), modelos contrafactuais, emulação de ensaios-alvo (<em>target trial emulation</em>) — ` +
              `sistematizam a pergunta que sempre esteve no coração da epidemiologia: <em>o que ` +
              `aconteceria se mudássemos uma exposição?</em> O livro <em>Causal Inference: What If</em>, ` +
              `de Hernán e Robins, consolida essa abordagem e aproxima os estudos observacionais da lógica ` +
              `dos ensaios clínicos${cite('hernan2020causal')}, quando estes não são possíveis ou éticos.`
          }
        ]
      }
    ];
  }

  // Mantemos buildMilestones como alias legado caso algum código externo
  // ainda chame por esse nome — devolve a lista plana de marcos como antes.
  function buildMilestones() {
    const eras = buildEras();
    const out = [];
    eras.forEach(era => era.markers.forEach(m => out.push(m)));
    return out;
  }

  /* ---------------------------------------------------------------------
   * Quiz (atividade)
   * ------------------------------------------------------------------- */
  const QUIZ = [
    {
      q: 'Qual das definições abaixo melhor descreve a epidemiologia?',
      opts: [
        'O estudo de epidemias e pandemias ao longo da história.',
        'Estudo de como a doença se distribui nas populações e os fatores que influenciam essa distribuição.',
        'A investigação laboratorial de agentes infecciosos emergentes.',
        'O ramo da medicina dedicado ao tratamento de doenças contagiosas.'
      ],
      answer: 1,
      feedback:
        'A definição vem da etimologia e do escopo do campo: “estudo de como a doença se ' +
        'distribui nas populações e os fatores que influenciam ou determinam essa distribuição”. ' +
        'Note que epidemiologia não se restringe a doenças infecciosas — cobre também doenças ' +
        'crônicas, saúde mental, acidentes, etc.'
    },
    {
      q: 'A palavra “epidemiologia” vem do grego. Como se decompõe?',
      opts: [
        'epi (fora) + demos (doença) + logos (estudo)',
        'epi (sobre) + demos (povo) + logos (estudo)',
        'epi (além) + demos (tempo) + logos (razão)',
        'epi (contra) + demos (saúde) + logos (ciência)'
      ],
      answer: 1,
      feedback:
        '<strong>Epi</strong> (sobre, em cima) + <strong>demos</strong> (povo, pessoas) + <strong>logos</strong> (estudo). ' +
        'Literalmente, “o estudo do que está sobre o povo” — uma boa intuição do que o campo faz: ' +
        'olhar de cima para como doenças e determinantes se distribuem numa população.'
    },
    {
      q: 'Identificar precocemente, por rastreio (screening), mulheres com lesões pré-cancerosas do colo do útero é um exemplo de:',
      opts: [
        'Prevenção primária',
        'Prevenção secundária',
        'Prevenção terciária',
        'Nenhuma das anteriores — é diagnóstico, não prevenção'
      ],
      answer: 1,
      feedback:
        'Prevenção secundária detecta a doença numa fase pré-clínica, quando a intervenção ainda ' +
        'altera o desfecho. Vacinação contra HPV seria primária (impede o início); reabilitação após ' +
        'um câncer avançado seria terciária (reduz o impacto).'
    },
    {
      q: 'Em 1854, durante o surto de cólera em Soho, o que John Snow efetivamente fez?',
      opts: [
        'Isolou o Vibrio cholerae em laboratório pela primeira vez.',
        'Provou que o cólera era um miasma do ar, como se acreditava.',
        'Associou o consumo da água de uma bomba específica aos casos e pediu a remoção da alça.',
        'Desenvolveu a primeira vacina contra o cólera.'
      ],
      answer: 2,
      feedback:
        'Snow investigou sistematicamente onde cada vítima conseguia água, identificou a bomba de ' +
        'Broad Street como fonte comum e apresentou as evidências ao Conselho de Governadores. ' +
        'Em 8 de setembro de 1854 a alça da bomba foi removida. O isolamento do <em>V. cholerae</em> ' +
        'seria feito por Filippo Pacini ainda em 1854 (reconhecido décadas depois) e por Robert Koch ' +
        'em 1884 — não por Snow. E a vacina, muito mais tarde.'
    },
    {
      q: 'Qual a grande contribuição de William Farr para a epidemiologia?',
      opts: [
        'Descobriu o agente causador da tuberculose.',
        'Sistematizou as estatísticas de mortalidade e defendeu uma nomenclatura padronizada de doenças.',
        'Fundou a Organização Mundial da Saúde.',
        'Demonstrou a relação entre tabagismo e câncer de pulmão.'
      ],
      answer: 1,
      feedback:
        'Farr, como <em>Registrar General</em> da Inglaterra e País de Gales a partir de 1839, foi ' +
        'pioneiro na coleta e análise de dados de mortalidade em larga escala. Sua insistência em ' +
        'padronizar a nomenclatura médica pavimentou o caminho da CID, hoje usada em todo o mundo.'
    },
    {
      q: 'Os estudos de Doll e Bradford Hill (1954) sobre médicos britânicos são considerados um marco porque:',
      opts: [
        'Foram os primeiros ensaios clínicos randomizados da história.',
        'Forneceram a base para a moderna inferência causal em epidemiologia, com os critérios de Bradford Hill.',
        'Identificaram o vírus responsável pelo câncer de pulmão.',
        'Foram os primeiros estudos de epidemiologia realizados fora do Reino Unido.'
      ],
      answer: 1,
      feedback:
        'O estudo de coorte demonstrou associação robusta entre tabagismo e câncer de pulmão, e ' +
        'levou Bradford Hill a formular em 1965 os nove <em>critérios de causalidade</em> (força, ' +
        'consistência, especificidade, temporalidade, gradiente biológico, plausibilidade, coerência, ' +
        'experimento e analogia). Esses critérios ainda são a base prática para inferir causa a ' +
        'partir de associações.'
    }
  ];

  /* ---------------------------------------------------------------------
   * Renderização
   * ------------------------------------------------------------------- */

  function renderHeader(container) {
    const header = document.createElement('header');
    header.className = 'module-header';
    header.innerHTML = `
      <span class="module-badge">Módulo 01</span>
      <h1>Introdução à Epidemiologia</h1>
      <p class="module-subtitle">
        O que é epidemiologia, de onde vem o nome, quais os quatro níveis de
        prevenção, e por quem o campo foi construído — de Graunt em 1662 a
        Bradford Hill em 1954.
      </p>
    `;
    container.appendChild(header);
  }

  function renderDefinition(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>1. Definição</h2>
      <p>
        <strong>Epidemiologia</strong> é o estudo de como a doença se distribui nas populações
        e dos fatores que influenciam ou determinam essa distribuição. É, em outras palavras,
        a disciplina que nos ajuda a entender por que algumas pessoas adoecem e outras não,
        e por que a doença aparece onde aparece, quando aparece, e em quem aparece.
      </p>

      <div class="etymology-card">
        <div class="greek">epi + demos + logos</div>
        <p style="margin:0">Do grego antigo — literalmente, <em>o estudo do que está sobre o povo</em>.</p>
        <div class="greek-components">
          <span><strong>epi</strong> sobre, em cima de</span>
          <span><strong>demos</strong> povo, pessoas</span>
          <span><strong>logos</strong> estudo, razão, discurso</span>
        </div>
      </div>

      <p>
        Uma ideia fundadora do campo, hoje quase óbvia mas revolucionária no século XIX,
        é que <strong>problemas de saúde não são distribuídos aleatoriamente</strong> nas populações.
        Há padrões — geográficos, temporais, demográficos, sociais — e esses padrões
        contêm informação sobre as causas.
      </p>

      <p>
        A identificação desses padrões, porém, não é um fim em si. O motivo pelo qual a
        epidemiologia investe em descobrir fatores de risco e causas — individuais, ambientais,
        sociais, genéticos — é que, uma vez identificados, eles podem ser <em>modificados</em>:
        se sabemos que fumar aumenta o risco de câncer de pulmão, uma política antitabagismo
        reduz a incidência; se água contaminada causa cólera, saneamento quebra a cadeia;
        se o HPV precede o câncer de colo de útero, a vacinação muda a história natural
        da doença.
      </p>

      <p>
        É esse movimento — <strong>do compreender para o intervir</strong> — que a próxima
        seção formaliza em quatro níveis de prevenção.
      </p>
    `;
    container.appendChild(sec);
  }

  function renderPrevention(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>2. Os quatro níveis de prevenção</h2>
      <p>
        A epidemiologia organiza as ações de saúde em <strong>quatro níveis de prevenção</strong>.
        Os três primeiros — primária, secundária e terciária — vêm do modelo clássico de Leavell
        e Clark e se diferenciam pelo momento da intervenção em relação à doença. O quarto —
        prevenção quaternária — foi proposto pelo médico de família belga Marc Jamoulle, em 1986,
        e mudou a pergunta: em vez de "quando intervir?", ela pergunta "<em>quando parar de
        intervir?</em>".
      </p>

      <div class="prevention-grid">
        <div class="prevention-card">
          <div class="p-tier">Prevenção primária</div>
          <h3>Antes da doença</h3>
          <p>Atua em pessoas saudáveis, evitando o início da doença.</p>
          <div class="example"><strong>Exemplo:</strong> vacinação contra sarampo.</div>
        </div>
        <div class="prevention-card">
          <div class="p-tier">Prevenção secundária</div>
          <h3>Fase pré-clínica</h3>
          <p>Detecta a doença já presente, mas ainda assintomática, permitindo intervenção antes do quadro clínico.</p>
          <div class="example"><strong>Exemplo:</strong> rastreio de câncer de colo do útero.</div>
        </div>
        <div class="prevention-card">
          <div class="p-tier">Prevenção terciária</div>
          <h3>Após a doença instalada</h3>
          <p>Reduz o impacto da doença já estabelecida: sequelas, reinternações, mortalidade.</p>
          <div class="example"><strong>Exemplo:</strong> reabilitação pós-AVC.</div>
        </div>
        <div class="prevention-card">
          <div class="p-tier">Prevenção quaternária</div>
          <h3>Contra o excesso de medicina</h3>
          <p>Identifica pessoas em risco de supermedicalização e as protege de novas invasões médicas, oferecendo apenas intervenções com benefício comprovado e eticamente aceitáveis.</p>
          <div class="example"><strong>Exemplo:</strong> não pedir exames de rotina sem indicação clínica em paciente assintomático.</div>
        </div>
      </div>

      <p style="margin-top:1.2rem">
        A prevenção quaternária${cite('jamoulle1986information')} nasce de uma tensão interna à própria medicina preventiva: o
        modelo de Leavell e Clark pressupunha que prevenir é sempre desejável, mas a expansão de
        rastreamentos, tratamentos e categorias diagnósticas trouxe consigo novos sofrimentos —
        rótulos, ansiedade, cascatas de exames, intervenções sem benefício claro. Jamoulle definiu
        a prevenção quaternária como a ação destinada a proteger o paciente contra invasões médicas
        desnecessárias${cite('jamoulle2015answer')}, e o conceito tem sido revisado e refinado para abarcar contextos
        em que o balanço entre benefício e dano é incerto${cite('martins2018quaternary')}. Ela <strong>não é niilismo
        terapêutico</strong>: não defende "fazer menos" por princípio, e sim agir com proporcionalidade —
        intervir quando há boa razão, abster-se quando a intervenção tende a causar mais dano do que
        benefício. Voltaremos a esse tema em profundidade num módulo dedicado.
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---- Timeline interativa (5 eras temáticas) --------------------------
   *
   * Design:
   *   - 5 sub-timelines, uma para cada "virada" conceitual da história da
   *     epidemiologia (ver buildEras). Cada uma tem seu próprio domínio
   *     temporal — o que dispensa o toggle de zoom da versão anterior.
   *   - Cada era é renderizada como uma seção independente, com cabeçalho
   *     (numeral + título + intervalo), texto introdutório (lede), SVG da
   *     timeline e painel de detalhes próprios.
   *   - Estado de "marco selecionado" é por-era (closure local), não global
   *     — clicar num marco da Era 3 não afeta o que está selecionado na
   *     Era 5, e cada painel de detalhes só responde aos cliques da sua
   *     timeline.
   *   - Placement por "faixas" (lanes), estimativa de largura e algoritmo
   *     de colisão permanecem iguais — reutilizamos assignLanes e
   *     estimateLabelWidth da implementação anterior.
   * -------------------------------------------------------------------- */

  function renderTimeline(container) {
    // Constrói as 5 eras uma única vez por render() — cite() registra os
    // números Vancouver agora. erasCache fica disponível para os
    // drawEraTimeline em re-renders (resize) sem re-registrar citações.
    erasCache = buildEras();

    // Cabeçalho da seção 3
    const intro = document.createElement('section');
    intro.className = 'module-section';
    intro.innerHTML = `
      <h2>3. Marcos históricos</h2>
      <p>
        A história da epidemiologia pode ser organizada em <strong>cinco grandes viradas</strong> —
        cinco momentos em que o modo de pensar a doença mudou. Cada uma é apresentada abaixo com
        seus marcos principais. Clique em cada ponto para ler o detalhe.
      </p>
    `;
    container.appendChild(intro);

    // Renderiza cada era como uma sub-seção independente
    const drawFuncs = [];
    erasCache.forEach((era, idx) => {
      const drawFn = renderEraTimeline(container, era, idx);
      drawFuncs.push(drawFn);
    });

    // Redesenha todas as eras em resize (com throttling via RAF)
    let rafId;
    const onResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        drawFuncs.forEach(fn => fn());
      });
    };
    window.addEventListener('resize', onResize, { passive: true });
    EDL.onModuleDestroy(() => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  /**
   * Renderiza UMA era (uma sub-timeline) no container, e retorna a função
   * de redraw (chamada em resize).
   */
  function renderEraTimeline(container, era, idx) {
    const sec = document.createElement('section');
    sec.className = 'module-section era-timeline';
    sec.innerHTML = `
      <header class="era-header">
        <span class="era-numeral">Era ${era.numeral}</span>
        <h3 class="era-title">${era.title}</h3>
        <span class="era-domain">${era.subtitle}</span>
      </header>
      <p class="era-lede">${era.lede}</p>
      <div class="timeline-wrap">
        <div class="timeline-svg-wrap" id="m01-era${idx}-svg"></div>
        <div class="timeline-detail" id="m01-era${idx}-detail">
          <p class="muted" style="margin:0">Selecione um marco acima para ver detalhes.</p>
        </div>
      </div>
    `;
    container.appendChild(sec);

    const svgWrap = sec.querySelector(`#m01-era${idx}-svg`);
    const detail  = sec.querySelector(`#m01-era${idx}-detail`);

    // Estado local desta era — não compartilhado com outras
    let activeMilestone = null;

    function draw() {
      svgWrap.innerHTML = '';
      drawEraTimeline(svgWrap, detail, era,
        () => activeMilestone,
        m => { activeMilestone = m; });
    }

    requestAnimationFrame(draw);
    return draw;
  }

  /**
   * Estima a largura em pixels de um rótulo de marco (ano + nome curto).
   * Inter 11px ≈ 6.5 px/char para texto normal. Usamos o maior dos dois
   * textos do rótulo mais uma margem.
   */
  function estimateLabelWidth(m) {
    const yearW = String(m.year).length * 6.5;
    const shortW = m.short.length * 6.5;
    return Math.max(yearW, shortW) + 10; // +padding pra respiração
  }

  /**
   * Distribui os marcos em faixas (lanes) para evitar sobreposição.
   *
   * Algoritmo guloso: para cada marco (na ordem em que aparecem), tenta
   * primeiro a faixa preferida (acima/abaixo alternando). Se colide com o
   * último item da faixa, promove à próxima faixa mais distante do eixo.
   * Vai de faixa 0 (próxima ao eixo) a faixa 2 (mais longe). Se ainda não
   * couber no lado preferido, tenta o lado oposto.
   *
   * Retorna array paralelo ao input: [{ m, x, side, lane }, ...]
   */
  function assignLanes(milestones, xScale) {
    const MAX_LANE = 2;       // 3 faixas (0, 1, 2) de cada lado
    const PADDING  = 6;       // espaço mínimo horizontal entre rótulos vizinhos na mesma faixa
    const lanes = { top: [[], [], []], bottom: [[], [], []] };
    const out = [];

    function tryPlace(m, x, side) {
      const w = estimateLabelWidth(m);
      for (let lane = 0; lane <= MAX_LANE; lane++) {
        const last = lanes[side][lane][lanes[side][lane].length - 1];
        const leftEdge = x - w / 2;
        const rightEdge = x + w / 2;
        if (!last || (last.right + PADDING) <= leftEdge) {
          lanes[side][lane].push({ left: leftEdge, right: rightEdge });
          return { m, x, side, lane, width: w };
        }
      }
      return null;
    }

    milestones.forEach((m, i) => {
      const x = xScale(m.year);
      const preferred = (i % 2 === 0) ? 'top' : 'bottom';
      const alternate = (preferred === 'top') ? 'bottom' : 'top';

      const placed =
        tryPlace(m, x, preferred) ||
        tryPlace(m, x, alternate);

      if (placed) {
        out.push(placed);
      } else {
        // Fallback extremo — empurra pra faixa 2 do lado preferido mesmo com colisão
        out.push({ m, x, side: preferred, lane: MAX_LANE, width: estimateLabelWidth(m) });
      }
    });

    return out;
  }

  /**
   * Desenha o SVG de uma era — versão refatorada do drawTimeline antigo.
   *
   * Em vez de filtrar uma lista global por um domínio de zoom, recebe
   * diretamente a era com seu próprio domain e seus markers. Estado de
   * "marco ativo" é passado via getters/setters (closure local da era).
   */
  function drawEraTimeline(svgWrap, detail, era, getActive, setActive) {
    const d3 = window.d3;

    const w = svgWrap.clientWidth || 800;
    const margin = { top: 10, right: 24, bottom: 10, left: 24 };

    // Altura total é calculada pra caber 3 faixas de cada lado + eixo.
    //   lane 0: -22 / +34 (acima / abaixo)    linha guia ~14 px
    //   lane 1: -48 / +60
    //   lane 2: -74 / +86
    //   rótulo de ano: +12 em direção oposta ao eixo
    //   extras: décadas no centro (y=yLine+18)
    const yLine = 100;
    const h = 2 * yLine;   // 200 — simétrico

    const iw = w - margin.left - margin.right;

    const dom = era.domain;
    const visible = era.markers;   // já filtrado por construção (markers da era)

    const xScale = d3.scaleLinear().domain(dom).range([margin.left, margin.left + iw]);

    const svg = d3.select(svgWrap)
      .append('svg')
      .attr('class', 'timeline-svg')
      .attr('viewBox', `0 0 ${w} ${h}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%');

    // --- Linha central do eixo ---
    svg.append('line')
      .attr('x1', margin.left).attr('x2', margin.left + iw)
      .attr('y1', yLine).attr('y2', yLine)
      .attr('stroke', '#2a3449')
      .attr('stroke-width', 2);

    // --- Ticks de décadas ---
    // Passo adequado ao domínio da era (varia de 5 anos a 500).
    const domSpan = dom[1] - dom[0];
    const tickStep = domSpan > 1000 ? 500 :
                     domSpan > 200  ? 50  :
                     domSpan > 100  ? 20  :
                     domSpan > 50   ? 10  : 5;
    const tickStart = Math.ceil(dom[0] / tickStep) * tickStep;
    const tickYears = d3.range(tickStart, dom[1] + 1, tickStep);

    svg.append('g')
      .selectAll('g')
      .data(tickYears)
      .join('g')
      .attr('transform', d => `translate(${xScale(d)},${yLine})`)
      .call(g => {
        g.append('line').attr('y1', -3).attr('y2', 3).attr('stroke', '#3a4a68');
        g.append('text')
         .attr('y', 16).attr('text-anchor', 'middle')
         .attr('class', 'timeline-label')
         .text(d => d);
      });

    // --- Placement por faixas e desenho dos marcos ---
    const placed = assignLanes(visible, xScale);

    // Offsets verticais por lane (distância do eixo em px)
    const LANE_OFFSETS = [24, 52, 80];
    const LABEL_GAP = 14;   // distância entre o dot e o texto do ano

    const milestoneG = svg.append('g').attr('class', 'timeline-milestones');

    placed.forEach(p => {
      const { m, x, side, lane } = p;
      const direction = (side === 'top') ? -1 : 1;
      const dotY = yLine + direction * LANE_OFFSETS[lane];
      const labelY = dotY + direction * LABEL_GAP;          // ano (mais próximo do eixo no sentido contrário)
      const shortY = labelY + direction * 13;               // nome curto abaixo/acima do ano

      const g = milestoneG.append('g')
        .attr('class', 'milestone')
        .attr('transform', `translate(${x},0)`);

      // Linha-guia do eixo até o dot
      g.append('line')
        .attr('x1', 0).attr('x2', 0)
        .attr('y1', yLine)
        .attr('y2', dotY - direction * 6)
        .attr('stroke', '#3a4a68')
        .attr('stroke-width', 1);

      // Dot clicável
      const active = getActive();
      const isActive = active && active.year === m.year;
      const circle = g.append('circle')
        .attr('class', 'timeline-dot')
        .attr('cx', 0)
        .attr('cy', dotY)
        .attr('r', 6)
        .attr('fill', isActive ? '#00d9c0' : '#1c2436')
        .attr('stroke', '#00d9c0')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');

      if (isActive) circle.classed('active', true);

      circle.on('click', function () { selectMilestone(m, this); });

      // Rótulo ano (usa displayYear se definido — útil para "~450 a.C." etc.)
      g.append('text')
        .attr('x', 0).attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', direction === -1 ? 'auto' : 'hanging')
        .attr('class', 'timeline-label')
        .text(m.displayYear || m.year);

      // Rótulo nome curto
      g.append('text')
        .attr('x', 0).attr('y', shortY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', direction === -1 ? 'auto' : 'hanging')
        .attr('fill', '#a8b3c4')
        .style('font-size', '11px')
        .style('font-weight', '500')
        .text(m.short);
    });

    // --- Interação: seleção ---
    let currentActive = null;
    const initiallyActive = getActive();
    if (initiallyActive) {
      // Re-renderiza painel de detalhes se já havia marco ativo (resize)
      renderDetail(initiallyActive);
    }

    function selectMilestone(m, circleEl) {
      if (currentActive) d3.select(currentActive).classed('active', false).attr('fill', '#1c2436');
      d3.select(circleEl).classed('active', true).attr('fill', '#00d9c0');
      currentActive = circleEl;
      setActive(m);
      renderDetail(m);
    }

    function renderDetail(m) {
      detail.innerHTML = `
        <h4>${m.displayYear || m.year} · ${m.byline}</h4>
        <h3>${m.title}</h3>
        <p>${m.body}</p>
      `;
    }
  }

  /* ---- Atividade ---- */
  function renderActivity(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>4. Atividade — consolide o aprendizado</h2>
      <p>
        Seis perguntas cronometradas (20 segundos cada) com pontuação e bônus de
        velocidade. Após o tempo você ainda pode responder, valendo meio-crédito.
        Feedback explicativo em cada resposta; seu melhor resultado é salvo e
        contabilizado no progresso total.
      </p>
      <div class="activity-box" id="m01-activity"></div>
    `;
    container.appendChild(sec);

    EDL.quiz.run(sec.querySelector('#m01-activity'), { bank: QUIZ });
  }

  /* ---- Rodapé do módulo: próximos passos ---- */
  function renderFooter(container) {
    const sec = document.createElement('section');
    sec.className = 'module-section';
    sec.innerHTML = `
      <h2>Próximos passos</h2>
      <p>
        O próximo módulo — <strong>Conceitos Básicos</strong> — formaliza o vocabulário da
        epidemiologia: endemia, surto, epidemia, pandemia; reservatórios; risco e
        fatores de risco; caso notificado vs. confirmado. Ele ainda está em construção;
        volte em breve.
      </p>
      <p class="muted">
        Quer sugerir ajustes no conteúdo ou corrigir algo? Abra uma issue no repositório
        GitHub do projeto.
      </p>
    `;
    container.appendChild(sec);
  }

  /* ---------------------------------------------------------------------
   * Registro
   * ------------------------------------------------------------------- */
  EDL.registerModule({
    id: '01-introducao',
    number: 1,
    icon: '🧭',
    title: 'Introdução à Epidemiologia',
    subtitle: 'Definição, etimologia, tipos de prevenção e marcos históricos.',
    status: 'available',
    quizCount: QUIZ.length,
    render(container) {
      // CitationManager fresco a cada render — zera numeração e mapa.
      cm = EDL.citations.create({ idPrefix: 'm01-ref-' });

      renderHeader(container);
      renderDefinition(container);
      renderPrevention(container);
      renderTimeline(container);
      renderActivity(container);

      // Referências citadas (Vancouver, ordem de primeira aparição)
      EDL.refs.renderCitedReferences(container, cm, { moduleNumber: 1 });

      renderFooter(container);
    }
  });
})();
