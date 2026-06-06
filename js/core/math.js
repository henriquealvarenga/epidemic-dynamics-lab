/* =========================================================================
 * EDL — math.js
 * Utilitários matemáticos puros. Sem efeitos colaterais, sem DOM.
 * Exporta: window.EDL.math
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /**
   * LCG (Linear Congruential Generator) determinístico.
   * Mesma seed → mesma sequência, útil para gerar datasets reproduzíveis.
   *
   * IMPORTANTE: os parênteses externos em torno de (Math.imul(...) + 1013904223)
   * são obrigatórios — sem eles, o operador >>> 0 aplica-se somente à constante,
   * não à soma, produzindo sequências diferentes.
   */
  function seededRNG(seed) {
    let s = (seed | 0) >>> 0;
    return function () {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 0xFFFFFFFF;
    };
  }

  /** Variável normal padrão via Box-Muller (usa um rng uniforme [0,1)). */
  function randn(rng) {
    const u = Math.max(rng(), 1e-12);
    const v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /** Clamp [a, b]. */
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }

  /** Embaralha um array in-place usando Fisher–Yates determinístico via rng. */
  function shuffleInPlace(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Formata número no padrão brasileiro: milhar com '.', decimal com ','.
   * Ex.: 12345.678 → "12.345,68"
   */
  function fmtBR(x, digits = 2) {
    if (!Number.isFinite(x)) return '—';
    return x.toLocaleString('pt-BR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  /** Formata inteiro sem casas decimais, também no padrão BR. */
  function fmtInt(x) {
    if (!Number.isFinite(x)) return '—';
    return Math.round(x).toLocaleString('pt-BR');
  }

  /** Soma simples (robusta a arrays pequenos). */
  function sum(arr) {
    let s = 0;
    for (let i = 0; i < arr.length; i++) s += arr[i];
    return s;
  }

  /** Média aritmética. */
  function mean(arr) { return arr.length ? sum(arr) / arr.length : 0; }

  EDL.math = {
    seededRNG,
    randn,
    clamp,
    shuffleInPlace,
    fmtBR,
    fmtInt,
    sum,
    mean
  };
})();
