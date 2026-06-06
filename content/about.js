/* =========================================================================
 * EDL — content/about.js
 *
 * Conteúdo HTML da tela "Sobre". Extraído do index.html para facilitar
 * edição futura do texto sem tocar no arquivo principal do app.
 *
 * Uso: carregado via <script> no index.html, define
 *   window.EDL.content.about = '<html string>'.
 * O roteador em screens.js injeta esse conteúdo no container
 * #about-content quando o usuário navega para a tela de Sobre.
 *
 * Para editar o texto, basta alterar a template string abaixo e recarregar
 * a página — nenhum build step, nenhuma conversão.
 *
 * Aviso: este arquivo é HTML embrulhado em JS template literal. Para
 * preservar `` e ${ dentro do texto, seriam necessários escapes. O
 * conteúdo atual não usa nenhum dos dois.
 * ========================================================================= */

window.EDL = window.EDL || {};
window.EDL.content = window.EDL.content || {};

window.EDL.content.about = `
<article class="static-page">
  <h1>Sobre o Epidemic Dynamics Lab</h1>

  <p class="lede">
    Laboratório digital para ensino de epidemiologia, destinado a alunos de
    Medicina e áreas afins. Funciona inteiramente no navegador, sem back-end,
    e é aberto para uso acadêmico sob licença MIT.
  </p>

  <p>
    São oito módulos, construídos a partir do material didático do autor.
    O percurso vai das definições fundamentais (endemia, surto, epidemia,
    pandemia) ao modelo compartimental SEIR com intervenção, passando por
    cadeia epidemiológica, dinâmica da doença no indivíduo, R₀, imunidade
    de rebanho e o estudo de caso clássico da cólera em Soho (Londres, 1854)
    com reflexo moderno na epidemia do Haiti (2010).
  </p>

  <p class="muted about-meta">
    <span>v0.1.0 · em desenvolvimento</span>
    <span>·</span>
    <span>Idioma: português (Brasil)</span>
    <span>·</span>
    <span>Licença: MIT</span>
  </p>

  <!-- =====================================================
       Progresso do usuário (gerenciado por localStorage)
       ===================================================== -->
  <section class="progress-section">
    <h2>Seu progresso</h2>
    <p id="progress-summary" class="muted">Carregando…</p>
    <button type="button" class="btn btn-ghost btn-small" id="progress-reset">
      Zerar progresso
    </button>
    <p class="muted" style="font-size:.82rem;margin-top:.4rem">
      Seu progresso (pontuações por módulo) fica salvo localmente no seu navegador,
      apenas neste dispositivo. Zerar não afeta outros aparelhos nem compartilha
      dado com ninguém.
    </p>
  </section>

  <!-- =====================================================
       Como citar
       ===================================================== -->
  <h2>Como citar este aplicativo</h2>
  <p>
    Para referenciar o Epidemic Dynamics Lab em trabalhos acadêmicos, aulas
    ou materiais didáticos:
  </p>
  <div class="citation-block">
    <strong>ABNT</strong><br>
    SILVA, H. A. <em>Epidemic Dynamics Lab</em>: laboratório interativo de
    epidemiologia [Software]. 2026. Disponível em:
    &lt;URL do GitHub Pages&gt;.
  </div>
  <div class="citation-block">
    <strong>APA</strong><br>
    Silva, H. A. (2026). <em>Epidemic Dynamics Lab: laboratório interativo
    de epidemiologia</em> [Software]. https://&lt;URL&gt;
  </div>
  <div class="citation-block">
    <strong>Vancouver</strong><br>
    Silva HA. Epidemic Dynamics Lab: laboratório interativo de epidemiologia
    [Software]. 2026.
  </div>
  <p class="muted" style="font-size:.88rem">
    O DOI Zenodo será registrado quando o app chegar à versão 1.0. A
    bibliografia completa citada nos módulos está na
    <button type="button" data-go="references" class="link-btn">página de Bibliografia</button>.
  </p>

  <!-- =====================================================
       Sobre o autor
       ===================================================== -->
  <h2>Sobre o autor</h2>
  <div class="author-card">
    <h3 class="author-name">Prof. Henrique Alvarenga da Silva</h3>
    <p class="author-role">
      Médico psiquiatra · Mestre em Ensino em Saúde
    </p>

    <p>
      Graduado em Medicina pela Universidade Federal de Minas Gerais (UFMG,
      1997), com residência em Psiquiatria pelo Hospital das Clínicas da UFMG
      (2000). Especialista em Psicoterapia Cognitiva-Construtivista (Núcleo
      de Psicoterapia Cognitiva de São Paulo). Bacharel em Direito pelo
      Centro Universitário Presidente Tancredo de Almeida Neves (UNIPTAN,
      2013). Mestre em Ensino em Saúde pela UNIFENAS.
    </p>

    <p>
      Atua como professor do curso de Medicina da <strong>UFSJ</strong>
      (Psiquiatria e Psicopatologia) e do <strong>UNIPTAN</strong>
      (Métodos de Ensino e Pesquisa; Saúde Mental). Tem experiência em
      psiquiatria clínica, neurociências, pesquisa e análise de dados,
      com ênfase na interface entre ciência, tecnologia, filosofia,
      comportamento e emoção.
    </p>

    <ul class="author-links" role="list">
      <li>
        <a href="https://www.henriquealvarenga.com" target="_blank" rel="noopener">
          🌐 henriquealvarenga.com
        </a>
      </li>
      <li>
        <a href="https://orcid.org/0000-0001-9799-5240" target="_blank" rel="noopener">
          <span class="orcid-icon" aria-hidden="true">ID</span>
          ORCID: 0000-0001-9799-5240
        </a>
      </li>
      <li>
        <a href="http://lattes.cnpq.br/6147640440978297" target="_blank" rel="noopener">
          📚 Currículo Lattes
        </a>
      </li>
    </ul>
  </div>

  <!-- =====================================================
       Tecnologias e ferramentas
       ===================================================== -->
  <h2>Tecnologias e ferramentas</h2>

  <h3 class="subsec-h">Linguagens e bibliotecas</h3>
  <ul class="tech-list">
    <li><strong>HTML5 e CSS puro</strong> — sem pré-processadores; variáveis CSS nativas organizam o tema.</li>
    <li><strong>JavaScript vanilla</strong> — sem framework (React, Vue, etc.); módulos organizados via IIFE e namespace global <code>window.EDL</code>.</li>
    <li><strong>D3.js v7</strong> (via CDN jsdelivr) — visualização de dados: gráficos, mapas, simuladores.</li>
    <li><strong>Google Fonts</strong> — tipografia Inter (corpo) e JetBrains Mono (código/números).</li>
    <li><strong>Python 3</strong> — script auxiliar (<code>scripts/bib2json.py</code>) converte <code>references.bib</code> em CSL-JSON; geração da imagem Open Graph via PIL.</li>
    <li><strong>Ícones</strong> — SVG inline inspirados na biblioteca Lucide (MIT).</li>
  </ul>

  <h3 class="subsec-h">Dados e fontes primárias</h3>
  <ul class="tech-list">
    <li><strong>Pacote R <code>cholera</code></strong> (Peter Li, CRAN, GPL-2) — dataset do mapa de Snow (578 mortes, 13 bombas, 658 segmentos de rua). Coordenadas extraídas via Python + <code>pyreadr</code>.</li>
    <li><strong>MSPP Haiti</strong> — série temporal mensal do surto de cólera (2010–2016), 66 observações oficiais.</li>
    <li><strong>Banco de perguntas</strong> — questões Kahoot testadas em sala pelo autor, adaptadas para o app.</li>
  </ul>

  <h3 class="subsec-h">Desenvolvimento e hospedagem</h3>
  <ul class="tech-list">
    <li><strong>Git + GitHub</strong> — controle de versão e hospedagem do código-fonte.</li>
    <li><strong>GitHub Pages</strong> — publicação web estática.</li>
    <li><strong>Claude Cowork</strong> (Anthropic) — ambiente de desenvolvimento assistido por IA. O código foi elaborado em diálogo colaborativo entre o autor e o modelo Claude dentro do Cowork, com decisões pedagógicas, revisão de conteúdo e direção geral do produto conduzidas pelo autor, e a implementação técnica apoiada pela IA.</li>
  </ul>

  <!-- =====================================================
       Materiais e atribuições
       ===================================================== -->
  <h2>Materiais didáticos de base e atribuições</h2>
  <p>
    O conteúdo pedagógico foi derivado das aulas e materiais do autor —
    especialmente &quot;Introdução à Epidemiologia&quot; e &quot;Conceitos de
    Epidemiologia&quot; — complementados pelas fontes acadêmicas primárias
    listadas na
    <button type="button" data-go="references" class="link-btn">Bibliografia</button>.
  </p>
  <p>
    Imagens externas utilizadas têm licença verificada e proveniência
    documentada no arquivo <code>assets/images/ATTRIBUTIONS.md</code> do
    repositório. Nenhuma imagem é incluída sem verificação prévia de
    domínio público ou licença compatível.
  </p>
  <p>
    O mapa de Soho usa o dataset do pacote R <code>cholera</code> (Peter Li,
    CRAN, GPL-2); coordenadas digitalizadas originalmente por Dodson &amp; Tobler
    (1992). A série temporal do Haiti é dado oficial do Ministério da Saúde
    Pública e População do Haiti (MSPP), fornecida em CSV pelo autor.
    Detalhes de licenciamento por dataset em
    <code>assets/images/ATTRIBUTIONS.md</code>.
  </p>

  <!-- =====================================================
       Código-fonte, contribuição, licença
       ===================================================== -->
  <h2>Código-fonte, contribuição e licença</h2>
  <p>
    O código é aberto no GitHub. <strong>Issues e pull requests são
    bem-vindos</strong> — seja para correções de conteúdo (erros factuais
    em qualquer módulo), sugestões de novos módulos, melhorias de
    acessibilidade ou tradução para outros idiomas.
  </p>
  <p>
    Licenciado sob <strong>MIT License</strong>. Uso em sala de aula,
    redistribuição e adaptação são livres, desde que o aviso de copyright
    seja preservado.
  </p>
  <p class="muted" style="font-size:.88rem">
    Observação: o dataset <code>assets/data/soho-1854-cholera.js</code> é
    derivado do pacote R <code>cholera</code> e, por isso, está sob licença
    <strong>GPL-2</strong> (herdada). O restante do código permanece MIT.
    Detalhes no arquivo <code>assets/images/ATTRIBUTIONS.md</code> do repositório.
  </p>
</article>
`;
