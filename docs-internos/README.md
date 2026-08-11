# Documentos internos

Notas de trabalho: rascunhos, logs de implementação e registros de decisão.

**Esta pasta não é publicada.** O workflow de publicação
([.github/workflows/publish.yml](../.github/workflows/publish.yml)) monta o site num diretório
`_site/` excluindo `docs-internos/`, `tests/`, `scripts/`, `.github/` e `.claude/`. Só o que o
aluno precisa vai ao ar.

## Por que versionar isto

O código mostra *o que* o site faz. Estes documentos guardam o *porquê* — a tese pedagógica, as
alternativas descartadas, os números que sustentam uma afirmação — e isso não se reconstrói
lendo o resultado.

## O que há aqui

- **`RASCUNHO_MODULO8_REORGANIZADO.md`** — o planejamento da reorganização do módulo 8 em três
  seções (Soho 1854 → Haiti 2010 → Reflexão), com o texto redigido da subseção "O Custo do
  Saneamento" e as decisões de design discutidas antes de virar código.
- **`IMPLEMENTACAO_MODULO8_LOG.md`** — o registro do que foi efetivamente implementado em
  10/05/2026.

## Estes documentos estão parcialmente desatualizados

São **registro histórico, não lista de pendências**. O log marca o download das imagens da
Wikimedia como próximo passo, mas `assets/images/` já tem `john-snow-portrait.jpg` e
`joseph-bazalgette.jpg` desde a mesma data.

Se um documento daqui ficar enganoso a ponto de atrapalhar quem chegar depois, esvazie-o e
deixe um ponteiro para o que o substituiu, em vez de mantê-lo como está.

## Verificação de referências do módulo 8 (11/08/2026)

O rascunho propôs entradas BibTeX que nunca foram conferidas contra a fonte. Duas das piores
foram filtradas já na implementação e nunca entraram no `references.bib`: `bazalgette_cost`
(autor literal `{various}`, periódico `{Historical Records}`) e `whogan2012cholera` (malformada).
Outras duas entraram e estavam erradas — **ambas corrigidas**.

### `cook2001prevention` → `cook2001bazalgette` ✅

A entrada citava *History of Medicine Today* 12(3):102–115. Esse periódico **não existe**: a
busca de periódicos da Crossref retorna zero resultados, e o título não corresponde a nenhum
trabalho indexado. Autor e ano estavam certos; o resto era fabricado.

Substituída pelo artigo real do mesmo autor e ano, confirmado por DOI:
Cook GC. *Construction of London's Victorian sewers: the vital role of Joseph Bazalgette.*
Postgraduate Medical Journal. 2001;77(914):802. doi:10.1136/pgmj.77.914.802

### `halliday2013great` → `halliday2007filth` ✅

Ano, subtítulo e ISBN estavam errados. *The Great Filth* é de **2007** (Sutton, 256 p.), com
subtítulo *"The War Against Disease in Victorian England"* — não "The War Against Bacteria and
the Transformation of Everyday Life". O ISBN registrado (978-1845886509) **não existe**; o real
é 978-0-7509-4378-9. Há reedição da History Press em 2011.

O rascunho é sintoma da confusão: lista duas entradas Halliday para a mesma obra, uma como
artigo de 2003 na *History Today* e outra como livro de 2013.

### Onde `cook2001bazalgette` não sustentava o texto ✅

O artigo real do Cook tem **uma página** (802–802) e é sobre os esgotos de Bazalgette. Sustenta
bem as 8 citações sobre Bazalgette (L104, L747, L756, L760, L780, L815, L817, L1229 de
`js/modules/08-colera-soho-haiti.js`), mas tinha sido herdado em 5 pontos que falam da
**recepção do trabalho de Snow**, que ele não cobre. Resolvido assim:

| Linha | Afirmação | Antes | Agora |
|---|---|---|---|
| 102 | "minimizado pelo *Lancet* e pelos sanitaristas miasmatistas" | só Cook | `eyler2001assessments` |
| 731 | "evidência esmagadora, recebida com ceticismo na época" | só Cook | `eyler2001assessments` |
| 96  | "primeiro ato moderno de saúde pública baseado em evidência" | Johnson + Snow + Cook | Cook removido |
| 331 | "Koch isola o *V. cholerae*, validando o que Snow provou" | Johnson + Cook | Cook removido |
| 1222 | "~30 anos para aceitação científica (Koch, 1884)" | Cook + Johnson | Cook removido |

Fonte nova para os dois casos órfãos:
Eyler JM. *The changing assessments of John Snow's and William Farr's cholera studies.*
Sozial- und Präventivmedizin. 2001;46(4):225–232. doi:10.1007/BF01593177 — verificada na
Crossref. Eyler é autor da biografia de referência de William Farr, e o artigo trata exatamente
de como os estudos de Snow foram avaliados pelos contemporâneos.

**Ressalva honesta:** o metadado do Eyler está verificado, mas o texto completo não foi lido. A
adequação vem do título e da especialidade do autor, não de conferência página a página.

### Pendência aberta: escapes LaTeX vazando para a bibliografia pública

Independente do acima, `scripts/bib2json.py` não converte escapes LaTeX, e **8 trechos aparecem
literais para o aluno** na tela de bibliografia:

- `m\'edecine g\'en\'erale`, `Fam\'ilia`, `G\'ervas`, `G\'erard` — acentos em `\'e`, `\'i`
- `Doll \& Hill`, `Chapman \& Hall/CRC`, `Southwark \& Vauxhall` — `\&`
- `\urlhttps://www.worldbank.org/...` — um `\url{}` mal desmontado

Correção provável: uma tabela de substituição no `bib2json.py` (ou usar acentos UTF-8 direto no
`.bib`, que é o que a maioria das entradas já faz) e tratar `\url{...}` antes de concatenar em
`note`.

### Convenção: campo `verificacao`

A proveniência de cada conferência fica num campo `verificacao` no `.bib`.
`scripts/bib2json.py` só propaga os campos de `FIELD_MAP` e `CUSTOM_FIELDS`, então esse campo
**não chega ao site** — diferente de `note`, que é renderizado na bibliografia visível ao aluno.

### A lição

Metadado bibliográfico gerado ou herdado tem taxa de erro alta o bastante para justificar
conferência item a item. Aqui, das 6 referências que o rascunho propôs, 2 eram fabricadas
(filtradas na implementação) e 2 tinham erros graves — 4 de 6. No projeto irmão do Exame do
Estado Mental, uma auditoria semelhante encontrou uma referência que simplesmente não existia
(DOI 404, PMID pertencendo a outro artigo), além de autores e títulos trocados.
