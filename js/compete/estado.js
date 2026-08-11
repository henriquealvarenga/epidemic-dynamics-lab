/* =========================================================================
 * EDL — compete/estado.js
 *
 * Identidade do grupo neste aparelho e fila de respostas pendentes.
 *
 * A REDE DA FACULDADE VAI CAIR
 *   Essa é a premissa. Quando cair, o grupo precisa continuar jogando: o
 *   banco de questões está no bundle, a pontuação é conhecida localmente, e
 *   só o placar do telão congela. As respostas ficam numa fila e sobem
 *   quando a conexão voltar.
 *
 *   Retry FIXO de 8 s, sem backoff exponencial. Uma aula dura ~50 minutos;
 *   backoff só atrasaria a recuperação justamente quando ela importa.
 *
 *   O reenvio é seguro por construção: `unique (team_id, question_idx)` no
 *   banco rejeita duplicata com 23505, então uma resposta entregue duas
 *   vezes não soma pontos duas vezes. Isso é o que permite a fila ser
 *   burra — ela não precisa saber o que já chegou.
 *
 * RETOMADA É DO SERVIDOR, NÃO DAQUI
 *   `join_room` devolve `resume_at = max(question_idx)+1`. Confiar no
 *   localStorage para isso permitiria refazer questões e somar de novo.
 *   O que guardamos aqui é conveniência (pular a tela de apelido), não
 *   autoridade.
 *
 * Exporta: window.EDL.compete.estado
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const compete = (EDL.compete = EDL.compete || {});
  const cfg = compete.config;

  /* -----------------------------------------------------------------------
   * Identidade
   * --------------------------------------------------------------------- */
  let identidade = null;

  (function carregar() {
    try {
      const bruto = localStorage.getItem(cfg.storageKeys.identity);
      if (bruto) identidade = JSON.parse(bruto);
    } catch (err) {
      console.warn('[EDL/compete] não foi possível ler a identidade salva:', err);
    }
  })();

  function gravarIdentidade(nova) {
    identidade = nova;
    try {
      if (nova) localStorage.setItem(cfg.storageKeys.identity, JSON.stringify(nova));
      else localStorage.removeItem(cfg.storageKeys.identity);
    } catch (err) { /* segue só em memória */ }
  }

  /** Shape:
   *  { modo:'sala'|'local', code, roomId, teamId, nickname,
   *    activityRef, itemCount, scoring, epoca } */
  function definir(dados) {
    gravarIdentidade(Object.assign({}, identidade, dados));
    return identidade;
  }

  function limpar() {
    gravarIdentidade(null);
    limparFila();
  }

  function emSala() {
    return !!(identidade && identidade.roomId && identidade.teamId);
  }

  /* -----------------------------------------------------------------------
   * Época
   *
   * Distingue "o professor reiniciou a rodada" (zerar) de "o aluno deu F5
   * no meio" (retomar). Sem isso, recarregar a página no meio da atividade
   * zeraria o próprio placar — bug real, documentado no projeto irmão.
   * --------------------------------------------------------------------- */
  function mesmaEpoca(epocaServidor) {
    if (!identidade) return false;
    if (epocaServidor == null) return true;         // servidor não informou
    return identidade.epoca === epocaServidor;
  }

  function adotarEpoca(epocaServidor) {
    if (!identidade) return false;
    const mudou = identidade.epoca !== epocaServidor;
    if (mudou) definir({ epoca: epocaServidor });
    return mudou;
  }

  /* -----------------------------------------------------------------------
   * Fila de respostas pendentes
   * --------------------------------------------------------------------- */
  let fila = [];
  let timerReenvio = null;
  let enviando = false;
  const ouvintes = [];

  (function carregarFila() {
    try {
      const bruto = localStorage.getItem(cfg.storageKeys.queue);
      if (bruto) {
        const arr = JSON.parse(bruto);
        if (Array.isArray(arr)) fila = arr;
      }
    } catch (err) { /* fila vazia é um começo válido */ }
  })();

  function gravarFila() {
    try {
      if (fila.length) localStorage.setItem(cfg.storageKeys.queue, JSON.stringify(fila));
      else localStorage.removeItem(cfg.storageKeys.queue);
    } catch (err) { /* QuotaExceeded: a fila vive nesta aba */ }
  }

  function limparFila() {
    fila = [];
    gravarFila();
    pararReenvio();
    notificar();
  }

  function pendentes() { return fila.length; }

  function aoMudar(fn) {
    if (typeof fn === 'function') ouvintes.push(fn);
    return () => {
      const i = ouvintes.indexOf(fn);
      if (i >= 0) ouvintes.splice(i, 1);
    };
  }

  function notificar() {
    const estado = { pendentes: fila.length, enviando: enviando };
    ouvintes.slice().forEach(fn => {
      try { fn(estado); }
      catch (err) { console.error('[EDL/compete] ouvinte de fila falhou:', err); }
    });
  }

  /**
   * Enfileira uma resposta e tenta enviar imediatamente.
   *
   * `enviarUm` é injetado por api.js para que este arquivo não conheça o
   * backend — a mesma fila serve ao modo sala (Supabase) e ao modo local
   * (BroadcastChannel).
   *
   * Deve retornar { ok:true } | { ok:false, permanente?:boolean }.
   * `permanente` marca o que não adianta repetir: duplicata (23505) e
   * questão fora da faixa. Essas saem da fila em vez de travá-la para sempre.
   */
  let enviarUm = null;
  function definirTransporte(fn) { enviarUm = fn; }

  function enfileirar(resposta) {
    fila.push(resposta);
    gravarFila();
    notificar();
    escoar();
  }

  async function escoar() {
    if (enviando || !fila.length || typeof enviarUm !== 'function') return;
    enviando = true;
    notificar();

    try {
      while (fila.length) {
        const item = fila[0];
        let r;
        try { r = await enviarUm(item); }
        catch (err) { r = { ok: false }; }

        if (r && r.ok) {
          fila.shift();
          gravarFila();
        } else if (r && r.permanente) {
          // Já estava no servidor (duplicata) ou nunca será aceita.
          // Descartar é o certo: manter travaria a fila indefinidamente.
          fila.shift();
          gravarFila();
        } else {
          agendarReenvio();
          break;
        }
      }
    } finally {
      enviando = false;
      notificar();
      if (!fila.length) pararReenvio();
    }
  }

  function agendarReenvio() {
    if (timerReenvio) return;             // idempotente: um timer só
    timerReenvio = setInterval(escoar, cfg.retryMs);
  }

  function pararReenvio() {
    if (timerReenvio) clearInterval(timerReenvio);
    timerReenvio = null;
  }

  /* A aba do celular dorme e volta: ao reaparecer, tenta escoar na hora em
   * vez de esperar o próximo tique de 8 s. */
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) escoar();
  });

  compete.estado = {
    definir, limpar, emSala,
    get:   () => identidade,
    codigo:() => (identidade && identidade.code) || null,
    salaId:() => (identidade && identidade.roomId) || null,
    grupoId:() => (identidade && identidade.teamId) || null,
    apelido:() => (identidade && identidade.nickname) || null,

    mesmaEpoca, adotarEpoca,

    definirTransporte, enfileirar, escoar, pendentes, aoMudar, limparFila
  };
})();
