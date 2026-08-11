/* =========================================================================
 * EDL — compete/local.js
 *
 * Backend do modo competição SEM REDE: `BroadcastChannel` entre abas do
 * mesmo navegador, com `localStorage` como armazenamento.
 *
 * ISTO NÃO É UM MOCK DE DESENVOLVIMENTO
 *   É fallback de produção. Se o Supabase estiver pausado, a rede da
 *   faculdade cair ou a config estiver desligada, a aula acontece assim:
 *   professor numa aba, grupos em outras. Também é como se ensaia a aula
 *   inteira no próprio notebook antes de depender de qualquer infra.
 *
 *   O projeto irmão do Exame do Estado Mental trata o modo local como
 *   cidadão de primeira classe pelo mesmo motivo: aula acontece uma vez,
 *   e degradar é aceitável — falhar não é.
 *
 * A FÓRMULA DE PONTOS É COPIADA DO TRIGGER DO SERVIDOR
 *   `aulas.answers_before_insert()` calcula:
 *     acerto no tempo     → base + segundos restantes × bônus
 *     acerto fora do tempo → meio-crédito fixo
 *     erro                 → 0
 *   Se as duas divergirem, ensaiar dá um número e a aula real dá outro —
 *   e a diferença só apareceria na frente da turma. Qualquer mudança lá
 *   precisa vir para cá.
 *
 * Exporta: window.EDL.compete.local
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const compete = (EDL.compete = EDL.compete || {});

  const PREFIXO = 'edl.compete.local.';
  const CANAL   = 'edl-compete-local';
  const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // sem 0 O 1 I L

  let canal = null;
  try { canal = new BroadcastChannel(CANAL); } catch (err) { canal = null; }

  const ouvintes = [];

  function anunciar(evento) {
    try { if (canal) canal.postMessage(evento); } catch (err) { /* ignora */ }
    entregar(evento);
  }

  function entregar(evento) {
    ouvintes.slice().forEach(o => {
      if (o.salaId && evento.roomId && o.salaId !== evento.roomId) return;
      try { o.fn(evento); }
      catch (err) { console.error('[EDL/compete/local] ouvinte falhou:', err); }
    });
  }

  if (canal) canal.onmessage = ev => entregar(ev.data || {});

  /* Rede de segurança: se BroadcastChannel não existir ou uma mensagem se
   * perder, o poll mantém as abas convergindo. Mesmo princípio do modo
   * sala — o canal rápido nunca substitui o lento, só o antecipa. */
  const POLL_MS = 800;

  /* -----------------------------------------------------------------------
   * Armazenamento
   * --------------------------------------------------------------------- */
  function ler(chave, padrao) {
    try {
      const bruto = localStorage.getItem(PREFIXO + chave);
      return bruto ? JSON.parse(bruto) : padrao;
    } catch (err) { return padrao; }
  }

  function gravar(chave, valor) {
    try { localStorage.setItem(PREFIXO + chave, JSON.stringify(valor)); }
    catch (err) { console.warn('[EDL/compete/local] falha ao gravar', chave, err); }
  }

  const salas     = () => ler('rooms', {});
  const grupos    = id => ler('teams.' + id, {});
  const respostas = id => ler('answers.' + id, []);

  function novoCodigo() {
    const existentes = salas();
    let c;
    do {
      c = '';
      for (let i = 0; i < 6; i++) {
        c += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
      }
    } while (existentes[c]);
    return c;
  }

  function uuidLocal() {
    if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return 'l-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  /* -----------------------------------------------------------------------
   * Operações — mesma superfície do backend remoto
   * --------------------------------------------------------------------- */

  function criarSala(opcoes) {
    const o = opcoes || {};
    const code = novoCodigo();
    const sala = {
      roomId: uuidLocal(),
      code: code,
      activityRef: o.activityRef,
      title: o.title || o.activityRef,
      itemCount: o.itemCount || 0,
      scoring: o.scoring || EDL.quiz.scoringConfig(),
      status: 'open',
      epoca: Date.now(),
      createdAt: Date.now()
    };
    const todas = salas();
    todas[code] = sala;
    gravar('rooms', todas);
    gravar('teams.' + sala.roomId, {});
    gravar('answers.' + sala.roomId, []);
    anunciar({ tipo: 'sala', roomId: sala.roomId });
    return { ok: true, dados: sala };
  }

  function acharSala(code) {
    return salas()[String(code || '').trim().toUpperCase()] || null;
  }

  function atualizarSala(roomId, campos) {
    const todas = salas();
    const code = Object.keys(todas).find(k => todas[k].roomId === roomId);
    if (!code) return { ok: false, erro: 'sala não encontrada' };
    Object.assign(todas[code], campos);
    gravar('rooms', todas);
    anunciar({ tipo: 'sala', roomId: roomId });
    return { ok: true, dados: todas[code] };
  }

  function entrar(code, apelido) {
    const sala = acharSala(code);
    if (!sala) return { ok: false, erro: 'Sala não encontrada. Confira o código com o professor.' };
    if (sala.status === 'closed') return { ok: false, erro: 'Esta sala já foi encerrada.' };

    const nick = String(apelido || '').replace(/\s+/g, ' ').trim();
    if (nick.length < 2 || nick.length > 24) {
      return { ok: false, erro: 'O nome do grupo precisa ter de 2 a 24 caracteres.' };
    }

    const time = grupos(sala.roomId);
    const conflito = Object.values(time)
      .find(t => t.nickname.toLowerCase() === nick.toLowerCase());
    if (conflito) {
      /* Mesma regra do servidor: reentrada do MESMO aparelho devolve o
       * mesmo grupo; aparelho diferente com nome repetido é recusado. */
      const meu = localStorage.getItem(PREFIXO + 'me.' + sala.roomId);
      if (meu === conflito.teamId) return { ok: true, dados: montarEntrada(sala, conflito) };
      return { ok: false, erro: 'Esse nome já está em uso nesta sala. Escolham outro.' };
    }

    const novo = {
      teamId: uuidLocal(), roomId: sala.roomId, nickname: nick,
      score: 0, answered: 0, correct: 0, joinedAt: Date.now(), lastAnswerAt: null
    };
    time[novo.teamId] = novo;
    gravar('teams.' + sala.roomId, time);
    try { localStorage.setItem(PREFIXO + 'me.' + sala.roomId, novo.teamId); } catch (err) { /* */ }
    anunciar({ tipo: 'grupo', roomId: sala.roomId });
    return { ok: true, dados: montarEntrada(sala, novo) };
  }

  function montarEntrada(sala, time) {
    const minhas = respostas(sala.roomId).filter(r => r.teamId === time.teamId);
    const resumeAt = minhas.length
      ? Math.max.apply(null, minhas.map(r => r.questionIdx)) + 1
      : 0;
    return {
      room_id: sala.roomId, code: sala.code, status: sala.status,
      scoring: sala.scoring, external_id: sala.activityRef,
      item_count: sala.itemCount, team_id: time.teamId,
      nickname: time.nickname, score: time.score,
      resume_at: resumeAt, epoca: sala.epoca
    };
  }

  /** Espelha `aulas.answers_before_insert()`. Ver o cabeçalho do arquivo. */
  function calcularPontos(sala, correto, segundosRestantes) {
    if (!correto) return 0;
    const s = sala.scoring || {};
    const base  = s.base != null ? s.base : (s.basePoints || 100);
    const bonus = s.bonus_per_sec != null ? s.bonus_per_sec : (s.bonusPerSec || 5);
    const late  = s.late != null ? s.late : (s.lateAnswerPoints || 50);
    const teto  = s.seconds != null ? s.seconds : (s.secondsPerQ || 30);
    const restantes = Math.max(0, Math.min(segundosRestantes || 0, teto));
    return restantes <= 0 ? late : base + restantes * bonus;
  }

  function registrarResposta(item) {
    const todas = salas();
    const code = Object.keys(todas).find(k => todas[k].roomId === item.roomId);
    const sala = code ? todas[code] : null;
    if (!sala) return { ok: false, permanente: true, erro: 'sala não encontrada' };
    if (sala.status === 'closed') return { ok: false, permanente: true, erro: 'sala encerrada' };
    if (item.questionIdx >= sala.itemCount) {
      return { ok: false, permanente: true, erro: 'questão fora da atividade' };
    }

    const lista = respostas(sala.roomId);
    // Espelha `unique (team_id, question_idx)`: duplicata é permanente, não
    // erro transitório — a fila descarta em vez de repetir para sempre.
    if (lista.some(r => r.teamId === item.teamId && r.questionIdx === item.questionIdx)) {
      return { ok: false, permanente: true, erro: 'questão já respondida' };
    }

    const pontos = calcularPontos(sala, item.isCorrect, item.secsLeft);
    lista.push({
      teamId: item.teamId, questionIdx: item.questionIdx,
      chosenIdx: item.chosenIdx, isCorrect: !!item.isCorrect,
      secsLeft: item.secsLeft, elapsedMs: item.elapsedMs || 0,
      points: pontos, createdAt: Date.now()
    });
    gravar('answers.' + sala.roomId, lista);

    const time = grupos(sala.roomId);
    const t = time[item.teamId];
    if (t) {
      t.score += pontos;
      t.answered += 1;
      t.correct += item.isCorrect ? 1 : 0;
      t.lastAnswerAt = Date.now();
      if (t.answered >= sala.itemCount && !t.finishedAt) t.finishedAt = Date.now();
      gravar('teams.' + sala.roomId, time);
    }

    anunciar({ tipo: 'resposta', roomId: sala.roomId });
    return { ok: true, dados: { points: pontos } };
  }

  function placar(roomId) {
    const todas = salas();
    const code = Object.keys(todas).find(k => todas[k].roomId === roomId);
    const sala = code ? todas[code] : null;
    if (!sala) return [];

    const s = sala.scoring || {};
    const maxPorQuestao = (s.base != null ? s.base : 100)
      + (s.seconds != null ? s.seconds : 30) * (s.bonus_per_sec != null ? s.bonus_per_sec : 5);
    const maximo = (sala.itemCount || 0) * maxPorQuestao;

    const linhas = Object.values(grupos(roomId)).map(t => ({
      team_id: t.teamId, nickname: t.nickname, score: t.score,
      answered_count: t.answered, correct_count: t.correct,
      finished_at: t.finishedAt || null,
      item_count: sala.itemCount,
      score_pct: maximo > 0 ? Math.round(Math.min(100, t.score / maximo * 100) * 10) / 10 : 0,
      last_answer_at: t.lastAnswerAt
    }));

    // Mesma ordenação da view v_leaderboard: pontos desc, desempate por
    // quem chegou lá primeiro. Empate compartilha colocação.
    linhas.sort((a, b) => (b.score - a.score) ||
      ((a.last_answer_at || Infinity) - (b.last_answer_at || Infinity)));
    let posicao = 0, anterior = null;
    linhas.forEach((l, i) => {
      if (anterior === null || l.score !== anterior) { posicao = i + 1; anterior = l.score; }
      l.position = posicao;
    });
    return linhas;
  }

  function estatisticasPorQuestao(roomId) {
    const porQuestao = {};
    respostas(roomId).forEach(r => {
      const k = r.questionIdx;
      if (!porQuestao[k]) porQuestao[k] = { question_idx: k, n: 0, n_correct: 0, erradas: {}, ms: 0 };
      const q = porQuestao[k];
      q.n += 1;
      q.ms += r.elapsedMs || 0;
      if (r.isCorrect) q.n_correct += 1;
      else q.erradas[r.chosenIdx] = (q.erradas[r.chosenIdx] || 0) + 1;
    });
    return Object.values(porQuestao).map(q => {
      let distrator = null, maior = 0;
      Object.keys(q.erradas).forEach(k => {
        if (q.erradas[k] > maior) { maior = q.erradas[k]; distrator = Number(k); }
      });
      return {
        question_idx: q.question_idx, n: q.n, n_correct: q.n_correct,
        pct_correct: q.n ? Math.round(q.n_correct / q.n * 1000) / 10 : 0,
        top_distractor: distrator,
        avg_secs: q.n ? Math.round(q.ms / q.n / 100) / 10 : 0
      };
    }).sort((a, b) => a.question_idx - b.question_idx);
  }

  function observar(roomId, fn) {
    const o = { salaId: roomId, fn: fn };
    ouvintes.push(o);
    const t = setInterval(() => fn({ tipo: 'poll', roomId: roomId }), POLL_MS);
    return function parar() {
      const i = ouvintes.indexOf(o);
      if (i >= 0) ouvintes.splice(i, 1);
      clearInterval(t);
    };
  }

  /** Apaga tudo do modo local. Usado pelo "encerrar sessão" do professor. */
  function zerar() {
    try {
      Object.keys(localStorage)
        .filter(k => k.indexOf(PREFIXO) === 0)
        .forEach(k => localStorage.removeItem(k));
    } catch (err) { /* ignora */ }
    anunciar({ tipo: 'reset' });
  }

  compete.local = {
    criarSala, acharSala, atualizarSala, entrar, registrarResposta,
    placar, estatisticasPorQuestao, observar, zerar,
    calcularPontos   // exposto para os testes compararem com o servidor
  };
})();
