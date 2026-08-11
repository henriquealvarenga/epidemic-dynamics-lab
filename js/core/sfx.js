/* =========================================================================
 * EDL — sfx.js
 *
 * Efeitos sonoros SINTETIZADOS pela Web Audio API.
 *
 * Zero arquivo de áudio, zero requisição, zero licença. Os sons são
 * osciladores montados na hora — o custo é ~150 linhas em vez de alguns
 * .mp3 que teriam de ser baixados, hospedados e atribuídos.
 *
 * ⚠️ ENVELOPE COM RAMPA LINEAR — DE PROPÓSITO. NÃO TROCAR POR
 *    exponentialRampToValueAtTime.
 *
 *    O WebKit/Safari tem um bug antigo em que a rampa exponencial no
 *    GainNode não é aplicada: o ganho fica preso no valor inicial e o som
 *    sai INAUDÍVEL. O oscilador roda, o Safari até acende o indicador de
 *    áudio na aba, e nada se ouve — o pior tipo de sintoma, porque tudo
 *    parece funcionar. A rampa exponencial também não pode partir de 0
 *    (exige um piso 0.0001), o que piora o problema.
 *
 *    Este aviso vem do projeto irmão do Exame do Estado Mental, onde o
 *    diagnóstico custou tempo real. Está aqui para impedir a reincidência.
 *
 * POLÍTICA DE AUTOPLAY
 *    Navegador nenhum deixa tocar som antes de o usuário interagir com a
 *    página. O AudioContext nasce suspenso e é destravado no primeiro
 *    toque/clique/tecla, uma vez só.
 *
 * ACESSIBILIDADE
 *    Som é reforço, nunca a única informação: acerto e erro continuam
 *    visíveis no feedback do quiz. A preferência de mudo é persistida, e
 *    quem tem `prefers-reduced-motion` começa mudo — quem pede menos
 *    estímulo costuma querer menos estímulo em geral.
 *
 * Exporta: window.EDL.sfx
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const CHAVE_MUDO = 'edl.sfx.mudo.v1';

  let ctx = null;
  let destravado = false;
  let mudo = false;

  (function carregarPreferencia() {
    try {
      const salvo = localStorage.getItem(CHAVE_MUDO);
      if (salvo !== null) { mudo = salvo === '1'; return; }
    } catch (err) { /* segue com o padrão */ }
    // Sem preferência salva: respeita quem pediu menos movimento.
    try {
      mudo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) { mudo = false; }
  })();

  function gravarPreferencia() {
    try { localStorage.setItem(CHAVE_MUDO, mudo ? '1' : '0'); }
    catch (err) { /* silencioso */ }
  }

  function contexto() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (err) { ctx = null; }
    return ctx;
  }

  function destravar() {
    const c = contexto();
    if (!c) return;
    if (c.state === 'suspended') { try { c.resume(); } catch (err) { /* */ } }
    destravado = true;
  }

  ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(ev => {
    document.addEventListener(ev, destravar, { once: true, capture: true, passive: true });
  });

  /**
   * Uma nota. `tipo` é a forma de onda; `dur` em segundos.
   *
   * O envelope sobe em 8 ms e desce até o fim — as duas rampas LINEARES
   * (ver o aviso no topo). A subida evita o "click" de transiente que um
   * ganho instantâneo produziria.
   */
  function nota(freq, inicio, dur, volume, tipo) {
    const c = contexto();
    if (!c) return;
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = tipo || 'triangle';
    osc.frequency.setValueAtTime(freq, inicio);

    g.gain.setValueAtTime(0, inicio);
    g.gain.linearRampToValueAtTime(volume, inicio + 0.008);
    g.gain.linearRampToValueAtTime(0, inicio + dur);

    osc.connect(g);
    g.connect(c.destination);
    osc.start(inicio);
    osc.stop(inicio + dur + 0.02);
  }

  /** Varredura de frequência, para o "whoosh" das barras do pódio. */
  function varredura(de, para, dur, volume) {
    const c = contexto();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g   = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(de, t0);
    osc.frequency.linearRampToValueAtTime(para, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(volume, t0 + 0.02);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function podeTocar() {
    if (mudo) return false;
    const c = contexto();
    if (!c) return false;
    if (!destravado) return false;
    if (c.state === 'suspended') { try { c.resume(); } catch (err) { return false; } }
    return true;
  }

  /* -----------------------------------------------------------------------
   * Os sons
   * --------------------------------------------------------------------- */
  const SONS = {
    /** Toque curto e neutro, para seleção. */
    clique() {
      if (!podeTocar()) return;
      nota(660, ctx.currentTime, 0.05, 0.06, 'triangle');
    },

    /** Arpejo maior ascendente (C5–E5–G5): resolve para cima. */
    acerto() {
      if (!podeTocar()) return;
      const t = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((f, i) => {
        nota(f, t + i * 0.07, 0.16, 0.09, 'triangle');
      });
    },

    /** Grave e curto. Serra em volume baixo: perceptível sem ser punitivo —
     *  o aluno erra por não saber, não para ser repreendido. */
    erro() {
      if (!podeTocar()) return;
      nota(146.83, ctx.currentTime, 0.22, 0.07, 'sawtooth');
    },

    /** Meio-crédito: uma nota só, no meio do caminho entre acerto e erro. */
    parcial() {
      if (!podeTocar()) return;
      nota(392.00, ctx.currentTime, 0.16, 0.07, 'triangle');
    },

    whoosh() {
      if (!podeTocar()) return;
      varredura(280, 880, 0.18, 0.05);
    },

    /** Fanfarra do pódio: arpejo + acorde sustentado. */
    fanfarra() {
      if (!podeTocar()) return;
      const t = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        nota(f, t + i * 0.10, 0.22, 0.10, 'triangle');
      });
      [523.25, 659.25, 783.99, 1046.50].forEach(f => {
        nota(f, t + 0.44, 0.75, 0.07, 'triangle');
      });
    }
  };

  /* -----------------------------------------------------------------------
   * Ligações automáticas
   *
   * Assina o barramento do quiz — os 8 módulos não sabem que som existe,
   * e o modo solo ganha o retorno sonoro junto com a competição.
   * --------------------------------------------------------------------- */
  if (EDL.quizEvents) {
    EDL.quizEvents.on('answer', ev => {
      if (!ev.correct) SONS.erro();
      else if (ev.expired) SONS.parcial();
      else SONS.acerto();
    });
    EDL.quizEvents.on('complete', () => SONS.fanfarra());
  }

  /* -----------------------------------------------------------------------
   * Botão de mudo
   * --------------------------------------------------------------------- */
  function criarBotao() {
    if (document.getElementById('sfx-toggle')) return;
    const b = document.createElement('button');
    b.id = 'sfx-toggle';
    b.type = 'button';
    b.className = 'sfx-toggle';
    document.body.appendChild(b);
    b.addEventListener('click', () => { alternarMudo(); pintar(b); });
    pintar(b);
  }

  function pintar(b) {
    b.textContent = mudo ? '🔇' : '🔊';
    b.setAttribute('aria-label',
      mudo ? 'Sons desligados — ativar' : 'Sons ligados — desativar');
    b.setAttribute('aria-pressed', String(mudo));
    b.title = b.getAttribute('aria-label');
  }

  function alternarMudo() {
    mudo = !mudo;
    gravarPreferencia();
    if (!mudo) { destravar(); SONS.clique(); }
    return mudo;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', criarBotao);
  } else {
    criarBotao();
  }

  EDL.sfx = Object.assign({}, SONS, {
    mudo: () => mudo,
    alternarMudo,
    destravar
  });
})();
