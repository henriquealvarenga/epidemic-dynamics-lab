/* =========================================================================
 * EDL — config.js
 *
 * Configurações globais ajustáveis do app.
 *
 * Este arquivo concentra valores que você pode querer mudar sem mexer em
 * lógica — tempo de cronômetro, regras de pontuação, etc. Edite aqui e
 * todos os componentes que dependem desses valores são atualizados
 * automaticamente na próxima carga.
 *
 * Só coloque AQUI parâmetros (números ou strings simples) que fazem
 * sentido ser ajustados entre deploys ou experimentos pedagógicos.
 * Lógica, estruturas de dados e constantes derivadas permanecem nos
 * arquivos de código que as usam.
 *
 * Resiliência: se este arquivo falhar em carregar ou for editado
 * incorretamente, os módulos que leem `EDL.config.*` usam valores padrão
 * hardcoded como fallback. O app continua funcional.
 * ========================================================================= */

window.EDL = window.EDL || {};

window.EDL.config = {
  /* ---------------------------------------------------------------------
   * Quiz — parâmetros de tempo e pontuação
   *
   * Regras vigentes:
   *   - Cada pergunta tem `quizSecondsPerQ` segundos de cronômetro.
   *   - Acerto dentro do tempo vale `quizBasePoints` + (segundos restantes × `quizBonusPerSec`).
   *   - Acerto DEPOIS do tempo expirar vale `quizLateAnswerPoints` fixos (meio-crédito).
   *   - Erro, em qualquer momento, vale 0 pts.
   *
   * Exemplo com os valores atuais (30s, 100, 5, 50):
   *   - Acerto instantâneo: 100 + 30×5 = 250 pts
   *   - Acerto no último segundo: 100 + 1×5 = 105 pts
   *   - Acerto após timeout: 50 pts
   *   - Erro: 0 pts
   * ------------------------------------------------------------------- */

  /** Segundos disponíveis para responder cada pergunta do quiz. */
  quizSecondsPerQ: 30,

  /** Pontos-base por acerto dentro do tempo. */
  quizBasePoints: 100,

  /** Bônus de velocidade: pontos por segundo restante no momento da resposta. */
  quizBonusPerSec: 5,

  /** Pontos fixos para resposta correta após o tempo expirar (meio-crédito). */
  quizLateAnswerPoints: 50
};
