#!/usr/bin/env node
/* =========================================================================
 * EDL — test runner
 *
 * Testes unitários para os módulos matemáticos core (math.js, models.js).
 *
 * Decisão: sem framework. Usa apenas `node:assert` nativo. Razão: (1) evita
 * acoplar o projeto a uma dependência npm só para testes, (2) os módulos
 * testados são funções puras e determinísticas — não precisam de mocks,
 * stubs ou runners de browser, (3) mantém o projeto consistente com a
 * filosofia zero-build/zero-dependency.
 *
 * Como rodar:
 *     node tests/run.js
 *
 * Saída: 1 linha por teste em formato TAP-ish (ok / not ok). Exit code 0
 * se tudo passar, 1 caso contrário — adequado para CI (GitHub Actions).
 * ========================================================================= */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/* ------------------------------------------------------------------
 * Setup — simula window + carrega os módulos core
 * ---------------------------------------------------------------- */
global.window = { EDL: {} };
const EDL = global.window.EDL;

function load(relPath) {
  const full = path.join(__dirname, '..', relPath);
  const src = fs.readFileSync(full, 'utf8');
  // Usa eval direto — segurança OK pois o código é nosso próprio.
  // Alternativa mais idiomática seria vm.runInThisContext, mas daria na
  // mesma para esse caso.
  eval(src);
}
load('js/core/math.js');
load('js/core/models.js');

/* ------------------------------------------------------------------
 * Mini test runner (TAP-ish)
 * ---------------------------------------------------------------- */
let count = 0, passed = 0, failed = 0;

function test(name, fn) {
  count++;
  try {
    fn();
    passed++;
    console.log(`ok ${count} - ${name}`);
  } catch (err) {
    failed++;
    console.log(`not ok ${count} - ${name}`);
    const lines = String(err.message || err).split('\n').slice(0, 5);
    lines.forEach(l => console.log('  ' + l));
  }
}

/* Variante assíncrona.
 *
 * O runner é síncrono por design — o que se testava aqui eram funções
 * puras. A recuperação da sala aberta não é: ela atravessa a camada de
 * rede, que os testes substituem. Em vez de espalhar `await` por tudo,
 * cada teste assíncrono registra sua promessa e o relatório final espera
 * por todas antes de decidir o exit code.
 */
const assincronos = [];

function testAsync(name, fn) {
  const meu = ++count;
  assincronos.push(Promise.resolve().then(fn).then(
    () => { passed++; console.log(`ok ${meu} - ${name}`); },
    err => {
      failed++;
      console.log(`not ok ${meu} - ${name}`);
      String(err.message || err).split('\n').slice(0, 5).forEach(l => console.log('  ' + l));
    }
  ));
}

/* ==================================================================
 * math.js
 * ================================================================ */

test('seededRNG: mesma seed produz mesma sequência', () => {
  const r1 = EDL.math.seededRNG(42);
  const r2 = EDL.math.seededRNG(42);
  for (let i = 0; i < 100; i++) assert.equal(r1(), r2());
});

test('seededRNG: seeds diferentes produzem sequências diferentes', () => {
  const r1 = EDL.math.seededRNG(42);
  const r2 = EDL.math.seededRNG(43);
  const a = [r1(), r1(), r1()];
  const b = [r2(), r2(), r2()];
  assert.notDeepEqual(a, b);
});

test('seededRNG: todos os valores em [0, 1)', () => {
  const r = EDL.math.seededRNG(123);
  for (let i = 0; i < 5000; i++) {
    const v = r();
    assert.ok(v >= 0 && v < 1, `valor fora de [0,1): ${v}`);
  }
});

test('randn: distribuição aproximadamente normal (N=20000)', () => {
  const r = EDL.math.seededRNG(7);
  const N = 20000;
  let sum = 0, sumsq = 0;
  for (let i = 0; i < N; i++) {
    const v = EDL.math.randn(r);
    sum += v; sumsq += v * v;
  }
  const mean = sum / N;
  const variance = sumsq / N - mean * mean;
  const stdev = Math.sqrt(variance);
  assert.ok(Math.abs(mean) < 0.05, `média fora: ${mean.toFixed(4)}`);
  assert.ok(Math.abs(stdev - 1) < 0.05, `desvio-padrão fora: ${stdev.toFixed(4)}`);
});

test('clamp: respeita limites inferior e superior', () => {
  const c = EDL.math.clamp;
  assert.equal(c(5, 0, 10), 5);
  assert.equal(c(-5, 0, 10), 0);
  assert.equal(c(15, 0, 10), 10);
  assert.equal(c(0, 0, 10), 0);
  assert.equal(c(10, 0, 10), 10);
});

test('shuffleInPlace: determinístico com mesma seed', () => {
  const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  EDL.math.shuffleInPlace(arr1, EDL.math.seededRNG(99));
  EDL.math.shuffleInPlace(arr2, EDL.math.seededRNG(99));
  assert.deepEqual(arr1, arr2);
  // E deve ser um permutação do input (mesmos elementos)
  assert.deepEqual([...arr1].sort((a,b) => a-b), [1,2,3,4,5,6,7,8,9,10]);
});

test('fmtBR: padrão brasileiro (ponto milhar, vírgula decimal)', () => {
  const f = EDL.math.fmtBR;
  assert.equal(f(1234567.89, 2), '1.234.567,89');
  assert.equal(f(0, 2), '0,00');
  assert.equal(f(-42.5, 2), '-42,50');
  assert.equal(f(NaN, 2), '—');
  assert.equal(f(Infinity, 2), '—');
});

test('fmtInt: arredonda e formata inteiro', () => {
  const f = EDL.math.fmtInt;
  assert.equal(f(12345), '12.345');
  assert.equal(f(12345.9), '12.346');
  assert.equal(f(0), '0');
  assert.equal(f(NaN), '—');
});

test('sum e mean: aritmética básica', () => {
  assert.equal(EDL.math.sum([1, 2, 3, 4]), 10);
  assert.equal(EDL.math.sum([]), 0);
  assert.equal(EDL.math.mean([1, 2, 3, 4]), 2.5);
  assert.equal(EDL.math.mean([]), 0);
});

/* ==================================================================
 * models.js — exponential
 * ================================================================ */

test('exponential: fórmula I(k) = I₀ · R₀^k', () => {
  const out = EDL.models.exponential({ R0: 2, cycles: 5, i0: 1 });
  // Esperado: 1, 2, 4, 8, 16, 32
  assert.deepEqual(out.inc, [1, 2, 4, 8, 16, 32]);
  // Acumulado: 1, 3, 7, 15, 31, 63
  assert.deepEqual(out.acum, [1, 3, 7, 15, 31, 63]);
});

test('exponential: R₀ = 1 mantém incidência constante', () => {
  const out = EDL.models.exponential({ R0: 1, cycles: 10, i0: 5 });
  out.inc.forEach(v => assert.equal(v, 5));
});

test('exponential: R₀ = 0.5 decai exponencialmente', () => {
  const out = EDL.models.exponential({ R0: 0.5, cycles: 3, i0: 100 });
  assert.deepEqual(out.inc, [100, 50, 25, 12.5]);
});

test('exponential: soma acumulada = Σ incidência', () => {
  const out = EDL.models.exponential({ R0: 1.8, cycles: 20, i0: 3 });
  let runningSum = 0;
  for (let k = 0; k <= 20; k++) {
    runningSum += out.inc[k];
    assert.ok(Math.abs(runningSum - out.acum[k]) < 1e-9,
      `acumulado divergente em k=${k}: runningSum=${runningSum}, acum=${out.acum[k]}`);
  }
});

/* ==================================================================
 * models.js — SIR
 * ================================================================ */

test('SIR: conservação da população em todos os ciclos', () => {
  const out = EDL.models.sir({
    R0: 3, infectious_period: 7, cycles: 100, N: 10000, I0: 10
  });
  for (let k = 0; k < out.cycleCount; k++) {
    const total = out.S[k] + out.I[k] + out.R[k];
    assert.ok(Math.abs(total - 10000) < 1,
      `população não conservada em k=${k}: total=${total.toFixed(4)}`);
  }
});

test('SIR: overshoot — R₀ = 3 converge para ~94% infectados', () => {
  const out = EDL.models.sir({
    R0: 3, infectious_period: 7, cycles: 200, N: 10000, I0: 10
  });
  const finalR = out.R[out.R.length - 1];
  const frac = finalR / 10000;
  assert.ok(frac > 0.92 && frac < 0.96,
    `esperado ~94%, obtido ${(frac * 100).toFixed(1)}%`);
});

test('SIR: R₀ < 1 resulta em surto mínimo (sem propagação)', () => {
  const out = EDL.models.sir({
    R0: 0.5, infectious_period: 7, cycles: 50, N: 10000, I0: 10
  });
  const finalR = out.R[out.R.length - 1];
  assert.ok(finalR < 50, `esperado < 50 infectados ao fim, obtido ${finalR.toFixed(0)}`);
});

test('SIR: S monotonicamente não-crescente, R monotonicamente não-decrescente', () => {
  const out = EDL.models.sir({
    R0: 2.5, infectious_period: 7, cycles: 80, N: 10000, I0: 5
  });
  for (let k = 1; k < out.cycleCount; k++) {
    assert.ok(out.S[k] <= out.S[k - 1] + 1e-6, `S subiu em k=${k}`);
    assert.ok(out.R[k] >= out.R[k - 1] - 1e-6, `R desceu em k=${k}`);
  }
});

/* ==================================================================
 * models.js — SEIR
 * ================================================================ */

test('SEIR: conservação S + E + I + R = N', () => {
  const out = EDL.models.seir({
    R0: 3, infectious_period: 7, incubation_period: 5,
    cycles: 100, N: 10000, I0: 10
  });
  for (let k = 0; k < out.cycleCount; k++) {
    const total = out.S[k] + out.E[k] + out.I[k] + out.R[k];
    assert.ok(Math.abs(total - 10000) < 1,
      `população não conservada em k=${k}: total=${total.toFixed(4)}`);
  }
});

test('SEIR: pico ocorre mais tarde que SIR para mesmo R₀', () => {
  const sir = EDL.models.sir({
    R0: 3, infectious_period: 7, cycles: 100, N: 10000, I0: 10
  });
  const seir = EDL.models.seir({
    R0: 3, infectious_period: 7, incubation_period: 5,
    cycles: 100, N: 10000, I0: 10
  });
  let sirPeakK = 0, seirPeakK = 0;
  for (let k = 1; k < sir.cycleCount; k++) {
    if (sir.I[k]  > sir.I[sirPeakK])  sirPeakK  = k;
    if (seir.I[k] > seir.I[seirPeakK]) seirPeakK = k;
  }
  assert.ok(seirPeakK > sirPeakK,
    `SEIR peak (k=${seirPeakK}) deveria vir após SIR peak (k=${sirPeakK})`);
});

/* ==================================================================
 * models.js — SIR com intervenção
 * ================================================================ */

test('sirWithIntervention: intervenção pesada reduz drasticamente total infectados', () => {
  const baseline = EDL.models.sir({
    R0: 3, infectious_period: 7, cycles: 100, N: 10000, I0: 10
  });
  const intervened = EDL.models.sirWithIntervention({
    R0: 3, R0_after: 0.8, intervention_cycle: 10,
    infectious_period: 7, cycles: 100, N: 10000, I0: 10
  });
  const baseTotal = baseline.R[baseline.R.length - 1];
  const intTotal  = intervened.R[intervened.R.length - 1];
  assert.ok(intTotal < baseTotal * 0.2,
    `intervenção deveria cortar total a menos de 20% do baseline; ` +
    `baseline=${baseTotal.toFixed(0)}, intervened=${intTotal.toFixed(0)}`);
});

test('sirWithIntervention: intervenção tardia tem retorno muito menor', () => {
  const early = EDL.models.sirWithIntervention({
    R0: 3, R0_after: 0.8, intervention_cycle: 10,
    infectious_period: 7, cycles: 100, N: 10000, I0: 10
  });
  const late = EDL.models.sirWithIntervention({
    R0: 3, R0_after: 0.8, intervention_cycle: 50,
    infectious_period: 7, cycles: 100, N: 10000, I0: 10
  });
  const earlyTotal = early.R[early.R.length - 1];
  const lateTotal  = late.R[late.R.length - 1];
  assert.ok(lateTotal > earlyTotal * 2,
    `intervenção tardia deveria deixar pelo menos 2x mais infectados; ` +
    `early=${earlyTotal.toFixed(0)}, late=${lateTotal.toFixed(0)}`);
});

/* ==================================================================
 * models.js — helpers
 * ================================================================ */

test('herdImmunityThreshold: fórmula 1 − 1/R₀', () => {
  const h = EDL.models.herdImmunityThreshold;
  assert.equal(h(2), 0.5);
  assert.equal(h(4), 0.75);
  assert.equal(h(1), 0);        // na fronteira, limiar é 0
  assert.equal(h(0.5), 0);      // abaixo de 1, limiar é 0
  assert.ok(Math.abs(h(15) - (1 - 1/15)) < 1e-10);  // sarampo
});

test('doublingTime: fórmula log(2) / log(R₀)', () => {
  const d = EDL.models.doublingTime;
  assert.ok(Math.abs(d(2) - 1) < 1e-10);
  assert.ok(Math.abs(d(4) - 0.5) < 1e-10);
  assert.equal(d(1), Infinity);
  assert.equal(d(0.5), Infinity);
  // R₀ = 1.1 deveria dobrar em ~7.27 ciclos
  assert.ok(Math.abs(d(1.1) - Math.log(2) / Math.log(1.1)) < 1e-10);
});

/* ==================================================================
 * Pontuação (quiz-engine.js) e histórico detalhado (progress.js)
 *
 * Estes dois arquivos precisam de `localStorage`, que não existe no
 * Node. O stub abaixo é suficiente porque ambos usam apenas
 * getItem/setItem/removeItem e já toleram falha (try/catch).
 * ================================================================ */

global.localStorage = (function () {
  let store = {};
  return {
    getItem:    k => (k in store ? store[k] : null),
    setItem:    (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    _clear:     () => { store = {}; }
  };
})();
global.window.localStorage = global.localStorage;

load('js/core/config.js');
load('js/core/state.js');
load('js/core/quiz-engine.js');
load('js/core/progress.js');

test('scoringConfig espelha config.js', () => {
  const s = EDL.quiz.scoringConfig();
  assert.equal(s.seconds,     EDL.config.quizSecondsPerQ);
  assert.equal(s.base,        EDL.config.quizBasePoints);
  assert.equal(s.bonusPerSec, EDL.config.quizBonusPerSec);
  assert.equal(s.late,        EDL.config.quizLateAnswerPoints);
});

test('maxPointsPerQuestion: base + segundos × bônus (regressão do 200 fixo)', () => {
  const c = EDL.config;
  const esperado = c.quizBasePoints + c.quizSecondsPerQ * c.quizBonusPerSec;
  assert.equal(EDL.quiz.maxPointsPerQuestion(), esperado);
  // Com a config vigente (30s, 100, 5) são 250 — o valor antigo era 200.
  assert.equal(EDL.quiz.maxPointsPerQuestion(), 250);
});

test('getMaxPossibleScore usa o teto derivado, não um número fixo', () => {
  EDL.modules = [
    { id: 'a', status: 'available',  quizCount: 4 },
    { id: 'b', status: 'available',  quizCount: 6 },
    { id: 'c', status: 'coming-soon', quizCount: 9 }   // não conta
  ];
  assert.equal(EDL.getMaxPossibleScore(), 10 * EDL.quiz.maxPointsPerQuestion());
});

test('registerModule deriva quizCount de getQuiz() quando ausente', () => {
  EDL.modules = [];
  EDL.registerModule({ id: 'x', getQuiz: () => [1, 2, 3] });
  assert.equal(EDL.getModule('x').quizCount, 3);
});

test('getModuleQuiz devolve [] para módulo sem getQuiz, sem lançar', () => {
  EDL.modules = [];
  EDL.registerModule({ id: 'sem-banco', quizCount: 0 });
  assert.deepEqual(EDL.getModuleQuiz('sem-banco'), []);
  assert.deepEqual(EDL.getModuleQuiz('inexistente'), []);
});

test('quizEvents: emite, entrega e permite cancelar a assinatura', () => {
  const vistos = [];
  const off = EDL.quizEvents.on('answer', ev => vistos.push(ev.index));
  EDL.quizEvents.emit('answer', { index: 0 });
  EDL.quizEvents.emit('answer', { index: 1 });
  off();
  EDL.quizEvents.emit('answer', { index: 2 });
  assert.deepEqual(vistos, [0, 1]);
});

test('quizEvents: assinante que lança não impede os demais', () => {
  const vistos = [];
  const offA = EDL.quizEvents.on('answer', () => { throw new Error('boom'); });
  const offB = EDL.quizEvents.on('answer', ev => vistos.push(ev.index));
  const errOriginal = console.error;
  console.error = () => {};                 // silencia o log esperado
  try { EDL.quizEvents.emit('answer', { index: 7 }); }
  finally { console.error = errOriginal; offA(); offB(); }
  assert.deepEqual(vistos, [7]);
});

test('progress: acumula acertos, erros e distrator por pergunta', () => {
  EDL.progress.reset();
  const ev = (index, correct, pickedIndex) => EDL.quizEvents.emit('answer', {
    moduleId: '05-r0', index, correct, pickedIndex,
    elapsedMs: 1000, total: 5
  });
  ev(0, true,  0);
  ev(0, false, 2);
  ev(0, false, 2);          // distrator 2 pegou duas vezes
  const mod = EDL.progress.getModule('05-r0');
  assert.equal(mod.items['0'].seen, 3);
  assert.equal(mod.items['0'].hits, 1);
  assert.equal(mod.items['0'].picks['2'], 2);
});

test('progress: hardestItems ordena por taxa de erro e exige exposição mínima', () => {
  EDL.progress.reset();
  const ev = (index, correct) => EDL.quizEvents.emit('answer', {
    moduleId: 'm', index, correct, pickedIndex: 1, elapsedMs: 500, total: 3
  });
  ev(0, false); ev(0, false);      // 100% de erro, visto 2x
  ev(1, true);  ev(1, false);      //  50% de erro, visto 2x
  ev(2, false);                    // visto só 1x → fica de fora do ranking
  const dificeis = EDL.progress.hardestItems('m');
  assert.deepEqual(dificeis.map(d => d.index), [0, 1]);
  assert.equal(dificeis[0].errorRate, 1);
});

test('progress: trend compara a última tentativa com a anterior', () => {
  EDL.progress.reset();
  const fim = score => EDL.quizEvents.emit('complete', {
    moduleId: 'm', score, correct: 3, total: 5
  });
  fim(400); fim(650);
  const s = EDL.progress.moduleSummary('m');
  assert.equal(s.attemptCount, 2);
  assert.equal(s.trend, 250);
  assert.equal(s.bestScore, 650);
});

test('progress: evento sem moduleId é ignorado (não polui o histórico)', () => {
  EDL.progress.reset();
  EDL.quizEvents.emit('answer', { moduleId: null, index: 0, correct: true });
  assert.deepEqual(EDL.progress._data().modules, {});
});

test('progress: EDL.resetScores também limpa o histórico detalhado', () => {
  EDL.quizEvents.emit('answer', {
    moduleId: 'm', index: 0, correct: false, pickedIndex: 1, elapsedMs: 10
  });
  assert.ok(EDL.progress.getModule('m'));
  EDL.resetScores();
  assert.equal(EDL.progress.getModule('m'), null);
  assert.deepEqual(EDL.state.scores, {});
});

/* ==================================================================
 * Modo competição — paridade da pontuação entre local e servidor
 *
 * O modo local (BroadcastChannel) reimplementa a fórmula de pontos que
 * o trigger `aulas.answers_before_insert()` aplica no Postgres. Se as
 * duas divergirem, ensaiar a aula dá um número e a aula real dá outro
 * — e a diferença só apareceria na frente da turma.
 *
 * Estes casos são os MESMOS que rodei contra o banco ao validar o
 * schema, com os mesmos resultados esperados.
 * ================================================================ */

global.BroadcastChannel = function () {
  return { postMessage() {}, close() {}, set onmessage(_) {} };
};
global.document = { addEventListener() {} };
global.window.crypto = { randomUUID: () => 'uuid-de-teste' };

load('js/compete/config.js');
load('js/compete/local.js');

const salaDeTeste = { scoring: { seconds: 30, base: 100, bonus_per_sec: 5, late: 50 } };
const pontos = (correto, secsLeft) =>
  EDL.compete.local.calcularPontos(salaDeTeste, correto, secsLeft);

test('pontos: acerto com 25s restantes = 225 (igual ao trigger)', () => {
  assert.equal(pontos(true, 25), 225);
});

test('pontos: acerto instantâneo = 250 (teto, igual ao trigger)', () => {
  assert.equal(pontos(true, 30), 250);
});

test('pontos: erro = 0, independente do tempo', () => {
  assert.equal(pontos(false, 30), 0);
  assert.equal(pontos(false, 0), 0);
});

test('pontos: acerto fora do tempo = 50 (meio-crédito)', () => {
  assert.equal(pontos(true, 0), 50);
});

test('pontos: secs_left absurdo é limitado ao teto da sala', () => {
  // O trigger faz least(secs_left, scoring.seconds). O local precisa
  // fazer o mesmo, senão o cliente infla o bônus de velocidade.
  assert.equal(pontos(true, 9999), 250);
  assert.equal(pontos(true, -5), 50);   // negativo cai no meio-crédito
});

test('pontos: paridade com a fórmula do quiz-engine', () => {
  // O que o aluno vê no feedback tem de bater com o que entra no placar.
  const cfg = EDL.quiz.scoringConfig();
  for (let s = 0; s <= cfg.seconds; s++) {
    const doMotor = s <= 0 ? cfg.late : cfg.base + s * cfg.bonusPerSec;
    assert.equal(pontos(true, s), doMotor, `divergiu com ${s}s restantes`);
  }
});

test('local: placar ordena por pontos e compartilha colocação no empate', () => {
  const L = EDL.compete.local;
  const sala = L.criarSala({ activityRef: 'x', itemCount: 2, scoring: salaDeTeste.scoring }).dados;
  const a = L.entrar(sala.code, 'Alfa').dados;
  const b = L.entrar(sala.code, 'Beta').dados;

  // Alfa e Beta acertam a questão 0 com o mesmo tempo → empatam
  L.registrarResposta({ roomId: sala.roomId, teamId: a.team_id, questionIdx: 0,
    chosenIdx: 1, isCorrect: true, secsLeft: 10, elapsedMs: 100 });
  L.registrarResposta({ roomId: sala.roomId, teamId: b.team_id, questionIdx: 0,
    chosenIdx: 1, isCorrect: true, secsLeft: 10, elapsedMs: 100 });

  const p = L.placar(sala.roomId);
  assert.equal(p.length, 2);
  assert.equal(p[0].score, p[1].score);
  assert.equal(p[0].position, 1);
  assert.equal(p[1].position, 1, 'empate deve compartilhar a colocação');
});

test('local: questão repetida é recusada como permanente (não trava a fila)', () => {
  const L = EDL.compete.local;
  const sala = L.criarSala({ activityRef: 'y', itemCount: 3, scoring: salaDeTeste.scoring }).dados;
  const t = L.entrar(sala.code, 'Gama').dados;
  const arg = { roomId: sala.roomId, teamId: t.team_id, questionIdx: 0,
                chosenIdx: 0, isCorrect: true, secsLeft: 5, elapsedMs: 10 };

  assert.equal(L.registrarResposta(arg).ok, true);
  const r2 = L.registrarResposta(arg);
  assert.equal(r2.ok, false);
  assert.equal(r2.permanente, true, 'duplicata precisa ser permanente, senão a fila repete para sempre');
});

test('local: questão fora da atividade é recusada', () => {
  const L = EDL.compete.local;
  const sala = L.criarSala({ activityRef: 'z', itemCount: 2, scoring: salaDeTeste.scoring }).dados;
  const t = L.entrar(sala.code, 'Delta').dados;
  const r = L.registrarResposta({ roomId: sala.roomId, teamId: t.team_id, questionIdx: 99,
    chosenIdx: 0, isCorrect: true, secsLeft: 5, elapsedMs: 10 });
  assert.equal(r.ok, false);
  assert.equal(r.permanente, true);
});

test('local: apelido é normalizado e o duplicado é recusado', () => {
  const L = EDL.compete.local;
  const sala = L.criarSala({ activityRef: 'w', itemCount: 1, scoring: salaDeTeste.scoring }).dados;
  const a = L.entrar(sala.code, '  Os   Kochs  ');
  assert.equal(a.ok, true);
  assert.equal(a.dados.nickname, 'Os Kochs', 'espaços internos e das pontas devem colapsar');

  const curto = L.entrar(sala.code, 'x');
  assert.equal(curto.ok, false, 'apelido de 1 caractere deve ser recusado');
});

test('local: código de sala não usa caracteres ambíguos', () => {
  const L = EDL.compete.local;
  const sala = L.criarSala({ activityRef: 'v', itemCount: 1, scoring: salaDeTeste.scoring }).dados;
  assert.match(sala.code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/,
    'o código não pode conter 0, O, 1 nem I');
});

/* ==================================================================
 * Retorno do magic link (compete/rest.js)
 *
 * O GoTrue devolve o professor com tokens OU com erro no MESMO lugar de
 * onde este site lê a rota. Enquanto o erro não era reconhecido, o
 * roteador não achava rota nenhuma, caía na home em silêncio, e o card
 * mais visível de lá leva à TELA DO ALUNO — o relato que abriu a
 * pendência do §7 do handoff.
 *
 * rest.js inteiro depende do navegador; o que dá para testar em Node é
 * justamente o pedaço que errou: a leitura do endereço. Os stubs abaixo
 * cobrem só o que o arquivo toca ao carregar.
 * ================================================================ */

global.location = { hash: '', search: '', pathname: '/', reload() {} };
global.history  = { replaceState() {} };
global.sessionStorage = (function () {
  let store = {};
  return {
    getItem:    k => (k in store ? store[k] : null),
    setItem:    (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; }
  };
})();
global.window.addEventListener = function () {};

load('js/compete/rest.js');

const lerLink = (frag, query) => EDL.compete.rest._lerRetornoDoLink(frag, query);

test('link: fragmento com tokens vira sessão', () => {
  const r = lerLink('#access_token=abc&refresh_token=def&type=magiclink', '');
  assert.equal(r.tipo, 'sessao');
  assert.equal(r.access, 'abc');
  assert.equal(r.refresh, 'def');
});

test('link: otp_expired vira erro que manda pedir outro link', () => {
  const r = lerLink(
    '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid', '');
  assert.equal(r.tipo, 'erro');
  assert.match(r.erro, /uma vez só/);
  assert.match(r.erro, /senha/);   // precisa oferecer a saída que não depende de e-mail
});

test('link: erro sem error_code também é reconhecido', () => {
  // Nem toda versão do GoTrue manda error_code; o `error` sozinho basta.
  const r = lerLink('#error=access_denied&error_description=Something+went+wrong', '');
  assert.equal(r.tipo, 'erro');
});

test('link: erro na query, e não no fragmento, também é lido', () => {
  const r = lerLink('#/sala', '?error_code=otp_expired');
  assert.equal(r.tipo, 'erro');
});

test('link: error_description desconhecida chega ao professor', () => {
  const r = lerLink('#error_code=alguma_coisa&error_description=Servidor+fora+do+ar', '');
  assert.match(r.erro, /Servidor fora do ar/);   // o '+' precisa virar espaço
});

test('link: rota normal do site NÃO é confundida com retorno de link', () => {
  // Este é o teste que protege a navegação: se qualquer hash virasse
  // "retorno de link", toda troca de tela recarregaria a página.
  ['#/sala', '#/jogar', '#/jogar/ABC234', '#/home', '#/module/05-r0', '', '#'].forEach(h => {
    assert.equal(lerLink(h, ''), null, `${h} não é retorno de link`);
  });
});

test('link: erro é entregue uma vez só', () => {
  // A tela consome o aviso ao mostrá-lo. Se ele sobrevivesse, reapareceria
  // numa entrada futura no console, sem link nenhum por perto.
  global.sessionStorage.setItem('edl.compete.link.erro.v1', 'link velho');
  assert.equal(EDL.compete.rest.erroDoLink(), 'link velho');
  assert.equal(EDL.compete.rest.erroDoLink(), null);
});

test('link: claims do JWT são lidas sem validar assinatura', () => {
  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const jwt = b64({ alg: 'HS256' }) + '.' + b64({ sub: 'u1', email: 'p@x.y', exp: 42 }) + '.sig';
  assert.equal(EDL.compete.rest._lerClaims(jwt).email, 'p@x.y');
  assert.equal(EDL.compete.rest._lerClaims('não é um jwt'), null);
});

/* ==================================================================
 * Recuperar a sala aberta do servidor (compete/api.js)
 *
 * A sala aberta era lembrada só no localStorage — que é por origem e por
 * navegador. Abrir o console de outro lugar oferecia CRIAR OUTRA sala com
 * a turma na primeira, e não havia caminho para encerrar a que estava no
 * ar. Agora o console pergunta ao servidor.
 *
 * O que dá para testar em Node é o que mais quebraria calado: a tradução
 * da linha do PostgREST para o objeto que o console consome. Um campo
 * errado aqui não dá erro — pinta um console mudo, com sorteio de
 * questões diferente do que a turma está vendo.
 * ================================================================ */

load('js/compete/estado.js');
load('js/compete/banco-jogo.js');
load('js/compete/api.js');

/* `expires_at` RELATIVO ao agora, e não uma data escrita à mão: uma sala
 * dura 6h, então qualquer data fixa vira passado e o teste passa a falhar
 * sozinho. Já aconteceu ao escrever este arquivo. */
const linhaDoServidor = {
  id: '813d2ea6-3da8-44d1-8438-b10a372240df',
  code: '74J4DH',
  status: 'open',
  scoring: { seconds: 30, base: 100, bonus_per_sec: 5, late: 50 },
  label: 'Turma B',
  created_at: new Date(Date.now() - 20 * 60000).toISOString(),
  expires_at: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
  activities: { external_id: 'game-v1', item_count: 10 }
};

test('sala do servidor: campos batem com os que o console consome', () => {
  const s = EDL.compete.api._salaDoServidor(linhaDoServidor);
  // renderConsole() usa roomId, code e itemCount; sortear() usa code+itemCount.
  assert.equal(s.roomId, '813d2ea6-3da8-44d1-8438-b10a372240df');
  assert.equal(s.code, '74J4DH');
  assert.equal(s.itemCount, 10, 'item_count vem da atividade embutida, não da sala');
  assert.equal(s.activityRef, 'game-v1');
  assert.equal(s.status, 'open');
  assert.deepEqual(s.scoring, linhaDoServidor.scoring);
  assert.equal(s.label, 'Turma B');
});

test('sala do servidor: retomada sorteia as MESMAS questões da turma', () => {
  // O sorteio é derivado do código. Se a retomada mudasse itemCount ou
  // code, o telão do professor mostraria questões que ninguém respondeu.
  const s = EDL.compete.api._salaDoServidor(linhaDoServidor);
  const daRetomada = EDL.compete.bancoJogo.sortear(s.code, s.itemCount);
  const daSalaOriginal = EDL.compete.bancoJogo.sortear('74J4DH', 10);
  assert.deepEqual(daRetomada.map(q => q.q), daSalaOriginal.map(q => q.q));
});

test('sala do servidor: linha sem atividade embutida não quebra', () => {
  const s = EDL.compete.api._salaDoServidor({ id: 'x', code: 'ABC234', status: 'open' });
  assert.equal(s.code, 'ABC234');
  assert.equal(s.itemCount, undefined);
  assert.equal(s.activityRef, undefined);
});

test('sala do servidor: entrada nula devolve nulo', () => {
  assert.equal(EDL.compete.api._salaDoServidor(null), null);
});

/* Os casos abaixo trocam só a camada de rede: o resto do caminho é o
 * mesmo que roda no navegador. */
function comRespostaDoServidor(resposta, fn) {
  const rest = EDL.compete.rest;
  const selOriginal = rest.selecionarDetalhado;
  const uidOriginal = rest.professor.uid;
  rest.selecionarDetalhado = async () => resposta;
  rest.professor.uid = () => 'uid-de-teste';
  return Promise.resolve(fn()).finally(() => {
    rest.selecionarDetalhado = selOriginal;
    rest.professor.uid = uidOriginal;
  });
}

const linhaExpirada = Object.assign({}, linhaDoServidor, {
  id: 'velha', code: 'AAA234',
  expires_at: new Date(Date.now() - 60000).toISOString()
});

testAsync('salas abertas: a expirada é descartada', async () => {
  await comRespostaDoServidor({ ok: true, dados: [linhaDoServidor, linhaExpirada] }, async () => {
    const r = await EDL.compete.api.salasAbertas();
    assert.equal(r.ok, true);
    assert.equal(r.salas.length, 1, 'sala vencida não pode ser oferecida para retomar');
    assert.equal(r.salas[0].code, '74J4DH');
  });
});

testAsync('salas abertas: falha de leitura NÃO vira "não há sala"', async () => {
  // A distinção é o ponto: [] liberaria abrir uma segunda sala com a turma
  // inteira na primeira.
  await comRespostaDoServidor({ ok: false, erro: 'sem conexão' }, async () => {
    const r = await EDL.compete.api.salasAbertas();
    assert.equal(r.ok, false);
    assert.equal(r.erro, 'sem conexão');
  });
});

testAsync('salas abertas: sem nenhuma aberta devolve lista vazia', async () => {
  await comRespostaDoServidor({ ok: true, dados: [] }, async () => {
    const r = await EDL.compete.api.salasAbertas();
    assert.equal(r.ok, true);
    assert.equal(r.salas.length, 0);
  });
});

/* ------------------------------------------------------------------
 * Relatório final
 * ---------------------------------------------------------------- */
Promise.all(assincronos).then(() => {
  console.log('');
  console.log(`1..${count}`);
  console.log(`# passing: ${passed}/${count}`);
  if (failed > 0) {
    console.log(`# failing: ${failed}`);
    process.exit(1);
  }
});
