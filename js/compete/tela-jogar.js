/* =========================================================================
 * EDL — compete/tela-jogar.js
 *
 * Tela do GRUPO: rota #/jogar (ou #/jogar/CODIGO, vindo do QR code).
 *
 * Fluxo: código da sala → nome do grupo → rodada. As questões vêm de
 * compete/banco-jogo.js, sorteadas a partir do código da sala — NÃO são as
 * dos módulos, que ficam reservadas ao estudo individual.
 *
 * DECISÕES DE UX QUE VÊM DE AULA REAL
 *   - O código é digitado em MAIÚSCULA, e o alfabeto exclui 0, O, 1 e I —
 *     os pares que o aluno confunde lendo da projeção. O L permanece, e é
 *     seguro justamente porque 1 e I não existem para confundi-lo.
 *   - O indicador de sincronia é permanente e discreto. Quando a rede
 *     cai, ele diz "salvo neste aparelho", não "erro": o grupo precisa
 *     continuar jogando com confiança, porque as respostas realmente vão
 *     subir depois.
 *   - Reentrada não pede nada de novo. F5 no meio da atividade cai direto
 *     no estado "você está na sala", com botão para voltar ao módulo.
 *
 * Exporta: registra a rota 'jogar' em EDL.screens
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const compete = (EDL.compete = EDL.compete || {});

  let desassinarFila = null;
  let pararPlacar = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, ch => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  }

  /* -----------------------------------------------------------------------
   * Render
   * --------------------------------------------------------------------- */

  function render(container, codigoDaUrl) {
    limpar();
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'compete-wrap';
    container.appendChild(wrap);

    if (compete.estado.emSala()) renderNaSala(wrap);
    else renderEntrada(wrap, codigoDaUrl);
  }

  /* ---- Formulário de entrada ---- */
  function renderEntrada(wrap, codigoDaUrl) {
    wrap.innerHTML = `
      <nav class="module-topbar">
        <button type="button" class="btn btn-ghost btn-small" data-voltar>← Voltar</button>
        <div class="module-topbar-title">Entrar na competição</div>
        <div class="module-topbar-spacer"></div>
      </nav>

      <section class="compete-card">
        <h1 class="compete-titulo">Entrar na sala</h1>
        <p class="compete-sub">
          O professor projetou um código de 6 letras e números. Digite abaixo,
          escolham um nome para o grupo e comecem.
        </p>

        <form id="form-entrar" novalidate>
          <label class="compete-label" for="campo-codigo">Código da sala</label>
          <input id="campo-codigo" class="compete-input compete-input-codigo"
                 type="text" inputmode="latin" autocomplete="off"
                 autocapitalize="characters" spellcheck="false"
                 maxlength="6" placeholder="ABC234"
                 aria-describedby="dica-codigo" />
          <p id="dica-codigo" class="compete-dica">
            Só letras e números. Não existem os caracteres 0, O, 1 nem I.
          </p>

          <label class="compete-label" for="campo-apelido">Nome do grupo</label>
          <input id="campo-apelido" class="compete-input" type="text"
                 autocomplete="off" maxlength="24"
                 placeholder="Os Vibriões" aria-describedby="dica-apelido" />
          <p id="dica-apelido" class="compete-dica">
            De 2 a 24 caracteres. Usem o nome do grupo, não o de ninguém.
          </p>

          <p id="erro-entrar" class="compete-erro" role="alert" hidden></p>

          <button type="submit" class="btn btn-primary compete-btn-grande" id="btn-entrar">
            Entrar na sala →
          </button>
        </form>

        <p class="compete-rodape">
          Não está numa aula? O site funciona sozinho —
          <a href="#/home" data-voltar-link>volte para os módulos</a>.
        </p>
      </section>
    `;

    const form    = wrap.querySelector('#form-entrar');
    const codigo  = wrap.querySelector('#campo-codigo');
    const apelido = wrap.querySelector('#campo-apelido');
    const erro    = wrap.querySelector('#erro-entrar');
    const botao   = wrap.querySelector('#btn-entrar');

    /* Normaliza enquanto digita: maiúscula e só o alfabeto do código. Evita
     * o aluno "acertar" um código que o servidor recusaria. */
    codigo.addEventListener('input', () => {
      const pos = codigo.selectionStart;
      codigo.value = codigo.value.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '');
      codigo.setSelectionRange(pos, pos);
    });

    if (codigoDaUrl) {
      codigo.value = String(codigoDaUrl).toUpperCase().slice(0, 6);
      setTimeout(() => { try { apelido.focus(); } catch (e) {} }, 60);
    } else {
      setTimeout(() => { try { codigo.focus(); } catch (e) {} }, 60);
    }

    form.addEventListener('submit', async ev => {
      ev.preventDefault();
      erro.hidden = true;
      botao.disabled = true;
      botao.textContent = 'Entrando…';

      const r = await compete.api.entrar(codigo.value, apelido.value);

      if (!r.ok) {
        erro.textContent = r.erro || 'Não foi possível entrar.';
        erro.hidden = false;
        botao.disabled = false;
        botao.textContent = 'Entrar na sala →';
        return;
      }
      render(document.getElementById('screen-jogar'));
    });

    wrap.querySelectorAll('[data-voltar], [data-voltar-link]').forEach(b => {
      b.addEventListener('click', ev => { ev.preventDefault(); EDL.screens.goTo('home'); });
    });
  }

  /* ---- Já está numa sala ---- */
  function renderNaSala(wrap) {
    const id = compete.estado.get();
    const titulo = 'Epidemiologia — rodada relâmpago';
    const emLocal = id.modo === 'local';

    wrap.innerHTML = `
      <nav class="module-topbar">
        <button type="button" class="btn btn-ghost btn-small" data-voltar>← Módulos</button>
        <div class="module-topbar-title">Competição</div>
        <div class="module-topbar-spacer"></div>
      </nav>

      <section class="compete-card">
        <div class="compete-badge-sala">Sala ${esc(id.code)}</div>
        <h1 class="compete-titulo">${esc(id.nickname)}</h1>
        <p class="compete-sub">
          <strong>${esc(titulo)}</strong>.
          ${id.resumeAt > 0
            ? `Já responderam ${id.resumeAt} de ${id.itemCount} questões.`
            : `São ${id.itemCount} questões, ${id.scoring && id.scoring.seconds || 30}s cada.
               Acertar rápido vale mais pontos.`}
        </p>

        ${emLocal ? `<p class="compete-aviso">
          Modo local: o placar aparece nas outras abas deste computador,
          sem internet.</p>` : ''}

        <div id="meu-placar" class="compete-placar" aria-live="polite"></div>

        <button type="button" class="btn btn-primary compete-btn-grande" id="btn-ir-modulo">
          ${id.resumeAt > 0 ? 'Continuar de onde paramos →' : 'Começar →'}
        </button>

        <div id="sync-aviso" class="compete-sync" role="status" aria-live="polite"></div>

        <p class="compete-rodape">
          <button type="button" class="btn-link" id="btn-sair">Sair da sala</button>
        </p>
      </section>
    `;

    wrap.querySelector('#btn-ir-modulo').addEventListener('click', () => {
      renderJogo(wrap, id);
    });

    wrap.querySelector('#btn-sair').addEventListener('click', async () => {
      const ok = window.confirm(
        'Sair da sala?\n\nAs respostas já enviadas continuam valendo. ' +
        'Para voltar, vocês precisarão do código e do mesmo nome de grupo.'
      );
      if (!ok) return;
      await compete.api.sair();
      render(document.getElementById('screen-jogar'));
    });

    wrap.querySelectorAll('[data-voltar]').forEach(b => {
      b.addEventListener('click', () => EDL.screens.goTo('home'));
    });

    ligarSync(wrap.querySelector('#sync-aviso'));
    ligarPlacar(wrap.querySelector('#meu-placar'), id);
  }

  /* -----------------------------------------------------------------------
   * A rodada
   *
   * Roda AQUI DENTRO, não no módulo. O modo game é atividade própria: as
   * questões vêm de compete/banco-jogo.js, sorteadas a partir do código da
   * sala — mesmo código, mesmo sorteio, para todos os grupos.
   *
   * As respostas são registradas por chamada EXPLÍCITA no onAnswer, e não
   * por escuta do barramento: assim, abrir um módulo para consultar a
   * teoria no meio da rodada não conta pontos.
   * --------------------------------------------------------------------- */
  function renderJogo(wrap, id) {
    limpar();

    const banco = compete.bancoJogo.sortear(id.code, id.itemCount);
    if (!banco.length) {
      wrap.innerHTML = '<p class="compete-erro">Não foi possível montar a rodada.</p>';
      return;
    }

    wrap.innerHTML = `
      <nav class="module-topbar">
        <div class="module-topbar-title">${esc(id.nickname)} · sala ${esc(id.code)}</div>
        <div class="module-topbar-spacer"></div>
      </nav>
      <section class="compete-jogo">
        <div id="jogo-quiz"></div>
      </section>
      <div id="sync-aviso" class="compete-sync" role="status" aria-live="polite"></div>
    `;

    ligarSync(wrap.querySelector('#sync-aviso'));

    EDL.quiz.run(wrap.querySelector('#jogo-quiz'), {
      bank: banco,
      startAt: id.resumeAt || 0,
      onAnswer(ev) { compete.api.registrarResposta(ev); },
      onComplete() { renderFim(wrap, id); }
    });
  }

  /* Tela de fim: pódio da sala. A festa fica aqui, não no meio da corrida. */
  async function renderFim(wrap, id) {
    const linhas = await compete.api.placar(id.roomId, compete.rest && compete.rest.aluno);
    const eu = (linhas || []).find(l => l.team_id === id.teamId);
    const medalhas = ['🥇', '🥈', '🥉'];

    wrap.innerHTML = `
      <nav class="module-topbar">
        <button type="button" class="btn btn-ghost btn-small" data-voltar>← Módulos</button>
        <div class="module-topbar-title">Fim da rodada</div>
        <div class="module-topbar-spacer"></div>
      </nav>
      <section class="compete-card">
        <h1 class="compete-titulo">${eu ? esc(eu.nickname) : esc(id.nickname)}</h1>
        ${eu ? `<div class="compete-placar">
            <span class="compete-placar-pos">${medalhas[eu.position - 1] || (eu.position + 'º')}</span>
            <span class="compete-placar-det">
              <strong>${Number(eu.score).toLocaleString('pt-BR')} pts</strong>
              · ${eu.correct_count}/${eu.answered_count} acertos
            </span>
          </div>` : ''}
        <div class="compete-podio" id="podio"></div>
        <p class="compete-sub" style="margin-top:1.25rem">
          O placar completo está na projeção. Aguardem o professor.
        </p>
        <div id="sync-aviso" class="compete-sync" role="status" aria-live="polite"></div>
      </section>
    `;

    const podio = wrap.querySelector('#podio');
    (linhas || []).slice(0, 8).forEach((l, i) => {
      const linha = document.createElement('div');
      linha.className = 'compete-podio-linha' + (l.team_id === id.teamId ? ' eu' : '');
      const pct = Math.max(2, Number(l.score_pct) || 0);
      linha.innerHTML = `
        <span class="compete-podio-pos">${medalhas[l.position - 1] || (l.position + 'º')}</span>
        <span class="compete-podio-nome">${esc(l.nickname)}</span>
        <span class="compete-podio-barra"><i style="width:0%"></i></span>
        <span class="compete-podio-pts">${Number(l.score).toLocaleString('pt-BR')}</span>`;
      podio.appendChild(linha);
      // Cascata: cada barra entra com um whoosh, 220 ms depois da anterior.
      setTimeout(() => {
        linha.querySelector('i').style.width = pct + '%';
        if (EDL.sfx) EDL.sfx.whoosh();
      }, 120 + i * 220);
    });

    setTimeout(() => { if (EDL.sfx) EDL.sfx.fanfarra(); },
               120 + Math.min((linhas || []).length, 8) * 220 + 200);

    wrap.querySelectorAll('[data-voltar]').forEach(b => {
      b.addEventListener('click', () => EDL.screens.goTo('home'));
    });
    ligarSync(wrap.querySelector('#sync-aviso'));
  }

  /* -----------------------------------------------------------------------
   * Indicador de sincronia
   *
   * Enquadramento importa: "salvo neste aparelho" em vez de "erro". O
   * grupo precisa continuar jogando com confiança — as respostas realmente
   * sobem quando a rede voltar.
   * --------------------------------------------------------------------- */
  function ligarSync(el) {
    if (!el) return;
    function pintar(estado) {
      const n = estado.pendentes;
      if (n === 0) {
        el.className = 'compete-sync ok';
        el.textContent = '✓ Respostas sincronizadas com a turma.';
      } else {
        el.className = 'compete-sync pendente';
        el.textContent = `Respostas salvas neste aparelho (${n} aguardando). ` +
                         'Sem conexão com a turma — tentando reenviar…';
      }
    }
    pintar({ pendentes: compete.estado.pendentes() });
    desassinarFila = compete.estado.aoMudar(pintar);
  }

  /* -----------------------------------------------------------------------
   * Posição do grupo
   *
   * Consulta pontual, não WebSocket: durante a corrida o grupo está
   * respondendo, não olhando placar. Uma conexão persistente por aparelho
   * seria desperdício — e é o que mantém o custo do Realtime irrisório.
   * --------------------------------------------------------------------- */
  function ligarPlacar(el, id) {
    if (!el) return;

    /* `forcar` pula a guarda de aba oculta. A guarda existe para o poll
     * periódico não consultar enquanto ninguém olha; a primeira pintura e
     * o retorno à aba precisam acontecer de qualquer forma, senão o grupo
     * encontra a posição em branco ao voltar. */
    async function atualizar(forcar) {
      if (document.hidden && !forcar) return;
      const linhas = await compete.api.placar(id.roomId, compete.rest && compete.rest.aluno);
      const eu = (linhas || []).find(l => l.team_id === id.teamId);
      if (!eu) { el.innerHTML = ''; return; }
      const total = (linhas || []).length;
      el.innerHTML = `
        <span class="compete-placar-pos">${eu.position}º</span>
        <span class="compete-placar-det">
          de ${total} grupo(s) · <strong>${Number(eu.score).toLocaleString('pt-BR')} pts</strong>
          · ${eu.answered_count}/${eu.item_count} respondidas
        </span>`;
    }

    atualizar(true);
    const parar = compete.api.observar(id.roomId, () => atualizar());
    const aoVoltar = () => { if (!document.hidden) atualizar(true); };
    document.addEventListener('visibilitychange', aoVoltar);
    pararPlacar = function () {
      parar();
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }

  function limpar() {
    if (desassinarFila) { desassinarFila(); desassinarFila = null; }
    if (pararPlacar)    { pararPlacar();    pararPlacar = null; }
  }

  /* -----------------------------------------------------------------------
   * Registro da rota
   * --------------------------------------------------------------------- */
  EDL.screens.register('jogar', {
    label: 'Entrar na competição',
    onEnter(container, param) { render(container, param); },
    onLeave() { limpar(); }
  });

  /* -----------------------------------------------------------------------
   * Card na home
   *
   * Injetado por este arquivo, e não escrito no index.html, para que o core
   * continue sem saber que competição existe: apagar js/compete/ devolve o
   * site ao estado anterior sem deixar markup órfão.
   *
   * Fica ACIMA da grade de módulos porque, na aula, é a primeira coisa que
   * o aluno precisa achar — e depois some do caminho, virando um discreto
   * "voltar à sala" para quem já entrou.
   * --------------------------------------------------------------------- */
  function injetarCardHome() {
    const secao = document.getElementById('modulos');
    if (!secao) return;

    const anterior = document.getElementById('compete-card-home');
    if (anterior) anterior.remove();

    const naSala = compete.estado.emSala();
    const card = document.createElement('button');
    card.type = 'button';
    card.id = 'compete-card-home';
    card.className = 'compete-home' + (naSala ? ' na-sala' : '');
    card.innerHTML = naSala
      ? `<span class="compete-home-icone" aria-hidden="true">🎯</span>
         <span class="compete-home-txt">
           <strong>Voltar para a sala ${esc(compete.estado.codigo())}</strong>
           <span>Vocês são ${esc(compete.estado.apelido())}</span>
         </span>
         <span class="compete-home-seta" aria-hidden="true">→</span>`
      : `<span class="compete-home-icone" aria-hidden="true">🏁</span>
         <span class="compete-home-txt">
           <strong>Entrar numa competição</strong>
           <span>O professor vai projetar um código de 6 caracteres</span>
         </span>
         <span class="compete-home-seta" aria-hidden="true">→</span>`;

    card.addEventListener('click', () => EDL.screens.goTo('jogar'));
    secao.insertBefore(card, secao.firstElementChild);
  }

  /* A home é re-renderizada a cada volta; o card precisa acompanhar o
   * estado (entrou numa sala, saiu dela). */
  window.addEventListener('hashchange', () => {
    if (location.hash === '' || location.hash === '#/' || location.hash === '#/home') {
      setTimeout(injetarCardHome, 0);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injetarCardHome);
  } else {
    injetarCardHome();
  }
})();
