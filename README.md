# Salesforce Metadata Compare

Ferramenta web estática para comparar XMLs de metadata Salesforce de forma visual e semântica.

## Status do projeto

Este projeto esta em andamento (work in progress).

Ele ja e util no dia a dia para analise de mudancas, mas ainda pode e deve ser evoluido com melhorias de parser, UX e cobertura de tipos de metadata.

## O que o projeto faz

- Compara dois XMLs (antes vs depois)
- Mostra diff semantico por tipo de elemento
- Mostra diff textual linha a linha
- Gera visao de schema para Permission Set
- Gera visualizacao de Flow com grafo interativo (Cytoscape + Dagre)
- Suporta modo de visualizacao Diff e modo Lado a lado para Flows

## Tecnologias

- HTML + CSS + JavaScript (sem backend)
- Bibliotecas via CDN:
	- diff.js
	- Cytoscape
	- Dagre
	- cytoscape-dagre

## Estrutura basica

- `index.html`: interface principal
- `styles.css`: estilos e layout
- `app.js`: parser XML, comparacao semantica e renderizacao

## Como usar

1. Abra o projeto no navegador (recomendado via servidor local).
2. Cole o XML antigo no painel esquerdo.
3. Cole o XML novo no painel direito.
4. Clique em **Comparar Agora**.
5. Explore as abas:
	 - Diff Semantico
	 - Diff Textual
	 - Flow Visual
	 - Schema Permission Set

### Recomendacao para abrir localmente

Apesar de ser possivel abrir o `index.html` direto, o modo `file://` pode causar limitacoes de seguranca no navegador.

Use um servidor HTTP simples, por exemplo:

```powershell
cd .
python -m http.server 8080
```

Depois acesse:

`http://localhost:8080`

## Como usar o Flow Visual

- Clique em **Gerar diagrama do Flow** na aba Flow Visual
- Use scroll para zoom
- Arraste para pan
- Use os botoes:
	- `+` e `-`
	- `Ajustar`
	- `Reset`
	- `Tela cheia`
- Alterne entre:
	- `Diff`
	- `Lado a lado`

## Checklist para subir no Git com seguranca

Antes de publicar:

1. Verifique se nao existem segredos no repositorio (tokens, senhas, chaves privadas)
2. Mantenha `.env` fora do Git (ja coberto no `.gitignore`)
3. Revise `index.html` para garantir apenas CDNs confiaveis
4. Considere fixar versoes de bibliotecas (ja esta sendo feito)
5. Se publicar em ambiente corporativo, considerar:
	 - CSP (Content-Security-Policy)
	 - SRI (Subresource Integrity) para scripts CDN

## Limites atuais

- O parser cobre bem os tipos principais de Flow, mas pode precisar ajustes para novos elementos de metadata
- Fluxos muito grandes podem exigir filtros visuais adicionais
- Ainda ha espaco para melhorar o destaque de conexoes e de caminhos de decisao

## Ideias de upgrade

- Filtro por tipo de no no Flow (Decision, Assignment, Lookup etc.)
- Busca por nome de elemento no grafo
- Exportar imagem do diagrama
- Collapse/expand de subgrafos
- Testes automatizados para parser de Flow
- Pipeline CI para validacao antes de merge

## Licenca

Defina a licenca desejada antes da publicacao (ex.: MIT).
