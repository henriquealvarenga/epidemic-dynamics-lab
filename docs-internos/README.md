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

## Pendência conhecida: duas referências do módulo 8

O rascunho propôs entradas BibTeX que nunca foram conferidas contra a fonte. Duas das piores
foram filtradas na implementação e não entraram no `references.bib` (`bazalgette_cost`, com
autor literal `{various}`, e `whogan2012cholera`, malformada). Mas duas entraram e **merecem
verificação na Crossref**:

- **`cook2001prevention`** — cita o periódico *History of Medicine Today*, 12(3):102–115.
  Gordon C. Cook é autor real e publicou sobre Snow, mas em periódicos como *Journal of Medical
  Biography*. Não há confirmação de que esse periódico exista.
- **`halliday2013great`** — dá 2013 para *The Great Filth*, da Sutton. O livro de Stephen
  Halliday com esse título é de 2007, e o subtítulo registrado não bate. O próprio rascunho é
  sintoma da confusão: lista duas entradas Halliday para a mesma obra, uma como artigo de 2003 e
  outra como livro de 2013.

Metadado bibliográfico gerado ou herdado tem taxa de erro alta o bastante para justificar
conferência item a item — no projeto irmão do Exame do Estado Mental, uma auditoria de
referências encontrou uma que simplesmente não existia (DOI 404, PMID pertencendo a outro
artigo), além de autores e títulos trocados.
