#!/usr/bin/env python3
"""
leituras2md.py — Converte references/leituras.bib no corpo da página Leituras.

Uso:
    python3 scripts/leituras2md.py            # gera _leituras-refs.md
    python3 scripts/leituras2md.py --check    # confere se está em dia

Gera `_leituras-refs.md`, incluído por `leituras.qmd` via {{< include >}}.
Depois de gerar, é preciso renderizar a página:

    python3 scripts/leituras2md.py && quarto render leituras.qmd

O `--check` (que o CI roda) cobre os três derivados do .bib, porque cada um
some em silêncio quando é esquecido: o `_leituras-refs.md`, o `leituras.html`
renderizado e os números citados na prosa dos arquivos de FONTES_PROSA. Ver
`check()`, no fim do arquivo.

Por que existe
--------------
A página agrupa 51 artigos por CONCEITO (causalidade, exposição, risco…), não
por ordem alfabética nem por módulo. O citeproc do Pandoc produz uma
bibliografia única por documento; sete listas independentes, cada uma com sua
prosa de abertura, exigiriam extensão externa. E o formato que a página usa
(ano na calha, título como link para o DOI, periódico em itálico) não é
nenhum estilo CSL.

Então o .bib continua sendo a única fonte de verdade e este script faz a
formatação. O que ele emite, na ordem:

    1. <ul class="facts">   — contagens do topo (N artigos, N conceitos, faixa
                              de anos), derivadas dos dados e não digitadas
    2. <nav class="chips">  — atalhos por conceito, com a contagem de cada um
    3. <section> por conceito, com as referências ordenadas por ano

O parser BibTeX e o conversor de LaTeX são importados de bib2json.py — mesmo
.bib, mesmas regras de acento, um lugar só para corrigir.

Dependências: só a biblioteca padrão do Python 3.
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bib2json import clean_latex, parse_entries  # noqa: E402

# ---------------------------------------------------------------------------
# Conceitos: id, título da seção, rótulo do chip e prosa de abertura.
#
# A ORDEM desta lista é a ordem das seções na página. Não é cronológica nem
# alfabética: é didática — causalidade primeiro porque o resto do vocabulário
# se define em relação a ela; o debate do IJE logo depois porque é o retrato
# mais nítido de que a questão segue aberta.
#
# Cada item é (id, título da seção, rótulo do chip, prosa de abertura). O chip
# tem rótulo próprio porque os sete precisam caber em UMA linha na largura do
# texto: "Correlação e causalidade" é um bom título de seção e um chip que
# empurra "Risco" para a linha de baixo.
#
# Para criar uma seção nova: acrescente aqui e marque as entradas do .bib com
# `concept = {novo-id}`. Para renomear uma: mude aqui E no .bib (o gerador
# aborta se sobrar entrada apontando para id inexistente).
# ---------------------------------------------------------------------------

CONCEITOS = [
    (
        "causalidade",
        "Causalidade",
        "Causalidade",
        "O que a epidemiologia quer dizer quando diz que algo causa algo. "
        "Definições concorrentes, do modelo de causas componentes à crítica "
        "da teia causal.",
    ),
    (
        "debate",
        "O debate do IJE, 2016",
        "Debate do IJE",
        "Um fascículo inteiro do <i>International Journal of Epidemiology</i> "
        "dedicado à mesma pergunta: o artigo-alvo, cinco comentários que não "
        "se conciliam e a réplica. Leia na ordem das páginas.",
    ),
    (
        "exposicao",
        "Exposição",
        "Exposição",
        "A exigência de que a exposição seja bem definida. Se não há "
        "intervenção imaginável que a produza, o efeito estimado não tem "
        "referente.",
    ),
    (
        "desfecho",
        "Desfecho",
        "Desfecho",
        "Substitutos, compostos e o que se perde ao trocar o desfecho que "
        "importa por outro mais fácil de medir.",
    ),
    (
        "correlacao",
        "Correlação e causalidade",
        "Correlação",
        "Confundimento em versão formal e em versão didática, e os dois erros "
        "de leitura mais frequentes na literatura aplicada.",
    ),
    (
        "inferencia",
        "Inferência",
        "Inferência",
        "O que testes, valores p e intervalos de confiança dizem — e a longa "
        "lista do que não dizem.",
    ),
    (
        "risco",
        "Risco",
        "Risco",
        "Escolha de medidas de efeito, a distância entre risco individual e "
        "risco populacional, e a genealogia do próprio conceito.",
    ),
]

# Acima deste número de autores a lista vira "Primeiro N. et al.". Três cabe
# na linha; quatro já empurra o periódico para a linha seguinte no celular.
MAX_AUTORES = 3


# ---------------------------------------------------------------------------
# Formatação de um item
# ---------------------------------------------------------------------------

def iniciais(prenomes: str) -> str:
    """"Austin Bradford" → "A. B."; "José Ricardo de Carvalho" → "J. R. C."

    Partículas minúsculas ("de", "van", "dos") são descartadas: não viram
    inicial em nenhuma norma de citação, e "J. R. d. C. M." seria só ruído.
    Nomes já abreviados no .bib ("M. Maria") atravessam sem duplicar o ponto.
    """
    saida = []
    for tok in re.split(r"[\s.]+", prenomes):
        if not tok or not tok[:1].isupper():
            continue
        saida.append(tok[0] + ".")
    return " ".join(saida)


def formata_autores(raw: str) -> str:
    """Campo `author` do BibTeX → "Hill A. B." / "Freemantle N. et al."."""
    partes = [p.strip() for p in re.split(r"\s+and\s+", clean_latex(raw)) if p.strip()]

    nomes = []
    for parte in partes:
        if "," in parte:
            sobrenome, prenomes = parte.split(",", 1)
        else:
            # "Geoffrey Rose" (sem vírgula): último token é o sobrenome.
            toks = parte.split()
            sobrenome, prenomes = toks[-1], " ".join(toks[:-1])
        sobrenome = sobrenome.strip()
        ini = iniciais(prenomes.strip())
        nomes.append(f"{sobrenome} {ini}".strip())

    if len(nomes) > MAX_AUTORES:
        return f"{nomes[0]} et al."
    return ", ".join(nomes)


def formata_fonte(f: dict) -> str:
    """Periódico, volume, número e páginas: "Epidemiology 21(1): 3–9"."""
    partes = [clean_latex(f.get("journal", ""))]
    volume = clean_latex(f.get("volume", ""))
    numero = clean_latex(f.get("number", ""))
    paginas = clean_latex(f.get("pages", ""))

    if volume:
        partes.append(f" {volume}")
        if numero:
            partes.append(f"({numero})")
    if paginas:
        partes.append(f": {paginas}")
    return "".join(partes).strip()


def bloco_ref(entrada: dict) -> str:
    f = entrada["fields"]
    titulo = clean_latex(f.get("title", ""))
    doi = clean_latex(f.get("doi", ""))
    nota = clean_latex(f.get("note", ""))
    ano = clean_latex(f.get("year", ""))

    # O título vira link quando há DOI, e texto simples quando não há. Um
    # <a> apontando para lugar nenhum é pior do que a ausência do link.
    rotulo = html.escape(titulo)
    if doi:
        titulo_html = (
            f'<a class="ref-title" href="https://doi.org/{html.escape(doi)}"'
            f' target="_blank" rel="noopener">{rotulo}</a>'
        )
    else:
        titulo_html = f'<span class="ref-title ref-title-plain">{rotulo}</span>'

    linhas = [
        '<li class="ref">',
        f'  <span class="ref-year">{html.escape(ano)}</span>',
        '  <div class="ref-body">',
        f"    {titulo_html}",
        f'    <p class="ref-source">{html.escape(formata_autores(f.get("author", "")))}'
        f" · <i>{html.escape(formata_fonte(f))}</i></p>",
    ]
    if nota:
        linhas.append(f'    <p class="ref-note">{html.escape(nota)}</p>')
    if doi:
        linhas.append(f'    <span class="ref-doi">{html.escape(doi)}</span>')
    linhas += ["  </div>", "</li>"]
    return "\n".join(linhas)


# ---------------------------------------------------------------------------
# Montagem da página
# ---------------------------------------------------------------------------

def agrupa(entradas: list) -> dict:
    """Indexa as entradas por conceito, ordenadas por ano e depois por chave.

    Aborta se alguma entrada tiver `concept` ausente ou desconhecido: sem
    seção, a referência simplesmente não apareceria na página, e um erro que
    só se manifesta como ausência é dos que passam despercebidos por meses.

    Aborta também se faltar `year`, pelo mesmo motivo em outra forma: a entrada
    apareceria, mas com a calha do ano vazia, ordenada antes de tudo, e — o
    estrago maior — arrastaria a faixa do topo da página para "–2019", já que
    string vazia é o menor ano possível. Nada disso levanta exceção sozinho.
    """
    validos = {cid for cid, *_ in CONCEITOS}
    grupos: dict[str, list] = {cid: [] for cid in validos}
    problemas = []
    houve_concept_invalido = False

    for e in entradas:
        cid = e["fields"].get("concept", "").strip()
        ano = e["fields"].get("year", "").strip()
        if cid not in validos:
            problemas.append(f"{e['key']}: concept = {cid!r}")
            houve_concept_invalido = True
            continue
        if not re.fullmatch(r"\d{4}", ano):
            problemas.append(f"{e['key']}: year = {ano!r} (esperado: 4 dígitos)")
            continue
        grupos[cid].append(e)

    if problemas:
        print("[erro] entradas com campo obrigatório ausente ou inválido:",
              file=sys.stderr)
        for p in problemas:
            print(f"       {p}", file=sys.stderr)
        if houve_concept_invalido:
            print(f"       ids de concept válidos: {', '.join(sorted(validos))}",
                  file=sys.stderr)
        raise SystemExit(1)

    # Ordena por ano, e só por ano: a ordenação do Python é estável, então
    # empates preservam a ordem do .bib. Isso importa — as sete entradas de
    # 2016 do debate do IJE estão no arquivo na ordem das páginas do
    # fascículo (artigo-alvo, comentários, réplica), que é a ordem em que a
    # seção pede que sejam lidas. Desempatar por chave as embaralharia.
    for cid in grupos:
        grupos[cid].sort(key=lambda e: e["fields"].get("year", ""))
    return grupos


def faixa_anos(entradas: list) -> str:
    """Faixa no formato 1965–2019: vale para a página e para o eyebrow."""
    anos = sorted(e["fields"].get("year", "") for e in entradas)
    return f"{anos[0]}–{anos[-1]}" if anos else ""


def monta(entradas: list) -> str:
    grupos = agrupa(entradas)
    faixa = faixa_anos(entradas)

    out = [
        "<!-- ARQUIVO GERADO por scripts/leituras2md.py a partir de",
        "     references/leituras.bib. NÃO EDITE À MÃO: a próxima execução",
        "     do gerador sobrescreve tudo. Para mudar uma referência, edite",
        "     o .bib; para mudar a prosa de uma seção, edite o gerador. -->",
        "",
        # Bloco raw do Pandoc. Sem ele, o HTML indentado abaixo seria lido
        # como bloco de código (4 espaços = code block em Markdown) e a
        # página sairia com as referências dentro de um <pre>. Aqui o
        # conteúdo atravessa verbatim, e a indentação fica livre para ser
        # legível.
        "```{=html}",
        '<ul class="facts">',
        f'  <li><b>{len(entradas)}</b> artigos</li>',
        f'  <li><b>{len(CONCEITOS)}</b> conceitos</li>',
        f"  <li><b>{faixa}</b></li>",
        "</ul>",
        "",
        '<nav class="chips" aria-label="Conceitos">',
    ]
    for cid, _, chip, _ in CONCEITOS:
        out.append(
            f'  <a class="chip" href="#{cid}">{html.escape(chip)}'
            f' <span>{len(grupos[cid])}</span></a>'
        )
    out += ["</nav>", ""]

    for cid, titulo, _, resumo in CONCEITOS:
        out += [
            f'<section id="{cid}" class="sec">',
            '  <header class="sec-head">',
            f"    <h2>{html.escape(titulo)}</h2>",
            f"    <p>{resumo}</p>",
            "  </header>",
            '  <ol class="refs">',
        ]
        for e in grupos[cid]:
            out.append("\n".join("    " + linha
                                 for linha in bloco_ref(e).splitlines()))
        out += ["  </ol>", "</section>", ""]

    out.append("```")
    return "\n".join(out).rstrip() + "\n"


# ---------------------------------------------------------------------------
# Conferência (--check)
# ---------------------------------------------------------------------------

# Arquivos que citam a contagem de artigos ou a faixa de anos em PROSA: meta
# description, chamada na tela de Bibliografia, comentários de cabeçalho. O
# `<ul class="facts">` da página sai dos dados; estes aqui saem da mão de quem
# escreveu, e ninguém lembra de revisar cinco arquivos ao acrescentar a 52ª
# entrada no .bib. O gate não reescreve nada — só diz onde está a divergência.
FONTES_PROSA = [
    "js/core/references-view.js",
    "leituras.qmd",
    "leituras.html",
    "references/leituras.bib",
    "scripts/leituras2md.py",
]

# A contagem é segura de procurar solta. A faixa NÃO é: leituras.html tem
# catorze trechos no formato de quatro dígitos, travessão, quatro dígitos, e
# treze deles são intervalos de página ("45(6): 1776–1786"). Por isso a âncora
# no texto do eyebrow, que é onde a faixa aparece escrita à mão de fato — sem
# ela o gate reprovaria todo build, que é o mesmo que não ter gate.
RE_CONTAGEM = re.compile(r"\b(\d+) artigos\b")
RE_FAIXA = re.compile(r"Bibliografia comentada · (\d{4}–\d{4})")


def extrai_bloco(md: str) -> str:
    """Devolve o miolo entre as cercas de bloco raw do arquivo gerado."""
    ini = md.index("```{=html}") + len("```{=html}\n")
    return md[ini:md.rindex("```")].strip("\n")


def confere_html(bloco: str, pagina: str) -> bool:
    """Diz se `leituras.html` já contém o bloco gerado.

    É este gate que substitui rodar o Quarto no CI. O bloco raw atravessa o
    Pandoc verbatim, então basta procurá-lo dentro da página renderizada — com
    uma ressalva: o Pandoc reemite entidades numéricas como o caractere que
    elas representam (`&#x27;` vira `'`). Normalizar os dois lados resolve, e
    normalizar o gerado também é seguro porque a comparação é simétrica.
    """
    return html.unescape(bloco) in html.unescape(pagina)


def confere_prosa(root: Path, total: int, faixa: str) -> list:
    """Lista as linhas em que a prosa contradiz os dados do .bib."""
    erros = []
    for rel in FONTES_PROSA:
        caminho = root / rel
        if not caminho.exists():
            continue
        linhas = caminho.read_text(encoding="utf-8").splitlines()
        for n, linha in enumerate(linhas, 1):
            for m in RE_CONTAGEM.finditer(linha):
                if m.group(1) != str(total):
                    erros.append(f"{rel}:{n}: diz \"{m.group(0)}\", "
                                 f"mas o .bib tem {total}")
            for m in RE_FAIXA.finditer(linha):
                if m.group(1) != faixa:
                    erros.append(f"{rel}:{n}: diz a faixa {m.group(1)}, "
                                 f"mas o .bib vai de {faixa}")
    return erros


def check(root: Path, md_path: Path, conteudo: str, entradas: list) -> int:
    """Confere os três derivados da lista: o .md, o .html e a prosa.

    Roda as três e só então decide o código de saída. Parar na primeira faria
    o CI revelar um problema por push, e quem esquece de rodar o gerador
    costuma ter esquecido de renderizar a página também.
    """
    html_path = root / "leituras.html"
    falhas = []

    if not md_path.exists():
        print(f"[erro] arquivo não encontrado: {md_path}", file=sys.stderr)
        return 1

    if md_path.read_text(encoding="utf-8") != conteudo:
        falhas.append("_leituras-refs.md está desatualizado em relação a "
                      "leituras.bib.\n"
                      "       Rode: python3 scripts/leituras2md.py")

    if not html_path.exists():
        falhas.append(f"arquivo não encontrado: {html_path.name}")
    elif not confere_html(extrai_bloco(conteudo),
                          html_path.read_text(encoding="utf-8")):
        falhas.append("leituras.html não contém a lista que o .bib produz "
                      "hoje — é a página velha ainda no ar.\n"
                      "       Rode: quarto render leituras.qmd")

    divergencias = confere_prosa(root, len(entradas), faixa_anos(entradas))
    if divergencias:
        falhas.append("a prosa cita números que o .bib não confirma:\n"
                      + "\n".join(f"       {d}" for d in divergencias))

    if falhas:
        for f in falhas:
            print(f"[erro] {f}", file=sys.stderr)
        return 1

    print(f"[ok] página Leituras em dia ({len(entradas)} entradas, "
          f"{faixa_anos(entradas)})")
    return 0


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    root = Path(__file__).resolve().parent.parent
    bib_path = root / "references" / "leituras.bib"
    md_path = root / "_leituras-refs.md"

    if not bib_path.exists():
        print(f"[erro] arquivo não encontrado: {bib_path}", file=sys.stderr)
        return 1

    entradas = parse_entries(bib_path.read_text(encoding="utf-8"))
    conteudo = monta(entradas)

    if "--check" in sys.argv[1:]:
        return check(root, md_path, conteudo, entradas)

    md_path.write_text(conteudo, encoding="utf-8")
    print(f"[ok] {len(entradas)} referência(s) em {md_path.relative_to(root)}")
    print("     Falta renderizar: quarto render leituras.qmd")
    return 0


if __name__ == "__main__":
    sys.exit(main())
