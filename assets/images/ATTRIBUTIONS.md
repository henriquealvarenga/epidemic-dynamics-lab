# Atribuições de Imagens — Epidemic Dynamics Lab

Este arquivo consolida a proveniência e o licenciamento de todas as imagens
externas usadas no projeto. **Nenhuma imagem entra no repositório sem um
registro aqui e um arquivo sidecar `.license.txt` ao seu lado.**

## Regras

1. Toda imagem externa precisa ter fonte verificável publicamente.
2. A licença precisa ser explicitamente declarada pela fonte original.
3. Em caso de dúvida, **não use a imagem** — prefira SVG autoral, ícone open-source, ou apenas descrição textual.
4. Preferir fontes com políticas de licenciamento documentadas:
   - [Wellcome Collection](https://wellcomecollection.org/works) — em geral CC0 ou CC BY para material histórico
   - [Wikimedia Commons](https://commons.wikimedia.org) — só usar imagens com tag de licença explícita (PD, PD-old-100, CC0, CC BY)
   - [Library of Congress](https://www.loc.gov/free-to-use/) — coleções públicas americanas
   - [NLM History of Medicine](https://www.nlm.nih.gov/hmd/ihm/) — acervo histórico-médico
   - [British Library Digital Collections](https://www.bl.uk/collection-guides)
5. Para cada imagem é obrigatório arquivar a página da fonte em
   [web.archive.org](https://web.archive.org) e registrar a URL arquivada no
   sidecar — isso imortaliza a prova de licença caso a página original suma.

## Template do sidecar `.license.txt`

Cada imagem no repositório deve ter um arquivo `<nome-da-imagem>.license.txt`
ao seu lado, com o conteúdo:

```
Título: 
Autor (ou autoria desconhecida): 
Ano de criação (aproximado se necessário): 
Fonte (URL direta à página da fonte, não Google Images): 
Fonte arquivada (web.archive.org/...): 
Licença declarada: 
Tipo específico (ex: PD-US-expired, CC0, CC BY 4.0): 
Verificado por: 
Data da verificação (YYYY-MM-DD): 
Uso no app: 
Notas:
```

Um exemplo preenchido está em `TEMPLATE.license.txt` nesta mesma pasta.

## Tabela consolidada

A tabela abaixo cobre todas as imagens externas atualmente presentes no
repositório. A coluna "Sidecar" aponta para o arquivo `.license.txt`
correspondente.

| Módulo | Arquivo | Título | Autor | Ano | Licença | Sidecar |
|--------|---------|--------|-------|-----|---------|---------|
| — | — | — | — | — | — | — |

_Nenhuma imagem externa usada até o momento. A versão atual do app utiliza apenas SVG autoral, D3 data-driven rendering, e tipografia. Esta tabela será preenchida quando uma imagem externa for introduzida._

## Datasets reutilizados (não são imagens, mas merecem atribuição)

| Dataset | Fonte | Licença | Uso no app |
|---------|-------|---------|------------|
| Mapa de Snow / Soho 1854 (321 endereços, 13 bombas, 658 segmentos de rua) | Pacote R [`cholera`](https://cran.r-project.org/package=cholera) de Peter Li (JOSS 2018, doi:10.21105/joss.00596); digitalização original de Dodson & Tobler (1992). | GPL-2 | Módulo 8 — mapa interativo reconstrói visualmente o dataset em D3. |
| Cólera Haiti 2010 (série mensal) | Ministère de la Santé Publique et de la Population du Haïti, 2010–2016 (dados públicos fornecidos em CSV pelo autor). | Dados públicos governamentais | Módulo 8 — gráfico temporal. |

A licença GPL-2 do pacote `cholera` permite redistribuir o dataset derivado (nossa serialização JSON das coordenadas) sob a mesma licença ou compatível. Como o Epidemic Dynamics Lab é MIT, mantemos o **dataset específico** (arquivo `assets/data/soho-1854-cholera.js`) sob GPL-2 herdada, citando a fonte no cabeçalho do arquivo. O código que lê e renderiza o dataset permanece MIT.

## Política para material do autor

Material didático de autoria do Prof. Henrique Alvarenga (slides, textos,
figuras inéditas que ele eventualmente fornecer para inclusão) é de sua
propriedade e licenciado para este projeto sob a mesma licença MIT do
software, a menos que indicado em contrário em sidecar específico.

## SVG autoral do app

Os elementos gráficos criados diretamente no código (curvas decorativas do
hero, ícones, gráficos D3) são parte do software e cobertos pela licença MIT
do projeto. Não requerem atribuição adicional.
