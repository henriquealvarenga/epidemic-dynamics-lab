/* =========================================================================
 * EDL — compete/tela-sala.js
 *
 * Console do PROFESSOR: rota #/sala. Projetado no telão da aula.
 *
 * A TELA NÃO É PROTEGIDA — O BANCO É
 *   Num site estático não existe "proteger a rota": qualquer um pode abrir
 *   #/sala. O que se vê sem login é um formulário; o que se CONSEGUE FAZER
 *   é zero, porque criar sala exige estar na allowlist aulas.instructors.
 *   A autorização mora no RLS; esta tela é cortesia.
 *
 * DOIS MÉTODOS DE LOGIN
 *
 *   LINK POR E-MAIL. Eu tinha escolhido código de 6 dígitos para evitar o
 *   #access_token=… que o magic link devolve no fragmento — exatamente
 *   onde vive o roteador deste site. Uma restrição do Supabase inverteu a
 *   decisão: só é possível EDITAR TEMPLATES quando há SMTP customizado
 *   configurado. Com o serviço de e-mail interno vale o template padrão,
 *   que manda link e não código.
 *
 *   Como o SMTP próprio deste projeto estava quebrado (Gmail devolvendo
 *   535 por exigir App Password), exigir código significaria exigir
 *   configuração de infraestrutura antes de a aula existir. O link não
 *   exige nada — e a colisão com o roteador é resolvida em
 *   compete/rest.js, que captura os tokens e limpa o endereço ANTES de
 *   qualquer roteamento.
 *
 *   SENHA. Alternativa que não depende de e-mail chegar, para o dia em
 *   que a entrega demorar com a turma esperando. O projeto irmão do Exame
 *   do Estado Mental usa senha pelo mesmo motivo, registrado lá como
 *   "confiável numa sala de aula".
 *
 * POLLING, NÃO WEBSOCKET
 *   Duas consultas a cada 3 s. Realtime fica para a fase seguinte — e
 *   mesmo lá o poll continua vivo como rede de segurança, porque um
 *   WebSocket que cai em silêncio congela o telão sem avisar ninguém.
 *
 * Exporta: registra a rota 'sala' em EDL.screens
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const compete = (EDL.compete = EDL.compete || {});

  let pararPoll = null;
  let salaAtual = null;      // { roomId, code, itemCount, ... }

  /* -----------------------------------------------------------------------
   * A sala aberta PERSISTE em localStorage.
   *
   * Sem isto, um F5 no meio da aula — ou o navegador recarregando a aba da
   * projeção — faria o console esquecer qual sala está no ar e oferecer
   * criar outra. O professor abriria uma sala nova com código diferente
   * enquanto a turma inteira continua na antiga, e nada no placar
   * apareceria. É o tipo de falha que só se descobre na frente dos alunos.
   * --------------------------------------------------------------------- */
  (function restaurarSala() {
    try {
      const bruto = localStorage.getItem(compete.config.storageKeys.sala);
      if (bruto) salaAtual = JSON.parse(bruto);
    } catch (err) { /* segue sem sala */ }
  })();

  function guardarSala(s) {
    salaAtual = s;
    try {
      if (s) localStorage.setItem(compete.config.storageKeys.sala, JSON.stringify(s));
      else localStorage.removeItem(compete.config.storageKeys.sala);
    } catch (err) { /* só em memória */ }
  }
  let bancoDaSala = [];      // questões sorteadas — para rotular o mapa de calor
  let ultimoPlacar = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, ch => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  }

  function limpar() {
    if (pararPoll) { pararPoll(); pararPoll = null; }
  }

  /* -----------------------------------------------------------------------
   * Roteamento interno da tela
   * --------------------------------------------------------------------- */
  function render(container) {
    limpar();
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'sala-wrap';
    container.appendChild(wrap);

    /* Um retorno de magic link que falhou deixa o motivo guardado no
     * rest.js. Consumimos SEMPRE aqui, mesmo quando não há tela de login
     * para mostrá-lo, senão um aviso velho reapareceria numa entrada
     * futura da mesma aba. */
    const erroDoLink = compete.rest.erroDoLink();

    if (salaAtual) return renderConsole(wrap);

    /* Em modo local não há login: é o ensaio, ou a aula acontecendo sem
     * rede. Vai direto para a criação da sala. */
    const precisaLogin = compete.rest.configValida() && !compete.rest.professor.valida();
    if (precisaLogin) return renderLogin(wrap, erroDoLink);

    /* Logado, mas sem sala em memória. Isso NÃO significa que não há sala
     * no ar: o `localStorage` é por origem e por navegador, e a sala pode
     * ter sido aberta em outro. Perguntar ao servidor antes de oferecer
     * criar outra é o que impede o professor de abrir uma segunda sala com
     * a turma inteira na primeira. */
    if (compete.rest.configValida()) return renderProcurando(wrap);

    renderCriar(wrap);
  }

  /* ---- Procurando sala aberta no servidor ---- */

  /* Invalida pinturas assíncronas de uma entrada anterior: se o professor
   * sair da tela enquanto a consulta está no ar, a resposta não pode
   * repintar por cima do que ele está vendo agora. */
  let geracao = 0;

  function renderProcurando(wrap) {
    const minha = ++geracao;

    wrap.innerHTML = `
      <nav class="module-topbar">
        <button type="button" class="btn btn-ghost btn-small" data-voltar>← Sair</button>
        <div class="module-topbar-title">Console do professor</div>
        <div class="module-topbar-spacer"></div>
      </nav>
      <section class="compete-card">
        <p class="compete-sub" role="status">Procurando salas abertas suas…</p>
      </section>`;
    wrap.querySelectorAll('[data-voltar]').forEach(b => {
      b.addEventListener('click', () => EDL.screens.goTo('home'));
    });

    compete.api.salasAbertas().then(r => {
      if (minha !== geracao || !wrap.isConnected) return;   // já saiu da tela
      if (r.ok && r.salas.length) return renderRetomar(wrap, r.salas);
      renderCriar(wrap, r.ok ? null : r.erro);
    });
  }

  /* ---- Retomar ou encerrar uma sala que ficou aberta ---- */
  function renderRetomar(wrap, salas) {
    const linhas = salas.map((s, i) => `
      <li class="sala-aberta" data-i="${i}">
        <div class="sala-aberta-txt">
          <strong class="sala-aberta-code">${esc(s.code)}</strong>
          <span>${s.itemCount} questões${s.label ? ' · ' + esc(s.label) : ''}
                ${s.expiraEm ? ' · ' + esc(quantoFalta(s.expiraEm)) : ''}</span>
        </div>
        <div class="sala-aberta-acoes">
          <button type="button" class="btn btn-primary btn-small" data-retomar="${i}">Retomar</button>
          <button type="button" class="btn btn-ghost btn-small" data-encerrar="${i}">Encerrar</button>
        </div>
      </li>`).join('');

    wrap.innerHTML = `
      <nav class="module-topbar">
        <button type="button" class="btn btn-ghost btn-small" data-voltar>← Sair</button>
        <div class="module-topbar-title">Console do professor</div>
        <div class="module-topbar-spacer"></div>
      </nav>

      <section class="compete-card">
        <h1 class="compete-titulo">${salas.length > 1 ? 'Você tem salas abertas' : 'Você tem uma sala aberta'}</h1>
        <p class="compete-sub">
          Está no ar agora, e os grupos ainda conseguem responder. Retome para
          voltar ao placar, ou encerre antes de abrir outra rodada.
        </p>
        <ul class="sala-abertas">${linhas}</ul>
        <p id="erro-retomar" class="compete-erro" role="alert" hidden></p>
        <p class="compete-rodape">
          <button type="button" class="btn-link" id="btn-outra">
            Abrir outra sala mesmo assim
          </button>
        </p>
      </section>`;

    const erro = wrap.querySelector('#erro-retomar');

    wrap.querySelectorAll('[data-retomar]').forEach(b => {
      b.addEventListener('click', () => {
        guardarSala(salas[Number(b.dataset.retomar)]);
        render(document.getElementById('screen-sala'));
      });
    });

    wrap.querySelectorAll('[data-encerrar]').forEach(b => {
      b.addEventListener('click', async () => {
        const s = salas[Number(b.dataset.encerrar)];
        const ok = window.confirm(
          'Encerrar a sala ' + s.code + '?\n\n' +
          'Os grupos param de conseguir responder.'
        );
        if (!ok) return;
        b.disabled = true; b.textContent = 'Encerrando…';
        const r = await compete.api.encerrarSala(s.roomId);
        if (r && r.ok === false) {
          b.disabled = false; b.textContent = 'Encerrar';
          erro.textContent = r.erro; erro.hidden = false;
          return;
        }
        render(document.getElementById('screen-sala'));   // reconsulta o servidor
      });
    });

    wrap.querySelector('#btn-outra').addEventListener('click', () => renderCriar(wrap));
    wrap.querySelectorAll('[data-voltar]').forEach(b => {
      b.addEventListener('click', () => EDL.screens.goTo('home'));
    });
  }

  /** Quanto falta, e não a hora do relógio: uma sala dura 6h e o horário
   *  absoluto atravessa a meia-noite sem dizer o dia. Na aula o que importa
   *  é "ainda tenho tempo" ou "está para vencer". */
  function quantoFalta(iso) {
    const ms = Date.parse(iso) - Date.now();
    if (isNaN(ms)) return '';
    if (ms <= 0) return 'expirada';
    const min = Math.round(ms / 60000);
    if (min < 60) return 'expira em ' + min + ' min';
    const h = Math.floor(min / 60);
    const resto = min % 60;
    return 'expira em ' + h + 'h' + (resto ? String(resto).padStart(2, '0') : '');
  }

  /* ---- Login ---- */
  function renderLogin(wrap, erroInicial) {
    wrap.innerHTML = `
      <nav class="module-topbar">
        <button type="button" class="btn btn-ghost btn-small" data-voltar>← Sair</button>
        <div class="module-topbar-title">Console do professor</div>
        <div class="module-topbar-spacer"></div>
      </nav>

      <section class="compete-card">
        <h1 class="compete-titulo">Entrar</h1>
        <p class="compete-sub">
          Um link de acesso será enviado ao seu e-mail. Só e-mails já
          cadastrados como professor recebem.
        </p>

        <div class="sala-abas" role="tablist">
          <button type="button" class="sala-aba ativa" data-metodo="otp" role="tab"
                  aria-selected="true">Link por e-mail</button>
          <button type="button" class="sala-aba" data-metodo="senha" role="tab"
                  aria-selected="false">Senha</button>
        </div>

        <form id="form-otp" novalidate>
          <label class="compete-label" for="campo-email">E-mail</label>
          <input id="campo-email" class="compete-input" type="email"
                 autocomplete="email" placeholder="voce@exemplo.com" />

          <div id="bloco-senha" hidden>
            <label class="compete-label" for="campo-senha">Senha</label>
            <input id="campo-senha" class="compete-input" type="password"
                   autocomplete="current-password" placeholder="••••••••" />
          </div>

          <p id="erro-otp" class="compete-erro" role="alert" hidden></p>
          <p id="aviso-otp" class="compete-sync ok" role="status" hidden></p>

          <button type="submit" class="btn btn-primary compete-btn-grande" id="btn-otp">
            Enviar link →
          </button>
        </form>

        <p class="compete-rodape">
          <button type="button" class="btn-link" id="btn-local">
            Ensaiar sem internet (modo local)
          </button>
        </p>
      </section>
    `;

    const form  = wrap.querySelector('#form-otp');
    const email = wrap.querySelector('#campo-email');
    const erro  = wrap.querySelector('#erro-otp');
    const aviso = wrap.querySelector('#aviso-otp');
    const botao = wrap.querySelector('#btn-otp');
    const blocoSenha = wrap.querySelector('#bloco-senha');
    const senha = wrap.querySelector('#campo-senha');
    let enviado = false;   // eslint-disable-line no-unused-vars
    let metodo = 'otp';

    /* Chegou aqui vindo de um link que não funcionou: diga isso na cara.
     * O silêncio é o bug — o professor devolvido à home sem explicação foi
     * parar na tela do aluno tentando adivinhar o caminho. */
    if (erroInicial) {
      erro.textContent = erroInicial;
      erro.hidden = false;
    }

    wrap.querySelectorAll('.sala-aba').forEach(aba => {
      aba.addEventListener('click', () => {
        metodo = aba.dataset.metodo;
        wrap.querySelectorAll('.sala-aba').forEach(a => {
          a.classList.toggle('ativa', a === aba);
          a.setAttribute('aria-selected', String(a === aba));
        });
        blocoSenha.hidden = metodo !== 'senha';
        erro.hidden = true; aviso.hidden = true;
        botao.textContent = metodo === 'senha' ? 'Entrar →' : 'Enviar link →';
      });
    });

    /* Guarda contra envio concorrente. Não é zelo excessivo: o serviço de
     * e-mail interno do Supabase permite DOIS e-mails por hora, então um
     * clique duplo custa metade da cota do professor — e ele descobriria
     * isso só na segunda tentativa, já sem crédito. `botao.disabled` não
     * basta, porque não cobre Enter no formulário nem envio programático. */
    let enviando = false;

    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      if (enviando) return;
      enviando = true;
      erro.hidden = true;
      botao.disabled = true;

      if (metodo === 'senha') {
        botao.textContent = 'Entrando…';
        const r = await compete.rest.entrarComSenha(email.value, senha.value);
        enviando = false;
        botao.disabled = false; botao.textContent = 'Entrar →';
        if (!r.ok) { erro.textContent = r.erro; erro.hidden = false; return; }
        render(document.getElementById('screen-sala'));
        return;
      }

      botao.textContent = 'Enviando…';
      const r = await compete.rest.enviarCodigo(email.value);
      enviando = false;
      botao.disabled = false;
      botao.textContent = 'Enviar link →';
      if (!r.ok) {
        aviso.hidden = true;                 // não deixar sucesso e erro juntos
        erro.textContent = r.erro; erro.hidden = false;
        return;
      }

      enviado = true;
      aviso.innerHTML = 'Link enviado. Abra o e-mail <strong>neste mesmo ' +
        'computador</strong> e clique em "Sign in" — é a aba da projeção que ' +
        'precisa ficar logada. Confira o spam se demorar.';
      aviso.hidden = false;
    });

    wrap.querySelector('#btn-local').addEventListener('click', () => {
      /* Persistido, não só em memória: as abas dos grupos precisam
       * enxergar a mesma escolha, senão o professor abre sala local e os
       * alunos vão procurá-la no Supabase. */
      compete.rest.forcarLocal(true);
      render(document.getElementById('screen-sala'));
    });
    wrap.querySelectorAll('[data-voltar]').forEach(b => {
      b.addEventListener('click', () => EDL.screens.goTo('home'));
    });
  }

  /* ---- Criar sala ----
   *
   * `falhaDaBusca` chega preenchido quando não deu para perguntar ao
   * servidor se já existe sala aberta. Dizer isso importa: sem o aviso, a
   * tela fica idêntica à de quem realmente não tem sala nenhuma, e o
   * professor abre a segunda rodada achando que a primeira não existe. */
  function renderCriar(wrap, falhaDaBusca) {
    const tamanhos = compete.bancoJogo.tamanhos;
    const seg = EDL.quiz.scoringConfig().seconds;
    const local = compete.api.modo() === 'local';

    wrap.innerHTML = `
      <nav class="module-topbar">
        <button type="button" class="btn btn-ghost btn-small" data-voltar>← Sair</button>
        <div class="module-topbar-title">Abrir uma rodada</div>
        <div class="module-topbar-spacer"></div>
      </nav>

      <section class="compete-card">
        <h1 class="compete-titulo">Nova rodada</h1>
        <p class="compete-sub">
          Configure abaixo e abra a sala. <strong>O código de entrada é criado
          nesse momento</strong> — aparece em fonte grande, pronto para projetar.
        </p>
        <p class="compete-sub" style="margin-top:-.75rem">
          O banco tem <strong>${compete.bancoJogo.total} questões</strong>; as
          sorteadas são as mesmas para todos os grupos da sala.
        </p>

        ${local ? `<p class="compete-aviso">
          Modo local: a sala vive só neste computador, entre abas. Bom para
          ensaiar.</p>` : ''}

        ${falhaDaBusca ? `<p class="compete-aviso">
          Não deu para conferir no servidor se você já tem uma sala aberta
          (${esc(falhaDaBusca)}). Se tiver, ela continua no ar — abrir outra
          aqui deixaria a turma dividida entre duas.</p>` : ''}

        <label class="compete-label">Quantas questões nesta rodada?</label>
        <div class="sala-tamanhos" role="radiogroup" aria-label="Número de questões">
          ${tamanhos.map((n, i) => `
            <button type="button" class="sala-tamanho${i === 0 ? ' ativo' : ''}"
                    data-n="${n}" role="radio" aria-checked="${i === 0}">
              <strong>${n}</strong>
              <span>~${Math.round(n * seg / 60)} min</span>
            </button>`).join('')}
        </div>

        <label class="compete-label" for="campo-turma">Identificação (opcional)</label>
        <input id="campo-turma" class="compete-input" type="text" maxlength="60"
               placeholder="Turma B, quinta 19h" />

        <p id="erro-criar" class="compete-erro" role="alert" hidden></p>

        <button type="button" class="btn btn-primary compete-btn-grande" id="btn-criar">
          Abrir sala e gerar o código →
        </button>

        <p class="compete-rodape">
          <button type="button" class="btn-link" id="btn-testar">Testar conexão</button>
          <span id="res-teste"></span>
        </p>
      </section>
    `;

    let escolhido = tamanhos[0];
    wrap.querySelectorAll('.sala-tamanho').forEach(b => {
      b.addEventListener('click', () => {
        wrap.querySelectorAll('.sala-tamanho').forEach(x => {
          x.classList.remove('ativo'); x.setAttribute('aria-checked', 'false');
        });
        b.classList.add('ativo'); b.setAttribute('aria-checked', 'true');
        escolhido = Number(b.dataset.n);
        if (EDL.sfx) EDL.sfx.clique();
      });
    });

    const erro  = wrap.querySelector('#erro-criar');
    const botao = wrap.querySelector('#btn-criar');

    botao.addEventListener('click', async () => {
      erro.hidden = true; botao.disabled = true; botao.textContent = 'Abrindo…';
      const r = await compete.api.criarSala({
        activityRef: 'game-v1',
        title: 'Epidemiologia — rodada relâmpago',
        itemCount: escolhido,
        label: wrap.querySelector('#campo-turma').value || null
      });
      botao.disabled = false; botao.textContent = 'Abrir sala →';
      if (!r.ok) { erro.textContent = r.erro; erro.hidden = false; return; }
      guardarSala(r.dados);
      render(document.getElementById('screen-sala'));
    });

    wrap.querySelector('#btn-testar').addEventListener('click', async () => {
      const alvo = wrap.querySelector('#res-teste');
      alvo.textContent = ' testando…';
      const r = await compete.rest.saude();
      alvo.textContent = r.ok
        ? ' ✓ conectado' + (r.detalhe ? ' — ' + r.detalhe : '')
        : ' ✗ ' + (r.erro || 'sem conexão');
    });

    wrap.querySelectorAll('[data-voltar]').forEach(b => {
      b.addEventListener('click', () => EDL.screens.goTo('home'));
    });
  }

  /* ---- Console em aula ---- */
  function renderConsole(wrap) {
    const s = salaAtual;
    bancoDaSala = compete.bancoJogo.sortear(s.code, s.itemCount);
    const urlEntrada = location.origin + location.pathname + '#/jogar/' + s.code;

    wrap.innerHTML = `
      <nav class="module-topbar">
        <button type="button" class="btn btn-ghost btn-small" data-voltar>← Sair</button>
        <div class="module-topbar-title" id="titulo-sala">Sala em andamento</div>
        <div class="module-topbar-spacer"></div>
      </nav>

      <section class="sala-projecao">
        <p class="sala-instrucao">Entrem em <strong>${esc(urlEntrada.replace(/^https?:\/\//, ''))}</strong></p>
        <div class="sala-codigo" aria-label="Código da sala">${esc(s.code)}</div>
        <p class="sala-meta">
          <span id="sala-grupos">0 grupos</span> ·
          ${s.itemCount} questões ·
          <span id="sala-atualizado">—</span>
        </p>
      </section>

      <div class="sala-colunas">
        <section class="sala-bloco">
          <h2 class="sala-h2">Placar</h2>
          <div id="sala-placar" class="sala-placar" aria-live="polite"></div>
        </section>

        <section class="sala-bloco">
          <h2 class="sala-h2">Onde a turma está errando</h2>
          <p class="sala-hint">Ordenado da questão mais errada para a menos.</p>
          <div id="sala-calor" class="sala-calor" aria-live="polite"></div>
        </section>
      </div>

      <div class="sala-acoes">
        <button type="button" class="btn btn-primary" id="btn-podio">Revelar pódio</button>
        <button type="button" class="btn btn-ghost" id="btn-encerrar">Encerrar sala</button>
      </div>
    `;

    /* O aviso do "Sair" depende de a sala AINDA estar no ar. Encerrada, ele
     * vira mentira — e mentira do console é o pior tipo de bug aqui: o
     * professor acabou de ler "Sala encerrada" no botão e recebe, no clique
     * seguinte, um alerta dizendo que a sala continua aberta. Relatado na
     * primeira rodada em produção. */
    let encerrada = false;

    wrap.querySelector('#btn-podio').addEventListener('click', () => mostrarPodio(wrap));
    wrap.querySelector('#btn-encerrar').addEventListener('click', async () => {
      const ok = window.confirm(
        'Encerrar a sala?\n\nOs grupos param de conseguir responder. ' +
        'O placar continua visível até você fechar esta tela.'
      );
      if (!ok) return;
      await compete.api.encerrarSala(s.roomId);
      guardarSala(null);
      encerrada = true;

      const btn = wrap.querySelector('#btn-encerrar');
      btn.disabled = true; btn.textContent = 'Sala encerrada';

      /* A tela inteira precisa concordar com o que acabou de acontecer.
       * Antes, só o botão mudava: o topo continuava anunciando "Sala em
       * andamento" e o "Sair" ainda avisava que a sala seguia aberta. O
       * professor lia três coisas diferentes sobre o mesmo fato. */
      const titulo = wrap.querySelector('#titulo-sala');
      if (titulo) titulo.textContent = 'Sala encerrada';

      const chamada = wrap.querySelector('.sala-instrucao');
      if (chamada) {
        chamada.textContent = 'Rodada encerrada. O placar abaixo é o resultado final.';
      }

      /* O poll para: não há mais nada mudando, e uma sala encerrada não
       * precisa de duas consultas a cada 3 s até alguém fechar a aba. */
      limpar();
    });
    wrap.querySelectorAll('[data-voltar]').forEach(b => {
      b.addEventListener('click', () => {
        /* Sala já encerrada: não há o que avisar, e perguntar de novo só
         * faria duvidar do que acabou de acontecer. */
        if (encerrada) return EDL.screens.goTo('home');
        if (window.confirm('Sair do console? A sala continua aberta para os grupos.')) {
          guardarSala(null);
          EDL.screens.goTo('home');
        }
      });
    });

    /* A primeira pintura é FORÇADA. A guarda de aba oculta vale para o poll
     * periódico (não faz sentido consultar de 3 em 3 s uma aba que ninguém
     * está vendo), mas não para o render inicial: o professor pode abrir o
     * console numa aba de fundo e só depois levá-la à projeção, e chegaria
     * a um painel vazio. */
    atualizar(wrap, true);
    pararPoll = compete.api.observar(s.roomId, () => atualizar(wrap));

    /* Ao voltar para a aba, atualiza na hora em vez de esperar o próximo
     * tique — o professor acabou de olhar para o telão. */
    const aoVoltar = () => { if (!document.hidden) atualizar(wrap, true); };
    document.addEventListener('visibilitychange', aoVoltar);
    const pararPollAnterior = pararPoll;
    pararPoll = function () {
      if (pararPollAnterior) pararPollAnterior();
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }

  /* -----------------------------------------------------------------------
   * Atualização
   * --------------------------------------------------------------------- */
  async function atualizar(wrap, forcar) {
    if (!salaAtual) return;
    if (document.hidden && !forcar) return;
    const [placar, stats] = await Promise.all([
      compete.api.placar(salaAtual.roomId),
      compete.api.estatisticas(salaAtual.roomId)
    ]);
    ultimoPlacar = placar || [];
    pintarPlacar(wrap, ultimoPlacar);
    pintarCalor(wrap, stats || []);

    const g = wrap.querySelector('#sala-grupos');
    if (g) g.textContent = ultimoPlacar.length + (ultimoPlacar.length === 1 ? ' grupo' : ' grupos');
    const t = wrap.querySelector('#sala-atualizado');
    if (t) t.textContent = 'atualizado ' + new Date().toLocaleTimeString('pt-BR');
  }

  function pintarPlacar(wrap, linhas) {
    const el = wrap.querySelector('#sala-placar');
    if (!el) return;
    if (!linhas.length) {
      el.innerHTML = '<p class="sala-vazio">Aguardando os grupos entrarem…</p>';
      return;
    }
    const medalhas = ['🥇', '🥈', '🥉'];
    el.innerHTML = linhas.map(l => `
      <div class="sala-linha">
        <span class="sala-pos">${medalhas[l.position - 1] || (l.position + 'º')}</span>
        <span class="sala-nome">${esc(l.nickname)}</span>
        <span class="sala-barra"><i style="width:${Math.max(2, Number(l.score_pct) || 0)}%"></i></span>
        <span class="sala-pts">${Number(l.score).toLocaleString('pt-BR')}</span>
        <span class="sala-prog">${l.answered_count}/${l.item_count}</span>
      </div>`).join('');
  }

  /* O mapa de calor é o item de maior valor pedagógico: mostra, durante a
   * rodada, onde vale parar e explicar. Guardamos a alternativa escolhida
   * (não só certo/errado) justamente para revelar QUAL distrator atraiu. */
  function pintarCalor(wrap, stats) {
    const el = wrap.querySelector('#sala-calor');
    if (!el) return;
    if (!stats.length) {
      el.innerHTML = '<p class="sala-vazio">Ainda sem respostas.</p>';
      return;
    }
    const ordenado = stats.slice().sort((a, b) =>
      (Number(a.pct_correct) - Number(b.pct_correct)) || (b.n - a.n));

    el.innerHTML = ordenado.slice(0, 8).map(s => {
      const q = bancoDaSala[s.question_idx];
      const texto = q ? q.q.replace(/<[^>]*>/g, '') : ('Questão ' + (s.question_idx + 1));
      const pct = Number(s.pct_correct) || 0;
      const dist = (s.top_distractor != null && q && q.opts[s.top_distractor])
        ? q.opts[s.top_distractor].replace(/<[^>]*>/g, '') : null;
      return `
        <div class="sala-calor-item" data-nivel="${pct < 40 ? 'ruim' : pct < 70 ? 'medio' : 'bom'}">
          <div class="sala-calor-topo">
            <span class="sala-calor-pct">${pct}%</span>
            <span class="sala-calor-n">${s.n_correct}/${s.n}</span>
          </div>
          <div class="sala-calor-q">${esc(texto.slice(0, 110))}${texto.length > 110 ? '…' : ''}</div>
          ${dist ? `<div class="sala-calor-dist">Erro mais comum: ${esc(dist.slice(0, 70))}</div>` : ''}
        </div>`;
    }).join('');
  }

  /* ---- Pódio projetado ---- */
  function mostrarPodio(wrap) {
    const linhas = ultimoPlacar.slice(0, 5);
    if (!linhas.length) return;
    const medalhas = ['🥇', '🥈', '🥉'];

    const overlay = document.createElement('div');
    overlay.className = 'sala-podio-overlay';
    overlay.innerHTML = `
      <div class="sala-podio-caixa">
        <h2>Classificação</h2>
        <div id="podio-lista"></div>
        <button type="button" class="btn btn-ghost" id="fechar-podio">Fechar</button>
      </div>`;
    document.body.appendChild(overlay);

    const lista = overlay.querySelector('#podio-lista');
    linhas.forEach((l, i) => {
      const d = document.createElement('div');
      d.className = 'sala-podio-linha';
      d.innerHTML = `
        <span class="sala-podio-pos">${medalhas[l.position - 1] || (l.position + 'º')}</span>
        <span class="sala-podio-nome">${esc(l.nickname)}</span>
        <span class="sala-podio-barra"><i style="width:0%"></i></span>
        <span class="sala-podio-pts">${Number(l.score).toLocaleString('pt-BR')}</span>`;
      lista.appendChild(d);
      setTimeout(() => {
        d.querySelector('i').style.width = Math.max(3, Number(l.score_pct) || 0) + '%';
        if (EDL.sfx) EDL.sfx.whoosh();
      }, 200 + i * 260);
    });
    setTimeout(() => { if (EDL.sfx) EDL.sfx.fanfarra(); }, 200 + linhas.length * 260 + 200);

    overlay.querySelector('#fechar-podio').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', ev => { if (ev.target === overlay) overlay.remove(); });
  }

  EDL.screens.register('sala', {
    label: 'Console do professor',
    onEnter(container) { render(container); },
    onLeave() { limpar(); }
  });

  /* -----------------------------------------------------------------------
   * Link no rodapé
   *
   * Sem isto a rota #/sala existia mas não havia como chegar nela pela
   * interface — só digitando o endereço. Rodapé é o lugar certo: o aluno
   * não precisa dele, mas o professor acha em dez segundos, e não ocupa
   * espaço no caminho de quem veio estudar.
   *
   * Injetado daqui, e não escrito no index.html, pelo mesmo motivo do card
   * da home: apagar js/compete/ devolve o site ao estado anterior sem
   * deixar link órfão.
   * --------------------------------------------------------------------- */
  function injetarLinkRodape() {
    const links = document.querySelector('.footer-links');
    if (!links || document.getElementById('link-console-prof')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.id = 'link-console-prof';
    b.className = 'footer-link';
    b.textContent = 'Console do professor';
    b.addEventListener('click', () => EDL.screens.goTo('sala'));
    links.appendChild(b);
  }

  /* -----------------------------------------------------------------------
   * Entrada do professor NA HOME
   *
   * O link do rodapé continua sendo o lugar natural, mas medindo a home
   * ele está a 2602px numa página de 2704px — três telas abaixo do card do
   * aluno, que fica a 386px. Um link que ninguém encontra é um link que não
   * existe: na verificação ponta a ponta o próprio professor perguntou por
   * onde entrava, e antes disso o §7 já tinha mostrado que quem cai na home
   * sem rumo vai parar na tela do ALUNO, porque é a única coisa visível.
   *
   * Fica logo abaixo do card da competição, em corpo pequeno e alinhado à
   * direita: acima da dobra, sem disputar espaço com quem veio estudar.
   * --------------------------------------------------------------------- */
  function injetarLinkHome() {
    const card = document.getElementById('compete-card-home');
    if (!card) return;                       // sem card, o rodapé dá conta
    const anterior = document.getElementById('compete-prof-home');
    if (anterior) anterior.remove();

    const p = document.createElement('p');
    p.id = 'compete-prof-home';
    p.className = 'compete-prof-home';

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-link';
    b.textContent = 'Sou o professor — abrir o console →';
    b.addEventListener('click', () => EDL.screens.goTo('sala'));

    p.appendChild(b);
    card.insertAdjacentElement('afterend', p);
  }

  /* A home é reconstruída a cada volta, e o card da competição é
   * reinjetado junto. O listener de tela-jogar.js foi registrado antes
   * deste (o arquivo carrega antes), então o card já existe quando
   * chegamos aqui. */
  window.addEventListener('hashchange', () => {
    if (location.hash === '' || location.hash === '#/' || location.hash === '#/home') {
      setTimeout(injetarLinkHome, 0);
    }
  });

  function injetarEntradas() {
    injetarLinkRodape();
    injetarLinkHome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injetarEntradas);
  } else {
    injetarEntradas();
  }
})();
