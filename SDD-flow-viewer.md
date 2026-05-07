# SDD: Salesforce Flow Visual Diff Viewer

## Contexto

Este projeto compara XMLs de metadata Salesforce no navegador, sem backend. Para Flows, o objetivo principal e permitir que um aprovador entenda rapidamente o que mudou entre a versao antiga e a nova, com prioridade para leitura visual e navegacao fluida em diagramas grandes.

## Problema

O diff textual do XML nao ajuda aprovadores a entender rapidamente o impacto da mudanca em Flows grandes.

Problemas observados:
- o diagrama pode ficar pequeno demais para leitura
- o zoom maximo ainda pode ser insuficiente em Flows extensos
- o aprovador precisa distinguir mudancas relevantes sem se perder no restante do grafo
- quando a mudanca e grande demais, um diff unico pode ficar denso e dificil de comparar

## Objetivos

- Exibir um Flow visual com foco em leitura rapida
- Destacar elementos adicionados, removidos e alterados
- Permitir navegacao eficiente com zoom, pan, ajuste e tela cheia
- Oferecer visualizacao lado a lado para comparacao direta de versoes muito diferentes
- Manter o app 100% estatico e simples de abrir via `index.html`

## Nao Objetivos

- editar Flows
- validar semantica completa do Salesforce Flow
- substituir ferramentas de diff textual detalhado

## Usuarios

- aprovadores de mudanca
- analistas funcionais
- desenvolvedores revisando metadata Salesforce

## Requisitos Funcionais

1. O app deve aceitar dois XMLs de Flow e renderizar um diff visual.
2. O app deve classificar nos como adicionados, removidos, alterados ou sem mudanca relevante.
3. O app deve classificar conectores como adicionados, removidos ou sem mudanca relevante.
4. O viewer deve suportar zoom por scroll, botoes, pan por arraste e tela cheia.
5. A aba de Flow deve mostrar apenas a visualizacao do diagrama e seu resumo, sem expor o codigo Mermaid bruto.
6. O usuario deve poder alternar entre `Diff` e `Lado a lado` na aba Flow.

## Requisitos Nao Funcionais

- Funcionar offline, exceto pela dependencia atual do Mermaid via CDN.
- Nao exigir build nem backend.
- Responder bem em desktop e ficar usavel em mobile.
- Preservar interface em pt-BR.

## Solucao Atual

- Extracao de nos de Flow a partir de tags principais como `assignments`, `decisions`, `recordLookups` e `recordUpdates`.
- Comparacao por chave semantica `tagName:name`.
- Renderizacao visual com Mermaid.
- Viewer com zoom, pan, ajustar, reset e tela cheia.
- Modo opcional lado a lado com um viewer para o XML antigo e outro para o XML novo.

## Lacunas Conhecidas

- Flows muito grandes ainda sofrem com densidade visual alta.
- Elementos sem conector explicito ou com estruturas menos comuns podem nao aparecer conectados da melhor forma.
- O layout do Mermaid nem sempre favorece leitura de grafos extensos horizontalmente.
- No modo lado a lado, os controles atuam sobre o viewer atualmente em foco.

## Proximos Incrementos Recomendados

1. Filtro `Mostrar apenas mudancas` para ocultar nos e conectores sem alteracao.
2. Sincronizacao opcional de zoom/pan entre os paines no modo lado a lado.
3. Mini mapa ou overview para navegacao em Flows muito grandes.
4. Painel lateral com detalhes do no selecionado.
5. Busca por nome de elemento no Flow.
6. Agrupamento por tipo de elemento (`Decision`, `Assignment`, `Lookup`, etc.).
7. Estrategia opcional de layout alternativo quando o Mermaid gerar grafos pouco legiveis.

## Criterios de Aceite Imediatos

- Um aprovador consegue abrir dois XMLs e identificar visualmente os principais pontos alterados.
- O zoom maximo permite leitura do texto dos nos em Flows grandes.
- A tela cheia melhora a leitura sem quebrar o viewer.
- A aba Flow nao mostra codigo cru do Mermaid.
- O modo lado a lado exibe claramente `Antes` e `Depois` em paines separados.

## Verificacao Manual

1. Abrir `index.html` no navegador.
2. Colar dois XMLs de Flow grandes.
3. Clicar em `Comparar Agora`.
4. Abrir a aba `Flow Visual`.
5. Alternar entre `Diff` e `Lado a lado`.
6. Validar zoom, pan, ajuste, reset e tela cheia.
7. Confirmar que o diff textual permanece restrito a sua propria aba.