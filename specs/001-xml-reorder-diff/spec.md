# Feature Specification: Diff Stable Under XML Reordering

**Feature Branch**: `[001-pre-spec-branch]`  
**Created**: 2026-05-18  
**Status**: Draft  
**Input**: User description: "Precisamos ajustar o compare, ao utilizar o arquivo1.xml vs arquivo2.xml, ele está removendo e adicionando um monte de coisa, mas essas coisas na verdade só estão mudando de lugar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ignore Reordering Noise (Priority: P1)

Como pessoa analisando metadata Salesforce, quero que o comparador reconheça quando um item apenas mudou de posição no XML, para que eu veja somente mudanças reais e nao uma lista grande de itens removidos e adicionados incorretamente.

**Why this priority**: Esse e o problema principal relatado e afeta diretamente a confianca no diff e o tempo gasto na revisao.

**Independent Test**: Pode ser testado comparando dois XMLs com o mesmo conteudo semantico, mas com elementos em ordem diferente, e verificando que o resultado nao aponta adicoes ou remocoes falsas.

**Acceptance Scenarios**:

1. **Given** dois arquivos XML com os mesmos elementos e os mesmos valores, mas em ordem diferente, **When** a comparacao e executada, **Then** o sistema nao deve listar esses elementos como adicionados nem removidos.
2. **Given** dois arquivos XML com elementos reordenados entre blocos equivalentes, **When** a comparacao e exibida, **Then** o sistema deve indicar que houve apenas mudanca de posicao ou nenhuma diferenca material, conforme a visao escolhida.

---

### User Story 2 - Preserve Real Differences (Priority: P2)

Como pessoa revisando alteracoes, quero continuar vendo itens realmente adicionados, removidos ou alterados mesmo quando o restante do XML foi reorganizado, para nao perder mudancas relevantes em meio ao reordenamento.

**Why this priority**: Corrigir falsos positivos nao pode esconder mudancas reais, senao a ferramenta deixa de cumprir seu objetivo principal.

**Independent Test**: Pode ser testado comparando dois XMLs com mistura de reordenacao e mudancas reais, confirmando que apenas as mudancas verdadeiras continuam aparecendo como diferencas.

**Acceptance Scenarios**:

1. **Given** dois arquivos XML onde alguns elementos mudaram apenas de lugar e outros foram realmente alterados, **When** a comparacao e executada, **Then** somente os elementos realmente alterados devem aparecer como alterados.
2. **Given** dois arquivos XML onde um elemento foi reordenado e outro foi removido de fato, **When** a comparacao e executada, **Then** o elemento removido deve continuar sendo mostrado como removido e o elemento reordenado nao.

---

### User Story 3 - Trust the Summary Counts (Priority: P3)

Como pessoa usando o resumo de resultados, quero que os totais de adicionados, removidos, alterados e movidos representem o que realmente aconteceu, para tomar decisoes rapidas sem precisar conferir manualmente todo o diff.

**Why this priority**: Os contadores resumidos sao usados como sinal rapido de impacto e hoje podem induzir a leitura errada do resultado.

**Independent Test**: Pode ser testado executando comparacoes conhecidas e verificando que os totais do resumo batem com o comportamento esperado para reordenacoes puras e para mudancas reais.

**Acceptance Scenarios**:

1. **Given** uma comparacao formada apenas por reordenacao, **When** o resumo e calculado, **Then** os totais de adicionados e removidos nao devem ser inflados por itens apenas movidos.
2. **Given** uma comparacao com itens movidos e itens realmente modificados, **When** o resumo e exibido, **Then** cada total deve refletir corretamente sua categoria sem duplicidade entre movido, adicionado e removido.

### Edge Cases

- Comparacao entre arquivos com muitos elementos repetidos do mesmo tipo deve continuar diferenciando itens equivalentes sem gerar classificacao incorreta em massa.
- Diferencas apenas de espacos em branco ou formatacao nao devem ser confundidas com mudanca de conteudo quando a opcao para ignorar esse ruido estiver ativa.
- Quando um elemento muda de posicao e tambem tem um atributo ou valor alterado, o sistema deve priorizar a sinalizacao da alteracao real em vez de trata-lo como mera movimentacao.
- Quando um arquivo contem elementos ausentes de identificador claro, o sistema deve manter um criterio consistente para evitar marcar reordenacao aleatoria como remocao e adicao.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST comparar elementos XML com base em identidade semantica suficiente para reconhecer quando o mesmo item aparece em outra posicao do arquivo.
- **FR-002**: O sistema MUST evitar classificar como adicionado ou removido qualquer elemento cujo conteudo semantico permaneceu equivalente entre o arquivo anterior e o novo, ainda que a ordem tenha mudado.
- **FR-003**: O sistema MUST continuar classificando corretamente elementos realmente adicionados, removidos e alterados mesmo quando houver reordenacao no mesmo conjunto comparado.
- **FR-004**: O sistema MUST refletir reordenacoes de forma consistente em todas as visoes afetadas da comparacao, incluindo o resumo e o diff semantico.
- **FR-005**: O sistema MUST evitar contagem duplicada do mesmo item em categorias diferentes quando a diferenca real for apenas movimentacao.
- **FR-006**: Usuários MUST be able to identificar, no resultado da comparacao, quais diferencas sao materiais e quais representam apenas reorganizacao estrutural.
- **FR-007**: O sistema MUST manter comportamento previsivel para comparacoes de arquivos grandes, sem exigir revisao manual extensiva para separar ruido de mudancas reais.

### Key Entities *(include if feature involves data)*

- **XML Comparison Item**: Unidade comparavel extraida de cada XML, com identidade semantica, categoria de diff e contexto estrutural.
- **Semantic Difference**: Resultado classificado da comparacao entre dois itens equivalentes ou ausentes, podendo representar adicao, remocao, alteracao, movimentacao ou ausencia de diferenca material.
- **Comparison Summary**: Agregado dos totais por categoria usado para comunicar rapidamente o impacto da comparacao.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em comparacoes compostas apenas por reordenacao dos mesmos elementos, 100% dos itens reordenados deixam de aparecer como adicionados ou removidos.
- **SC-002**: Em um conjunto de validacao com reordenacao misturada a mudancas reais, pelo menos 95% das diferencas exibidas correspondem corretamente ao tipo de mudanca esperada.
- **SC-003**: Pessoas usuarias conseguem identificar as mudancas relevantes em uma comparacao com reordenacao em menos de 2 minutos, sem precisar revisar manualmente todos os itens sinalizados.
- **SC-004**: Os totais exibidos no resumo da comparacao batem com o resultado esperado em todos os cenarios de validacao definidos para reordenacao pura e reordenacao combinada com alteracoes reais.

## Assumptions

- O publico principal sao pessoas analisando metadata Salesforce manualmente para revisar impacto entre versoes de XML.
- A comparacao continuara tratando os dois arquivos fornecidos como fonte suficiente, sem depender de dados externos adicionais.
- A funcionalidade atual de diff textual permanece disponivel, mas esta especificacao foca na precisao da comparacao semantica e do resumo.
- O conceito de item movido e relevante para a experiencia de uso, mas nao deve inflar categorias de adicao ou remocao.