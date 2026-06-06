/* =========================================================================
 * EDL — models.js
 * Modelos epidemiológicos: crescimento exponencial, SIR, SEIR e SIR com
 * intervenção. Funções puras, sem D3 e sem DOM.
 *
 * Todas as funções recebem um objeto de parâmetros e retornam um objeto com
 * arrays paralelos (séries temporais). A indexação de ciclos começa em 0.
 *
 * Exporta: window.EDL.models
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});

  /* ---------------------------------------------------------------------
   * 1. Crescimento exponencial puro (o modelo do R_Naught v1)
   *
   *    I(k) = I(k-1) * R0     — incidência por ciclo
   *    Acum(k) = Σ I(0..k)    — acumulado
   *
   *    Este modelo assume população infinita suscetível. Adequado só para
   *    ilustrar os primeiros ciclos de um surto; superestima grosseiramente
   *    em qualquer tempo mais longo.
   * ------------------------------------------------------------------- */
  function exponential({ R0, cycles, i0 }) {
    const n = Math.max(0, Math.floor(cycles)) + 1;
    const inc  = new Array(n).fill(0);
    const acum = new Array(n).fill(0);

    inc[0]  = i0;
    acum[0] = i0;
    for (let k = 1; k < n; k++) {
      inc[k]  = inc[k - 1] * R0;
      acum[k] = acum[k - 1] + inc[k];
    }
    return { cycleCount: n, inc, acum };
  }

  /* ---------------------------------------------------------------------
   * 2. SIR clássico — sem demografia (nascimentos/mortes ignorados)
   *
   *      dS/dt = -β S I / N
   *      dI/dt =  β S I / N - γ I
   *      dR/dt =  γ I
   *
   *    onde  β = R0 * γ   e   γ = 1 / período_infeccioso
   *
   *    Parâmetros:
   *      R0             — número básico de reprodução
   *      infectious_period — período infeccioso em ciclos (1/γ)
   *      cycles         — número de ciclos a simular
   *      N              — população total
   *      I0             — infectados iniciais
   *      R_init         — recuperados iniciais (imunidade pré-existente)
   *      dt             — passo de integração em frações de ciclo (default 0.1)
   *
   *    Integração via Runge-Kutta de 4ª ordem (RK4) para estabilidade
   *    mesmo quando γ·dt não é pequeno.
   *
   *    Retorno: séries em passo de 1 ciclo (não de dt), prontas para plotar.
   * ------------------------------------------------------------------- */
  function sir({ R0, infectious_period, cycles, N, I0, R_init = 0, dt = 0.1 }) {
    if (!N || N <= 0) throw new Error('[EDL/models] sir: N deve ser > 0');
    const gamma = 1 / infectious_period;
    const beta  = R0 * gamma;

    const steps_per_cycle = Math.max(1, Math.round(1 / dt));
    const dt_eff = 1 / steps_per_cycle;

    const n = Math.max(0, Math.floor(cycles)) + 1;
    const S = new Array(n);
    const I = new Array(n);
    const R = new Array(n);
    const newCases = new Array(n).fill(0);

    let s = N - I0 - R_init;
    let i = I0;
    let r = R_init;
    S[0] = s; I[0] = i; R[0] = r;

    // Derivadas instantâneas
    const deriv = (s, i) => {
      const inf = beta * s * i / N;
      const rec = gamma * i;
      return { dS: -inf, dI: inf - rec, dR: rec, newInc: inf };
    };

    for (let k = 1; k < n; k++) {
      let incInCycle = 0;
      for (let t = 0; t < steps_per_cycle; t++) {
        // RK4
        const k1 = deriv(s, i);
        const k2 = deriv(s + 0.5 * dt_eff * k1.dS, i + 0.5 * dt_eff * k1.dI);
        const k3 = deriv(s + 0.5 * dt_eff * k2.dS, i + 0.5 * dt_eff * k2.dI);
        const k4 = deriv(s +       dt_eff * k3.dS, i +       dt_eff * k3.dI);

        s += (dt_eff / 6) * (k1.dS + 2 * k2.dS + 2 * k3.dS + k4.dS);
        i += (dt_eff / 6) * (k1.dI + 2 * k2.dI + 2 * k3.dI + k4.dI);
        r += (dt_eff / 6) * (k1.dR + 2 * k2.dR + 2 * k3.dR + k4.dR);

        // Guardas numéricas contra negativos por erro de truncamento
        if (s < 0) s = 0;
        if (i < 0) i = 0;
        if (r < 0) r = 0;

        incInCycle += (dt_eff / 6) * (k1.newInc + 2 * k2.newInc + 2 * k3.newInc + k4.newInc);
      }
      S[k] = s; I[k] = i; R[k] = r;
      newCases[k] = incInCycle;
    }

    return { cycleCount: n, S, I, R, newCases };
  }

  /* ---------------------------------------------------------------------
   * 3. SEIR — adiciona compartimento Exposto (em incubação, ainda não
   *    transmite)
   *
   *      dS/dt = -β S I / N
   *      dE/dt =  β S I / N - σ E
   *      dI/dt =  σ E - γ I
   *      dR/dt =  γ I
   *
   *      σ = 1 / período_incubação
   *
   *    Parâmetros: iguais ao SIR + incubation_period, E0.
   * ------------------------------------------------------------------- */
  function seir({ R0, infectious_period, incubation_period, cycles, N, I0, E0 = 0, R_init = 0, dt = 0.1 }) {
    if (!N || N <= 0) throw new Error('[EDL/models] seir: N deve ser > 0');
    const gamma = 1 / infectious_period;
    const sigma = 1 / incubation_period;
    const beta  = R0 * gamma;

    const steps_per_cycle = Math.max(1, Math.round(1 / dt));
    const dt_eff = 1 / steps_per_cycle;

    const n = Math.max(0, Math.floor(cycles)) + 1;
    const S = new Array(n);
    const E = new Array(n);
    const I = new Array(n);
    const R = new Array(n);
    const newCases = new Array(n).fill(0);

    let s = N - I0 - E0 - R_init;
    let e = E0;
    let i = I0;
    let r = R_init;
    S[0] = s; E[0] = e; I[0] = i; R[0] = r;

    const deriv = (s, e, i) => {
      const inf = beta * s * i / N;
      const toI = sigma * e;
      const rec = gamma * i;
      return {
        dS: -inf,
        dE: inf - toI,
        dI: toI - rec,
        dR: rec,
        newInc: toI  // notificação ocorre na transição E→I
      };
    };

    for (let k = 1; k < n; k++) {
      let incInCycle = 0;
      for (let t = 0; t < steps_per_cycle; t++) {
        const k1 = deriv(s, e, i);
        const k2 = deriv(s + 0.5 * dt_eff * k1.dS, e + 0.5 * dt_eff * k1.dE, i + 0.5 * dt_eff * k1.dI);
        const k3 = deriv(s + 0.5 * dt_eff * k2.dS, e + 0.5 * dt_eff * k2.dE, i + 0.5 * dt_eff * k2.dI);
        const k4 = deriv(s +       dt_eff * k3.dS, e +       dt_eff * k3.dE, i +       dt_eff * k3.dI);

        s += (dt_eff / 6) * (k1.dS + 2 * k2.dS + 2 * k3.dS + k4.dS);
        e += (dt_eff / 6) * (k1.dE + 2 * k2.dE + 2 * k3.dE + k4.dE);
        i += (dt_eff / 6) * (k1.dI + 2 * k2.dI + 2 * k3.dI + k4.dI);
        r += (dt_eff / 6) * (k1.dR + 2 * k2.dR + 2 * k3.dR + k4.dR);

        if (s < 0) s = 0;
        if (e < 0) e = 0;
        if (i < 0) i = 0;
        if (r < 0) r = 0;

        incInCycle += (dt_eff / 6) * (k1.newInc + 2 * k2.newInc + 2 * k3.newInc + k4.newInc);
      }
      S[k] = s; E[k] = e; I[k] = i; R[k] = r;
      newCases[k] = incInCycle;
    }

    return { cycleCount: n, S, E, I, R, newCases };
  }

  /* ---------------------------------------------------------------------
   * 4. SIR com intervenção pontual
   *
   *    Identical ao SIR, mas no ciclo `intervention_cycle` o R0 efetivo passa
   *    de R0 para R0_after (simulando lockdown, vacinação massiva,
   *    intervenção de saúde pública, etc.).
   * ------------------------------------------------------------------- */
  function sirWithIntervention({ R0, R0_after, intervention_cycle, infectious_period, cycles, N, I0, R_init = 0, dt = 0.1 }) {
    if (!N || N <= 0) throw new Error('[EDL/models] sirWithIntervention: N deve ser > 0');
    const gamma = 1 / infectious_period;
    const steps_per_cycle = Math.max(1, Math.round(1 / dt));
    const dt_eff = 1 / steps_per_cycle;

    const n = Math.max(0, Math.floor(cycles)) + 1;
    const S = new Array(n);
    const I = new Array(n);
    const R = new Array(n);
    const newCases = new Array(n).fill(0);

    let s = N - I0 - R_init;
    let i = I0;
    let r = R_init;
    S[0] = s; I[0] = i; R[0] = r;

    const derivBeta = (beta, s, i) => {
      const inf = beta * s * i / N;
      const rec = gamma * i;
      return { dS: -inf, dI: inf - rec, dR: rec, newInc: inf };
    };

    for (let k = 1; k < n; k++) {
      const currentR0 = (k >= intervention_cycle) ? R0_after : R0;
      const beta = currentR0 * gamma;

      let incInCycle = 0;
      for (let t = 0; t < steps_per_cycle; t++) {
        const k1 = derivBeta(beta, s, i);
        const k2 = derivBeta(beta, s + 0.5 * dt_eff * k1.dS, i + 0.5 * dt_eff * k1.dI);
        const k3 = derivBeta(beta, s + 0.5 * dt_eff * k2.dS, i + 0.5 * dt_eff * k2.dI);
        const k4 = derivBeta(beta, s +       dt_eff * k3.dS, i +       dt_eff * k3.dI);

        s += (dt_eff / 6) * (k1.dS + 2 * k2.dS + 2 * k3.dS + k4.dS);
        i += (dt_eff / 6) * (k1.dI + 2 * k2.dI + 2 * k3.dI + k4.dI);
        r += (dt_eff / 6) * (k1.dR + 2 * k2.dR + 2 * k3.dR + k4.dR);

        if (s < 0) s = 0;
        if (i < 0) i = 0;
        if (r < 0) r = 0;

        incInCycle += (dt_eff / 6) * (k1.newInc + 2 * k2.newInc + 2 * k3.newInc + k4.newInc);
      }
      S[k] = s; I[k] = i; R[k] = r;
      newCases[k] = incInCycle;
    }

    return { cycleCount: n, S, I, R, newCases };
  }

  /* ---------------------------------------------------------------------
   * Helpers analíticos derivados
   * ------------------------------------------------------------------- */

  /** Limiar de imunidade de rebanho: fração mínima imune para R_eff < 1. */
  function herdImmunityThreshold(R0) {
    if (R0 <= 1) return 0;
    return 1 - 1 / R0;
  }

  /** Tempo de duplicação (em ciclos) assumindo crescimento exponencial puro. */
  function doublingTime(R0) {
    if (R0 <= 1) return Infinity;
    return Math.log(2) / Math.log(R0);
  }

  EDL.models = {
    exponential,
    sir,
    seir,
    sirWithIntervention,
    herdImmunityThreshold,
    doublingTime
  };
})();
