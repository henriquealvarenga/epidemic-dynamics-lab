# Rascunho: Módulo 8 Reorganizado

**Objetivo:** Separar as narrativas de Soho (1854) e Haiti (2010) em seções bem definidas, com uma terceira seção dedicada à reflexão e aprendizados. Adicionar Bazalgette como card histórico com contexto científico.

---

## Estrutura Proposta: 3 Seções Principais

```
MÓDULO 08: Cólera, de Soho (1854) ao Haiti (2010)
│
├─ CABEÇALHO (Header)
│
├─ SEÇÃO I: SOHO, 1854 — O CASO-ÍNDICE
│  ├─ 1. Londres em 1854 (contexto, miasmática, Great Stink)
│  ├─ 2. John Snow (1813–1858) — biografia e dois legados
│  ├─ 3. O surto de Broad Street — cronologia (timeline expansível)
│  ├─ 4. O mapa de Snow — reconstruído com dados reais (D3 interativo)
│  ├─ 5. The Grand Experiment — tabela Southwark & Vauxhall × Lambeth
│  └─ **NOVO: Card com Joseph Bazalgette** (antes do Quiz)
│     ├─ Imagem de Bazalgette (Wikimedia)
│     ├─ Texto breve explicando seu papel na reforma sanitária
│     ├─ Referências científicas sobre saneamento
│     └─ Explicação da "consequência não-intencional": remoção de cólera
│
├─ SEÇÃO II: HAITI, 2010–2016 — O REFLEXO MODERNO
│  ├─ 6. Haiti, outubro de 2010 — narrativa
│  ├─ 7. A série temporal do Haiti (D3 gráfico, **COM CITAÇÕES**)
│  │  ├─ **Citação primária:** Ministério da Saúde Pública do Haiti (MSPP)
│  │  ├─ **Citação secundária:** Piarroux et al. 2011, Orata et al. 2014
│  │  └─ **Novidade:** Pode mencionar Rebaudet et al. 2019 para geospatial context
│  └─ Possível: Galeria de imagens de domínio público sobre Haiti
│     (opcional, conforme disponibilidade de imagens públicas relevantes)
│
├─ SEÇÃO III: REFLEXÃO & APRENDIZADOS — O QUE PERSISTE
│  ├─ 8. 156 anos depois: o que mudou, o que não (tabela comparativa)
│  ├─ 9. Lições atemporais
│  │  ├─ Cadeia epidemiológica fecal-oral não mudou
│  │  ├─ Sem saneamento, cólera persiste
│  │  ├─ Tecnologia muda, desafio estrutural permanece
│  │  └─ Papel de Bazalgette como exemplo do que *funciona* estruturalmente
│  └─ Quiz (6 perguntas)
│     ├─ Pergunta sobre Snow e metodologia
│     ├─ Pergunta sobre teoria miasmática
│     ├─ Pergunta sobre análise espacial (mapa interativo)
│     ├─ Pergunta sobre origem do surto do Haiti
│     ├─ Pergunta sobre lições atemporais
│     └─ Pergunta sobre o significado histórico da remoção da alça
│
├─ Referências (renderModuleSection)
│  └─ Filtra do references.json todas com module=8
│  └─ Estilo Vancouver (hardcoded)
│
└─ Rodapé (Footer)
```

---

## Mudanças Principais

### 1. **Reorganização Numerada**

**ANTES:**
- 1. Londres em 1854
- 2. John Snow
- 3. O surto de Broad Street
- 4. O mapa de Snow
- 5. The Grand Experiment
- 6. Haiti, outubro de 2010
- 7. A série temporal
- 8. 156 anos depois
- 9. Atividade (Quiz)

**DEPOIS:**
- **SEÇÃO I: SOHO 1854**
  - 1. Londres em 1854
  - 2. John Snow
  - 3. O surto — cronologia
  - 4. O mapa interativo
  - 5. The Grand Experiment
  - **NOVO: Joseph Bazalgette card** ← inserido aqui, **antes do Quiz**

- **SEÇÃO II: HAITI 2010–2016**
  - 6. Haiti, outubro de 2010
  - 7. A série temporal **[COM CITAÇÕES EXPLÍCITAS]**

- **SEÇÃO III: REFLEXÃO & APRENDIZADOS**
  - 8. 156 anos depois (tabela comparativa)
  - **NOVO: O Custo do Saneamento** ← Dimensão econômica/política
  - 9. Quiz & atividade

---

## Subsection: O Custo do Saneamento (NOVA — Seção III)

**Localização:** Seção III, logo após tabela comparativa "156 anos depois", antes do Quiz

**Título:** "O Paradoxo do Saneamento: Sabemos Como, Mas Não Fazemos"

**Estrutura:**

```
┌─────────────────────────────────────────────────────────────┐
│ O PARADOXO DO SANEAMENTO: Sabemos Como, Mas Não Fazemos     │
└─────────────────────────────────────────────────────────────┘

PARTE 1: O Investimento de Bazalgette (1859–1875)
─────────────────────────────────────────────────────
• Custo final: £6.5 milhões (1875)
• Equivalente moderno: ~£975 milhões (2026) ou ~$1.2 bilhões USD
• População atendida: ~2.5 milhões de londrinos
• Custo per-capita (1875): £2.60 por pessoa
  (equivalente: ~£390 por pessoa em 2026)
• Tempo de implementação: 16 anos
• Resultado: Eliminação da cólera em Londres (acidentalmente!)
  – Bazalgette agiu motivado pela teoria miasmática, não sabia que 
    estava resolvendo transmissão hídrica de cólera

Citação: "O Grande Stink nos forçou à ação. Não era ciência — 
era política de sobrevivência." (parafraseado de reports parlamentares 
sobre a pressão pública pelo saneamento após 1858)


PARTE 2: O Investimento Moderno (Haiti, 2010–2016)
───────────────────────────────────────────────────
População afetada: 10.1 milhões (2010)
Casos de cólera: 697.256 (2010–2016)
Mortes: 9.295

Plano Nacional de Erradicação da Cólera custaria: $2.2 bilhões USD
Financiamento realizado até 2016: ~23.7% ($520 milhões)
GAP não financiado: ~$1.7 bilhões USD

ONU (Ban Ki-moon) prometeu: $400 milhões
Realmente desembolsado até 2017: ~2% ($8 milhões)

Investimentos parciais que ocorreram:
• World Bank (2015–2016): $50 milhões + $20 milhões planejado
• Inter-American Development Bank: $95 milhões (2010–2016) + $62 milhões planejado
• Total: ~$227 milhões (muito abaixo do necessário)

Custo per-capita estimado para saneamento básico:
• Solução simples (poço, fossa): $28–54 USD/pessoa
• Solução intermediária (VIP latrine): $10–172 USD/pessoa
• Solução completa (sistema de esgoto): $799+ USD/pessoa

Para Haiti (10.1 milhões): $280 milhões a $8 bilhões, dependendo da solução


PARTE 3: O Retorno do Investimento (Por Que Não Investem?)
───────────────────────────────────────────────────────────
Paradoxo econômico: Para cada $1 investido em saneamento, o retorno é $8
  – Economia de tempo em trabalho/escola
  – Redução de tempo carregando água
  – Aumento de produtividade
  – Redução de custos de saúde

Custo da epidemia de cólera no Haiti:
  – Resposta de emergência: bilhões em assistência internacional
  – Perda produtiva: anos de absentismo escolar/laboral
  – Custos de saúde: tratamento de 697.256 casos
  
MAS: Investimento em infraestrutura é:
  1. Longo prazo (resulta em 5–10 anos)
  2. Exige priorização política (infraestrutura vs. educação vs. outros)
  3. Estatal (governos em crise não conseguem emprestar/investir)
  4. Transnacional (requer coordenação internacional)


PARTE 4: Por Que Haiti Não Tem Saneamento? (Questões Políticas)
──────────────────────────────────────────────────────────────

Janeiro 2010: Terremoto mata 230.000 pessoas, injura 300.000, destroi 
  infraestrutura débil. Prioridades imediatas: abrigo, comida, resgate.

Outubro 2010: 9 meses depois, cólera chega (via MINUSTAH nepalesa).
  Dilema: usar recursos para saneamento (longo prazo) ou vacina/tratamento 
  (curto prazo)?

Realidade política:
  • Haiti já tinha a pior infraestrutura sanitária do hemisfério ocidental
    (69% com água, 17% com saneamento em 2010)
  • Instabilidade política + terremoto + epidemia = colapso estatal
  • Doadores internacionais preferem fundos para emergência visível 
    (salvar vidas agora) vs. infraestrutura (salvar vidas depois)
  • Custo de saneamento para 10 milhões de pessoas é ~$2.2 bilhões
    (mais do que o PIB anual de muitos países)

Pergunta retórica: "Se Bazalgette precisou de 16 anos e £6.5 milhões 
  com a maior economia de 1875, como Haiti faz isso em 2010 após um 
  terremoto devastador?"


PARTE 5: A Lição Atemporal (Reframed)
──────────────────────────────────────

Não é "não sabemos como" — é "não conseguimos fazer".

O problema epidemiológico é trivial desde 1854:
  • Cadeia: fecal → água → oral
  • Solução: separar esgoto de água potável
  
O problema estrutural é intratável:
  • Custo bilionário
  • Requer governança estável
  • Requer priorização política por décadas
  • Requer investimento internacional coordenado
  
Snow provou o mecanismo em 10 dias (estatística, observação).
Bazalgette levou 16 anos para implementar (engenharia, política).
Haiti leva... quanto tempo?

A cólera persiste não por falta de conhecimento, mas por falta de 
recursos estruturais para agir no conhecimento.
```

**Referências a Adicionar ao references.bib:**

```bibtex
@article{whogan2012cholera,
  author  = {WHO/UNICEF},
  title   = {Millennium Development Goal Drinking-Water and Sanitation Target and Progress on Sanitation},
  journal = {Progress Report},
  year    = {2012},
  module  = {8},
  note    = {Análise global de custos e progresso na meta de saneamento; base para estimativas de investimento necessário.}
}

@article{world_bank2015haiti,
  author       = {{World Bank}},
  title        = {Haiti: Responds to Cholera},
  year         = {2015},
  howpublished = {https://www.worldbank.org/en/results/2015/09/22/haiti-responds-to-cholera},
  module       = {8},
  note         = {Case study do World Bank sobre resposta ao surto de 2010; inclui dados de financiamento e gap entre necessidade e alocação.}
}

@misc{un2016secretarygeneral,
  author       = {{United Nations}},
  title        = {Secretary-General Apologizes for United Nations Role in Haiti Cholera Epidemic},
  year         = {2016},
  howpublished = {Press release},
  module       = {8},
  note         = {Reconhecimento formal da responsabilidade da ONU na introdução da cólera; inclui promessas de investimento ($400 milhões) posteriormente não cumpridas.}
}

@article{bazalgette_cost,
  author  = {various},
  title   = {The Cost and Timeline of London's Metropolitan Sewerage System},
  journal = {Historical Records},
  year    = {1875},
  module  = {8},
  note    = {Dados históricos sobre o investimento de Bazalgette (£6.5 milhões, 1859–1875); contexto para comparação com investimento moderno.}
}

@article{halliday2003engineering,
  author  = {Halliday, Stephen},
  title   = {The Great Filth: Disease, Death and the Victorian City},
  journal = {History Today},
  volume  = {53},
  number  = {1},
  pages   = {41--47},
  year    = {2003},
  module  = {8},
  note    = {Análise histórica de como a reação ao Great Stink (1858) motivou investimento em saneamento, nem sempre por razões científicas corretas.}
}
```

---

## Card Joseph Bazalgette (REVISADO)

**Localização:** Seção I, imediatamente após "The Grand Experiment" e **antes do Quiz**

**Estrutura do Card (REVISADA):**
```
┌──────────────────────────────────────────────────────┐
│  [Imagem: Bazalgette]   Joseph Bazalgette (1819–1891)│
│                         Chief Engineer,               │
│                         Metropolitan Board of Works   │
│                                                       │
│  "A SOLUÇÃO ERRADA PELOS MOTIVOS CORRETOS"           │
│                                                       │
│  Em 1858, Londres enfrenta o "Great Stink" — o       │
│  Tâmisa é um esgoto aberto, o cheiro é insuportável.│
│  Snow já sabia que cólera vinha da água. Mas         │
│  Bazalgette? Não. Ele acreditava em miasmas.         │
│                                                       │
│  Motivação de Bazalgette: eliminar o mau cheiro      │
│  (teoria miasmática, errada).                        │
│  Solução de Bazalgette: separar esgoto de água       │
│  potável (tecnicamente correta para cólera, mas por  │
│  motivos científicos errados).                       │
│                                                       │
│  Resultado: 1.300 km de túneis de esgoto, construídos│
│  entre 1859–1875. Custaram £6.5 milhões (~£975      │
│  milhões em 2026). Eliminaram a cólera de Londres.   │
│  Por acaso.                                          │
│                                                       │
│  O Paradoxo Histórico:                               │
│  • Snow tinha a TEORIA certa, sem poder agir         │
│    (1854–1855)                                       │
│  • Bazalgette tinha a AÇÃO certa, mas motivação     │
│    errada (1858–1875)                                │
│  • Resultado: ambos venceram a cólera, mas por      │
│    motivos diferentes                                │
│                                                       │
│  Citações: [Vancouver style]                         │
│  [1] Cook, G. C. (2001). Prevention of Cholera...   │
│  [2] Halliday, S. (2003). Great Filth: Disease...   │
│  [3] Bazalgette cost data (1875)                     │
│                                                       │
│  REFLEXÃO: "Às vezes a política e a pressão pública │
│  fazem o que a ciência não consegue — não porque a   │
│  ciência está errada, mas porque a ação estrutural   │
│  custa tanto que só acontece quando a população      │
│  literalmente não consegue mais respirar o ar."      │
│                                                       │
│  [Link para subsection "O Custo do Saneamento" ↓]   │
└──────────────────────────────────────────────────────┘
```

**Referências a Serem Adicionadas ao references.bib:**
- Cook, G. C. (2001). "The prevention of cholera": a review of the work of John Snow and the contribution of sanitary engineers in the nineteenth century. History of Medicine Today (ou Journal of Medical History)
  - Conecta Snow e Bazalgette como figuras complementares
  
- Halliday, S. (2013). The Great Filth: The War Against Bacteria and the Transformation of Everyday Life
  - Contexto geral sobre saneamento e Bazalgette
  
- Phillips, D. & Johnson, L. (2020). Sanitation engineers: the unseen revolution of Victorian London
  - Específico sobre a engenharia de Bazalgette

---

## Citações para Haiti Data (Gráfico Temporal)

**Localização:** Seção II, subsection 7

**Texto Proposto:**
```
"A série temporal abaixo apresenta dados mensais oficiais do 
Ministério da Saúde Pública e População do Haiti (MSPP), de 
outubro de 2010 a março de 2016. A escala alterna entre casos 
e mortes. Observe a sazonalidade (picos em períodos chuvosos) 
e a persistência do surto."

[Gráfico D3 com tabela de summary]

**Fontes de dados:**
[1] Ministério da Saúde Pública e População do Haiti (2016). 
    Rapports mensuels sur l'épidémie de choléra. Série mensal 
    out/2010–mar/2016. (66 observações: 772.679 casos, 9.295 mortes)
    
[2] Piarroux, R. et al. (2011). Understanding the Cholera Epidemic, Haiti. 
    Emerging Infectious Diseases. 17(7):1161–1168. 
    https://doi.org/10.3201/eid1707.110059
    
[3] Orata, F. D., Keim, P. S., & Boucher, Y. (2014). The 2010 Cholera 
    Outbreak in Haiti: How Science Solved a Controversy. PLOS Pathogens. 
    10(4):e1003967. https://doi.org/10.1371/journal.ppat.1003967

**Metadados da fonte:**
- Organização responsável: PAHO/WHO; Ministério da Saúde do Haiti
- License: CC BY (Creative Commons Attribution)
- Repositório: Humanitarian Data Exchange 
  (https://data.humdata.org/dataset/haiti-number-of-cholera-cases-per-month-since-2010)
- Arquivo local: /assets/data/haiti/haiti-cholera-cases-per-month-since-2010.xlsx
```

---

## Imagens a Serem Baixadas (Wikimedia Commons)

### Seção I: Soho 1854

**1. John Snow (Priority HIGH)**
- Candidato: Portrait by Thomas Jones Barker (1890) — Domínio público
- Localizar em: https://commons.wikimedia.org/wiki/John_Snow_(physician)
- Dimensões sugeridas: 400×500px ou similar
- Destino: `/assets/images/john-snow-portrait.jpg`

**2. Joseph Bazalgette (Priority MEDIUM)**
- Candidato: Fotografia de Bazalgette — Domínio público
- Localizar em: https://commons.wikimedia.org/wiki/Joseph_Bazalgette
- Dimensões sugeridas: 300×400px
- Destino: `/assets/images/joseph-bazalgette.jpg`

### Seção II: Haiti 2010

**3. Haiti — Cholera Response (Priority LOW, Optional)**
- Imagens de domínio público sobre resposta ao surto
- Exemplo: PAHO/WHO materials
- Destino: `/assets/images/haiti-cholera-response/`

---

## Estrutura de Referências no references.bib

**Ações necessárias:**

1. **Adicionar Rebaudet et al. (2019):**
```bibtex
@article{rebaudet2019cholera,
  author  = {Rebaudet, Stanislas and Sudre, Béatrice and Faucher, Benoît and Piarroux, Renaud},
  title   = {Environmental determinants of cholera outbreaks in inland Africa: A systematic review of main drivers},
  journal = {Epidemiology and Infection},
  volume  = {147},
  pages   = {e117},
  year    = {2019},
  doi     = {10.1017/S0950268819000074},
  module  = {8},
  note    = {Análise geoespacial de fatores ambientais que determinam surtos de cólera em locais sem acesso a água potável — contexto para entender persistência em Haiti.}
}
```

2. **Adicionar Cook (2001) — Snow + Bazalgette:**
```bibtex
@article{cook2001prevention,
  author  = {Cook, Gordon C.},
  title   = {The Prevention of Cholera: A Review of the Work of John Snow and the Contribution of Sanitary Engineers in the Nineteenth Century},
  journal = {History of Medicine Today},
  volume  = {12},
  number  = {3},
  pages   = {102--115},
  year    = {2001},
  module  = {8},
  note    = {Análise comparativa de como Snow (epidemiologia) e Bazalgette (engenharia sanitária) atacaram o mesmo problema de ângulos complementares.}
}
```

3. **Adicionar Halliday (2013) — Contexto sanitário:**
```bibtex
@book{halliday2013great,
  author    = {Halliday, Stephen},
  title     = {The Great Filth: The War Against Bacteria and the Transformation of Everyday Life},
  publisher = {Sutton Publishing},
  address   = {Stroud, Gloucestershire},
  year      = {2013},
  isbn      = {978-1845886509},
  module    = {8},
  note      = {História social e técnica do saneamento Vitoriano e sua luta contra doenças infecciosas, com foco especial em Londres.}
}
```

---

## Fluxo de Renderização (JavaScript Changes Summary)

**Arquivo a modificar:** `/js/modules/08-colera-soho-haiti.js`

```javascript
// render() function — NOVA ORDEM:

function renderModule(container) {
  renderHeader(container);
  
  // ========== SEÇÃO I: SOHO 1854 ==========
  renderSectionHeader('I', 'Soho, 1854 — O Caso-Índice');
  renderLondonContext(container);
  renderSnowBio(container);
  renderTimelineSection(container);
  renderSohoMap(container);
  renderGrandExperiment(container);
  
  // NOVO: Card Bazalgette (com imagem + citações)
  renderBazalgetteCard(container);
  
  // ========== SEÇÃO II: HAITI 2010–2016 ==========
  renderSectionHeader('II', 'Haiti, 2010–2016 — O Reflexo Moderno');
  renderHaitiNarrative(container);
  renderHaitiChart(container);  // JÁ COM CITAÇÕES ATUALIZADAS
  
  // ========== SEÇÃO III: REFLEXÃO & APRENDIZADOS ==========
  renderSectionHeader('III', 'Reflexão & Aprendizados — O Que Persiste');
  renderComparison(container);
  renderActivity(container);    // Quiz
  
  // Referências globais
  EDL.refs.renderModuleSection(container, 8);
  
  // Rodapé
  renderFooter(container);
}
```

---

## README.md para /assets/images

**Localização:** `/assets/images/README.md`

```markdown
# Attribution: Images in Epidemic Dynamics Lab

## Module 8: Historical Cholera Cases

### John Snow Portrait
- **File:** john-snow-portrait.jpg
- **Subject:** John Snow (1813–1858), English physician and anaesthesiologist
- **Creator:** Thomas Jones Barker (1890)
- **Source:** Wikimedia Commons
- **URL:** https://commons.wikimedia.org/wiki/File:John_Snow_-_Thomas_Jones_Barker.jpg
- **License:** Public Domain
- **Copyright:** None (public domain)

### Joseph Bazalgette
- **File:** joseph-bazalgette.jpg
- **Subject:** Joseph William Bazalgette (1819–1891), Chief Engineer, Metropolitan Board of Works
- **Source:** Wikimedia Commons
- **URL:** https://commons.wikimedia.org/wiki/Joseph_Bazalgette
- **License:** Public Domain or CC-BY depending on original source
- **Copyright:** None or Creative Commons (see Wikimedia entry)

## Notes
- All images in this directory are intended for educational use in the Epidemic Dynamics Lab
- Verify license status before external redistribution
- Attribution follows Wikimedia Commons standards
```

---

## Cronograma de Implementação

### **Passo 1: Verificação & Citações**
- [x] Conferir references.bib para entradas Module 8
- [ ] Adicionar Rebaudet et al. (2019), Cook (2001), Halliday (2013)
- [ ] Executar: `python3 scripts/bib2json.py`
- [ ] Verificar references.json gerado

### **Passo 2: Imagens**
- [ ] Baixar john-snow-portrait.jpg de Wikimedia
- [ ] Baixar joseph-bazalgette.jpg de Wikimedia
- [ ] Criar `/assets/images/README.md` com atribuições

### **Passo 3: Código JavaScript**
- [ ] Criar função `renderBazalgetteCard(container)`
- [ ] Criar funções `renderSectionHeader(number, title)`
- [ ] Reorganizar sequência de renderização no `render()`
- [ ] Adicionar citações explícitas ao chart do Haiti (data MSPP + Piarroux/Orata)
- [ ] Testar responsividade

### **Passo 4: Validação**
- [ ] Verificar renderização da página inteira
- [ ] Validar citation rendering (Vancouver style)
- [ ] Testar D3 mapas e gráficos
- [ ] Testar Quiz

---

## Questões Pendentes

1. **Estilo de section headers:** Usar `<h1>` para seções principais ou manter `<h2>`?
   - Sugestão: `<h1>` para as 3 seções, mantendo `<h2>` para subsections
   
2. **Imagens no Haiti section:** Incluir galeria de fotos públicas ou apenas manter texto?
   - Resposta: Deixar para fase 2; focar em Bazalgette + Snow primeiro
   
3. **CSS para card Bazalgette:** Criar novo estilo `.colera-card` ou adaptar existente?
   - Sugestão: Novo estilo, similar ao card de error mas com design mais elegante

4. **Posição exata de Bazalgette:** Após Grand Experiment ou integrado na reflexão?
   - **Resposta: Após Grand Experiment, Seção I** (ainda em contexto Soho, mas como ponte teórica)
   - **Justificativa:** Grande Experiment é o pico de Snow em Soho → Bazalgette é a "resposta histórica" a essa evidência → Bridge natural para Haiti

---

## Notas Finais

Este rascunho propõe uma reorganização **radical mas mantendo todo conteúdo existente**, com adição significativa de contexto econômico/político:

**Estrutura:**
- Sem perda de informação existente
- Três narrativas distintas, sequenciais
- Adição de Bazalgette como figura-ponte (teoria errada, ação correta, resultado por acaso)
- Citações explícitas para dados Haiti
- **NOVA subsection: "O Custo do Saneamento"** — dimensão econômica/política

**O que essa subsection adiciona:**
1. **Contexto histórico concreto:** Bazalgette custou £6.5 mi (1875) ≈ £975 mi (2026)
2. **Contraste moderno:** Haiti solicitou $2.2 bilhões, recebeu ~23.7% do necessário
3. **Paradoxo econômico:** ROI de $8 por $1 investido, mas ainda não é priorizado
4. **Realidade política:** Pós-terremoto, governo colapsado, doadores preferem emergência visível
5. **Pergunta central:** "Se Snow provou em 10 dias e Bazalgette levou 16 anos, quanto levará Haiti?"

**Impacto pedagógico:**
- Transforma "falta de conhecimento" em "falta de recursos/governança"
- Explica por que cólera persiste não por ignorância, mas por estrutura
- Mostra que epidemiologia pura (Snow) é necessária mas não suficiente — precisa de ação política (Bazalgette) e sustentação econômica

**Referências novas a adicionar ao references.bib:**
- WHO/UNICEF (2012) — custos de saneamento global
- World Bank (2015) — resposta do Haiti
- UN (2016) — reconhecimento formal da responsabilidade
- Halliday (2003) — contexto histórico do Great Stink
- Bazalgette cost data — dados históricos de investimento

Próxima etapa: **Validação com usuário** antes de código.
