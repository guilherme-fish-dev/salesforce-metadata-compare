# Implementation Plan: Diff Stable Under XML Reordering

**Branch**: `[001-pre-spec-branch]` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-xml-reorder-diff/spec.md`

**Note**: This plan covers Phase 0 research and Phase 1 design artifacts for stabilizing semantic XML comparison when repeated metadata elements are reordered outside the current Permission Set-specific mappings.

## Summary

The feature must stop reporting false additions and removals when Salesforce metadata XML elements are only reordered, especially in types such as `standardValueSet` where repeated children have stable identifiers like `fullName`. The chosen approach is to extend semantic identity matching from a Permission Set-only registry to a tiered identifier strategy: explicit type-specific keys first, common child identifier tags second, and an order-insensitive fingerprint fallback last.

## Technical Context

**Language/Version**: JavaScript running in a browser, with static HTML and CSS  
**Primary Dependencies**: Browser DOMParser/XMLSerializer APIs, diff.js via CDN, Cytoscape via CDN, Dagre via CDN, cytoscape-dagre via CDN  
**Storage**: N/A  
**Testing**: Manual browser-based validation using representative XML fixtures, including `arquivo1.xml` and `arquivo2.xml`  
**Target Platform**: Modern desktop browsers used locally through a simple static HTTP server  
**Project Type**: Static client-side web application  
**Performance Goals**: Keep semantic comparison responsive for typical Salesforce metadata reviews and complete representative local comparisons without perceptible UI stall  
**Constraints**: No backend, no build step, preserve current browser-only distribution model, keep existing Permission Set behavior stable, avoid introducing order-insensitive matching that hides real content changes  
**Scale/Scope**: Single-page tool with one main comparison workflow, repository centered on `index.html`, `styles.css`, and `app.js`, targeting repeated XML metadata elements in common Salesforce metadata files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- The constitution file at `.specify/memory/constitution.md` is still a placeholder template and defines no enforceable principles or gates.
- Result before Phase 0: PASS, because there are no actionable constitutional constraints to violate.
- Result after Phase 1: PASS, unchanged for the same reason.
- Follow-up note: a real project constitution should be authored later if planning gates are expected to be enforced by workflow.

## Project Structure

### Documentation (this feature)

```text
specs/001-xml-reorder-diff/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── semantic-diff-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
.
├── index.html
├── styles.css
├── app.js
├── arquivo1.xml
├── arquivo2.xml
└── specs/
    └── 001-xml-reorder-diff/
```

**Structure Decision**: Keep the existing single-file static application structure. This feature will primarily affect `app.js`, with validation driven by the existing sample XML files and the browser UI in `index.html`.

## Complexity Tracking

No constitution violations or exceptional complexity justifications are currently required.
