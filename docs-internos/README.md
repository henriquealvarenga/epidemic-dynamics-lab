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

### Pendência editorial: onde `cook2001bazalgette` não sustenta o texto

O artigo real do Cook tem **uma página** (802–802) e é sobre os esgotos de Bazalgette. Ele
sustenta bem as 8 citações sobre Bazalgette (L104, L747, L756, L760, L780, L815, L817, L1229 de
`js/modules/08-colera-soho-haiti.js`), mas foi herdado em 5 pontos que falam da **recepção do
trabalho de Snow**, que ele não cobre:

| Linha | Afirmação | Situação |
|---|---|---|
| 102 | "minimizado pelo *Lancet* e pelos sanitaristas miasmatistas" | **Cook é a única fonte** |
| 731 | "evidência esmagadora, recebida com ceticismo na época" | **Cook é a única fonte** |
| 96  | "primeiro ato moderno de saúde pública baseado em evidência" | já tem Johnson + Snow |
| 331 | "Koch isola o *V. cholerae*, validando o que Snow provou" | já tem Johnson |
| 1222 | "~30 anos para aceitação científica (Koch, 1884)" | já tem Johnson |

Os dois primeiros são os que importam: uma afirmação sobre a recepção de Snow apoiada apenas
numa nota de uma página sobre engenharia sanitária. Precisam de fonte própria ou de reformulação.
Nos outros três, basta remover Cook — as fontes que ficam já sustentam o texto.

Não corrigido aqui por ser decisão editorial sobre o argumento, não defeito de metadado.

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
