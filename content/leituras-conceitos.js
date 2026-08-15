/* =========================================================================
 * EDL — content/leituras-conceitos.js
 *
 * Bibliografia comentada "Os conceitos que a epidemiologia usa sem definir":
 * 51 artigos sobre exposição, desfecho, correlação, causalidade, inferência
 * e risco, agrupados pelo conceito em disputa. Metadados conferidos na
 * Crossref e no PubMed; todos os itens têm DOI.
 *
 * Por que este arquivo é separado de references/references.js:
 *   - references.* é a bibliografia DO APP (o que os módulos citam), gerada
 *     por scripts/bib2json.py a partir do .bib e agrupada por módulo.
 *   - esta lista é uma leitura complementar, curada por conceito, que não
 *     é citada em módulo nenhum. Misturá-las jogaria 51 itens no balde
 *     "Sem módulo associado" da tela de Bibliografia e apagaria o
 *     agrupamento conceitual, que é o que dá sentido à lista.
 *
 * Formato de cada referência:
 *   { year, title, authors, source, doi }
 * `source` é a linha de periódico já formatada ("Epidemiology 21(1): 3–9").
 * A URL é derivada do DOI na renderização (js/core/leituras-view.js) — não
 * guardamos o link pronto para não ter duas fontes de verdade.
 *
 * Uso: carregado via <script> no index.html; define
 *   window.EDL.content.leituras
 * Renderizado por js/core/leituras-view.js na rota #/leituras.
 * ========================================================================= */

window.EDL = window.EDL || {};
window.EDL.content = window.EDL.content || {};

window.EDL.content.leituras = {
  titulo: "Os conceitos que a epidemiologia usa sem definir",
  lede: "Exposição, desfecho, correlação, causalidade, inferência e risco aparecem em todo artigo empírico como se fossem evidentes. Não são. Esta é a literatura que os discute diretamente — 51 artigos, todos com DOI verificado, organizados pelo conceito em disputa.",

  secoes: [
    {
      id: "causalidade",
      titulo: "Causalidade",
      resumo: "O que a epidemiologia quer dizer quando diz que algo causa algo. Definições concorrentes, do modelo de causas componentes à crítica da teia causal.",
      refs: [
        { year: "1965", title: "The Environment and Disease: Association or Causation?",
          authors: "Hill A. B.",
          source: "Proceedings of the Royal Society of Medicine 58(5): 295–300",
          doi: "10.1177/0141076814562718" },
        { year: "1976", title: "Causes",
          authors: "Rothman K. J.",
          source: "American Journal of Epidemiology 104(6): 587–592",
          doi: "10.1093/oxfordjournals.aje.a112335" },
        { year: "1980", title: "Concepts of Interaction",
          authors: "Rothman K. J., Greenland S., Walker A. M.",
          source: "American Journal of Epidemiology 112(4): 467–470",
          doi: "10.1093/oxfordjournals.aje.a113015" },
        { year: "1991", title: "What Is a Cause and How Do We Know One? A Grammar for Pragmatic Epidemiology",
          authors: "Susser M.",
          source: "American Journal of Epidemiology 133(7): 635–648",
          doi: "10.1093/oxfordjournals.aje.a115939" },
        { year: "1994", title: "Epidemiology and the Web of Causation: Has Anyone Seen the Spider?",
          authors: "Krieger N.",
          source: "Social Science & Medicine 39(7): 887–903",
          doi: "10.1016/0277-9536(94)90202-X" },
        { year: "2000", title: "Looking Back on \"Causal Thinking in the Health Sciences\"",
          authors: "Kaufman J. S., Poole C.",
          source: "Annual Review of Public Health 21(1): 101–119",
          doi: "10.1146/annurev.publhealth.21.1.101" },
        { year: "2001", title: "Causation in Epidemiology",
          authors: "Parascandola M., Weed D. L.",
          source: "Journal of Epidemiology and Community Health 55(12): 905–912",
          doi: "10.1136/jech.55.12.905" },
        { year: "2005", title: "Causation and Causal Inference in Epidemiology",
          authors: "Rothman K. J., Greenland S.",
          source: "American Journal of Public Health 95(S1): S144–S150",
          doi: "10.2105/AJPH.2004.059204" },
        { year: "2009", title: "Causation and Models of Disease in Epidemiology",
          authors: "Broadbent A.",
          source: "Studies in History and Philosophy of Biological and Biomedical Sciences 40(4): 302–311",
          doi: "10.1016/j.shpsc.2009.09.006" }
      ]
    },
    {
      id: "debate",
      titulo: "O debate do IJE, 2016",
      resumo: "Um fascículo inteiro do <i>International Journal of Epidemiology</i> dedicado à mesma pergunta: o artigo-alvo, cinco comentários que não se conciliam e a réplica. Leia na ordem das páginas.",
      refs: [
        { year: "2016", title: "Causality and Causal Inference in Epidemiology: The Need for a Pluralistic Approach",
          authors: "Vandenbroucke J. P., Broadbent A., Pearce N.",
          source: "International Journal of Epidemiology 45(6): 1776–1786",
          doi: "10.1093/ije/dyv341" },
        { year: "2016", title: "The Tale Wagged by the DAG: Broadening the Scope of Causal Inference and Explanation for Epidemiology",
          authors: "Krieger N., Davey Smith G.",
          source: "International Journal of Epidemiology 45(6): 1787–1808",
          doi: "10.1093/ije/dyw114" },
        { year: "2016", title: "Commentary: On Causes, Causal Inference, and Potential Outcomes",
          authors: "VanderWeele T. J.",
          source: "International Journal of Epidemiology 45(6): 1809–1816",
          doi: "10.1093/ije/dyw230" },
        { year: "2016", title: "Commentary: The Formal Approach to Quantitative Causal Inference in Epidemiology: Misguided or Misrepresented?",
          authors: "Daniel R. M., De Stavola B. L., Vansteelandt S.",
          source: "International Journal of Epidemiology 45(6): 1817–1829",
          doi: "10.1093/ije/dyw227" },
        { year: "2016", title: "Commentary: Counterfactual Causation and Streetlamps: What Is to Be Done?",
          authors: "Robins J. M., Weissman M. B.",
          source: "International Journal of Epidemiology 45(6): 1830–1835",
          doi: "10.1093/ije/dyw231" },
        { year: "2016", title: "Response: Formalism or Pluralism? A Reply to Commentaries on `Causality and Causal Inference in Epidemiology'",
          authors: "Broadbent A., Vandenbroucke J. P., Pearce N.",
          source: "International Journal of Epidemiology 45(6): 1841–1851",
          doi: "10.1093/ije/dyw298" },
        { year: "2016", title: "Causal Inference—So Much More Than Statistics",
          authors: "Pearce N., Lawlor D. A.",
          source: "International Journal of Epidemiology 45(6): 1895–1903",
          doi: "10.1093/ije/dyw328" }
      ]
    },
    {
      id: "exposicao",
      titulo: "Exposição",
      resumo: "A exigência de que a exposição seja bem definida. Se não há intervenção imaginável que a produza, o efeito estimado não tem referente.",
      refs: [
        { year: "2004", title: "A Definition of Causal Effect for Epidemiological Research",
          authors: "Hernán M. A.",
          source: "Journal of Epidemiology and Community Health 58(4): 265–271",
          doi: "10.1136/jech.2002.006361" },
        { year: "2005", title: "Invited Commentary: Hypothetical Interventions to Define Causal Effects—Afterthought or Prerequisite?",
          authors: "Hernán M. A.",
          source: "American Journal of Epidemiology 162(7): 618–620",
          doi: "10.1093/aje/kwi255" },
        { year: "2008", title: "Does Obesity Shorten Life? The Importance of Well-Defined Interventions to Answer Causal Questions",
          authors: "Hernán M. A., Taubman S. L.",
          source: "International Journal of Obesity 32(S3): S8–S14",
          doi: "10.1038/ijo.2008.82" },
        { year: "2009", title: "The Consistency Statement in Causal Inference: A Definition or an Assumption?",
          authors: "Cole S. R., Frangakis C. E.",
          source: "Epidemiology 20(1): 3–5",
          doi: "10.1097/EDE.0b013e31818ef366" },
        { year: "2011", title: "Compound Treatments and Transportability of Causal Inference",
          authors: "Hernán M. A., VanderWeele T. J.",
          source: "Epidemiology 22(3): 368–377",
          doi: "10.1097/EDE.0b013e3182109296" },
        { year: "2016", title: "The Consistency Assumption for Causal Inference in Social Epidemiology: When a Rose Is Not a Rose",
          authors: "Rehkopf D. H., Glymour M. M., Osypuk T. L.",
          source: "Current Epidemiology Reports 3(1): 63–71",
          doi: "10.1007/s40471-016-0069-5" },
        { year: "2016", title: "Does Water Kill? A Call for Less Casual Causal Inferences",
          authors: "Hernán M. A.",
          source: "Annals of Epidemiology 26(10): 674–680",
          doi: "10.1016/j.annepidem.2016.08.016" }
      ]
    },
    {
      id: "desfecho",
      titulo: "Desfecho",
      resumo: "Substitutos, compostos e o que se perde ao trocar o desfecho que importa por outro mais fácil de medir.",
      refs: [
        { year: "1996", title: "Surrogate End Points in Clinical Trials: Are We Being Misled?",
          authors: "Fleming T. R., DeMets D. L.",
          source: "Annals of Internal Medicine 125(7): 605–613",
          doi: "10.7326/0003-4819-125-7-199610010-00011" },
        { year: "2003", title: "Composite Outcomes in Randomized Trials: Greater Precision but with Greater Uncertainty?",
          authors: "Freemantle N. et al.",
          source: "JAMA 289(19): 2554–2559",
          doi: "10.1001/jama.289.19.2554" },
        { year: "2004", title: "A Structural Approach to Selection Bias",
          authors: "Hernán M. A., Hernández-Díaz S., Robins J. M.",
          source: "Epidemiology 15(5): 615–625",
          doi: "10.1097/01.ede.0000135174.63482.43" },
        { year: "2014", title: "Invited Commentary: Composite Outcomes as an Attempt to Escape from Selection Bias and Related Paradoxes",
          authors: "Hernán M. A., Schisterman E. F., Hernández-Díaz S.",
          source: "American Journal of Epidemiology 179(3): 368–370",
          doi: "10.1093/aje/kwt283" }
      ]
    },
    {
      id: "correlacao",
      titulo: "Correlação e causalidade",
      resumo: "Confundimento em versão formal e em versão didática, e os dois erros de leitura mais frequentes na literatura aplicada.",
      refs: [
        { year: "1986", title: "Identifiability, Exchangeability, and Epidemiological Confounding",
          authors: "Greenland S., Robins J. M.",
          source: "International Journal of Epidemiology 15(3): 413–419",
          doi: "10.1093/ije/15.3.413" },
        { year: "1993", title: "Toward a Clearer Definition of Confounding",
          authors: "Weinberg C. R.",
          source: "American Journal of Epidemiology 137(1): 1–8",
          doi: "10.1093/oxfordjournals.aje.a116591" },
        { year: "1999", title: "Confounding and Collapsibility in Causal Inference",
          authors: "Greenland S., Pearl J., Robins J. M.",
          source: "Statistical Science 14(1): 29–46",
          doi: "10.1214/ss/1009211805" },
        { year: "2012", title: "\"Toward a Clearer Definition of Confounding\" Revisited with Directed Acyclic Graphs",
          authors: "Howards P. P. et al.",
          source: "American Journal of Epidemiology 176(6): 506–511",
          doi: "10.1093/aje/kws127" },
        { year: "2013", title: "On the Definition of a Confounder",
          authors: "VanderWeele T. J., Shpitser I.",
          source: "The Annals of Statistics 41(1): 196–220",
          doi: "10.1214/12-AOS1058" },
        { year: "2013", title: "The Table 2 Fallacy: Presenting and Interpreting Confounder and Modifier Coefficients",
          authors: "Westreich D., Greenland S.",
          source: "American Journal of Epidemiology 177(4): 292–298",
          doi: "10.1093/aje/kws412" },
        { year: "2018", title: "The C-Word: Scientific Euphemisms Do Not Improve Causal Inference from Observational Data",
          authors: "Hernán M. A.",
          source: "American Journal of Public Health 108(5): 616–619",
          doi: "10.2105/AJPH.2018.304337" }
      ]
    },
    {
      id: "inferencia",
      titulo: "Inferência",
      resumo: "O que testes, valores p e intervalos de confiança dizem — e a longa lista do que não dizem.",
      refs: [
        { year: "1990", title: "Randomization, Statistics, and Causal Inference",
          authors: "Greenland S.",
          source: "Epidemiology 1(6): 421–429",
          doi: "10.1097/00001648-199011000-00003" },
        { year: "1999", title: "The Right Answer for the Wrong Question: Consequences of Type III Error for Public Health Research",
          authors: "Schwartz S., Carpenter K. M.",
          source: "American Journal of Public Health 89(8): 1175–1180",
          doi: "10.2105/AJPH.89.8.1175" },
        { year: "2013", title: "Why Representativeness Should Be Avoided",
          authors: "Rothman K. J., Gallacher J. E. J., Hatch E. E.",
          source: "International Journal of Epidemiology 42(4): 1012–1014",
          doi: "10.1093/ije/dys223" },
        { year: "2016", title: "Statistical Tests, P Values, Confidence Intervals, and Power: A Guide to Misinterpretations",
          authors: "Greenland S. et al.",
          source: "European Journal of Epidemiology 31(4): 337–350",
          doi: "10.1007/s10654-016-0149-3" },
        { year: "2016", title: "The ASA Statement on p-Values: Context, Process, and Purpose",
          authors: "Wasserstein R. L., Lazar N. A.",
          source: "The American Statistician 70(2): 129–133",
          doi: "10.1080/00031305.2016.1154108" },
        { year: "2017", title: "For and Against Methodologies: Some Perspectives on Recent Causal and Statistical Inference Debates",
          authors: "Greenland S.",
          source: "European Journal of Epidemiology 32(1): 3–20",
          doi: "10.1007/s10654-017-0230-6" },
        { year: "2019", title: "Scientists Rise Up against Statistical Significance",
          authors: "Amrhein V., Greenland S., McShane B.",
          source: "Nature 567(7748): 305–307",
          doi: "10.1038/d41586-019-00857-9" }
      ]
    },
    {
      id: "risco",
      titulo: "Risco",
      resumo: "Escolha de medidas de efeito, a distância entre risco individual e risco populacional, e a genealogia do próprio conceito.",
      refs: [
        { year: "1987", title: "Interpretation and Choice of Effect Measures in Epidemiologic Analyses",
          authors: "Greenland S.",
          source: "American Journal of Epidemiology 125(5): 761–768",
          doi: "10.1093/oxfordjournals.aje.a114593" },
        { year: "2000", title: "Individual Risk Prediction and Population-Wide Disease Prevention",
          authors: "Rockhill B., Kawachi I., Colditz G. A.",
          source: "Epidemiologic Reviews 22(1): 176–180",
          doi: "10.1093/oxfordjournals.epirev.a018017" },
        { year: "2001", title: "Sick Individuals and Sick Populations",
          authors: "Rose G.",
          source: "International Journal of Epidemiology 30(3): 427–432",
          doi: "10.1093/ije/30.3.427" },
        { year: "2005", title: "Epidemiologic Measures and Policy Formulation: Lessons from Potential Outcomes",
          authors: "Greenland S.",
          source: "Emerging Themes in Epidemiology 2(1): 5",
          doi: "10.1186/1742-7622-2-5" },
        { year: "2005", title: "Theorizing about Causes at the Individual Level While Estimating Effects at the Population Level: Implications for Prevention",
          authors: "Rockhill B.",
          source: "Epidemiology 16(1): 124–129",
          doi: "10.1097/01.ede.0000147111.46244.41" },
        { year: "2010", title: "On the Origin of Risk Relativism",
          authors: "Poole C.",
          source: "Epidemiology 21(1): 3–9",
          doi: "10.1097/EDE.0b013e3181c30eba" },
        { year: "2011", title: "Desenvolvimento histórico-epistemológico da Epidemiologia e do conceito de risco",
          authors: "Ayres J. R. C. M.",
          source: "Cadernos de Saúde Pública 27(7): 1301–1311",
          doi: "10.1590/S0102-311X2011000700006" },
        { year: "2012", title: "The Risk Concept—Historical and Recent Development Trends",
          authors: "Aven T.",
          source: "Reliability Engineering & System Safety 99: 33–44",
          doi: "10.1016/j.ress.2011.11.006" },
        { year: "2013", title: "An Argument for a Consequentialist Epidemiology",
          authors: "Galea S.",
          source: "American Journal of Epidemiology 178(8): 1185–1191",
          doi: "10.1093/aje/kwt172" },
        { year: "2015", title: "Concepts and Pitfalls in Measuring and Interpreting Attributable Fractions, Prevented Fractions, and Causation Probabilities",
          authors: "Greenland S.",
          source: "Annals of Epidemiology 25(3): 155–161",
          doi: "10.1016/j.annepidem.2014.11.005" }
      ]
    }
  ]
};
