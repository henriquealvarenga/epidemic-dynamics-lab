/* =========================================================================
 * EDL — compete/config.js
 *
 * Endereço e chave do backend do modo competição.
 *
 * ⚠️ SOBRE A CHAVE ESTAR NO REPOSITÓRIO PÚBLICO
 *
 * A chave `publishable` (sb_publishable_...) é PÚBLICA POR DESIGN, como a
 * antiga `anon key`. Ela vai no bundle de qualquer aplicação web e pode ser
 * lida no DevTools por qualquer visitante. Ela apenas identifica o projeto;
 * quem decide o que cada um pode ler e escrever é o Row Level Security do
 * schema `aulas`. Versioná-la aqui é seguro e é a prática recomendada.
 *
 * O que NUNCA pode entrar neste arquivo (nem em nenhum outro do repo) é a
 * chave SECRETA (sb_secret_... / service_role): ela ignora o RLS por
 * completo e dá acesso total ao banco.
 *
 * Se um dia isto aqui parecer um vazamento, leia o parágrafo acima antes de
 * rotacionar nada.
 *
 * Exporta: window.EDL.compete.config
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const compete = (EDL.compete = EDL.compete || {});

  compete.config = {
    /* Interruptor geral. Com `false`, o modo competição roda inteiramente
     * local (BroadcastChannel entre abas), sem tocar em rede — é assim que
     * se ensaia a aula no próprio notebook, e é o fallback se o Supabase
     * estiver pausado ou a rede da faculdade cair. */
    enabled: true,

    url: 'https://yfnilksnqehysxunujli.supabase.co',
    publishableKey: 'sb_publishable_7TvKSU1mXbodAHVwr_gS6g_gXsHKd7p',

    /* Schema dedicado. PRECISA estar em Settings → Data API → Exposed
     * schemas, senão o PostgREST devolve 404 em tudo. */
    schema: 'aulas',

    /* Identifica este site no catálogo multi-app do banco. */
    appSlug: 'epidemic-dynamics-lab',

    /* Chaves de localStorage. Versionadas para permitir migração futura
     * sem quebrar quem já tem dado salvo. */
    storageKeys: {
      identity: 'edl.compete.v1',      // sala + grupo do aparelho
      sala:     'edl.compete.sala.v1', // sala aberta pelo professor
      queue:    'edl.compete.queue.v1', // respostas aguardando envio
      authStudent: 'edl.compete.auth.aluno.v1',
      authTeacher: 'edl.compete.auth.prof.v1',
      forcarLocal: 'edl.compete.local.forcado.v1',

      /* Única chave de sessionStorage da lista: guarda o motivo de um
       * retorno de magic link que falhou, só até a tela de login mostrá-lo.
       * Precisa de storage (e não de uma variável) porque o caminho do
       * hashchange recarrega a página; e é de sessão porque um aviso de
       * link expirado não deve reaparecer amanhã. */
      erroLink: 'edl.compete.link.erro.v1'
    },

    /* Ritmo da rede. Números herdados do projeto irmão do Exame do Estado
     * Mental, que já rodou este tipo de jogo em sala:
     *   - retry fixo, sem backoff: uma aula dura ~50 min e backoff só
     *     atrasaria a recuperação;
     *   - poll do painel convive com o Realtime, nunca o substitui. */
    retryMs: 8000,
    pollMs:  3000
  };
})();
