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

/* ------------------------------------------------------------------
 * Relatório final
 * ---------------------------------------------------------------- */
console.log('');
console.log(`1..${count}`);
console.log(`# passing: ${passed}/${count}`);
if (failed > 0) {
  console.log(`# failing: ${failed}`);
  process.exit(1);
}
