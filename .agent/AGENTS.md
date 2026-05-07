# AGENTS Guide: Salesforce Metadata Compare

This repository is a static web app that compares Salesforce metadata XML files.

## Quick Start

- Run the app by opening `index.html` in a browser.
- There is no build pipeline and no backend.
- Main user documentation: [README.md](../README.md).

## Project Map

- `index.html`: page structure, tabs, and CDN script includes.
- `app.js`: XML parsing, semantic diff, raw diff, Permission Set schema diff, and Flow Mermaid generation.
- `styles.css`: visual design tokens, layout, and component styles.

## Core Conventions

- Keep all UI text and user-facing messages in Portuguese (pt-BR) to match existing UX.
- Preserve vanilla JS architecture (no framework introduction unless explicitly requested).
- Keep logic browser-native (`DOMParser`, `XMLSerializer`, native DOM APIs).
- For Permission Set comparisons, preserve semantic-key behavior in `PERMISSION_SET_KEYS`; this is critical to classify moved vs removed items correctly.

## Safe Change Rules

- Prefer small, targeted edits in `app.js` to avoid regressions in diff classification.
- Do not remove the Mermaid integration from `index.html` unless replacing it with an equivalent flow rendering path.
- Maintain tab IDs and UI element IDs used by the `ui` object in `app.js`.
- When adjusting styles, keep responsive behavior for mobile (single-column workspace under narrow widths).

## Verification Checklist

After code changes:

1. Open `index.html` in a browser.
2. Load one valid XML on each side and click "Comparar Agora".
3. Confirm all tabs still render (`Diff Semantico`, `Diff Textual`, `Flow Visual`, `Schema Permission Set`).
4. Validate at least one invalid XML path shows a readable error message.
5. If Flow-related code changed, click "Gerar diagrama do Flow" and confirm Mermaid renders.

## Documentation Links

- End-user guide and feature overview: [README.md](../README.md)
- Antigravity profile install notes (only if using `.agent` workflows): [INSTALL.md](INSTALL.md)
