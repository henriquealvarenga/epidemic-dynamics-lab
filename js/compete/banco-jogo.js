/* =========================================================================
 * EDL — compete/banco-jogo.js
 *
 * Banco de 30 questões do MODO GAME — separado dos quizzes dos módulos.
 *
 * ⚠️ CONTEÚDO GERADO, PENDENTE DE REVISÃO DO PROFESSOR.
 *    As questões abaixo foram escritas a partir da teoria dos oito módulos.
 *    Algumas são adaptações das que já existiam nos módulos (reescritas,
 *    com distratores novos ou cenário clínico), outras são inéditas.
 *    Material didático de medicina exige conferência humana antes do uso
 *    em aula — em especial os números de R₀, coberturas vacinais e os
 *    dados históricos.
 *
 * POR QUE UM BANCO SEPARADO
 *    As questões dos módulos ficam no fim de páginas longas de teoria, e
 *    servem ao estudo individual: o aluno responde, vê o gabarito na hora
 *    e revisa o que errou (js/core/progress.js até lista os erros dele).
 *    Reusá-las na competição criaria três problemas:
 *
 *    1. Spoiler. Quem estudou o módulo já viu exatamente aquelas questões
 *       — competiria em memória, não em conhecimento.
 *    2. Ritmo. Os módulos têm de 4 a 10 questões; uma rodada de aula quer
 *       duração previsível.
 *    3. Atrito. "Entrem no módulo 5 e rolem até o fim" não é uma boa
 *       instrução com a turma esperando.
 *
 *    O sorteio de N entre 30 acrescenta uma quarta defesa: mesmo nas
 *    questões adaptadas, ninguém sabe quais vão cair.
 *
 * FORMATO
 *    Idêntico ao esperado por EDL.quiz.run — { q, opts, answer, feedback,
 *    scenario? } — para que o mesmo motor cronometrado e a mesma regra de
 *    pontuação valham aqui.
 *
 * Exporta: window.EDL.compete.bancoJogo
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const compete = (EDL.compete = EDL.compete || {});

  const QUESTOES = [

    /* ---------- Fundamentos e história (1–4) ---------- */
    {
      tema: 'fundamentos',
      q: 'A epidemiologia se distingue da clínica principalmente porque:',
      opts: [
        'estuda apenas doenças infecciosas, enquanto a clínica cuida das crônicas',
        'só se aplica a surtos e emergências de saúde pública',
        'depende de exames laboratoriais, enquanto a clínica depende do exame físico',
        'sua unidade de análise é a população, não o indivíduo'
      ],
      answer: 3,
      feedback: 'O deslocamento do indivíduo para a população é a virada que funda a disciplina — de Graunt contando mortes em Londres a Doll e Hill acompanhando médicos britânicos. Epidemiologia estuda doenças crônicas tanto quanto infecciosas.'
    },
    {
      tema: 'fundamentos',
      q: 'Uma campanha de vacinação contra HPV em meninas de 11 anos é prevenção de que nível?',
      opts: ['Primária', 'Secundária', 'Terciária', 'Quaternária'],
      answer: 0,
      feedback: '<strong>Primária</strong>: age antes de a doença existir, reduzindo a incidência. Secundária seria o rastreio (Papanicolau) para achar lesão já instalada; terciária, reabilitar quem adoeceu; quaternária, proteger de intervenção médica excessiva.'
    },
    {
      tema: 'fundamentos',
      q: 'Evitar solicitar tomografia de rotina em paciente com lombalgia aguda sem sinais de alarme é um exemplo de prevenção:',
      opts: ['Primária', 'Secundária', 'Terciária', 'Quaternária'],
      answer: 3,
      feedback: '<strong>Quaternária</strong> (Jamoulle, 1986): proteger o paciente de intervenções médicas desnecessárias e do dano que elas causam — achados incidentais, ansiedade, cascata diagnóstica.'
    },
    {
      tema: 'fundamentos',
      q: 'O que os estudos de Doll e Hill sobre médicos britânicos consolidaram para a epidemiologia?',
      opts: [
        'A descoberta do agente infeccioso do câncer de pulmão',
        'O primeiro ensaio clínico randomizado da história',
        'As bases da inferência causal a partir de associações estatísticas',
        'A criação da Classificação Internacional de Doenças'
      ],
      answer: 2,
      feedback: 'A coorte dos médicos britânicos mostrou que era possível sustentar causalidade sem experimento — e levou Bradford Hill a formular, em 1965, os critérios que ainda orientam a inferência causal.'
    },

    /* ---------- Conceitos básicos (5–10) ---------- */
    {
      tema: 'conceitos',
      scenario: {
        title: 'Unidade de saúde, interior de Minas',
        body: 'Em duas semanas, sete moradores da mesma rua procuram atendimento com diarreia aquosa. Todos usam água de um poço comum. Nos outros bairros, nada de diferente.',
        meta: [{ label: 'Casos', value: '7' }, { label: 'Área', value: 'uma rua' }, { label: 'Período', value: '2 semanas' }]
      },
      q: 'Como classificar epidemiologicamente esse evento?',
      opts: ['Endemia', 'Surto', 'Pandemia', 'Caso esporádico'],
      answer: 1,
      feedback: '<strong>Surto</strong>: elevação de casos restrita a uma área pequena e bem delimitada, com ligação entre os casos. Epidemia seria a mesma elevação em área maior; endemia, presença habitual e estável.'
    },
    {
      tema: 'conceitos',
      q: 'Malária na região amazônica, com número de casos estável e esperado ano após ano, caracteriza:',
      opts: ['Surto', 'Epidemia', 'Endemia', 'Pandemia'],
      answer: 2,
      feedback: '<strong>Endemia</strong> é a presença habitual da doença numa área, num patamar esperado. Endêmico não significa raro nem inofensivo — significa previsível.'
    },
    {
      tema: 'conceitos',
      q: 'O que diferencia uma pandemia de uma epidemia?',
      opts: [
        'A extensão geográfica: a pandemia atravessa continentes',
        'A gravidade dos casos e a letalidade',
        'A existência de vacina disponível',
        'O fato de o agente ser um vírus, e não uma bactéria'
      ],
      answer: 0,
      feedback: 'O critério é geográfico, não de gravidade. Uma pandemia pode ser branda e uma epidemia local, devastadora — a distinção diz respeito à disseminação.'
    },
    {
      tema: 'conceitos',
      scenario: {
        title: 'Pronto-socorro, plantão noturno',
        body: 'Paciente com febre há 3 dias, mialgia e dor retro-orbitária. O médico preenche a ficha de notificação de dengue. A sorologia foi coletada e ainda não voltou.',
        meta: [{ label: 'Sorologia', value: 'pendente' }]
      },
      q: 'Neste momento, o que este paciente representa?',
      opts: [
        'Caso confirmado de dengue',
        'Caso notificado, ainda não confirmado',
        'Caso descartado',
        'Não é caso, pois falta confirmação laboratorial'
      ],
      answer: 1,
      feedback: 'Notificar é comunicar a suspeita; confirmar depende de critério laboratorial ou clínico-epidemiológico. A vigilância trabalha com casos suspeitos, notificados, confirmados e descartados — e a notificação não pode esperar a confirmação.'
    },
    {
      tema: 'conceitos',
      q: 'Sedentarismo está associado a maior incidência de doença cardiovascular. Epidemiologicamente, sedentarismo é:',
      opts: [
        'A causa da doença cardiovascular',
        'Um reservatório',
        'Um desfecho da doença cardiovascular',
        'Um fator de risco'
      ],
      answer: 3,
      feedback: 'Fator de risco é o atributo que aumenta a probabilidade do desfecho, sem ser suficiente nem necessário para causá-lo. Chamá-lo de "a causa" atribui a uma associação uma força que ela não tem.'
    },
    {
      tema: 'conceitos',
      q: 'Por que o sarampo é candidato à erradicação e a febre amarela não é?',
      opts: [
        'Porque a vacina do sarampo é mais eficaz',
        'Porque o sarampo tem R₀ menor',
        'Porque o sarampo tem o ser humano como único reservatório, e a febre amarela tem ciclo silvestre em primatas',
        'Porque a febre amarela é endêmica e o sarampo não'
      ],
      answer: 2,
      feedback: 'Erradicação exige que não haja reservatório fora do humano. Com ciclo silvestre em primatas não humanos e mosquitos, a febre amarela sempre pode reintroduzir-se — por isso se fala em controle, não em erradicação.'
    },

    /* ---------- Cadeia epidemiológica (11–14) ---------- */
    {
      tema: 'cadeia',
      scenario: {
        title: 'Após a enchente',
        body: 'Duas semanas depois de uma enchente, moradores que participaram da limpeza das casas chegam com febre alta, mialgia intensa em panturrilhas e sufusão conjuntival.',
        meta: [{ label: 'Exposição', value: 'água de enchente' }, { label: 'Intervalo', value: '~2 semanas' }]
      },
      q: 'Qual é o modo de transmissão em questão?',
      opts: [
        'Contato direto entre pessoas doentes',
        'Contato da pele ou mucosa com água contaminada por urina de roedores',
        'Inalação de aerossóis da água parada',
        'Picada de mosquito que se reproduz na água parada'
      ],
      answer: 1,
      feedback: 'Leptospirose: a <em>Leptospira</em> é eliminada na urina de roedores, sobrevive na água e penetra por pele lesada ou mucosas. Não há transmissão pessoa a pessoa — o que muda completamente as medidas de controle.'
    },
    {
      tema: 'cadeia',
      /* O cenário é REPETIDO de propósito, e não referenciado.
       *
       * Esta questão dizia "no caso anterior". Como a rodada sorteia N das
       * 30 e embaralha, ela caía sem o caso em mais da metade dos sorteios
       * simulados — pergunta impossível de responder — e, quando os dois
       * caíam juntos, podiam ficar vinte questões distantes. O aluno não
       * tem como voltar para reler.
       *
       * O texto abaixo descreve o mesmo caso SEM nomear a doença nem a via:
       * assim ele não entrega a resposta da questão anterior, que pergunta
       * exatamente qual é o modo de transmissão. */
      scenario: {
        title: 'Depois da enchente',
        body: 'Duas semanas após uma enchente, moradores que ajudaram na limpeza das casas adoecem com febre alta, dor intensa nas panturrilhas e olhos avermelhados.',
        meta: [{ label: 'Exposição', value: 'água de enchente' }]
      },
      q: 'Nesse caso, qual medida <strong>não</strong> interrompe a cadeia de transmissão?',
      opts: [
        'Controle de roedores',
        'Botas e luvas para quem limpa',
        'Distribuição de máscaras faciais à população',
        'Drenagem das áreas alagadas'
      ],
      answer: 2,
      feedback: 'Nada no caso aponta para via respiratória: a exposição é à água, pela pele e mucosas. Máscara protege uma porta de entrada que não está em jogo. As outras três agem em elos reais — o reservatório (roedores), a barreira de contato (botas e luvas) e o veículo (água parada).'
    },
    {
      tema: 'cadeia',
      /* Versão anterior perguntava em qual elo a CLORAÇÃO age, e a resposta
       * "modo de transmissão" era discutível: a água é o veículo, mas
       * também é reservatório ambiental do V. cholerae, então "reservatório"
       * se defende. O professor errou a própria questão e ficou em dúvida
       * se o gabarito estava certo — sinal de item ambíguo, não de item
       * difícil. Aqui o sentido é invertido: dado o elo, qual medida age
       * nele. Só a vacina age no hospedeiro, sem margem para discussão. */
      q: 'Numa epidemia de cólera transmitida pela água de abastecimento, qual medida age sobre o hospedeiro suscetível?',
      opts: [
        'Clorar a água de abastecimento',
        'Tratar os doentes com reidratação e antibiótico',
        'Vacinar a população contra a cólera',
        'Construir rede de esgoto para o destino das fezes'
      ],
      answer: 2,
      feedback: 'Cada medida age num elo diferente: a cloração corta o veículo (modo de transmissão), o tratamento dos doentes reduz o reservatório humano, o esgoto fecha a porta de saída, e só a vacina age sobre o hospedeiro suscetível. Saber em qual elo se está agindo é o que permite escolher a medida certa para o que se tem em mãos.'
    },
    {
      tema: 'cadeia',
      q: 'Isolamento de um paciente com tuberculose pulmonar bacilífera age principalmente sobre:',
      opts: [
        'O reservatório e a porta de saída',
        'A porta de entrada do novo hospedeiro',
        'O agente etiológico',
        'A suscetibilidade da população'
      ],
      answer: 0,
      feedback: 'O paciente bacilífero é a fonte, e a tosse é a porta de saída. Isolar contém a emissão de aerossóis; o tratamento, ao negativar a baciloscopia, encerra o mesmo elo de forma definitiva.'
    },

    /* ---------- Dinâmica no indivíduo (15–18) ---------- */
    {
      tema: 'individuo',
      q: 'Período de incubação é o intervalo entre:',
      opts: [
        'a exposição e o início dos sintomas',
        'a exposição e o início da transmissibilidade',
        'o início dos sintomas e a recuperação',
        'a infecção e a produção de anticorpos detectáveis'
      ],
      answer: 0,
      feedback: 'Incubação é clínica: exposição → sintomas. O intervalo até a pessoa se tornar transmissora é o <strong>período latente</strong>, e os dois não coincidem — quando a transmissibilidade começa antes dos sintomas, o controle fica muito mais difícil.'
    },
    {
      tema: 'individuo',
      q: 'Por que a COVID-19 se mostrou mais difícil de conter que o SARS de 2003?',
      opts: [
        'Porque tem letalidade maior',
        'Porque o período de incubação é mais longo',
        'Porque não existia teste diagnóstico',
        'Porque a transmissão começa antes do aparecimento dos sintomas'
      ],
      answer: 3,
      feedback: 'No SARS a transmissão era ligada à doença sintomática, então isolar quem tinha febre funcionava. Com transmissão pré-sintomática, o portador circula transmitindo antes de qualquer suspeita — e a triagem por sintoma deixa de bastar.'
    },
    {
      tema: 'individuo',
      q: 'Qual agente é exemplo clássico de <strong>latência</strong> com reativação anos depois?',
      opts: ['Vírus varicela-zóster', 'Vírus influenza', 'Vibrio cholerae', 'Vírus da dengue'],
      answer: 0,
      feedback: 'A varicela na infância deixa o vírus latente nos gânglios sensitivos; a reativação, décadas depois, é o herpes-zóster. Herpes simples e o bacilo da tuberculose têm comportamento análogo.'
    },
    {
      tema: 'individuo',
      q: 'Ordem cronológica correta na história natural de uma doença infecciosa aguda:',
      opts: [
        'Incubação → prodrômico → clínico → convalescença',
        'Prodrômico → incubação → clínico → convalescença',
        'Incubação → clínico → prodrômico → convalescença',
        'Incubação → prodrômico → convalescença → clínico'
      ],
      answer: 0,
      feedback: 'Exposição, incubação silenciosa, pródromos inespecíficos (mal-estar, febre baixa), quadro clínico característico e convalescença. O pródromo costuma ser o momento de maior transmissibilidade em várias viroses.'
    },

    /* ---------- R₀ e crescimento (19–22) ---------- */
    {
      tema: 'r0',
      q: 'R₀ é definido como o número médio de casos secundários gerados por um caso em:',
      opts: [
        'qualquer população, a qualquer momento do surto',
        'uma população fechada, sem entrada ou saída de pessoas',
        'uma população com cobertura vacinal de 50%',
        'uma população inteiramente suscetível'
      ],
      answer: 3,
      feedback: 'A condição de suscetibilidade total é o que torna o R₀ uma característica do par agente-população, e não do momento. Assim que parte da população fica imune, quem descreve a transmissão é o R efetivo.'
    },
    {
      tema: 'r0',
      q: 'Numa população em que 60% já está imune e o R₀ é 2,5, qual o R efetivo?',
      opts: ['2,5', '1,5', '1,0', '0,4'],
      answer: 2,
      feedback: 'R<sub>e</sub> = R₀ × fração suscetível = 2,5 × 0,4 = <strong>1,0</strong>. Exatamente no limiar: cada caso gera um caso, e a epidemia deixa de crescer sem ainda regredir.'
    },
    {
      tema: 'r0',
      q: 'Dois surtos começam com um caso. No A, R₀ = 1,5; no B, R₀ = 3. Após 10 ciclos, quantas vezes o B é maior que o A?',
      opts: ['Cerca de 2 vezes', 'Cerca de 30 vezes', 'Cerca de 1.000 vezes', 'Cerca de 60.000 vezes'],
      answer: 2,
      feedback: 'No ciclo 10: 3¹⁰ = 59.049 casos contra 1,5¹⁰ ≈ 58. A razão é (3/1,5)¹⁰ = 2¹⁰ = <strong>1.024</strong>. O R₀ dobrou; o surto ficou mil vezes maior. É o efeito exponencial que a intuição não acompanha — e a razão de intervenções precoces valerem tanto.'
    },
    {
      tema: 'r0',
      /* A versão anterior era "uma doença com R₀ = 2 tem tempo de duplicação,
       * em ciclos, de:", com resposta "1 ciclo". Dois defeitos: usava
       * "ciclo" como unidade de tempo sem nunca dizer que ciclo é geração,
       * e, entendida a linguagem, virava tautologia — R₀ = 2 dobra por
       * definição. O professor não entendeu a questão, e ele escreveu o
       * curso. Trocada pelo conceito que aquela confundia: R₀ diz quantos,
       * o intervalo entre gerações diz em quanto tempo. */
      q: 'Duas doenças têm o mesmo R₀ = 2, mas o intervalo entre uma geração de casos e a seguinte é de 3 dias numa e de 3 semanas na outra. O que muda?',
      opts: [
        'Nada: com o mesmo R₀, as duas epidemias evoluem do mesmo jeito',
        'A de intervalo curto cresce muito mais rápido no calendário, embora o número de casos por geração seja o mesmo',
        'A de intervalo longo infecta mais gente no total, porque circula por mais tempo',
        'A de intervalo curto exige cobertura vacinal mais alta para atingir a imunidade de rebanho'
      ],
      answer: 1,
      feedback: 'R₀ diz QUANTOS casos cada caso gera; o intervalo entre gerações diz EM QUANTO TEMPO. As duas dobram a cada geração, mas uma dobra a cada 3 dias e a outra a cada 3 semanas — é a diferença entre uma epidemia que explode em um mês e outra que leva um ano. O limiar de rebanho depende só do R₀: 1 − 1/2 = 50% nas duas.'
    },

    /* ---------- Imunidade de rebanho (23–26) ---------- */
    {
      tema: 'rebanho',
      q: 'O limiar de imunidade de rebanho é dado por:',
      opts: ['1 − 1/R₀', '1/R₀', 'R₀ − 1', '1/(R₀ − 1)'],
      answer: 0,
      feedback: 'A fração imune precisa ser grande o bastante para levar o R efetivo abaixo de 1. Resolvendo R₀ × (1 − p) < 1, chega-se a p > <strong>1 − 1/R₀</strong>.'
    },
    {
      tema: 'rebanho',
      q: 'Sarampo tem R₀ entre 12 e 18. Qual cobertura vacinal mínima aproximada isso exige?',
      opts: ['Cerca de 50%', 'Cerca de 75%', 'Cerca de 85%', 'Acima de 92%'],
      answer: 3,
      feedback: 'Com R₀ = 12, o limiar é 1 − 1/12 ≈ 92%; com R₀ = 18, ≈ 94%. É por isso que o sarampo volta assim que a cobertura cai poucos pontos — a margem entre controle e surto é estreitíssima.'
    },
    {
      tema: 'rebanho',
      scenario: {
        title: 'Município de 10.000 habitantes',
        body: 'A cobertura vacinal para uma doença com R₀ = 5 está em 70%. Um caso importado chega à cidade.',
        meta: [{ label: 'Cobertura', value: '70%' }, { label: 'R₀', value: '5' }]
      },
      q: 'Qual a avaliação epidemiológica correta?',
      opts: [
        'Imunidade de rebanho atingida; surto improvável',
        'Cobertura abaixo do limiar de 80% — o surto pode se propagar',
        'Impossível avaliar sem conhecer a incidência prévia',
        'Imunidade de rebanho não se aplica a populações desse tamanho'
      ],
      answer: 1,
      feedback: 'Limiar = 1 − 1/5 = 80%. Com 70%, o R efetivo é 5 × 0,30 = 1,5 — acima de 1, portanto com potencial de crescimento sustentado.'
    },
    {
      tema: 'rebanho',
      q: 'Por que a imunidade de rebanho não protege contra tétano?',
      opts: [
        'Porque a vacina antitetânica tem eficácia baixa',
        'Porque o R₀ do tétano é altíssimo',
        'Porque não há transmissão pessoa a pessoa — a fonte é ambiental',
        'Porque a imunidade dura pouco tempo'
      ],
      answer: 2,
      feedback: 'O <em>C. tetani</em> vive no solo e infecta por ferimento. Como ninguém transmite tétano a ninguém, vacinar o vizinho não protege você — a proteção é estritamente individual. A imunidade de rebanho pressupõe cadeia de transmissão interpessoal.'
    },

    /* ---------- Modelos compartimentais (27–28) ---------- */
    {
      tema: 'modelos',
      q: 'O que o compartimento E do modelo SEIR representa, e que o SIR não captura?',
      opts: [
        'Pessoas expostas que ficaram imunes sem adoecer',
        'Pessoas que morreram durante o surto',
        'Pessoas em isolamento domiciliar',
        'Pessoas infectadas mas ainda não infectantes'
      ],
      answer: 3,
      feedback: 'O E modela o período latente — infectado, sem transmitir ainda. Isso atrasa e achata o pico em relação ao SIR com o mesmo R₀, e é essencial para doenças de latência longa.'
    },
    {
      tema: 'modelos',
      q: 'Num SIR com R₀ = 3, cerca de 94% da população se infecta até o fim do surto, embora o limiar de rebanho seja 67%. Por quê?',
      opts: [
        'Porque o modelo assume que a imunidade não é duradoura',
        'Por overshoot: ao cruzar o limiar ainda há muitos infectantes circulando',
        'Porque o cálculo do limiar não vale para R₀ maior que 2',
        'Porque o modelo ignora a recuperação'
      ],
      answer: 1,
      feedback: 'O limiar diz onde a epidemia <em>para de crescer</em>, não onde ela acaba. No ponto de inflexão existe um estoque grande de infectantes que continua transmitindo enquanto se recupera — e a epidemia ultrapassa o limiar por inércia. É o argumento epidemiológico contra "deixar a doença correr".'
    },

    /* ---------- Casos históricos (29–30) ---------- */
    {
      tema: 'historia',
      q: 'Além de remover a alça da bomba, qual foi a contribuição metodológica mais forte de John Snow?',
      opts: [
        'Ter isolado o <em>Vibrio cholerae</em> ao microscópio',
        'Ter cunhado o termo "epidemiologia"',
        'O Grand Experiment: comparar a mortalidade entre clientes de duas companhias de água',
        'Ter provado que o cólera se transmitia por miasmas'
      ],
      answer: 2,
      feedback: 'Southwark & Vauxhall captava água abaixo dos despejos; Lambeth, acima. Casas vizinhas, na mesma rua, servidas por companhias diferentes — um experimento natural. A mortalidade foi cerca de 8 a 9 vezes maior entre os clientes da primeira.'
    },
    {
      tema: 'historia',
      q: 'Qual lição a comparação entre Soho (1854) e Haiti (2010) torna mais evidente?',
      opts: [
        'Que a cólera confere imunidade permanente após a infecção',
        'Que sem saneamento a cólera persiste pelos mesmos mecanismos, 156 anos depois — o obstáculo é estrutural, não de conhecimento',
        'Que a vacina resolve a cólera em qualquer contexto',
        'Que os dois surtos vieram da mesma cepa bacteriana'
      ],
      answer: 1,
      feedback: 'Snow provou o mecanismo em dias e não pôde agir; Bazalgette agiu por 16 anos motivado pela teoria errada e funcionou; o Haiti tem o conhecimento e não os recursos. Não é falta de saber — é falta de condições estruturais para agir sobre o que se sabe.'
    }
  ];

  /* -----------------------------------------------------------------------
   * Sorteio
   *
   * DERIVADO DO CÓDIGO DA SALA, não aleatório por cliente. Todos os grupos
   * precisam receber exatamente as mesmas questões, na mesma ordem — senão
   * não é competição. Semear pelo código evita ter de guardar a seleção no
   * banco: mesmo código, mesmo sorteio, em qualquer aparelho.
   * --------------------------------------------------------------------- */

  function semente(texto) {
    let h = 2166136261;                       // FNV-1a de 32 bits
    const s = String(texto || '');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h) || 1;
  }

  /** N questões do banco, sorteadas de forma estável a partir do código. */
  function sortear(codigoDaSala, quantidade) {
    const n = Math.max(1, Math.min(QUESTOES.length, quantidade || 10));
    const indices = QUESTOES.map((_, i) => i);
    const rng = EDL.math.seededRNG(semente(codigoDaSala));
    EDL.math.shuffleInPlace(indices, rng);
    return indices.slice(0, n).map(i => QUESTOES[i]);
  }

  compete.bancoJogo = {
    total: QUESTOES.length,
    todas: () => QUESTOES.slice(),
    sortear,
    /** Tamanhos oferecidos no console do professor. */
    tamanhos: [10, 15, 20, 25, 30]
  };
})();
