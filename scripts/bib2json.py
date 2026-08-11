#!/usr/bin/env python3
"""
bib2json.py — Converte references.bib (BibTeX) em references.json (CSL-JSON).

Uso:
    python3 scripts/bib2json.py

Roda na raiz do projeto. Espera o arquivo `references.bib` e gera
`references.json` sobrescrevendo, com cabeçalho de proveniência.

Dependências: apenas Python 3 padrão. Sem `bibtexparser`, sem `citation-js`.

Escopo: parser deliberadamente simples, suficiente para o subconjunto de
BibTeX que usamos (campos com chaves ou aspas, @article/@book/@incollection,
sem macros `@string`, sem abreviações, sem `@comment` avançados).
Se o volume de entradas crescer a ponto de precisar mais, vale trocar por
`pybtex` ou `pypandoc`.
"""
from __future__ import annotations

import datetime
import json
import re
import sys
import unicodedata
from pathlib import Path

# ---------------------------------------------------------------------------
# Mapeamento BibTeX → CSL-JSON
# ---------------------------------------------------------------------------

CSL_TYPE_MAP = {
    "article":       "article-journal",
    "book":          "book",
    "incollection":  "chapter",
    "inproceedings": "paper-conference",
    "techreport":    "report",
    "misc":          "webpage",
    "online":        "webpage",
    "phdthesis":     "thesis",
    "mastersthesis": "thesis",
}

FIELD_MAP = {
    "title":     "title",
    "journal":   "container-title",
    "booktitle": "container-title",
    "publisher": "publisher",
    "address":   "publisher-place",
    "edition":   "edition",
    "volume":    "volume",
    "number":    "issue",
    "pages":     "page",
    "doi":       "DOI",
    "url":       "URL",
    "isbn":      "ISBN",
    "issn":      "ISSN",
    "note":      "note",
    "howpublished": "note",   # fallback: concatenar se já existir
}

# Campos não-padrão que preservamos no CSL-JSON sob a chave `custom`.
# Esses campos são usados pela view de bibliografia do app (agrupamento
# por módulo, notas explicativas, etc.).
CUSTOM_FIELDS = {"module"}

# ---------------------------------------------------------------------------
# Parser BibTeX (simples, suficiente para nosso uso)
# ---------------------------------------------------------------------------

_STRIP_BRACES_RE = re.compile(r"^\{(.*)\}$", re.DOTALL)


def strip_outer_braces(s: str) -> str:
    s = s.strip()
    m = _STRIP_BRACES_RE.match(s)
    while m:
        s = m.group(1).strip()
        m = _STRIP_BRACES_RE.match(s)
    if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
        s = s[1:-1]
    return s


# Acentos LaTeX → marca combinante Unicode. Aplicar a marca depois da letra
# e normalizar em NFC resolve maiúsculas e minúsculas de uma vez, sem precisar
# de uma tabela com todas as combinações.
_MARCA_COMBINANTE = {
    "'": "\u0301",  # agudo      \'e → é
    "`": "\u0300",  # grave      \`a → à
    "^": "\u0302",  # circunflexo \^o → ô
    '"': "\u0308",  # trema      \"a → ä
    "~": "\u0303",  # til        \~a → ã
    "=": "\u0304",  # mácron
    ".": "\u0307",  # ponto acima
    "c": "\u0327",  # cedilha    \c{c} → ç
    "v": "\u030C",  # caron
    "u": "\u0306",  # breve
    "H": "\u030B",  # duplo agudo
    "d": "\u0323",  # ponto abaixo
}

# Acentos aparecem em três formas no BibTeX, e todas ocorrem neste projeto:
#     {\'e}     chave envolvendo o comando INTEIRO — forma mais comum em
#               arquivos exportados por gerenciadores de referência
#     \'{e}     chave só na letra
#     \'e       sem chave
#
# As formas "envoltas" precisam ser tratadas ANTES das demais: se `\'e}` for
# consumido primeiro, a chave de ABERTURA fica órfã e vaza para o site
# (`m{\'e}decine` → `m{édecine`). Foi exatamente esse o bug.
#
# Separação por tipo de comando:
#   - por SÍMBOLO (\'e) — sem ambiguidade, chaves opcionais;
#   - por LETRA (\c{c}) — chaves OBRIGATÓRIAS, senão `\url` seria lido como
#     "\u seguido de r" (breve no r) e a URL viraria lixo.
_ACENTO_LETRA_ENVOLTO_RE = re.compile(r"\{\\([cvuHd])\s*\{\s*([A-Za-z])\s*\}\s*\}")
_ACENTO_ENVOLTO_RE = re.compile(r"\{\\([`'^\"~=.])\s*\{?\s*([A-Za-z])\s*\}?\s*\}")
_ACENTO_LETRA_RE = re.compile(r"\\([cvuHd])\{\s*([A-Za-z])\s*\}")
_ACENTO_SIMBOLO_RE = re.compile(r"\\([`'^\"~=.])\s*\{?\s*([A-Za-z])\s*\}?")

# Letras que não são acento + base, mas um caractere próprio.
_LETRAS_LATEX = {
    r"\ss": "ß", r"\aa": "å", r"\AA": "Å", r"\o": "ø", r"\O": "Ø",
    r"\l": "ł", r"\L": "Ł", r"\ae": "æ", r"\AE": "Æ",
    r"\oe": "œ", r"\OE": "Œ", r"\i": "ı", r"\j": "ȷ",
}

# Caracteres que o LaTeX exige escapar e que no site devem aparecer literais.
_ESPECIAIS_LATEX = {
    r"\&": "&", r"\%": "%", r"\$": "$", r"\#": "#",
    r"\_": "_", r"\{": "{", r"\}": "}",
}

# Comandos de formatação cujo conteúdo interessa e o comando não.
_COMANDOS_TEXTO_RE = re.compile(
    r"\\(?:emph|textit|textbf|textsc|texttt|textrm|mbox|text)\s*\{([^{}]*)\}"
)

_URL_RE = re.compile(r"\\url\s*\{([^{}]*)\}")
# URL solta em `howpublished`/`note`, sem \url{} ao redor.
_URL_NUA_RE = re.compile(r"(?<![\x00\w])(https?://[^\s{}]+)")


def _aplica_acento(m: "re.Match") -> str:
    marca = _MARCA_COMBINANTE.get(m.group(1))
    if not marca:
        return m.group(0)
    return unicodedata.normalize("NFC", m.group(2) + marca)


def clean_latex(s: str) -> str:
    """Resolve comandos LaTeX e remove os wrappers de proteção de maiúsculas.

    A ORDEM importa, e um erro aqui vaza direto para a bibliografia que o
    aluno lê. O bug que motivou esta versão: a remoção genérica de chaves
    rodava primeiro, então `\\url{https://x}` virava `\\urlhttps://x` e
    `{\\'e}` virava `\\'e` — ambos apareciam literais no site.

    Comandos são resolvidos ANTES de as chaves serem removidas.
    """
    # 1) URLs saem de cena primeiro: nenhuma das substituições seguintes
    #    (traços, chaves, espaços) pode tocá-las. '--' numa URL é legítimo e
    #    viraria en-dash.
    urls: list[str] = []

    def _guarda_url(m: "re.Match") -> str:
        urls.append(m.group(1))
        return f"\x00URL{len(urls) - 1}\x00"

    s = _URL_RE.sub(_guarda_url, s)
    s = _URL_NUA_RE.sub(_guarda_url, s)

    # 2) Comandos de formatação: preserva o conteúdo, descarta o comando.
    s = _COMANDOS_TEXTO_RE.sub(r"\1", s)

    # 3) Acentos e letras especiais. As formas com chave externa primeiro.
    s = _ACENTO_LETRA_ENVOLTO_RE.sub(_aplica_acento, s)
    s = _ACENTO_ENVOLTO_RE.sub(_aplica_acento, s)
    s = _ACENTO_LETRA_RE.sub(_aplica_acento, s)
    s = _ACENTO_SIMBOLO_RE.sub(_aplica_acento, s)
    for cmd, letra in _LETRAS_LATEX.items():
        s = re.sub(re.escape(cmd) + r"(?![A-Za-z])", letra, s)

    # 4) Caracteres escapados (\& → &). Antes da remoção de chaves para que
    #    \{ e \} não sejam confundidos com agrupamento.
    for cmd, char in _ESPECIAIS_LATEX.items():
        s = s.replace(cmd, char)

    # 5) {Something} internos — preserva o texto (proteção de maiúsculas).
    s = re.sub(r"\{([^{}]*)\}", r"\1", s)

    # 6) Traços LaTeX: ordem importa — '---' (em-dash) antes de '--' (en-dash)
    s = s.replace("---", "—")
    s = s.replace("--", "–")
    # Aspas LaTeX simples
    s = s.replace("``", "“").replace("''", "”")
    # Espaços extras
    s = re.sub(r"\s+", " ", s).strip()

    # 7) Devolve as URLs intactas.
    for i, url in enumerate(urls):
        s = s.replace(f"\x00URL{i}\x00", url)

    return unicodedata.normalize("NFC", s)


def parse_entries(bib_text: str):
    """Divide o .bib em entradas @type{key, fields...}.

    Produz dicts {type, key, fields{}}.
    Ignora comentários de linha iniciados com '%'.
    """
    # Remove comentários de linha
    lines = []
    for line in bib_text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("%"):
            continue
        lines.append(line)
    src = "\n".join(lines)

    entries = []
    i = 0
    n = len(src)
    while i < n:
        if src[i] != "@":
            i += 1
            continue
        # Encontra @type{key,
        m = re.match(r"@(\w+)\s*\{\s*([^,\s]+)\s*,", src[i:])
        if not m:
            i += 1
            continue
        etype = m.group(1).lower()
        ekey = m.group(2)
        j = i + m.end()

        # Agora extrai os campos até o '}' no nível 0 (precisamos contar chaves).
        depth = 1
        start = j
        while j < n and depth > 0:
            c = src[j]
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        body = src[start:j]

        # Parse dos campos: key = value, ... (value pode ser {...}, "...", ou número)
        fields = {}
        k = 0
        m2 = True
        while k < len(body):
            m2 = re.search(r"(\w+)\s*=\s*", body[k:])
            if not m2:
                break
            key = m2.group(1).lower()
            k2 = k + m2.end()
            # Valor: pode ser {...}, "...", ou plano
            if body[k2:k2 + 1] == "{":
                # conta chaves
                depth = 1
                k3 = k2 + 1
                while k3 < len(body) and depth > 0:
                    if body[k3] == "{": depth += 1
                    elif body[k3] == "}": depth -= 1
                    k3 += 1
                val = body[k2:k3]   # inclui chaves externas
                k = k3
            elif body[k2:k2 + 1] == '"':
                k3 = k2 + 1
                while k3 < len(body) and body[k3] != '"':
                    k3 += 1
                val = body[k2:k3 + 1]
                k = k3 + 1
            else:
                m3 = re.match(r"[^,\n]+", body[k2:])
                if not m3:
                    break
                val = m3.group(0)
                k = k2 + m3.end()
            # Avança vírgula ou espaço
            m4 = re.match(r"\s*,\s*", body[k:])
            if m4:
                k += m4.end()

            # Detecta convenção BibTeX de autor institucional: {{...}}
            # (duas chaves externas). O valor original é marcado como literal.
            val_stripped = val.strip()
            is_literal = (val_stripped.startswith("{{") and val_stripped.endswith("}}"))
            cleaned = strip_outer_braces(val)
            if is_literal and key == "author":
                fields[key] = "__LITERAL__" + cleaned
            else:
                fields[key] = cleaned

        entries.append({"type": etype, "key": ekey, "fields": fields})
        i = j + 1
    return entries


# ---------------------------------------------------------------------------
# Conversão para CSL-JSON
# ---------------------------------------------------------------------------

def split_authors(raw: str):
    """Parse author field em lista de {family, given} ou {literal}.

    Reconhece a convenção BibTeX para autores institucionais: quando o valor
    original no .bib está envolvido em {{...}} (duplas chaves), é preservado
    como um único autor literal, sem split em 'and'. Esse caso é marcado
    pelo prefixo `__LITERAL__` injetado em parse_entries.
    """
    if raw.startswith("__LITERAL__"):
        return [{"literal": raw[len("__LITERAL__"):].strip()}]

    authors = []
    for part in re.split(r"\s+and\s+", raw):
        part = part.strip()
        if not part:
            continue
        if "," in part:
            family, given = part.split(",", 1)
            authors.append({"family": family.strip(), "given": given.strip()})
        else:
            # Sem vírgula: assume "Primeiro Sobrenome"
            toks = part.split()
            if len(toks) == 1:
                authors.append({"literal": toks[0]})
            else:
                authors.append({"family": toks[-1], "given": " ".join(toks[:-1])})
    return authors


def to_csl(entry):
    etype = entry["type"]
    fields = entry["fields"]
    item = {
        "id": entry["key"],
        "type": CSL_TYPE_MAP.get(etype, "article"),
    }

    # Autor
    if "author" in fields:
        item["author"] = split_authors(clean_latex(fields["author"]))
    if "editor" in fields:
        item["editor"] = split_authors(clean_latex(fields["editor"]))

    # Ano como issued
    if "year" in fields:
        try:
            y = int(re.sub(r"[^0-9]", "", fields["year"])[:4])
            item["issued"] = {"date-parts": [[y]]}
        except ValueError:
            pass

    # Campos mapeados diretamente
    for bib_key, csl_key in FIELD_MAP.items():
        if bib_key in fields:
            value = clean_latex(fields[bib_key])
            # Se já existe (ex: howpublished + note), concatena com " — "
            if csl_key in item and item[csl_key]:
                item[csl_key] = item[csl_key] + " — " + value
            else:
                item[csl_key] = value

    # Campos custom (preservados sob `custom` no CSL-JSON, convenção CSL 1.0.2)
    custom = {}
    for bib_key in CUSTOM_FIELDS:
        if bib_key in fields:
            raw = clean_latex(fields[bib_key])
            if bib_key == "module":
                # Normaliza: "4" → [4]; "4, 8" → [4, 8]
                modules = []
                for part in raw.split(","):
                    part = part.strip()
                    if part:
                        try:
                            modules.append(int(part))
                        except ValueError:
                            modules.append(part)
                custom["module"] = modules
            else:
                custom[bib_key] = raw
    if custom:
        item["custom"] = custom

    return item


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Autoteste de clean_latex
#
# Existe porque um erro nessa função não quebra nada — apenas vaza LaTeX cru
# para a bibliografia que o aluno lê, silenciosamente. Rodado no CI junto com
# a suíte JS: `python3 scripts/bib2json.py --selftest`.
# ---------------------------------------------------------------------------

_CASOS_TESTE = [
    # As três formas de acento que aparecem em .bib de verdade
    (r"m{\'e}decine g{\'e}n{\'e}rale", "médecine générale"),   # chave envolvendo o comando
    (r"Pr\"{a}ventivmedizin", "Präventivmedizin"),              # chave só na letra
    (r"Pr\"aventivmedizin", "Präventivmedizin"),                # sem chave
    (r"Fam{\'i}lia", "Família"),
    (r"G{\'e}rvas", "Gérvas"),
    (r"\c{c}ao e \~{a}o e {\c{c}}", "çao e ão e ç"),
    (r"Ma{\~n}ana e {\o}re e \ss", "Mañana e øre e ß"),
    # Caracteres escapados
    (r"Doll \& Hill", "Doll & Hill"),
    (r"Chapman \& Hall/CRC", "Chapman & Hall/CRC"),
    # URLs: não podem sofrer nenhuma substituição (o '--' é legítimo)
    (r"\url{https://ex.com/a--b}", "https://ex.com/a--b"),
    (r"veja https://ex.com/x--y agora", "veja https://ex.com/x--y agora"),
    # Formatação
    (r"\emph{destaque} e \textbf{forte}", "destaque e forte"),
    # Comportamentos que NÃO podem regredir
    (r"{J}ohn {S}now", "John Snow"),
    (r"225--232", "225–232"),
    (r"traço --- longo", "traço — longo"),
    (r"``citado''", "“citado”"),
]


def selftest() -> int:
    falhas = 0
    for entrada, esperado in _CASOS_TESTE:
        obtido = clean_latex(entrada)
        if obtido != esperado:
            falhas += 1
            print(f"[falha] {entrada!r}\n        esperado: {esperado!r}\n"
                  f"        obtido  : {obtido!r}", file=sys.stderr)
    total = len(_CASOS_TESTE)
    if falhas:
        print(f"[erro] clean_latex: {falhas}/{total} caso(s) falharam", file=sys.stderr)
        return 1
    print(f"[ok] clean_latex: {total}/{total} casos")
    return 0


def main() -> int:
    if "--selftest" in sys.argv[1:]:
        return selftest()

    root = Path(__file__).resolve().parent.parent
    bib_path = root / "references" / "references.bib"
    json_path = root / "references" / "references.json"
    js_path = root / "references" / "references.js"

    if not bib_path.exists():
        print(f"[erro] arquivo não encontrado: {bib_path}", file=sys.stderr)
        return 1

    bib_text = bib_path.read_text(encoding="utf-8")
    entries = parse_entries(bib_text)
    csl_items = [to_csl(e) for e in entries]

    # Cabeçalho de proveniência (metadados do arquivo gerado)
    out = {
        "_generated_from":    "references.bib",
        "_generated_by":      "scripts/bib2json.py",
        "_generated_at_utc":  datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "_warning":           "DO NOT EDIT THIS FILE MANUALLY. It is derived from references.bib — regenerate via scripts/bib2json.py.",
        "items":              csl_items,
    }

    # 1) references.json — para download pelo usuário (importável em Zotero etc.)
    json_serialized = json.dumps(out, ensure_ascii=False, indent=2)
    json_path.write_text(json_serialized + "\n", encoding="utf-8")

    # 2) references.js — wrapper que define window.EDL.data.references.
    #    Carregado via <script> no index.html, evita o fetch() — que é
    #    bloqueado pelo Safari em protocolo file:// (CORS-like policy).
    #    Esta duplicação é intencional: o JSON é o formato canônico para
    #    exportação/download; o JS é o veículo para consumo pelo app em runtime.
    js_wrapper = (
        "/* =========================================================================\n"
        " * EDL — references.js (AUTO-GERADO)\n"
        " *\n"
        " * Este arquivo é gerado automaticamente a partir de references.bib via\n"
        " * scripts/bib2json.py. NÃO EDITE MANUALMENTE.\n"
        " *\n"
        " * Propósito: expor a bibliografia como `window.EDL.data.references`\n"
        " * para consumo pelo app em runtime. Usamos <script> em vez de fetch()\n"
        " * de references.json porque o Safari bloqueia fetch de arquivos locais\n"
        " * em protocolo file:// — o que quebraria o app ao ser aberto por duplo-\n"
        " * clique no index.html.\n"
        " *\n"
        " * O arquivo references.json (gerado em paralelo) serve para download\n"
        " * pelo usuário e para importação em gerenciadores como Zotero, EndNote,\n"
        " * Mendeley, Pandoc etc. Ambos derivam da mesma fonte.\n"
        " * ========================================================================= */\n"
        "\n"
        "window.EDL = window.EDL || {};\n"
        "window.EDL.data = window.EDL.data || {};\n"
        "window.EDL.data.references = "
        + json_serialized
        + ";\n"
    )
    js_path.write_text(js_wrapper, encoding="utf-8")

    print(f"[ok] {len(csl_items)} referência(s) gravadas em:")
    print(f"       {json_path.relative_to(root)}  (download / import em gerenciadores)")
    print(f"       {js_path.relative_to(root)}   (consumido pelo app em runtime)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
