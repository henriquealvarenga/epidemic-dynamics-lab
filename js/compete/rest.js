/* =========================================================================
 * EDL — compete/rest.js
 *
 * Cliente do Supabase escrito à mão: `fetch` direto contra o PostgREST e o
 * GoTrue. Sem SDK, sem CDN, sem build — como o resto deste site.
 *
 * POR QUE NÃO USAR O supabase-js
 *   Não é para evitar um domínio novo — o site já carrega o D3 do
 *   jsdelivr, e o SDK viria de lá também. São dois outros motivos:
 *
 *   1. 211 KB. É o tamanho do build UMD, baixado no celular do aluno, na
 *      rede da faculdade, antes de ele conseguir entrar na sala.
 *   2. Um ponto de falha a menos. Para jogar, o navegador já precisa
 *      alcançar o Supabase — isso é inevitável. Com o SDK, precisaria
 *      alcançar TAMBÉM o CDN: o backend poderia estar perfeitamente no ar
 *      e a aula travaria porque o jsdelivr não respondeu.
 *
 *   O custo dessa escolha é real e vale registrar: renovação de token,
 *   tratamento de erro e (na fase 2) o cliente de Realtime passam a ser
 *   nossos para manter. O projeto irmão do Exame do Estado Mental fez a
 *   mesma escolha e rodou aulas reais assim.
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

  /* O "Ensaiar sem internet" do console precisa valer para TODAS as abas
   * desta origem, não só para a do professor: o ensaio é justamente uma
   * aba de console e várias de grupos. Guardar a escolha em localStorage
   * é o que faz as abas concordarem — sem isso, o professor abre uma sala
   * local e os alunos tentam o Supabase, onde ela não existe. */
  function localForcado() {
    try { return localStorage.getItem(cfg.storageKeys.forcarLocal) === '1'; }
    catch (err) { return false; }
  }

  function forcarLocal(ligar) {
    try {
      if (ligar) localStorage.setItem(cfg.storageKeys.forcarLocal, '1');
      else localStorage.removeItem(cfg.storageKeys.forcarLocal);
    } catch (err) { /* fica só nesta aba */ }
    cfg.enabled = !ligar;
  }

  function configValida() {
    if (localForcado()) return false;
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
        return { ok: false, status: resp.status,
                 erro: mensagemDeErro(corpo, resp.status, o.contexto) };
      }
      return { ok: true, status: resp.status, dados: corpo };
    } catch (err) {
      // Rede caída, DNS, CORS, CDN bloqueado — tudo cai aqui.
      return { ok: false, status: 0, erro: 'sem conexão' };
    }
  }

  /** Traduz os erros que a turma pode encontrar para português de sala.
   *  Os códigos vêm dos `raise exception ... using errcode` do schema.
   *
   *  `contexto` desambigua códigos reaproveitados pelo GoTrue: o mesmo
   *  `invalid_credentials` vale para código OTP errado e para senha
   *  errada, e dizer "peça um novo código" a quem digitou a senha manda a
   *  pessoa para o lado errado. */
  function mensagemDeErro(corpo, status, contexto) {
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
      if (cerr === 'otp_expired' || cerr === 'invalid_credentials') {
        return contexto === 'senha'
          ? 'E-mail ou senha incorretos.'
          : 'Código inválido ou expirado. Peça um novo.';
      }
      if (cerr === 'over_email_send_rate_limit' || cerr === 'over_request_rate_limit')
        return 'Muitas tentativas seguidas. Aguarde alguns minutos.';

      /* O servidor devolve "Error sending magic link email" para qualquer
       * falha de SMTP — inclusive credencial recusada pelo provedor, que é
       * problema de CONFIGURAÇÃO, não do que o professor digitou. Sem esta
       * tradução, ele fica tentando de novo achando que errou o e-mail.
       * (Vimos exatamente isso: SMTP do Gmail devolvendo 535 BadCredentials
       * porque exige App Password, não a senha da conta.) */
      if (cerr === 'unexpected_failure' || status === 500) {
        return 'O servidor não conseguiu enviar o e-mail. É configuração de ' +
               'SMTP no Supabase, não erro seu — use o login por senha ou ' +
               'siga em modo local.';
      }

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

  /** URL para onde o magic link deve voltar. Precisa estar na allowlist de
   *  Redirect URLs do projeto, senão o GoTrue ignora e usa a Site URL. */
  function urlDeRetorno() {
    return location.origin + location.pathname + '#/sala';
  }

  /**
   * Envia o e-mail de acesso ao professor.
   *
   * `create_user: false` é essencial: sem ele, qualquer visitante que
   * digite o próprio e-mail cria uma conta no projeto.
   *
   * O QUE CHEGA — link ou código de 6 dígitos — é decidido pelo TEMPLATE
   * do projeto, não por esta chamada. E o Supabase só permite editar
   * templates quando há SMTP customizado configurado; com o serviço de
   * e-mail interno, vale o template padrão, que manda LINK. Daí este
   * cliente tratar o retorno por link (ver capturarRedirect).
   */
  async function enviarCodigo(email) {
    if (!configValida()) return { ok: false, erro: 'modo competição desligado' };
    const r = await pedir(
      AUTH() + '/otp?redirect_to=' + encodeURIComponent(urlDeRetorno()), {
        method: 'POST',
        body: { email: String(email || '').trim(), create_user: false }
      });
    return r.ok ? { ok: true } : { ok: false, erro: r.erro };
  }

  /* -----------------------------------------------------------------------
   * Retorno do magic link
   *
   * O GoTrue devolve o usuário para a Redirect URL com os tokens no
   * FRAGMENTO: #access_token=…&refresh_token=…&type=magiclink
   *
   * Isso colide de frente com o roteador deste site, que lê a rota do
   * mesmo fragmento — sem tratar, o `route()` veria lixo e cairia na home,
   * perdendo o login. Por isso capturamos ANTES de qualquer roteamento
   * (este arquivo carrega antes de app.js, que é quem chama screens.init).
   *
   * Depois de guardar a sessão, `history.replaceState` limpa o endereço:
   * token de acesso não pode ficar no histórico do navegador, nem ser
   * copiado junto quando alguém compartilha a URL.
   *
   * O RETORNO TAMBÉM PODE SER UM ERRO, e ele não pode ser engolido:
   *   #error=access_denied&error_code=otp_expired&error_description=…
   *
   * É o que acontece quando o link já foi usado — inclusive quando quem o
   * usou foi um filtro antivírus do provedor de e-mail, que abre os links
   * da mensagem antes de o professor clicar. Sem tratar, o roteador não
   * reconhece esse fragmento, cai na home em silêncio, e a coisa mais
   * visível ali é o card "Entrar numa competição": o professor termina na
   * TELA DO ALUNO sem entender por quê. Foi exatamente o relato que abriu
   * esta pendência.
   * --------------------------------------------------------------------- */

  /**
   * Lê o que o GoTrue devolveu no endereço. Pura de propósito — é o pedaço
   * que os testes conseguem exercitar sem navegador.
   *
   * O erro chega no FRAGMENTO no fluxo implícito (o nosso) e na QUERY em
   * alguns caminhos do GoTrue; ler os dois custa uma linha e evita
   * depender de qual deles a versão do servidor escolheu hoje.
   *
   * Devolve { tipo: 'sessao', access, refresh } | { tipo: 'erro', erro }
   * | null quando o endereço é só uma rota normal do site.
   */
  function lerRetornoDoLink(fragmento, consulta) {
    const doHash  = new URLSearchParams(String(fragmento || '').replace(/^#\/?/, ''));
    const doQuery = new URLSearchParams(String(consulta || '').replace(/^\?/, ''));
    const pega = k => doHash.get(k) || doQuery.get(k);

    const access = pega('access_token');
    if (access) return { tipo: 'sessao', access: access, refresh: pega('refresh_token') };

    const codigo = pega('error_code') || pega('error');
    if (codigo) return { tipo: 'erro', erro: mensagemDoLink(codigo, pega('error_description')) };

    return null;
  }

  /** O que o professor lê na tela quando o link não funcionou. */
  function mensagemDoLink(codigo, descricao) {
    if (codigo === 'otp_expired' || codigo === 'access_denied') {
      return 'Este link de acesso não vale mais: cada um funciona uma vez só, ' +
             'e alguns filtros de e-mail o abrem antes de você. Peça outro — ' +
             'ou entre com senha, que não depende de e-mail.';
    }
    const d = String(descricao || '').trim();
    return d ? 'O login pelo link falhou: ' + d
             : 'O login pelo link falhou. Peça outro link, ou entre com senha.';
  }

  /* O motivo do erro precisa atravessar o `location.reload()` do caminho do
   * hashchange, então vai para o sessionStorage — memória só como reserva
   * para navegação privativa. Some ao fechar a aba, que é a vida útil certa
   * para um aviso de tela. */
  let erroLinkMemoria = null;

  function guardarErroDoLink(msg) {
    erroLinkMemoria = msg;
    try { sessionStorage.setItem(cfg.storageKeys.erroLink, msg); }
    catch (err) { /* fica só em memória, e só nesta aba */ }
  }

  /** Lê E CONSOME o erro do último retorno de link. */
  function erroDoLink() {
    let msg = erroLinkMemoria;
    erroLinkMemoria = null;
    try {
      msg = sessionStorage.getItem(cfg.storageKeys.erroLink) || msg;
      sessionStorage.removeItem(cfg.storageKeys.erroLink);
    } catch (err) { /* fica com o que estava em memória */ }
    return msg || null;
  }

  /** Tira do endereço o que o GoTrue pendurou nele e aponta para #/sala.
   *  Vale tanto para os tokens (que não podem ficar no histórico) quanto
   *  para o erro (que já foi guardado e não deve sobreviver a um F5). */
  function limparEndereco() {
    const q = new URLSearchParams(String(location.search || '').replace(/^\?/, ''));
    ['access_token', 'refresh_token', 'expires_in', 'expires_at', 'token_type',
     'type', 'error', 'error_code', 'error_description'].forEach(k => q.delete(k));
    const cauda = q.toString();
    const alvo = location.pathname + (cauda ? '?' + cauda : '') + '#/sala';
    try { history.replaceState(null, '', alvo); }
    catch (err) { location.hash = '#/sala'; }
  }

  /** Devolve 'sessao', 'erro' ou false (endereço sem retorno de link). */
  function capturarRedirect() {
    const r = lerRetornoDoLink(location.hash, location.search);
    if (!r) return false;

    if (r.tipo === 'sessao') {
      professor.definirDaResposta({
        access_token: r.access,
        refresh_token: r.refresh
      });
    } else {
      guardarErroDoLink(r.erro);
    }

    limparEndereco();
    return r.tipo;
  }

  let entrouPorLink = capturarRedirect() === 'sessao';

  /* Também na troca de fragmento, e não só na carga.
   *
   * Se o professor já estiver com o site aberto quando clicar no link do
   * e-mail, o navegador NÃO recarrega a página: o endereço difere apenas
   * no fragmento, então ele só dispara `hashchange`. Sem este ouvinte, a
   * captura não rodaria e o login seria silenciosamente perdido — a tela
   * voltaria ao formulário sem explicação nenhuma.
   *
   * Descoberto testando: o primeiro teste navegou só trocando o hash e a
   * captura não aconteceu.
   *
   * Só o FRAGMENTO é consultado aqui: a query não muda numa troca de hash e
   * já foi tratada na carga — relê-la faria um retorno velho disparar de
   * novo a cada navegação do site. */
  window.addEventListener('hashchange', function (ev) {
    if (!lerRetornoDoLink(location.hash, '')) return;   // rota normal: não mexe
    const tipo = capturarRedirect();
    if (!tipo) return;
    if (tipo === 'sessao') entrouPorLink = true;

    /* Este hashchange é nosso: nenhum outro ouvinte deve tratá-lo.
     *
     * `location.reload()` só AGENDA a recarga — os ouvintes seguintes ainda
     * rodam. O roteador rodaria, renderizaria a tela do professor e, ao
     * fazê-lo, CONSUMIRIA o aviso de link inválido (ele é entregue uma vez
     * só) numa pintura que a recarga jogaria fora um instante depois: o
     * professor recarregaria numa tela de login muda. Custou um teste
     * descobrir, e o sintoma era idêntico ao bug original.
     *
     * Funciona porque os dois ouvintes são do mesmo alvo (window) e este
     * foi registrado primeiro — rest.js carrega antes de app.js, que é
     * quem chama screens.init. É a mesma ordem de que a captura na carga
     * já depende. */
    if (ev && typeof ev.stopImmediatePropagation === 'function') {
      ev.stopImmediatePropagation();
    }

    /* A tela precisa se redesenhar já logada — ou já com o aviso de que o
     * link falhou. Recarregar é o caminho mais simples e seguro: sessão e
     * aviso são lidos do storage na carga. */
    location.reload();
  });

  /**
   * Login por e-mail e senha — alternativa ao OTP.
   *
   * Existe porque o OTP depende do e-mail CHEGAR, e isso depende de uma
   * configuração de SMTP que pode falhar exatamente no dia da aula (já
   * falhou aqui: SMTP do Gmail devolvendo 535 por exigir App Password).
   * O projeto irmão do Exame do Estado Mental usa senha pelo mesmo motivo,
   * registrado lá como "confiável numa sala de aula".
   *
   * A senha é digitada pelo professor no formulário e vai direto para o
   * GoTrue; não é guardada em lugar nenhum — só o token que volta.
   */
  async function entrarComSenha(email, senha) {
    if (!configValida()) return { ok: false, erro: 'modo competição desligado' };
    const r = await pedir(AUTH() + '/token?grant_type=password', {
      method: 'POST', contexto: 'senha',
      body: { email: String(email || '').trim(), password: String(senha || '') }
    });
    if (!r.ok) return { ok: false, erro: r.erro };
    const s = professor.definirDaResposta(r.dados);
    return s ? { ok: true, sessao: s } : { ok: false, erro: 'resposta de login inesperada' };
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
    configValida, localForcado, forcarLocal,
    aluno, professor,
    entrouPorLink: () => entrouPorLink,
    erroDoLink,
    urlDeRetorno,
    entrarAnonimo, enviarCodigo, verificarCodigo, entrarComSenha, renovar,
    rpc, selecionar, inserir, atualizar, saude,
    _lerClaims: lerClaims,               // expostos para os testes
    _lerRetornoDoLink: lerRetornoDoLink
  };
})();
