/* =========================================================================
 * EDL — compete/rest.js
 *
 * Cliente do Supabase escrito à mão: `fetch` direto contra o PostgREST e o
 * GoTrue. Sem SDK, sem CDN, sem build — como o resto deste site.
 *
 * POR QUE NÃO USAR O supabase-js
 *   O build UMD do SDK tem ~211 KB. Trocá-lo por ~200 linhas de fetch
 *   elimina um domínio externo que a rede da faculdade pode bloquear
 *   justamente no dia da aula, e mantém a identidade do projeto (zero
 *   dependência). O projeto irmão do Exame do Estado Mental fez a mesma
 *   escolha e rodou aulas reais assim.
 *
 * NENHUMA FUNÇÃO AQUI LANÇA EXCEÇÃO
 *   Leitura falha → devolve []. Escrita falha → devolve { ok:false, erro }.
 *   Consequência: o painel projetado no telão nunca quebra na frente da
 *   turma — no pior caso mostra vazio ou "sem conexão".
 *
 * DUAS SESSÕES INDEPENDENTES
 *   O mesmo navegador pode ter uma sessão de aluno (anônima) e uma de
 *   professor. Se compartilhassem chave de armazenamento, logar como
 *   professor destruiria a sessão de aluno — bug real registrado no
 *   projeto irmão. Daí `storageKeys.authAluno` e `authProfessor`.
 *
 * Exporta: window.EDL.compete.rest
 * ========================================================================= */
(function () {
  'use strict';

  const EDL = (window.EDL = window.EDL || {});
  const compete = (EDL.compete = EDL.compete || {});
  const cfg = compete.config;

  const AUTH = () => cfg.url + '/auth/v1';
  const REST = () => cfg.url + '/rest/v1';

  /* Margem antes do vencimento: um token que expira em 20 s é tratado como
   * já expirado, para não sair uma requisição fadada ao 401. */
  const MARGEM_EXPIRACAO_S = 30;

  function configValida() {
    return !!(cfg && cfg.enabled && cfg.url && cfg.publishableKey &&
              cfg.url.indexOf('http') === 0);
  }

  /* -----------------------------------------------------------------------
   * Sessão persistida
   * --------------------------------------------------------------------- */

  /** Decodifica o payload de um JWT. Não valida assinatura — só lê claims
   *  para saber quando expira e quem é. A validação de verdade é do
   *  servidor; aqui é só para evitar requisição inútil. */
  function lerClaims(token) {
    try {
      let p = String(token).split('.')[1];
      p = p.replace(/-/g, '+').replace(/_/g, '/');
      while (p.length % 4) p += '=';
      return JSON.parse(decodeURIComponent(escape(atob(p))));
    } catch (err) {
      return null;
    }
  }

  function criarSessao(chaveStorage) {
    let atual = null;
    try {
      const bruto = localStorage.getItem(chaveStorage);
      if (bruto) atual = JSON.parse(bruto);
    } catch (err) { /* modo privativo, storage cheio: segue sem sessão */ }

    function gravar(s) {
      atual = s;
      try {
        if (s) localStorage.setItem(chaveStorage, JSON.stringify(s));
        else localStorage.removeItem(chaveStorage);
      } catch (err) { /* silencioso: a sessão vive na memória desta aba */ }
    }

    function daResposta(dados) {
      if (!dados || !dados.access_token) return null;
      const claims = lerClaims(dados.access_token) || {};
      return {
        accessToken:  dados.access_token,
        refreshToken: dados.refresh_token || null,
        expiraEm:     claims.exp || 0,
        uid:          claims.sub || null,
        email:        claims.email || null,
        anonimo:      claims.is_anonymous === true
      };
    }

    return {
      get:    () => atual,
      uid:    () => (atual && atual.uid) || null,
      email:  () => (atual && atual.email) || null,
      anonima:() => !!(atual && atual.anonimo),
      valida: () => !!(atual && atual.accessToken &&
                       atual.expiraEm > (Date.now() / 1000 + MARGEM_EXPIRACAO_S)),
      token:  () => (atual && atual.accessToken) || null,
      definirDaResposta(dados) { const s = daResposta(dados); gravar(s); return s; },
      limpar() { gravar(null); }
    };
  }

  const aluno     = criarSessao(cfg.storageKeys.authStudent);
  const professor = criarSessao(cfg.storageKeys.authTeacher);

  /* -----------------------------------------------------------------------
   * HTTP
   * --------------------------------------------------------------------- */

  async function pedir(url, opcoes) {
    const o = opcoes || {};
    const cabecalhos = Object.assign({
      'apikey': cfg.publishableKey,
      'Content-Type': 'application/json'
    }, o.headers || {});

    /* apikey é SEMPRE a chave publishable; o Bearer pode ser o token do
     * usuário (aluno anônimo ou professor). Sem token, o Bearer é a própria
     * chave — é o que o PostgREST espera para a role `anon`. */
    cabecalhos['Authorization'] = 'Bearer ' + (o.token || cfg.publishableKey);

    try {
      const resp = await fetch(url, {
        method:  o.method || 'GET',
        headers: cabecalhos,
        body:    o.body ? JSON.stringify(o.body) : undefined
      });

      let corpo = null;
      const texto = await resp.text();
      if (texto) { try { corpo = JSON.parse(texto); } catch (err) { corpo = texto; } }

      if (!resp.ok) {
        return { ok: false, status: resp.status, erro: mensagemDeErro(corpo, resp.status) };
      }
      return { ok: true, status: resp.status, dados: corpo };
    } catch (err) {
      // Rede caída, DNS, CORS, CDN bloqueado — tudo cai aqui.
      return { ok: false, status: 0, erro: 'sem conexão' };
    }
  }

  /** Traduz os erros que a turma pode encontrar para português de sala.
   *  Os códigos vêm dos `raise exception ... using errcode` do schema. */
  function mensagemDeErro(corpo, status) {
    if (corpo && typeof corpo === 'object') {
      const cod = corpo.code || '';
      if (cod === 'P0002') return 'Sala não encontrada. Confira o código com o professor.';
      if (cod === '23505') return 'Esse nome já está em uso nesta sala. Escolham outro.';
      if (cod === '53100') return 'A sala está lotada.';
      if (cod === '42501') return 'Sem permissão para esta ação.';
      if (cod === '22023') return 'O nome do grupo precisa ter de 2 a 24 caracteres.';

      /* Erros do GoTrue. `otp_disabled` é o que o servidor devolve quando
       * o e-mail não existe e create_user é false — a mensagem original
       * ("Signups not allowed for otp") sugere configuração errada, mas na
       * prática significa e-mail não cadastrado. */
      const cerr = corpo.error_code || '';
      if (cerr === 'otp_disabled')
        return 'E-mail não cadastrado como professor neste projeto.';
      if (cerr === 'otp_expired' || cerr === 'invalid_credentials')
        return 'Código inválido ou expirado. Peça um novo.';
      if (cerr === 'over_email_send_rate_limit' || cerr === 'over_request_rate_limit')
        return 'Muitas tentativas seguidas. Aguarde alguns minutos.';

      if (corpo.msg)          return corpo.msg;
      if (corpo.message)      return corpo.message;
      if (corpo.error_description) return corpo.error_description;
      if (corpo.error)        return String(corpo.error);
    }
    if (status === 401 || status === 403) return 'Sessão expirada. Recarregue a página.';
    if (status === 404) return 'Recurso não encontrado (o schema está exposto na Data API?).';
    if (status === 429) return 'Muitas tentativas. Aguarde um minuto e tente de novo.';
    return 'Falha de comunicação (HTTP ' + status + ').';
  }

  /* -----------------------------------------------------------------------
   * Autenticação
   * --------------------------------------------------------------------- */

  /** Cria (ou reaproveita) a sessão anônima do aparelho.
   *  Reaproveitar importa: o limite é de 200 sign-ins por hora por IP, e a
   *  turma inteira compartilha o IP do NAT da faculdade. Um F5 NÃO pode
   *  gastar cota nova. */
  async function entrarAnonimo() {
    if (!configValida()) return { ok: false, erro: 'modo competição desligado' };
    if (aluno.valida()) return { ok: true, sessao: aluno.get() };

    if (aluno.get() && aluno.get().refreshToken) {
      const r = await renovar(aluno);
      if (r.ok) return r;
    }

    const r = await pedir(AUTH() + '/signup', { method: 'POST', body: {} });
    if (!r.ok) return { ok: false, erro: r.erro };
    const s = aluno.definirDaResposta(r.dados);
    return s ? { ok: true, sessao: s } : { ok: false, erro: 'resposta de login inesperada' };
  }

  /** Envia o código de 6 dígitos para o e-mail do professor.
   *  `create_user: false` é essencial: sem ele, qualquer visitante que
   *  digite o próprio e-mail cria uma conta no projeto. */
  async function enviarCodigo(email) {
    if (!configValida()) return { ok: false, erro: 'modo competição desligado' };
    const r = await pedir(AUTH() + '/otp', {
      method: 'POST',
      body: { email: String(email || '').trim(), create_user: false }
    });
    return r.ok ? { ok: true } : { ok: false, erro: r.erro };
  }

  async function verificarCodigo(email, codigo) {
    if (!configValida()) return { ok: false, erro: 'modo competição desligado' };
    const r = await pedir(AUTH() + '/verify', {
      method: 'POST',
      body: { email: String(email || '').trim(), token: String(codigo || '').trim(), type: 'email' }
    });
    if (!r.ok) return { ok: false, erro: r.erro };
    const s = professor.definirDaResposta(r.dados);
    return s ? { ok: true, sessao: s } : { ok: false, erro: 'resposta de login inesperada' };
  }

  async function renovar(sessao) {
    const atual = sessao.get();
    if (!atual || !atual.refreshToken) return { ok: false, erro: 'sem refresh token' };
    const r = await pedir(AUTH() + '/token?grant_type=refresh_token', {
      method: 'POST', body: { refresh_token: atual.refreshToken }
    });
    if (!r.ok) { sessao.limpar(); return { ok: false, erro: r.erro }; }
    const s = sessao.definirDaResposta(r.dados);
    return s ? { ok: true, sessao: s } : { ok: false, erro: 'renovação falhou' };
  }

  /** Token válido da sessão, renovando se estiver perto de vencer. */
  async function tokenDe(sessao) {
    if (sessao.valida()) return sessao.token();
    const r = await renovar(sessao);
    return r.ok ? sessao.token() : null;
  }

  /* -----------------------------------------------------------------------
   * Dados
   * --------------------------------------------------------------------- */

  /* Accept-Profile / Content-Profile apontam o PostgREST para o schema
   * `aulas`. Sem eles ele olharia só o `public`. O schema também precisa
   * estar na lista de Exposed schemas no dashboard — senão, 404. */
  function cabecalhosSchema(metodo) {
    return metodo === 'GET'
      ? { 'Accept-Profile': cfg.schema }
      : { 'Content-Profile': cfg.schema };
  }

  async function rpc(nome, args, sessao) {
    if (!configValida()) return { ok: false, erro: 'modo competição desligado' };
    const token = sessao ? await tokenDe(sessao) : null;
    if (sessao && !token) return { ok: false, erro: 'Sessão expirada. Recarregue a página.' };

    const r = await pedir(REST() + '/rpc/' + nome, {
      method: 'POST', token: token, body: args || {},
      headers: cabecalhosSchema('POST')
    });
    return r.ok ? { ok: true, dados: r.dados } : { ok: false, erro: r.erro, status: r.status };
  }

  /** SELECT. Devolve SEMPRE um array — [] em qualquer falha. */
  async function selecionar(recurso, consulta, sessao) {
    if (!configValida()) return [];
    const token = sessao ? await tokenDe(sessao) : null;
    if (sessao && !token) return [];

    const r = await pedir(REST() + '/' + recurso + (consulta ? '?' + consulta : ''), {
      method: 'GET', token: token, headers: cabecalhosSchema('GET')
    });
    if (!r.ok) return [];
    return Array.isArray(r.dados) ? r.dados : [];
  }

  async function inserir(recurso, linhas, sessao) {
    if (!configValida()) return { ok: false, erro: 'modo competição desligado' };
    const token = sessao ? await tokenDe(sessao) : null;
    if (sessao && !token) return { ok: false, erro: 'Sessão expirada. Recarregue a página.' };

    const r = await pedir(REST() + '/' + recurso, {
      method: 'POST', token: token, body: linhas,
      headers: Object.assign(cabecalhosSchema('POST'), { 'Prefer': 'return=minimal' })
    });
    return r.ok ? { ok: true } : { ok: false, erro: r.erro, status: r.status };
  }

  /** PATCH. A policy `rooms_update` já restringe a linhas do próprio
   *  professor, então não é preciso RPC para fechar ou renomear uma sala. */
  async function atualizar(recurso, consulta, campos, sessao) {
    if (!configValida()) return { ok: false, erro: 'modo competição desligado' };
    const token = sessao ? await tokenDe(sessao) : null;
    if (sessao && !token) return { ok: false, erro: 'Sessão expirada. Recarregue a página.' };

    const r = await pedir(REST() + '/' + recurso + (consulta ? '?' + consulta : ''), {
      method: 'PATCH', token: token, body: campos,
      headers: Object.assign(cabecalhosSchema('PATCH'), { 'Prefer': 'return=minimal' })
    });
    return r.ok ? { ok: true } : { ok: false, erro: r.erro, status: r.status };
  }

  /** Ping barato para o botão "testar conexão" da tela do professor. */
  async function saude() {
    if (!configValida()) return { ok: false, erro: 'modo competição desligado' };
    const r = await pedir(REST() + '/', { method: 'GET' });
    return r.ok || r.status === 200 ? { ok: true } : { ok: false, erro: r.erro };
  }

  compete.rest = {
    configValida,
    aluno, professor,
    entrarAnonimo, enviarCodigo, verificarCodigo, renovar,
    rpc, selecionar, inserir, atualizar, saude,
    _lerClaims: lerClaims   // exposto para os testes
  };
})();
