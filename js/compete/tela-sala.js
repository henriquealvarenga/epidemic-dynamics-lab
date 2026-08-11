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
 * LOGIN POR CÓDIGO DE 6 DÍGITOS, NÃO POR MAGIC LINK
 *   Três razões, na ordem em que pesam:
 *   1. O magic link volta com #access_token=… no fragmento — exatamente
 *      onde vive o roteador deste site.
 *   2. Na aula, o e-mail chega no celular e a projeção está no notebook.
 *      Um código de 6 dígitos atravessa aparelhos; um link, não.
 *   3. Com create_user:false, visitante nenhum cria conta digitando o
 *      próprio e-mail.
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

    if (salaAtual) return renderConsole(wrap);

    /* Em modo local não há login: é o ensaio, ou a aula acontecendo sem
     * rede. Vai direto para a criação da sala. */
    const precisaLogin = compete.rest.configValida() && !compete.rest.professor.valida();
    if (precisaLogin) renderLogin(wrap);
    else renderCriar(wrap);
  }

  /* ---- Login ---- */
  function renderLogin(wrap) {
    wrap.innerHTML = `
      <nav class="module-topbar">
        <button type="button" class="btn btn-ghost btn-small" data-voltar>← Sair</button>
        <div class="module-topbar-title">Console do professor</div>
        <div class="module-topbar-spacer"></div>
      </nav>

      <section class="compete-card">
        <h1 class="compete-titulo">Entrar</h1>
        <p class="compete-sub">
          Um código de 6 dígitos será enviado ao seu e-mail. Só e-mails já
          cadastrados como professor recebem.
        </p>

        <form id="form-otp" novalidate>
          <label class="compete-label" for="campo-email">E-mail</label>
          <input id="campo-email" class="compete-input" type="email"
                 autocomplete="email" placeholder="voce@exemplo.com" />

          <div id="bloco-codigo" hidden>
            <label class="compete-label" for="campo-otp">Código recebido</label>
            <input id="campo-otp" class="compete-input compete-input-codigo"
                   type="text" inputmode="numeric" autocomplete="one-time-code"
                   maxlength="6" placeholder="000000" />
          </div>

          <p id="erro-otp" class="compete-erro" role="alert" hidden></p>
          <p id="aviso-otp" class="compete-sync ok" role="status" hidden></p>

          <button type="submit" class="btn btn-primary compete-btn-grande" id="btn-otp">
            Enviar código →
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
    const bloco = wrap.querySelector('#bloco-codigo');
    const otp   = wrap.querySelector('#campo-otp');
    const erro  = wrap.querySelector('#erro-otp');
    const aviso = wrap.querySelector('#aviso-otp');
    const botao = wrap.querySelector('#btn-otp');
    let enviado = false;

    otp.addEventListener('input', () => {
      otp.value = otp.value.replace(/\D/g, '');
    });

    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      erro.hidden = true;
      botao.disabled = true;

      if (!enviado) {
        botao.textContent = 'Enviando…';
        const r = await compete.rest.enviarCodigo(email.value);
        botao.disabled = false;
        if (!r.ok) {
          erro.textContent = r.erro; erro.hidden = false;
          botao.textContent = 'Enviar código →';
          return;
        }
        enviado = true;
        bloco.hidden = false;
        aviso.textContent = 'Código enviado. Confira também o spam.';
        aviso.hidden = false;
        botao.textContent = 'Entrar →';
        setTimeout(() => { try { otp.focus(); } catch (e) {} }, 60);
        return;
      }

      botao.textContent = 'Verificando…';
      const r = await compete.rest.verificarCodigo(email.value, otp.value);
      botao.disabled = false;
      botao.textContent = 'Entrar →';
      if (!r.ok) { erro.textContent = r.erro; erro.hidden = false; return; }
      render(document.getElementById('screen-sala'));
    });

    wrap.querySelector('#btn-local').addEventListener('click', () => {
      compete.config.enabled = false;   // força o backend local nesta sessão
      render(document.getElementById('screen-sala'));
    });
    wrap.querySelectorAll('[data-voltar]').forEach(b => {
      b.addEventListener('click', () => EDL.screens.goTo('home'));
    });
  }

  /* ---- Criar sala ---- */
  function renderCriar(wrap) {
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
          O banco tem <strong>${compete.bancoJogo.total} questões</strong>.
          As sorteadas são as mesmas para todos os grupos da sala.
        </p>

        ${local ? `<p class="compete-aviso">
          Modo local: a sala vive só neste computador, entre abas. Bom para
          ensaiar.</p>` : ''}

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
          Abrir sala →
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
      alvo.textContent = r.ok ? ' ✓ conectado' : ' ✗ ' + (r.erro || 'sem conexão');
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
        <div class="module-topbar-title">Sala em andamento</div>
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

    wrap.querySelector('#btn-podio').addEventListener('click', () => mostrarPodio(wrap));
    wrap.querySelector('#btn-encerrar').addEventListener('click', async () => {
      const ok = window.confirm(
        'Encerrar a sala?\n\nOs grupos param de conseguir responder. ' +
        'O placar continua visível até você fechar esta tela.'
      );
      if (!ok) return;
      await compete.api.encerrarSala(s.roomId);
      guardarSala(null);
      const btn = wrap.querySelector('#btn-encerrar');
      btn.disabled = true; btn.textContent = 'Sala encerrada';
    });
    wrap.querySelectorAll('[data-voltar]').forEach(b => {
      b.addEventListener('click', () => {
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
})();
